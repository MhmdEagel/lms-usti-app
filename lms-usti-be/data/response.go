package data

type Response struct {
	Meta ResponseStatus `json:"meta"`
	Data any            `json:"data"`
}
type ResponseStatus struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

func NewResponse(status int, message string, data any) Response {
	return Response{
		Meta: ResponseStatus{
			Status:  status,
			Message: message,
		},
		Data: data,
	}
}

type PaginationResponse struct {
	Meta       ResponseStatus `json:"meta"`
	Pagination Pagination     `json:"pagination"`
	Data       any            `json:"data"`
}

func NewPaginationResponse(status int, message string, pagination Pagination, data any) PaginationResponse {
	return PaginationResponse{
		Meta: ResponseStatus{
			Status:  status,
			Message: message,
		},
		Pagination: pagination,
		Data:       data,
	}
}

type Pagination struct {
	Limit      int   `json:"limit"`
	TotalPages int   `json:"total_pages"`
	Total      int64 `json:"total"`
	Current    int   `json:"current"`
}

type PaginationWithData struct {
	Pagination Pagination
	Data       any
}

func (p *Pagination) GetOffset() int {
	return (p.GetCurrent() - 1) * p.GetLimit()
}
func (p *Pagination) GetLimit() int {
	if p.Limit == 0 {
		p.Limit = 10
	}
	return p.Limit
}
func (p *Pagination) GetCurrent() int {
	if p.Current == 0 {
		p.Current = 1
	}
	return p.Current
}
