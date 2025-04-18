package helpers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"server/internal/configs"
	"time"

	"github.com/golang-jwt/jwt"
)

// to generate jwt token
func GenarateJwtToken(num string) (*http.Cookie, error) {

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"phoneNumber": num})

	secrect := os.Getenv("JWT_SECRET_KEY")
	signedToken, err := jwtToken.SignedString([]byte(secrect))
	if err != nil {
		return nil, err
	}

	//expire after 1 month
	cookie := &http.Cookie{
		Name:    "jwt",
		Value:   signedToken,
		Expires: time.Now().Add(30 * 24 * time.Hour),
	}

	return cookie, nil
}

// to parse verify jwt token
func VerifyJwtToken(token string) (string, error) {
	secret := os.Getenv("JWT_SECRET_KEY")

	jwtToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return "", err
	}

	if claims, ok := jwtToken.Claims.(jwt.MapClaims); ok && jwtToken.Valid {
		phNum := claims["phoneNumber"].(string)
		return phNum, nil
	}
	return "", nil
}

// middleware to check if user is authenticated
func JwtMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("jwt")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token := cookie.Value
		phNum, err := VerifyJwtToken(token)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		// phNum := "9999999999"
		//read the user data based on the phone number
		db := configs.PsqlDb
		row, err := db.Query(context.Background(), "SELECT first_name FROM users WHERE ph_num = $1", phNum)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			fmt.Println("Error fetching user data:", err)
			return
		}
		defer row.Close()
		if !row.Next() {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			fmt.Println("User not found")
			return
		}

		// read the user data
		var firstName string
		if err := row.Scan(&firstName); err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			fmt.Println("Error scanning user data:", err)
			return
		}

		r.Header.Set("first_name", firstName)
		next.ServeHTTP(w, r)
	})
}