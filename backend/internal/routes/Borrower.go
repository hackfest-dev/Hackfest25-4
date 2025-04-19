package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/configs"
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

func BorrowerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /borrower/loan-req", createLoanReq)
	mux.HandleFunc("POST /borrower/view-loan", getLoanDetails)
}
