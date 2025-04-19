package configs

import (
	"fmt"
	"os"

	"github.com/razorpay/razorpay-go"
)

var RazorpayClient *razorpay.Client

// initialize the razorpay client
func InitRazorPayClient() {
	key := os.Getenv("RAZORPAY_KEY_ID")
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	RazorpayClient = razorpay.NewClient(key, secret)

	cardInfo := RazorpayClient.Card
	fmt.Println("payment api info : ", *cardInfo)
}
