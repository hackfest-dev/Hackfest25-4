package routes

import (
	"context"
	"encoding/json"
	"net/http"
	"server/internal/configs"
	"server/internal/helpers"
)

type CreateUserReq struct {
	FirstName     string `json:"first_name"`
	MiddleName    string `json:"middle_name"`
	LastName      string `json:"last_name"`
	UserType      string `json:"user_type"`
	PhNum         string `json:"ph_num"`
	Email         string `json:"email"`
	Address       string `json:"address"`
	City          string `json:"city"`
	State         string `json:"state"`
	Pincode       string `json:"pincode"`
	AdhaarCardNum string `json:"adhaar_card_num"`
	PanCardNum    string `json:"pan_card_num"`
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
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDb

	//insert the user into the database
	_, err = db.Exec(context.Background(), "INSERT INTO users (first_name, middle_name, last_name, user_type, ph_num, email, address, city, state, pincode, adhaar_card_num, pan_card_num) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
		user.FirstName, user.MiddleName, user.LastName, user.UserType, user.PhNum, user.Email, user.Address, user.City, user.State, user.Pincode, user.AdhaarCardNum, user.PanCardNum)
	if err != nil {
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

// routes for users
func UserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /auth/verify-user", verifyUser)
}
