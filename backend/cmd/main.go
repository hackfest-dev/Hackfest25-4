package main

import (
	"context"
	"net/http"
	"server/internal/configs"
	"server/internal/routes"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic("Error loading .env file")
	}

	//initializing all the configs
	configs.InitTwilio()
	psqlConn := configs.InitPsql()
	defer psqlConn.Close(context.Background())

	mux := http.NewServeMux()

	routes.AuthRoutes(mux)
	routes.UserRoutes(mux)

	if err := http.ListenAndServe(":8080", mux); err != nil {
		panic(err)
	}
}
