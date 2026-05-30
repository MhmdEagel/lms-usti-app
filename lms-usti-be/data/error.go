package data

func ErrInvalidCredentials(err error) *AppError { return NewAppError(401, "email atau password salah", err) }
func ErrEmailAlreadyExist(err error) *AppError  { return NewAppError(409, "email sudah terdaftar", err) }
func ErrEmailNotFound(err error) *AppError      { return NewAppError(404, "email tidak ditemukan", err) }
func ErrAccountNotVerified(err error) *AppError { return NewAppError(403, "akun belum diverifikasi", err) }
func ErrInvalidToken(err error) *AppError       { return NewAppError(400, "token tidak valid", err) }
func ErrTokenExpired(err error) *AppError       { return NewAppError(400, "token sudah kedaluwarsa", err) }


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
