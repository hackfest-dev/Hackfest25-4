package configs

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

var PsqlDb *pgx.Conn

func InitPsql() *pgx.Conn {
	connStr := os.Getenv("PSQL_DB_URL")
	conn, err := pgx.Connect(context.Background(), connStr)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	PsqlDb = conn
	return conn
}
