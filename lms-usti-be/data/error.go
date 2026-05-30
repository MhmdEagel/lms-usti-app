package data

var (
	ErrInvalidCredentials = NewAppError(401, "email atau password salah", nil)
	ErrEmailAlreadyExist  = NewAppError(409, "email sudah terdaftar", nil)
	ErrEmailNotFound      = NewAppError(404, "email tidak ditemukan", nil)
	ErrAccountNotVerified = NewAppError(403, "akun belum diverifikasi", nil)
	ErrInvalidToken       = NewAppError(400, "token tidak valid", nil)
	ErrTokenExpired       = NewAppError(400, "token sudah kedaluwarsa", nil)
)

type AppError struct {
	Code    int
	Message string
	Err     error
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(code int, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}
