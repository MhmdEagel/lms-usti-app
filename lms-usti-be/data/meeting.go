package data

type MeetingRequest struct {
	Topic       string `json:"topic" binding:"required"`
	Description string `json:"description"`
	ClassroomId string
	DosenId     string
}

type ReorderRequest struct {
	MeetingIDs []string `json:"meeting_ids" binding:"required"`
}

type MeetingUpdateRequest struct {
	Position    *int    `json:"position"`
	Topic       *string `json:"topic"`
	Description *string `json:"description"`
}

type MeetingMaterialItem struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	CreatedAt string `json:"created_at"`
}

type MeetingAssignmentItem struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Deadline  string `json:"deadline"`
	CreatedAt string `json:"created_at"`
}

type MeetingResponse struct {
	ID          string `json:"id"`
	Position    int    `json:"position"`
	Topic       string `json:"topic"`
	Description string `json:"description"`
	DosenId     string `json:"dosen_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
	MaterialCount   int                    `json:"material_count"`
	AssignmentCount int                    `json:"assignment_count"`
	Materials       []MeetingMaterialItem   `json:"materials"`
	Assignments     []MeetingAssignmentItem `json:"assignments"`
}
