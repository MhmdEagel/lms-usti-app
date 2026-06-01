package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/env"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

var testStoragePath string
var dummyDir = "dummy"

func TestMain(m *testing.M) {
	var err error
	testStoragePath, err = os.MkdirTemp("", "media-test-*")
	if err != nil {
		log.Fatal("failed to create temp storage:", err)
	}
	os.MkdirAll(filepath.Join(testStoragePath, "materials"), 0755)
	os.MkdirAll(filepath.Join(testStoragePath, "assignments"), 0755)
	os.MkdirAll(filepath.Join(testStoragePath, "profiles"), 0755)

	env.BASE_STORAGE_PATH = testStoragePath
	env.BASE_URL = "http://localhost:8080/lms-usti-api"

	code := m.Run()

	os.RemoveAll(testStoragePath)
	os.Exit(code)
}

func setupMediaTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	r.Use(globalErrMiddleware.Handle())

	mediaService := services.NewMediaService()
	mediaController := controllers.NewMediaController(mediaService)

	api := r.Group("/lms-usti-api")
	{
		media := api.Group("/media")
		{
			materials := media.Group("/materials")
			materials.GET("/:name", mediaController.FindMaterialFile)
			materials.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadMaterial)
			materials.POST("/delete-batch", authMiddleware.Handle(), mediaController.RemoveMaterialBatch)
			materials.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveMaterial)

			assignments := media.Group("/assignments")
			assignments.GET("/:name", mediaController.FindAssignmentFile)
			assignments.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadAssignment)
			assignments.POST("/delete-batch", authMiddleware.Handle(), mediaController.RemoveAssignmentBatch)
			assignments.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveAssignment)

			profiles := media.Group("/profiles")
			profiles.POST("", mediaController.UploadProfilePicture)
			profiles.GET("/:name", mediaController.FindProfilePicture)
			profiles.DELETE("/:name", mediaController.RemoveProfilePicture)
		}
	}
	return r
}

func writeFileToMultipart(filePath string) (*bytes.Buffer, string, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	file, err := os.Open(filePath)
	if err != nil {
		return nil, "", err
	}
	defer file.Close()

	part, err := writer.CreateFormFile("file", filepath.Base(filePath))
	if err != nil {
		return nil, "", err
	}
	if _, err := io.Copy(part, file); err != nil {
		return nil, "", err
	}
	writer.Close()
	return body, writer.FormDataContentType(), nil
}

func makeMultipartRequest(r *gin.Engine, method, url, filePath, token string) (*httptest.ResponseRecorder, error) {
	body, contentType, err := writeFileToMultipart(filePath)
	if err != nil {
		return nil, err
	}
	req := httptest.NewRequest(method, url, body)
	req.Header.Set("Content-Type", contentType)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w, nil
}

func createTestToken(role string) string {
	token, err := lib.CreateToken("Test User", "test@test.com", role, "user-id-123")
	if err != nil {
		panic("failed to generate token: " + err.Error())
	}
	return token
}

func copyDummyFile(src, destDir, newName string) error {
	dest := filepath.Join(destDir, newName)
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	destFile, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, srcFile)
	return err
}

func uploadTestFile(r *gin.Engine, url, filePath, token string) (*httptest.ResponseRecorder, string, error) {
	w, err := makeMultipartRequest(r, "POST", url, filePath, token)
	if err != nil {
		return nil, "", err
	}
	var res testResponse
	json.Unmarshal(w.Body.Bytes(), &res)

	uniqueFileName := ""
	if res.Data != nil {
		var data struct {
			UniqueFileName string `json:"unique_file_name"`
		}
		json.Unmarshal(res.Data, &data)
		uniqueFileName = data.UniqueFileName
	}
	return w, uniqueFileName, nil
}

// --- Tahap 2: Test FindFile (GET) ---

func TestFindMaterialFile(t *testing.T) {
	r := setupMediaTestRouter()

	t.Run("File exists", func(t *testing.T) {
		err := copyDummyFile(filepath.Join(dummyDir, "test_material.pdf"), filepath.Join(testStoragePath, "materials"), "test.pdf")
		if err != nil {
			t.Fatalf("failed to copy dummy file: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "materials", "test.pdf"))

		w := makeRequest(r, "GET", "/lms-usti-api/media/materials/test.pdf", "", "")
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
		if w.Body.Len() == 0 {
			t.Errorf("expected file content, got empty body")
		}
	})

	t.Run("File not found", func(t *testing.T) {
		w := makeRequest(r, "GET", "/lms-usti-api/media/materials/nonexistent.pdf", "", "")
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
		if res.Meta.Message != "file not found" {
			t.Errorf("expected 'file not found', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Path traversal", func(t *testing.T) {
		w := makeRequest(r, "GET", "/lms-usti-api/media/materials/../etc/passwd", "", "")
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
	})
}

func TestFindAssignmentFile(t *testing.T) {
	r := setupMediaTestRouter()

	t.Run("File exists", func(t *testing.T) {
		err := copyDummyFile(filepath.Join(dummyDir, "test_video.mp4"), filepath.Join(testStoragePath, "assignments"), "test.mp4")
		if err != nil {
			t.Fatalf("failed to copy dummy file: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "assignments", "test.mp4"))

		w := makeRequest(r, "GET", "/lms-usti-api/media/assignments/test.mp4", "", "")
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
		if w.Body.Len() == 0 {
			t.Errorf("expected file content, got empty body")
		}
	})

	t.Run("File not found", func(t *testing.T) {
		w := makeRequest(r, "GET", "/lms-usti-api/media/assignments/nonexistent.mp4", "", "")
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
		if res.Meta.Message != "file not found" {
			t.Errorf("expected 'file not found', got '%s'", res.Meta.Message)
		}
	})
}

func TestFindProfilePicture(t *testing.T) {
	r := setupMediaTestRouter()

	t.Run("File exists", func(t *testing.T) {
		err := copyDummyFile(filepath.Join(dummyDir, "profile.jpeg"), filepath.Join(testStoragePath, "profiles"), "profile.jpeg")
		if err != nil {
			t.Fatalf("failed to copy dummy file: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "profiles", "profile.jpeg"))

		w := makeRequest(r, "GET", "/lms-usti-api/media/profiles/profile.jpeg", "", "")
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
		if w.Body.Len() == 0 {
			t.Errorf("expected file content, got empty body")
		}
	})

	t.Run("File not found", func(t *testing.T) {
		w := makeRequest(r, "GET", "/lms-usti-api/media/profiles/nonexistent.jpg", "", "")
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
		if res.Meta.Message != "file not found" {
			t.Errorf("expected 'file not found', got '%s'", res.Meta.Message)
		}
	})
}

// --- Tahap 3: Test Upload (POST) ---

func TestUploadMaterial(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")

	t.Run("Upload PDF berhasil", func(t *testing.T) {
		w, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}

		var res testResponse
		json.Unmarshal(w.Body.Bytes(), &res)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "file berhasil diupload" {
			t.Errorf("expected 'file berhasil diupload', got '%s'", res.Meta.Message)
		}
		if res.Data == nil {
			t.Fatal("expected data in response")
		}

		var data struct {
			FileName       string `json:"file_name"`
			UniqueFileName string `json:"unique_file_name"`
			FileUrl        string `json:"file_url"`
		}
		json.Unmarshal(res.Data, &data)
		if data.FileName != "test_material.pdf" {
			t.Errorf("expected 'test_material.pdf', got '%s'", data.FileName)
		}
		if data.UniqueFileName == "" {
			t.Errorf("expected non-empty unique_file_name")
		}
		if data.FileUrl == "" {
			t.Errorf("expected non-empty file_url")
		}

		// Cleanup uploaded file
		if uniqueFileName != "" {
			os.Remove(filepath.Join(testStoragePath, "materials", uniqueFileName))
		}
	})

	t.Run("Upload tanpa file", func(t *testing.T) {
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/media/materials", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Upload file tidak diizinkan (.exe)", func(t *testing.T) {
		// Create a temporary .exe file
		tmpFile, err := os.CreateTemp("", "*.exe")
		if err != nil {
			t.Fatalf("failed to create temp file: %v", err)
		}
		tmpFile.Write([]byte("fake exe content"))
		tmpFile.Close()
		defer os.Remove(tmpFile.Name())

		w, err := makeMultipartRequest(r, "POST", "/lms-usti-api/media/materials", tmpFile.Name(), dosenToken)
		if err != nil {
			t.Fatalf("failed to make multipart request: %v", err)
		}
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestUploadAssignment(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")

	t.Run("Upload video berhasil", func(t *testing.T) {
		w, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}

		var res testResponse
		json.Unmarshal(w.Body.Bytes(), &res)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "file berhasil diupload" {
			t.Errorf("expected 'file berhasil diupload', got '%s'", res.Meta.Message)
		}
		if res.Data == nil {
			t.Fatal("expected data in response")
		}

		var data struct {
			FileName       string `json:"file_name"`
			UniqueFileName string `json:"unique_file_name"`
			FileUrl        string `json:"file_url"`
		}
		json.Unmarshal(res.Data, &data)
		if data.FileName != "test_video.mp4" {
			t.Errorf("expected 'test_video.mp4', got '%s'", data.FileName)
		}
		if data.UniqueFileName == "" {
			t.Errorf("expected non-empty unique_file_name")
		}
		if data.FileUrl == "" {
			t.Errorf("expected non-empty file_url")
		}

		if uniqueFileName != "" {
			os.Remove(filepath.Join(testStoragePath, "assignments", uniqueFileName))
		}
	})
}

func TestUploadProfilePicture(t *testing.T) {
	r := setupMediaTestRouter()

	t.Run("Upload profile picture tanpa token berhasil", func(t *testing.T) {
		w, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/profiles", filepath.Join(dummyDir, "profile.jpeg"), "")
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}

		var res testResponse
		json.Unmarshal(w.Body.Bytes(), &res)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "profile picture berhasil diupload" {
			t.Errorf("expected 'profile picture berhasil diupload', got '%s'", res.Meta.Message)
		}
		if res.Data == nil {
			t.Fatal("expected data in response")
		}

		var data struct {
			FileName       string `json:"file_name"`
			UniqueFileName string `json:"unique_file_name"`
			FileUrl        string `json:"file_url"`
		}
		json.Unmarshal(res.Data, &data)
		if data.UniqueFileName == "" {
			t.Errorf("expected non-empty unique_file_name")
		}

		if uniqueFileName != "" {
			os.Remove(filepath.Join(testStoragePath, "profiles", uniqueFileName))
		}
	})
}

// --- Tahap 4: Test Delete (DELETE) ---

func TestRemoveMaterial(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")

	t.Run("Hapus file exists", func(t *testing.T) {
		_, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		if uniqueFileName == "" {
			t.Fatal("upload did not return unique_file_name")
		}

		w := makeRequest(r, "DELETE", "/lms-usti-api/media/materials/"+uniqueFileName, "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil dihapus" {
			t.Errorf("expected 'material berhasil dihapus', got '%s'", res.Meta.Message)
		}

		// Verify file deleted from filesystem
		if _, err := os.Stat(filepath.Join(testStoragePath, "materials", uniqueFileName)); !os.IsNotExist(err) {
			t.Errorf("expected file to be deleted, still exists")
		}
	})

	t.Run("Hapus file tidak ada", func(t *testing.T) {
		w := makeRequest(r, "DELETE", "/lms-usti-api/media/materials/nonexistent.pdf", "", dosenToken)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected 500, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestRemoveAssignment(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")

	t.Run("Hapus file exists", func(t *testing.T) {
		_, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		if uniqueFileName == "" {
			t.Fatal("upload did not return unique_file_name")
		}

		w := makeRequest(r, "DELETE", "/lms-usti-api/media/assignments/"+uniqueFileName, "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dihapus" {
			t.Errorf("expected 'assignment berhasil dihapus', got '%s'", res.Meta.Message)
		}

		if _, err := os.Stat(filepath.Join(testStoragePath, "assignments", uniqueFileName)); !os.IsNotExist(err) {
			t.Errorf("expected file to be deleted, still exists")
		}
	})

	t.Run("Hapus file tidak ada", func(t *testing.T) {
		w := makeRequest(r, "DELETE", "/lms-usti-api/media/assignments/nonexistent.mp4", "", dosenToken)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected 500, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestRemoveProfilePicture(t *testing.T) {
	r := setupMediaTestRouter()
	token := createTestToken("DOSEN")

	t.Run("Hapus file exists", func(t *testing.T) {
		_, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/profiles", filepath.Join(dummyDir, "profile.jpeg"), "")
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		if uniqueFileName == "" {
			t.Fatal("upload did not return unique_file_name")
		}

		w := makeRequest(r, "DELETE", "/lms-usti-api/media/profiles/"+uniqueFileName, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "profile picture berhasil dihapus" {
			t.Errorf("expected 'profile picture berhasil dihapus', got '%s'", res.Meta.Message)
		}

		if _, err := os.Stat(filepath.Join(testStoragePath, "profiles", uniqueFileName)); !os.IsNotExist(err) {
			t.Errorf("expected file to be deleted, still exists")
		}
	})
}

// --- Tahap 5: Test Delete Batch (POST delete-batch) ---

func TestRemoveMaterialBatch(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")

	t.Run("Hapus batch beberapa file berhasil", func(t *testing.T) {
		_, name1, err := uploadTestFile(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload 1 failed: %v", err)
		}
		_, name2, err := uploadTestFile(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload 2 failed: %v", err)
		}

		reqBody := `{"files":[{"file_name":"test_material.pdf","unique_file_name":"` + name1 + `","file_url":""},{"file_name":"test_material.pdf","unique_file_name":"` + name2 + `","file_url":""}]}`
		w := makeRequest(r, "POST", "/lms-usti-api/media/materials/delete-batch", reqBody, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil menghapus material secara batch" {
			t.Errorf("expected 'berhasil menghapus material secara batch', got '%s'", res.Meta.Message)
		}

		if _, err := os.Stat(filepath.Join(testStoragePath, "materials", name1)); !os.IsNotExist(err) {
			t.Errorf("expected file 1 to be deleted")
		}
		if _, err := os.Stat(filepath.Join(testStoragePath, "materials", name2)); !os.IsNotExist(err) {
			t.Errorf("expected file 2 to be deleted")
		}
	})

	t.Run("Hapus batch dengan salah satu file tidak ada", func(t *testing.T) {
		_, name, err := uploadTestFile(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}

		reqBody := `{"files":[{"file_name":"test_material.pdf","unique_file_name":"` + name + `","file_url":""},{"file_name":"test_material.pdf","unique_file_name":"nonexistent-file.pdf","file_url":""}]}`
		w := makeRequest(r, "POST", "/lms-usti-api/media/materials/delete-batch", reqBody, dosenToken)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected 500, got %d: %s", w.Code, string(w.Body.Bytes()))
		}

		os.Remove(filepath.Join(testStoragePath, "materials", name))
	})

	t.Run("Body kosong", func(t *testing.T) {
		w := makeRequest(r, "POST", "/lms-usti-api/media/materials/delete-batch", `{}`, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestRemoveAssignmentBatch(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")

	t.Run("Hapus batch berhasil", func(t *testing.T) {
		_, name1, err := uploadTestFile(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload 1 failed: %v", err)
		}
		_, name2, err := uploadTestFile(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload 2 failed: %v", err)
		}

		reqBody := `{"files":[{"file_name":"test_video.mp4","unique_file_name":"` + name1 + `","file_url":""},{"file_name":"test_video.mp4","unique_file_name":"` + name2 + `","file_url":""}]}`
		w := makeRequest(r, "POST", "/lms-usti-api/media/assignments/delete-batch", reqBody, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil menghapus assignment secara batch" {
			t.Errorf("expected 'berhasil menghapus assignment secara batch', got '%s'", res.Meta.Message)
		}
	})
}

// --- Tahap 6: Test Auth & ACL ---

func TestMediaAuth(t *testing.T) {
	r := setupMediaTestRouter()
	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Upload material tanpa token", func(t *testing.T) {
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/media/materials", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Upload material dengan token MAHASISWA", func(t *testing.T) {
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/media/materials", body, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Upload material dengan token DOSEN valid", func(t *testing.T) {
		w, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if uniqueFileName != "" {
			os.Remove(filepath.Join(testStoragePath, "materials", uniqueFileName))
		}
	})

	t.Run("Upload profile picture tanpa token (publik)", func(t *testing.T) {
		w, uniqueFileName, err := uploadTestFile(r, "/lms-usti-api/media/profiles", filepath.Join(dummyDir, "profile.jpeg"), "")
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if uniqueFileName != "" {
			os.Remove(filepath.Join(testStoragePath, "profiles", uniqueFileName))
		}
	})

	t.Run("Hapus material tanpa token", func(t *testing.T) {
		w := makeRequest(r, "DELETE", "/lms-usti-api/media/materials/test.pdf", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
