package data

type ClassroomPolicyResponse struct {
	ForumPermission   string `json:"forum_permission"`
	CommentPermission string `json:"comment_permission"`
}

type ClassroomPolicyRequest struct {
	ForumPermission   string `json:"forum_permission" binding:"required"`
	CommentPermission string `json:"comment_permission" binding:"required"`
}
