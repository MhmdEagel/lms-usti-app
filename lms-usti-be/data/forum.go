package data

type CreateForumPostRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
}

type ForumPostResponse struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Content       string `json:"content"`
	AuthorName    string `json:"author_name"`
	AuthorProfile string `json:"author_profile"`
	CreatedBy     string `json:"created_by"`
	IsPinned      bool   `json:"is_pinned"`
	CommentCount  int    `json:"comment_count"`
	CreatedAt     string `json:"created_at"`
}

type ForumPostDetailResponse struct {
	ID            string            `json:"id"`
	Title         string            `json:"title"`
	Content       string            `json:"content"`
	AuthorName    string            `json:"author_name"`
	AuthorProfile string            `json:"author_profile"`
	CreatedBy     string            `json:"created_by"`
	IsPinned      bool              `json:"is_pinned"`
	CreatedAt     string            `json:"created_at"`
	Comments      []CommentResponse `json:"comments,omitempty"`
}
