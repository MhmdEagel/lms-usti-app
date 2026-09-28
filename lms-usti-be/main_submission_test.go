package main

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/gin-gonic/gin"
)

func seedAssignmentWithPolicy(t *testing.T, r *gin.Engine, classroomId, token string, deadline time.Time, lateSubmission string) string {
	t.Helper()
	req := map[string]any{
		"title":           "Tugas Deadline",
		"deadline":        deadline.Format(time.RFC3339),
		"instruction":     "Kerjakan",
		"rubrics":         []data.AssignmentRubricRequest{},
		"attachments":     []data.AttachmentRequest{},
		"late_submission": lateSubmission,
	}
	body, _ := json.Marshal(req)
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroomId+"/assignments", string(body), token)
	if w.Code != http.StatusOK {
		t.Fatalf("seed assignment failed: %d: %s", w.Code, w.Body.String())
	}
	w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroomId+"/assignments", "", token)
	var list struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &list)
	if len(list.Data) == 0 {
		t.Fatal("no assignments found")
	}
	return list.Data[0].ID
}

// --- Tahap: Test Submission setelah deadline ---

func TestSubmissionAfterDeadline(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAssignmentTestRouter(db)

	pastDeadline := time.Now().Add(-2 * time.Hour)

	t.Run("Ditolak 400 saat late_submission not_allowed", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mhsToken := generateToken(mhs)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		assignmentId := seedAssignmentWithPolicy(t, r, classroom.ID, dosenToken, pastDeadline, "not_allowed")

		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId+"/submissions", `{"attachments":[]}`, mhsToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
		res := parseResponse(w)
		if res.Meta.Message != "Batas pengumpulan tugas telah berlalu" {
			t.Errorf("expected 'Batas pengumpulan tugas telah berlalu', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Diizinkan 200 saat late_submission allow", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mhsToken := generateToken(mhs)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		if err := db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: classroom.ID}).Error; err != nil {
			t.Fatalf("seed member failed: %v", err)
		}

		assignmentId := seedAssignmentWithPolicy(t, r, classroom.ID, dosenToken, pastDeadline, "allow")

		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId+"/submissions", `{"attachments":[]}`, mhsToken)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})
}
