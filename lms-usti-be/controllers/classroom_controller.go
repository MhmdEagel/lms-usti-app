package controllers

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ClassroomController struct {
	classroomService services.ClassroomServiceInterface
}

func NewClassroomController(classroomService services.ClassroomServiceInterface) *ClassroomController {
	return &ClassroomController{classroomService: classroomService}
}

func (c *ClassroomController) Create(ctx *gin.Context) {
	var req data.CreateClassroomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	req.DosenId = user.ID
	err := c.classroomService.Create(req)
	if err != nil {
		log.Printf("Classroom Create: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "successfully create classroom", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindAllByDosenId(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	search := ctx.Query("search")
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	filter := data.ClassroomFilter{
		Search:      search,
		Prodi:       ctx.Query("prodi"),
		Term:        ctx.Query("term"),
		TahunAjaran: ctx.Query("tahun_ajaran"),
		RoomNumber:  ctx.Query("room_number"),
	}

	pagination := data.Pagination{Limit: limit, Current: page}
	paginationResult, err := c.classroomService.FindAllByDosenId(user.ID, filter, pagination)
	if err != nil {
		log.Printf("FindAllByDosenId: %v", err)
		appErr := data.ErrInternalServer(nil)
		res := data.NewResponseFromError(appErr)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "successfully find all dosen classrooms", paginationResult.Pagination, paginationResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	classroom, err := c.classroomService.FindById(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("FindById: %v", err)
		appErr := data.ErrInternalServer(nil)
		res := data.NewResponseFromError(appErr)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find classroom by id", classroom)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindAllByMahasiswaId(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	search := ctx.Query("search")
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	filter := data.ClassroomFilter{
		Search:      search,
		Prodi:       ctx.Query("prodi"),
		Term:        ctx.Query("term"),
		TahunAjaran: ctx.Query("tahun_ajaran"),
		RoomNumber:  ctx.Query("room_number"),
	}
	pagination := data.Pagination{Limit: limit, Current: page}
	paginationResult, err := c.classroomService.FindAllByMahasiswaId(user.ID, filter, pagination)
	if err != nil {
		log.Printf("FindAllByMahasiswaId: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "successfully find all mahasiswa classrooms", paginationResult.Pagination, paginationResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) Update(ctx *gin.Context) {
	var req data.UpdateClassroomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	classroomId := ctx.Param("id")
	req.Id = classroomId
	err := c.classroomService.Update(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Update: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "classroom successfully updated", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	err := c.classroomService.Delete(classroomId, user.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Delete: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "classroom successfully deleted", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) Enroll(ctx *gin.Context) {
	var req data.JoinClassroomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	err := c.classroomService.EnrollMahasiswa(req, user.ID)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			ctx.JSON(appErr.Code, res)
			return
		}
		log.Printf("Enroll: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success join classroom", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) RemoveMember(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	memberId := ctx.Param("memberId")
	err := c.classroomService.RemoveMember(classroomId, memberId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "anggota tidak ditemukan", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("RemoveMember: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "anggota berhasil dikeluarkan", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) GetDashboardStats(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	stats, err := c.classroomService.GetDashboardStats(user.ID)
	if err != nil {
		log.Printf("GetDashboardStats: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil dashboard stats", stats)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) GetMahasiswaDashboardStats(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	stats, err := c.classroomService.GetMahasiswaDashboardStats(user.ID)
	if err != nil {
		log.Printf("GetMahasiswaDashboardStats: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil dashboard stats mahasiswa", stats)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindAllClassroomMember(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	classroomMembers, err := c.classroomService.FindAllClassroomMember(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("FindAllClassroomMember: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find all classroom member", classroomMembers)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindClassroomMemberById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	memberId := ctx.Param("memberId")
	member, err := c.classroomService.FindClassroomMemberByMemberId(classroomId, memberId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom or member not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("FindClassroomMemberById: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find member by id", member)
	ctx.JSON(http.StatusOK, res)
}
