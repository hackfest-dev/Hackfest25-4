package routes

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"server/internal/configs"
)

type OrderReqBody struct {
	Amount int `json:"amount"`
}

// to create a payment order
func createOrder(w http.ResponseWriter, r *http.Request) {
	var data OrderReqBody
	json.NewDecoder(r.Body).Decode(&data)

	client := configs.RazorpayClient

	order := map[string]interface{}{
		"amount":   data.Amount,
		"currency": "INR",
	}

	reciept, err := client.Order.Create(order, nil)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "error creating order", http.StatusInternalServerError)
	}

	reciept["key"] = os.Getenv("RAZORPAY_KEY_ID")

	w.Header().Set("content-type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(reciept)
}

// to verify the payment
func verifyCreateOrder(w http.ResponseWriter, r *http.Request) {

	cook, err := r.Cookie("aadhar")
	if err != nil {
		http.Error(w, "Failed to get cookie", http.StatusBadRequest)
		return
	}
	cookie := cook.Value
	fmt.Println("aadh", cookie)

	if err := r.ParseForm(); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}
	signature := r.FormValue("razorpay_signature")
	orderId := r.FormValue("razorpay_order_id")
	payId := r.FormValue("razorpay_payment_id")

	key := os.Getenv("RAZORPAY_KEY_SECRET")

	hmac := hmac.New(sha256.New, []byte(key))
	hmac.Write([]byte(orderId + "|" + payId))
	expectedSignature := hex.EncodeToString(hmac.Sum(nil))

	if expectedSignature != signature {
		http.Error(w, "Payment verification failed", http.StatusBadRequest)
		return
	}

	// get the details of the payment
	client := configs.RazorpayClient
	payment, err := client.Payment.Fetch(payId, nil, nil)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "error fetching payment", http.StatusInternalServerError)
		return
	}

	amountPaise := int(payment["amount"].(float64))
	amount := amountPaise / 100

	//update the wallet balance
	db := configs.PsqlDB
	query := `UPDATE users SET balance = balance + $1 WHERE adhaar_card_num = $2;`

	_, err = db.Exec(query, amount, cookie)
	if err != nil {
		fmt.Println("Error updating data:", err)
		http.Error(w, "Error updating data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	http.Redirect(w, r, "http://localhost:5173/profile", http.StatusSeeOther)
}

// to invest in a loan
func investInLoan(w http.ResponseWriter, r *http.Request) {
	var data struct {
		amt       int `json:"amount"`
		loanId    int `json:"loanId"`
		totalAmt  int `json:"totalAmt"`
		investAmt int `json:"investAmt"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	if data.investAmt == 4000 {
		configs.SignContract(data.loanId)
	}

	db	:= configs.PsqlDB
	query := `UPDATE loan_asked
	SET contributions = contributions || to_jsonb(
    	jsonb_build_array(
        	jsonb_build_object(
            	'adhaar_card_num', $1,
            	'percentage', &2
        	)
    	)
	)`
	_, err = db.Exec(query, data.amt, data.loanId)
	if err != nil {
		fmt.Println("Error updating data:", err)
		http.Error(w, "Error updating data", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Println("Investment successful")

}

// routes for payment
func PaymentRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /deposit", createOrder)
	mux.HandleFunc("POST /verify-deposit", verifyCreateOrder)

	mux.HandleFunc("POST /invest", investInLoan)
}
