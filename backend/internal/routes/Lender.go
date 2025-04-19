package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/configs"
)

type Loan struct {
	LoanID        int64   `json:"loan_id"`
	Aadhar        string  `json:"asked_by"`
	Amt           int64   `json:"amount"`
	Tenure        int32   `json:"tenure"`
	Rate          int32   `json:"interest"`
	Penalty       int32   `json:"penalty"`
	Contributions []uint8 `json:"contributions"`
}

// to get all the loan requests of the user
func getAllLoanReq(w http.ResponseWriter, r *http.Request) {

	db := configs.PsqlDB

	query := `SELECT * FROM loan_asked;`
	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, "Error querying data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var allLoans []Loan
	for rows.Next() {
		var loan Loan
		if err := rows.Scan(&loan.LoanID, &loan.Aadhar, &loan.Amt, &loan.Tenure, &loan.Rate, &loan.Penalty, &loan.Contributions); err != nil {
			http.Error(w, "Error scanning row", http.StatusInternalServerError)
			return
		}
		allLoans = append(allLoans, loan)
	}

	fmt.Println("all loans", allLoans)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(allLoans)
}

// to get the loan requests of the user
func getInvestedLoans(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Aadhar string `json:"aadhar"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDB

	query := `SELECT *
	FROM loan_asked
	WHERE EXISTS (
    SELECT 1
    FROM jsonb_array_elements(contributions) AS contrib
    WHERE contrib->>'adhaar_card_num' = $1
	);`

	var loanReq Loan
	err := db.QueryRow(query, input.Aadhar).Scan(&loanReq.LoanID, &loanReq.Aadhar, &loanReq.Amt, &loanReq.Tenure, &loanReq.Rate, &loanReq.Penalty, &loanReq.Contributions)
	if err != nil {
		fmt.Println("Error querying data:", err)
		http.Error(w, "Error querying data", http.StatusInternalServerError)
		return
	}

	fmt.Println("loan req", loanReq)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loanReq)
}

// to get a single laon based on loan id
func getLoan(w http.ResponseWriter, r *http.Request) {
	var input struct {
		LoanID int64 `json:"loan_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db := configs.PsqlDB

	query := `SELECT * FROM loan_asked WHERE loan_id = $1;`

	var loanReq Loan
	err := db.QueryRow(query, input.LoanID).Scan(&loanReq.LoanID, &loanReq.Aadhar, &loanReq.Amt, &loanReq.Tenure, &loanReq.Rate, &loanReq.Penalty, &loanReq.Contributions)
	if err != nil {
		fmt.Println("Error querying data:", err)
		http.Error(w, "Error querying data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loanReq)
}

// routes to for loan operations
func LoanRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /lender/loan", getLoan)
	mux.HandleFunc("POST /lender/all-loan", getAllLoanReq)
	mux.HandleFunc("POST /lender/invested-loan", getInvestedLoans)
}