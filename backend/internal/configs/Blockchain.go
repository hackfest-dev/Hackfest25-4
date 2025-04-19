package configs

import (
	"fmt"
	"log"
	"math/big"
	"net/http"
	"server/internal/configs"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind/v2"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

var LoanContract *bind.BoundContract
var EthClient *ethclient.Client
var loanAbiStr = `[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "principal",
          "type": "uint32"
        },
        {
          "internalType": "uint8",
          "name": "tenure",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "sanctionedDate",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "interestRate",
          "type": "uint8"
        },
        {
          "internalType": "int8",
          "name": "agreedPenalty",
          "type": "int8"
        },
        {
          "internalType": "address[]",
          "name": "lenderAddresses",
          "type": "address[]"
        },
        {
          "internalType": "uint8[]",
          "name": "percentages",
          "type": "uint8[]"
        }
      ],
      "name": "createLoan",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        }
      ],
      "name": "getBorrowersLoanInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "loanId",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "lender",
                  "type": "address"
                },
                {
                  "internalType": "uint8",
                  "name": "percentage",
                  "type": "uint8"
                }
              ],
              "internalType": "struct Loans.LenderShare[]",
              "name": "lenders",
              "type": "tuple[]"
            },
            {
              "internalType": "address",
              "name": "borrower",
              "type": "address"
            },
            {
              "internalType": "uint32",
              "name": "principal",
              "type": "uint32"
            },
            {
              "internalType": "uint8",
              "name": "tenure",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "sanctionedDate",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "interestRate",
              "type": "uint8"
            },
            {
              "internalType": "int8",
              "name": "agreedPenalty",
              "type": "int8"
            },
            {
              "internalType": "bool",
              "name": "isCompleted",
              "type": "bool"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint8",
                  "name": "interest",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "dueBy",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "isPaid",
                  "type": "bool"
                }
              ],
              "internalType": "struct Loans.Installment[]",
              "name": "installments",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct Loans.LoanAgreement[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "loanId",
          "type": "uint256"
        }
      ],
      "name": "getLendersForLoan",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint8[]",
          "name": "",
          "type": "uint8[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "lender",
          "type": "address"
        }
      ],
      "name": "getLendersLoanInfo",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "loanAgreements",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "loanId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "principal",
          "type": "uint32"
        },
        {
          "internalType": "uint8",
          "name": "tenure",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "sanctionedDate",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "interestRate",
          "type": "uint8"
        },
        {
          "internalType": "int8",
          "name": "agreedPenalty",
          "type": "int8"
        },
        {
          "internalType": "bool",
          "name": "isCompleted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextLoanId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]`

// to initialize the Ethereum client
func InitEthClient() *ethclient.Client {
	EthClient, err := ethclient.Dial("ws://127.0.0.1:8545/")
	if err != nil {
		log.Fatal("err connecting ETH client :", err)
	}

	InitLoanContract(EthClient)

	return EthClient
}

// to initialize the loan contract
func InitLoanContract(client *ethclient.Client) {

	loanContractAdrs := common.HexToAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3")
	parsedLoanAbi, err := abi.JSON(strings.NewReader(loanAbiStr))
	if err != nil {
		log.Fatal("err abi :", err)
	}

	LoanContract = bind.NewBoundContract(loanContractAdrs, parsedLoanAbi, client, client, client)
}

func SignContract(id int) error {

	privateKey, err := crypto.HexToECDSA("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
	if err != nil {
		return err
	}

	chainID := big.NewInt(31337)
	transactOpt := bind.NewKeyedTransactor(privateKey, chainID)

  db := configs.PsqlDB
  

	// createLoan(
	//         address borrower,
	//         uint32 principal,
	//         uint8 tenure,
	//         uint256 sanctionedDate,
	//         uint8 interestRate,
	//         int8 agreedPenalty,
	//         address[] calldata lenderAddresses,
	//         uint8[] calldata percentages
	//calling the contract function initLoan
	tx, err := LoanContract.Transact(transactOpt, "createLoan")
	if err != nil {
		return err
	}
	price := tx.Cost()
	fmt.Println("transaction cost : ", price)
	return nil
}
