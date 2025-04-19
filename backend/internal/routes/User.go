package routes

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"server/internal/configs"
	"server/internal/helpers"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/rpc"
)

// email: "",
//
//	name: "",
//	phone: "",
//	address: "",
//	city: "",
//	state: "",
//	pincode: "",
//	aadharNumber: "",
//	pan: "",
//	accountNumber: "",
//	ifsc: "",
//	bankName: "",
type CreateUserReq struct {
	Email     string `json:"email"`
	Name      string `json:"name"`
	PhNum     string `json:"phone"`
	Address   string `json:"address"`
	City      string `json:"city"`
	State     string `json:"state"`
	Pincode   string `json:"pincode"`
	AdhaarNum string `json:"aadharNumber"`
	PanNum    string `json:"pan"`
	AcNum     string `json:"accountNumber"`
	Ifsc      string `json:"ifsc"`
	BankName  string `json:"bankName"`
}

// to return the varified user
func verifyUser(w http.ResponseWriter, r *http.Request) {
	jwt, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "No JWT token found", http.StatusUnauthorized)
		return
	}

	token, err := helpers.VerifyJwtToken(jwt.Value)
	if err != nil {
		http.Error(w, "Error verifying JWT token", http.StatusUnauthorized)
		return
	}

	name, err := helpers.ParseNameFromNum(token)
	if err != nil {
		http.Error(w, "Error parsing user name", http.StatusInternalServerError)
		return
	}

	res := map[string]string{
		"name": name,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// to create new user
func CreateUser(w http.ResponseWriter, r *http.Request) {

	//parse the request body
	var user CreateUserReq
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println("parse err ", err)
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDb

	//insert the user into the database
	_, err = db.Exec(context.Background(), "INSERT INTO users (first_name, ph_num, email, address, city, state, pincode, adhaar_card_num, pan_card_num, bank_name, ac_num, ifsc) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
		user.Name, user.PhNum, user.Email, user.Address, user.City, user.State, user.Pincode, user.AdhaarNum, user.PanNum, user.BankName, user.AcNum, user.Ifsc)
	if err != nil {
		fmt.Println("psql err", err)
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}

	if err := CreateCustodialWallet(user.AdhaarNum); err != nil {
		fmt.Println("err creating wallet :", err)
		http.Error(w, "Error creating custodial wallet", http.StatusInternalServerError)
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

// to create a new custodial wallet and return the wallet address using go-ethereum
func CreateCustodialWallet(adNum string) error {
	// Create a new key pair
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		return err
	}

	publicKey := privateKey.Public().(*ecdsa.PublicKey)
	addrs := crypto.PubkeyToAddress(*publicKey)

	wei := new(big.Int).Mul(big.NewInt(1000), big.NewInt(1e18))
	weiHex := "0x" + wei.Text(16)

	rpcClient, err := rpc.Dial("http://127.0.0.1:8545/")
	if err != nil {
		return err
	}

	// Set the balance
	err = rpcClient.CallContext(context.Background(), nil, "hardhat_setBalance", addrs, weiHex)
	if err != nil {
		return err
	}

	//hash the private key and store the pub & priv key in the database
	db := configs.PsqlDb
	hashPrivateKey := crypto.Keccak256Hash(crypto.FromECDSA(privateKey))

	_, err = db.Exec(context.Background(), "INSERT INTO wallet (adhaar_card_num, public_key, private_key_encrypted) VALUES ($1, $2, $3)",
		adNum, addrs.Hex(), hashPrivateKey.Hex())
	if err != nil {
		return err
	}

	return nil
}

// routes for users
func UserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /user/verify-user", verifyUser)
	mux.HandleFunc("POST /user/create", CreateUser)
}
