package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type ClassroomForumPostService struct {
	classroomForumPostRepository repositories.ClassroomForumPostRepositoryInterface
	classroomRepository          repositories.ClassroomRepositoryInterface
	commentRepository            repositories.CommentRepositoryInterface
	classroomPolicyRepository    repositories.ClassroomPolicyRepositoryInterface
}

type ClassroomForumPostServiceInterface interface {
	Create(req data.ClassroomForumPostRequest, userRole string) error
	FindAll(classroomId string, search string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error)
	FindById(forumPostId, classroomId string) (data.ClassroomForumPostResponse, error)
	Update(forumPostId, classroomId string, req data.ClassroomForumPostUpdateRequest) error
	Delete(forumPostId, classroomId string) error
}

func NewClassroomForumPostService(classroomForumPostRepository repositories.ClassroomForumPostRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface, commentRepository repositories.CommentRepositoryInterface, classroomPolicyRepository repositories.ClassroomPolicyRepositoryInterface) ClassroomForumPostServiceInterface {
	return &ClassroomForumPostService{classroomForumPostRepository: classroomForumPostRepository, classroomRepository: classroomRepository, commentRepository: commentRepository, classroomPolicyRepository: classroomPolicyRepository}
}

func (s *ClassroomForumPostService) Create(req data.ClassroomForumPostRequest, userRole string) error {
	classroom, err := s.classroomRepository.FindById(req.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}

	if userRole == "MAHASISWA" {
		policy, err := s.classroomPolicyRepository.FindByClassroomId(req.ClassroomId)
		if err != nil && err != gorm.ErrRecordNotFound {
			return data.ErrInternalServer(err)
		}
		if err == nil && (policy.ForumPermission == model.ForumPermissionComment || policy.ForumPermission == model.ForumPermissionDosen) {
			return data.ErrForumPermissionDenied(err)
		}
	}

	forumPost := model.ClassroomForumPost{
		Title:       req.Title,
		Content:     req.Content,
		ClassroomId: classroom.ID,
		DosenId:     req.DosenId,
	}
	if err := s.classroomForumPostRepository.Create(forumPost); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}
func (s *ClassroomForumPostService) FindAll(classroomId string, search string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error) {
	if _, err := s.classroomRepository.FindById(classroomId); err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	paginatedResult, err = s.classroomForumPostRepository.FindAll(classroomId, search, pagination)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	forumPosts := paginatedResult.Data.([]model.ClassroomForumPost)
	var ids []string
	for _, v := range forumPosts {
		ids = append(ids, v.ID)
	}
	counts, _ := s.commentRepository.CountByCommentableBatch(model.CommentableTypeAnnouncement, ids)
	var forumPostResponses []data.ClassroomForumPostResponse
	for _, v := range forumPosts {
		forumPost := data.ClassroomForumPostResponse{
			Id:            v.ID,
			Title:         v.Title,
			Content:       v.Content,
			IsPinned:      v.IsPinned,
			ClassroomName: v.Classroom.ClassName,
			CreatedBy:     v.Dosen.Fullname,
			CreatedAt:     v.CreatedAt.Format(time.RFC3339Nano),
			CommentCount:  counts[v.ID],
		}
		forumPostResponses = append(forumPostResponses, forumPost)
	}
	paginatedResult.Data = forumPostResponses
	return paginatedResult, nil
}
func (s *ClassroomForumPostService) FindById(forumPostId, classroomId string) (data.ClassroomForumPostResponse, error) {
	if _, err := s.classroomRepository.FindById(classroomId); err != nil {
		return data.ClassroomForumPostResponse{}, data.ErrClassroomNotFound(err)
	}
	forumPost, err := s.classroomForumPostRepository.FindById(forumPostId)
	if err != nil {
		return data.ClassroomForumPostResponse{}, data.ErrClassroomForumPostNotFound(err)
	}
	counts, _ := s.commentRepository.CountByCommentableBatch(model.CommentableTypeAnnouncement, []string{forumPostId})
	count := counts[forumPostId]
	return data.ClassroomForumPostResponse{
		Id:            forumPost.ID,
		Title:         forumPost.Title,
		Content:       forumPost.Content,
		IsPinned:      forumPost.IsPinned,
		ClassroomName: forumPost.Classroom.ClassName,
		CreatedBy:     forumPost.Dosen.Fullname,
		CreatedAt:     forumPost.CreatedAt.Format(time.RFC3339Nano),
		CommentCount:  count,
	}, nil
}

func (s *ClassroomForumPostService) Update(forumPostId, classroomId string, req data.ClassroomForumPostUpdateRequest) error {
	if _, err := s.classroomRepository.FindById(classroomId); err != nil {
		return data.ErrClassroomNotFound(err)
	}

	if req.IsPinned != nil {
		if err := s.classroomForumPostRepository.UpdateIsPinned(forumPostId, classroomId, *req.IsPinned); err != nil {
			if err == gorm.ErrRecordNotFound {
				return data.ErrClassroomForumPostNotFound(err)
			}
			return data.ErrInternalServer(err)
		}
	}

	if req.Title != nil || req.Content != nil {
		forumPost, err := s.classroomForumPostRepository.FindById(forumPostId)
		if err != nil {
			return data.ErrClassroomForumPostNotFound(err)
		}
		if req.Title != nil {
			forumPost.Title = *req.Title
		}
		if req.Content != nil {
			forumPost.Content = *req.Content
		}
		if err := s.classroomForumPostRepository.Update(forumPost); err != nil {
			return data.ErrInternalServer(err)
		}
	}

	return nil
}
func (s *ClassroomForumPostService) Delete(forumPostId, classroomId string) error {
	err := s.classroomForumPostRepository.Delete(forumPostId, classroomId)
	if err != nil {
		return data.ErrClassroomForumPostNotFound(err)
	}
	return nil
}
