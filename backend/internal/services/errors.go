package services

type StatusError struct {
	Code int
	Msg  string
}

func (e *StatusError) Error() string {
	return e.Msg
}

func NewStatusError(code int, msg string) *StatusError {
	return &StatusError{
		Code: code,
		Msg:  msg,
	}
}
