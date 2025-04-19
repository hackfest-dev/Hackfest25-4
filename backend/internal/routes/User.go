package routes

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"server/internal/configs"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/rpc"
)

type CreateUsers struct {
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

type User struct {
	Id        int64  `json:"id"`
	Name      string `json:"first_name"`
	PhNum     int64  `json:"ph_num"`
	Email     string `json:"email"`
	Address   string `json:"address"`
	City      string `json:"city"`
	State     string `json:"state"`
	Pincode   string `json:"pincode"`
	AdhaarNum string `json:"adhaar_card_num"`
	PanNum    string `json:"pan_card_num"`
	BankName  string `json:"bank_name"`
	AcNum     string `json:"ac_num"`
	Ifsc      string `json:"ifsc"`
}

type VerifyArg struct{ Aadhar string `json:"aadhar"` }

// to return the varified user
func verifyUser(w http.ResponseWriter, r *http.Request) {
	var input VerifyArg
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fmt.Println("aadhar num", input.Aadhar)

	db := configs.PsqlDB
	query := `SELECT * FROM users
         WHERE adhaar_card_num = $1`

	var user User
	err := db.QueryRow(query, input.Aadhar).Scan(&user.Id, &user.Name, &user.PhNum, &user.Email, &user.Address, &user.City, &user.State, &user.Pincode, &user.AdhaarNum, &user.PanNum, &user.BankName, &user.AcNum, &user.Ifsc)
	if err != nil {
		fmt.Println("psql err", err)
		http.Error(w, "Error fetching user from database", http.StatusInternalServerError)
	}

	fmt.Println(user)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// to create new user
func CreateUser(w http.ResponseWriter, r *http.Request) {

	//parse the request body
	var user CreateUsers
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println("parse err ", err)
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDB

	// insert the user into the database
	_, err = db.Exec("INSERT INTO users (first_name, ph_num, email, address, city, state, pincode, adhaar_card_num, pan_card_num, bank_name, ac_num, ifsc) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
		user.Name, user.PhNum, user.Email, user.Address, user.City, user.State, user.Pincode, user.AdhaarNum, user.PanNum, user.BankName, user.AcNum, user.Ifsc)
	if err != nil {
		fmt.Println("psql err", err)
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}

	if err := CreateCustodialWallet(user.AdhaarNum); err != nil {
		fmt.Println("err creating wallet :", err)
		http.Error(w, "Error creating custodial wallet", http.StatusInternalServerError)
		return
	}

	//generate jwt token
	// token, err := helpers.GenarateJwtToken(user.PhNum)
	// if err != nil {
	// 	http.Error(w, "Error generating JWT token", http.StatusInternalServerError)
	// 	return
	// }
	// cookie := &http.Cookie{
	// 	Name:    "jwt",
	// 	Value:   token.Value,
	// 	Expires: time.Now().AddDate(0, 1, 0),
	// }
	// http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
	fmt.Println("User created successfully")
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
	db := configs.PsqlDB
	hashPrivateKey := crypto.Keccak256Hash(crypto.FromECDSA(privateKey))

	_, err = db.Exec("INSERT INTO wallet (adhaar_card_num, public_key, private_key_encrypted) VALUES ($1, $2, $3)",
		adNum, addrs.Hex(), hashPrivateKey.Hex())
	if err != nil {
		return err
	}

	return nil
}

// routes for users
func UserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /user/verify-user", verifyUser)
	mux.HandleFunc("POST /user/create", CreateUser)
}
