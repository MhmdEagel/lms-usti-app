package env

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var BASE_URL string = goDotEnvVariable("BASE_URL")
var CLIENT_URL string = goDotEnvVariable("CLIENT_URL")
var DEFAULT_PORT string = goDotEnvVariable("DEFAULT_PORT")
var SECRET_KEY string = goDotEnvVariable("SECRET_KEY")
var CONFIG_SMTP_HOST string = goDotEnvVariable("CONFIG_SMTP_HOST")
var CONFIG_EMAIL_USERNAME string = goDotEnvVariable("CONFIG_EMAIL_USERNAME")
var CONFIG_EMAIL_PASSWORD string = goDotEnvVariable("CONFIG_EMAIL_PASSWORD")
var MAX_FILE_SIZE string = goDotEnvVariable("MAX_FILE_SIZE")
var MAX_FILE_PER_REQUEST string = goDotEnvVariable("MAX_FILE_PER_REQUEST")
var BASE_STORAGE_PATH string = goDotEnvVariable("BASE_STORAGE_PATH")
var DB_USERNAME string = goDotEnvVariable("DB_USERNAME")
var DB_PASSWORD string = goDotEnvVariable("DB_PASSWORD")
var ADMIN_EMAIL string = goDotEnvVariable("ADMIN_EMAIL")
var ADMIN_PASSWORD string = goDotEnvVariable("ADMIN_PASSWORD")

func goDotEnvVariable(key string) string {
	err := godotenv.Load("./.env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	return os.Getenv(key)
}
