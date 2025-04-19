package routes

import (
	"encoding/json"
	"net/http"
	// "server/internal/configs"
)

// to get all the loan requests of the user
func getAllLoanReq(w http.ResponseWriter, r *http.Request) {

	var body struct {
		Aadhar string `json:"aadhar"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// db := configs.PsqlDB

	// query := `SELECT * FROM loan_asked;`
	// rows, err := db.Query(query, body.Aadhar)

}

// routes to for loan operations
func LoanRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /lender/all-loan", getAllLoanReq)
}
