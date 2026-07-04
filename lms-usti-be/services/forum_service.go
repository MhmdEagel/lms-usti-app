package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type ForumService struct {
	forumRepository repositories.ForumRepositoryInterface
	commentRepository repositories.CommentRepositoryInterface
}

type ForumServiceInterface interface {
	CreatePost(req data.CreateForumPostRequest, userId string) error
	FindAllPosts() ([]data.ForumPostResponse, error)
	FindPostById(id string) (data.ForumPostDetailResponse, error)
	DeletePost(id string, userId string, userRole string) error
}

func NewForumService(forumRepository repositories.ForumRepositoryInterface, commentRepository repositories.CommentRepositoryInterface) ForumServiceInterface {
	return &ForumService{forumRepository: forumRepository, commentRepository: commentRepository}
}

func (f *ForumService) CreatePost(req data.CreateForumPostRequest, userId string) error {
	post := model.ForumPost{
		Title:     req.Title,
		Content:   req.Content,
		CreatedBy: userId,
	}
	if err := f.forumRepository.Create(post); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}

func (f *ForumService) FindAllPosts() ([]data.ForumPostResponse, error) {
	posts, err := f.forumRepository.FindAll()
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	if len(posts) == 0 {
		return []data.ForumPostResponse{}, nil
	}
	ids := make([]string, len(posts))
	for i, p := range posts {
		ids[i] = p.ID
	}
	counts, err := f.commentRepository.CountByCommentableBatch(model.CommentableTypeForumPost, ids)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	var res []data.ForumPostResponse
	for _, p := range posts {
		res = append(res, data.ForumPostResponse{
			ID:            p.ID,
			Title:         p.Title,
			Content:       p.Content,
			AuthorName:    p.Author.Fullname,
			AuthorProfile: p.Author.Image,
			CreatedBy:     p.CreatedBy,
			IsPinned:      p.IsPinned,
			CommentCount:  int(counts[p.ID]),
			CreatedAt:     p.CreatedAt.Format(time.RFC3339Nano),
		})
	}
	return res, nil
}

func (f *ForumService) FindPostById(id string) (data.ForumPostDetailResponse, error) {
	post, err := f.forumRepository.FindById(id)
	if err != nil {
		return data.ForumPostDetailResponse{}, data.ErrForumPostNotFound(err)
	}
	comments, err := f.commentRepository.FindAll(model.CommentableTypeForumPost, id)
	if err != nil {
		return data.ForumPostDetailResponse{}, data.ErrInternalServer(err)
	}
	var commentRes []data.CommentResponse
	for _, c := range comments {
		commentRes = append(commentRes, data.CommentResponse{
			ID:        c.ID,
			Content:   c.Content,
			CreatedBy: c.CreatedBy,
			User: data.CommentUserResponse{
				Fullname: c.User.Fullname,
				Profile:  c.User.Image,
			},
			CreatedAt: c.CreatedAt,
		})
	}
	return data.ForumPostDetailResponse{
		ID:            post.ID,
		Title:         post.Title,
		Content:       post.Content,
		AuthorName:    post.Author.Fullname,
		AuthorProfile: post.Author.Image,
		CreatedBy:     post.CreatedBy,
		IsPinned:      post.IsPinned,
		CreatedAt:     post.CreatedAt.Format(time.RFC3339Nano),
		Comments:      commentRes,
	}, nil
}

func (f *ForumService) DeletePost(id, userId, userRole string) error {
	if userRole == "PRODI" {
		if _, err := f.forumRepository.FindById(id); err != nil {
			return data.ErrForumPostNotFound(err)
		}
		if err := f.forumRepository.DeleteByID(id); err != nil {
			return data.ErrForumPostNotFound(err)
		}
		return nil
	}
	if err := f.forumRepository.Delete(id, userId); err != nil {
		return data.ErrForumPostNotFound(err)
	}
	return nil
}
