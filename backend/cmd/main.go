package main

import (
	"context"
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
	defer psqlConn.Close(context.Background())

	mux := http.NewServeMux()
	//add cors allow all origins

	routes.AuthRoutes(mux)
	routes.UserRoutes(mux)

	handler := cors.AllowAll().Handler(mux)

	fmt.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		panic(err)
	}
}
