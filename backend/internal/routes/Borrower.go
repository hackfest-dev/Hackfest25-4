package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/configs"

	"github.com/ethereum/go-ethereum/accounts/abi/bind/v2"
	"github.com/ethereum/go-ethereum/common"
)

type LoanReq struct {
	Aadhar string `json:"aadhar"`
	Amt    int64  `json:"amount"`
	Tenure int32  `json:"tenure"`
	Rate   int32  `json:"rate"`
}

type LoanAskT struct {
	LoanID        int64   `json:"loan_id"`
	Aadhar        string  `json:"asked_by"`
	Amt           int64   `json:"amount"`
	Tenure        int32   `json:"tenure"`
	Rate          int32   `json:"interest"`
	Penalty       int32   `json:"penalty"`
	Contributions []uint8 `json:"contributions"`
}

// to create a loan request
func createLoanReq(w http.ResponseWriter, r *http.Request) {
	var input LoanReq
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDB

	query := `INSERT INTO loan_asked (asked_by, amount, tenure, interest, penalty, contributions)
	SELECT u.adhaar_card_num, $1, $2, $3, 2, '[]'::jsonb
	FROM users u WHERE u.adhaar_card_num = $4`

	_, err := db.Exec(query, input.Amt, input.Tenure, input.Rate, input.Aadhar)
	if err != nil {
		fmt.Println("Error inserting data:", err)
		http.Error(w, "Error inserting data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// to get the loan requests of the user
func getLoanDetails(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Aadhar string `json:"aadhar"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDB

	query := `SELECT * FROM loan_asked WHERE asked_by = $1;`

	var loanReq LoanAskT
	err := db.QueryRow(query, input.Aadhar).Scan(&loanReq.LoanID, &loanReq.Aadhar, &loanReq.Amt, &loanReq.Tenure, &loanReq.Rate, &loanReq.Penalty, &loanReq.Contributions)
	if err != nil {
		fmt.Println("Error querying data:", err)
		http.Error(w, "Error querying data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loanReq)
}

// to get the loan details from the contract
func getContractLoanDetails(w http.ResponseWriter, r *http.Request) {
	var input struct {
		LoanID int64  `json:"loan_id"`
		Aadhar string `json:"aadhar"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// get the wallet address from the aadhar
	db := configs.PsqlDB
	query := `SELECT wallet_address FROM users WHERE adhaar_card_num = $1;`
	var walletAdrs string
	err := db.QueryRow(query, input.Aadhar).Scan(&walletAdrs)
	if err != nil {
		fmt.Println("Error querying data:", err)
		http.Error(w, "Error querying data", http.StatusInternalServerError)
		return
	}
	adrs := common.HexToAddress(walletAdrs)

	contract := configs.LoanContract

	var result []any
	if err := contract.Call(&bind.CallOpts{Context: context.Background()}, &result, "getBorrowersLoanInfo", adrs); err != nil {
		http.Error(w, "network error cannot get laon details", http.StatusInternalServerError)
		fmt.Println("err ex borrower loan info:", err)
	}
	fmt.Println("result : ", result)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

//routes for borrower operations
func BorrowerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /borrower/create-loan", createLoanReq)
	mux.HandleFunc("POST /borrower/view-loan", getLoanDetails)
	mux.HandleFunc("POST /borrower/web3/view-loan", getContractLoanDetails)
}
