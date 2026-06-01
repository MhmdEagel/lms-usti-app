package data

import "time"

type AssignmentRequest struct {
	Title       string                    `json:"title" binding:"required"`
	Deadline    time.Time                 `json:"deadline" binding:"required"`
	Instruction string                    `json:"instruction"`
	Rubrics     []AssignmentRubricRequest `json:"rubrics"`
	ClassroomId string
}
type AssignmentUpdateRequest struct {
	ID          string
	Title       *string                         `json:"title"`
	Deadline    *time.Time                      `json:"deadline"`
	Instruction *string                         `json:"instruction"`
	Rubrics     []AssignmentRubricUpdateRequest `json:"rubrics"`
	ClassroomId string
}

type AssignmentRubricRequest struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

type AssignmentRubricUpdateRequest struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}
type AssignmentDetailResponse struct {
	ID          string                     `json:"id"`
	Title       string                     `json:"title"`
	Deadline    time.Time                  `json:"deadline"`
	Instruction string                     `json:"instruction"`
	Rubrics     []AssignmentRubricResponse `json:"rubrics"`
}
type AssignmentResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Deadline    time.Time `json:"deadline"`
	Instruction string    `json:"instruction"`
}

type AssignmentRubricResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Score int    `json:"score"`
}
