package main

import (
	"fmt"
	"net/http"
	"server/internal/configs"
	"server/internal/routes"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic("Error loading .env file")
	}

	//initializing all the configs
	ethCl := configs.InitEthClient()
	defer ethCl.Close()
	configs.InitTwilio()
	psqlConn := configs.InitPsql()
	defer psqlConn.Close()

	//initializing all routes
	mux := http.NewServeMux()

	routes.AuthRoutes(mux)
	routes.UserRoutes(mux)
	routes.LoanRoutes(mux)
	routes.PaymentRoutes(mux)
	routes.BorrowerRoutes(mux)

	handler := cors.AllowAll().Handler(mux)

	fmt.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		panic(err)
	}
}
