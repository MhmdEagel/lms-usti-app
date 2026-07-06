package data

type ClassroomPolicyResponse struct {
	LateSubmission    string `json:"late_submission"`
	ForumPermission   string `json:"forum_permission"`
	CommentPermission string `json:"comment_permission"`
}

type ClassroomPolicyRequest struct {
	LateSubmission    string `json:"late_submission" binding:"required"`
	ForumPermission   string `json:"forum_permission" binding:"required"`
	CommentPermission string `json:"comment_permission" binding:"required"`
}
