package main

import (
	"fmt"
	"log"

	"github.com/MhmdEagel/lms-usti-be/config"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

func SeedUsers(Db *gorm.DB) {
	Db.Exec("ALTER TABLE users MODIFY COLUMN role varchar(20) NOT NULL DEFAULT ''")

	dosenHashedPassword, err := lib.HashPassword("dosenusti123")
	if err != nil {
		log.Printf("Failed to hash dosen password: %v", err)
		return
	}

	prodiHashedPassword, err := lib.HashPassword("prodiusti123")
	if err != nil {
		log.Printf("Failed to hash dosen password: %v", err)
		return
	}

	mahasiswaHashedPassword, err := lib.HashPassword("mahasiswausti123")
	if err != nil {
		log.Printf("Failed to hash dosen password: %v", err)
		return
	}

	dosen := model.User{
		Fullname: "James Bond, M. Kom",
		Email:    "dosenusti@yopmail.com",
		Password: dosenHashedPassword,
		Role:     "DOSEN",
	}

	prodi := model.User{
		Fullname: "Prodi TI",
		Email:    "proditi@yopmail.com",
		Password: prodiHashedPassword,
		Role:     "PRODI",
	}

	mhs1 := model.User{
		Fullname: "Dimas USTI",
		Email:    "mahasiswausti@yopmail.com",
		Password: mahasiswaHashedPassword,
		Role:     "MAHASISWA",
	}

	mhs2 := model.User{
		Fullname: "John Marston",
		Email:    "johnmarston@yopmail.com",
		Password: mahasiswaHashedPassword,
		Role:     "MAHASISWA",
	}
	mhs3 := model.User{
		Fullname: "Abigail Roberts",
		Email:    "abigailroberts@yopmail.com",
		Password: mahasiswaHashedPassword,
		Role:     "MAHASISWA",
	}
	mhs4 := model.User{
		Fullname: "Charles Smith",
		Email:    "charlessmith@yopmail.com",
		Password: mahasiswaHashedPassword,
		Role:     "MAHASISWA",
	}

	if err := Db.Create(&dosen).Error; err != nil {
		log.Printf("Failed to seed dosen user: %v", err)
		return
	}
	if err := Db.Create(&prodi).Error; err != nil {
		log.Printf("Failed to seed prodi user: %v", err)
		return
	}
	if err := Db.Create(&mhs1).Error; err != nil {
		log.Printf("Failed to seed mhs1 user: %v", err)
		return
	}
	if err := Db.Create(&mhs2).Error; err != nil {
		log.Printf("Failed to seed mhs2 user: %v", err)
		return
	}
	if err := Db.Create(&mhs3).Error; err != nil {
		log.Printf("Failed to seed mhs3 user: %v", err)
		return
	}
	if err := Db.Create(&mhs4).Error; err != nil {
		log.Printf("Failed to seed mhs4 user: %v", err)
		return
	}
	fmt.Println("All dummy user seeded successfully")
}

func main() {
	Db := config.ConnectDatabase()
	SeedUsers(Db)
}
