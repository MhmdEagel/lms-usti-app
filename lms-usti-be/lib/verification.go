package lib

import (
	"time"

)

func IsTokenVerificationExpired(expires *time.Time) bool {
	val := expires.Compare(time.Now())
	return val == -1
}

