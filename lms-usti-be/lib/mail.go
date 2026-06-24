package lib

import (
	"bytes"
	"html/template"
	"log"

	"github.com/MhmdEagel/lms-usti-be/env"
	"gopkg.in/gomail.v2"
)

func SendOTPEmail(email, otp string) error {
	body := "<p>Gunakan kode OTP berikut untuk mengubah password Anda:</p>" +
		"<h2 style=\"letter-spacing:8px;font-size:32px;text-align:center\">" + otp + "</h2>" +
		"<p>Kode ini berlaku selama 10 menit.</p>"

	mailer := gomail.NewMessage()
	mailer.SetHeader("From", "LMS USTI <muhammadeagel@gmail.com>")
	mailer.SetHeader("To", email)
	mailer.SetHeader("Subject", "LMS USTI | Kode Verifikasi Ubah Password")
	mailer.SetBody("text/html", body)
	dialer := gomail.NewDialer(
		env.CONFIG_SMTP_HOST,
		587,
		env.CONFIG_EMAIL_USERNAME,
		env.CONFIG_EMAIL_PASSWORD,
	)
	dialErr := dialer.DialAndSend(mailer)
	if dialErr != nil {
		return dialErr
	}
	return nil
}

func SendVerificationEmail(email, token string) error {
	// Generate Template
	t, err := template.ParseFiles("lib/template/index.html")
	if err != nil {
		log.Println(err.Error())
		return err
	}
	var body bytes.Buffer
	t.Execute(&body, struct {
		Token string
	}{
		Token: token,
	})

	// Send Email
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", "LMS USTI <muhammadeagel@gmail.com>")
	mailer.SetHeader("To", email)
	mailer.SetHeader("Subject", "LMS USTI | Verifikasi Email")
	mailer.SetHeader("MIME-version", "1.0")
	mailer.SetBody("text/html", body.String())
	dialer := gomail.NewDialer(
		env.CONFIG_SMTP_HOST,
		587,
		env.CONFIG_EMAIL_USERNAME,
		env.CONFIG_EMAIL_PASSWORD,
	)
	dialErr := dialer.DialAndSend(mailer)
	if dialErr != nil {
		return dialErr
	}
	return nil
}
