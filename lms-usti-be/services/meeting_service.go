package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type MeetingService struct {
	meetingRepository  repositories.MeetingRepositoryInterface
	classroomRepository repositories.ClassroomRepositoryInterface
}

type MeetingServiceInterface interface {
	Create(req data.MeetingRequest) error
	FindAll(classroomId string, search string) ([]data.MeetingResponse, error)
	FindById(meetingId, classroomId string) (data.MeetingResponse, error)
	Update(meetingId, classroomId, userID string, req data.MeetingUpdateRequest) error
	Delete(meetingId, classroomId, userID string) error
	Reorder(classroomId, userID string, req data.ReorderRequest) error
}

func NewMeetingService(meetingRepository repositories.MeetingRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface) MeetingServiceInterface {
	return &MeetingService{meetingRepository: meetingRepository, classroomRepository: classroomRepository}
}

func (s *MeetingService) Create(req data.MeetingRequest) error {
	classroom, err := s.classroomRepository.FindById(req.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	if classroom.DosenId != req.DosenId {
		return data.ErrUnauthorized(nil)
	}

	count, err := s.meetingRepository.CountByClassroom(classroom.ID)
	if err != nil {
		return data.ErrInternalServer(err)
	}
	if count >= 16 {
		return data.ErrMeetingMaxReached(nil)
	}

	meeting := &model.Meeting{
		Position:    int(count) + 1,
		Topic:       req.Topic,
		Description: req.Description,
		ClassroomId: classroom.ID,
		DosenId:     req.DosenId,
	}
	return s.meetingRepository.Create(meeting)
}

func (s *MeetingService) FindAll(classroomId string, search string) ([]data.MeetingResponse, error) {
	if _, err := s.classroomRepository.FindById(classroomId); err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	meetings, err := s.meetingRepository.FindAll(classroomId, search)
	if err != nil {
		return nil, err
	}
	var result []data.MeetingResponse
	for _, m := range meetings {
		var materials []data.MeetingMaterialItem
		for _, mat := range m.Materials {
			materials = append(materials, data.MeetingMaterialItem{
				ID:        mat.ID,
				Title:     mat.Title,
				CreatedAt: mat.CreatedAt.Format(time.RFC3339Nano),
			})
		}
		var assignments []data.MeetingAssignmentItem
		for _, a := range m.Assignments {
			deadline := ""
			if a.Deadline.Valid {
				deadline = a.Deadline.Time.Format(time.RFC3339Nano)
			}
			assignments = append(assignments, data.MeetingAssignmentItem{
				ID:        a.ID,
				Title:     a.Title,
				Deadline:  deadline,
				CreatedAt: a.CreatedAt.Format(time.RFC3339Nano),
			})
		}
		result = append(result, data.MeetingResponse{
			ID:          m.ID,
			Position:    m.Position,
			Topic:       m.Topic,
			Description: m.Description,
			DosenId:     m.DosenId,
			CreatedAt:   m.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt:   m.UpdatedAt.Format(time.RFC3339Nano),
			MaterialCount:   len(m.Materials),
			AssignmentCount: len(m.Assignments),
			Materials:       materials,
			Assignments:     assignments,
		})
	}
	return result, nil
}

func (s *MeetingService) FindById(meetingId, classroomId string) (data.MeetingResponse, error) {
	if _, err := s.classroomRepository.FindById(classroomId); err != nil {
		return data.MeetingResponse{}, data.ErrClassroomNotFound(err)
	}
	meeting, err := s.meetingRepository.FindById(meetingId)
	if err != nil {
		return data.MeetingResponse{}, data.ErrMeetingNotFound(err)
	}
	return data.MeetingResponse{
		ID:          meeting.ID,
		Position:    meeting.Position,
		Topic:       meeting.Topic,
		Description: meeting.Description,
		DosenId:     meeting.DosenId,
		CreatedAt:   meeting.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt:   meeting.UpdatedAt.Format(time.RFC3339Nano),
		Materials:   []data.MeetingMaterialItem{},
		Assignments: []data.MeetingAssignmentItem{},
	}, nil
}

func (s *MeetingService) Update(meetingId, classroomId, userID string, req data.MeetingUpdateRequest) error {
	classroom, err := s.classroomRepository.FindById(classroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	if classroom.DosenId != userID {
		return data.ErrUnauthorized(nil)
	}
	meeting, err := s.meetingRepository.FindById(meetingId)
	if err != nil {
		return data.ErrMeetingNotFound(err)
	}
	if req.Position != nil {
		meeting.Position = *req.Position
	}
	if req.Topic != nil {
		meeting.Topic = *req.Topic
	}
	if req.Description != nil {
		meeting.Description = *req.Description
	}
	return s.meetingRepository.Update(meeting)
}

func (s *MeetingService) Delete(meetingId, classroomId, userID string) error {
	classroom, err := s.classroomRepository.FindById(classroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	if classroom.DosenId != userID {
		return data.ErrUnauthorized(nil)
	}
	err = s.meetingRepository.Delete(meetingId, classroomId)
	if err != nil {
		return data.ErrMeetingNotFound(err)
	}
	return nil
}

func (s *MeetingService) Reorder(classroomId, userID string, req data.ReorderRequest) error {
	classroom, err := s.classroomRepository.FindById(classroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	if classroom.DosenId != userID {
		return data.ErrUnauthorized(nil)
	}
	return s.meetingRepository.Reorder(req.MeetingIDs)
}
