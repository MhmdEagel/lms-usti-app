package lib

import (
	"crypto/rand"
	"math/big"
)

func GenerateOTP() string {
	const digits = "0123456789"
	result := make([]byte, 6)
	for i := range result {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		result[i] = digits[n.Int64()]
	}
	return string(result)
}
