package configs

import (
	"log"

	"github.com/ethereum/go-ethereum/ethclient"
)

var EthClient *ethclient.Client

func InitEthClient() *ethclient.Client {
	EthClient, err := ethclient.Dial("ws://127.0.0.1:8545/")
	if err != nil {
		log.Fatal("err connecting ETH client :", err)
	}

	return EthClient
}
