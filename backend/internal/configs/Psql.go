package configs

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var PsqlDB *sql.DB

func InitPsql() *sql.DB {
	connStr := os.Getenv("PSQL_DB_URL") 

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Unable to ping database:", err)
	}
	
	PsqlDB = db
	return db
}
