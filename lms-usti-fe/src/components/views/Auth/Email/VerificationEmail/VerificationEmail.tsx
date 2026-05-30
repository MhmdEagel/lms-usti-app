interface PropTypes {
  token: string;
}


export default function VerificationEmail(props: PropTypes) {
  const { token } = props;
  return (
    <html lang="en">
      <body
        style={{
          padding: 0,
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e3a8a",
            padding: "10px 0",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontWeight: "bold", color: "white" }}>
            Terimakasih telah mendaftar di LMS Universitas Sains dan Teknologi
            Indonesia
          </h1>
        </div>
        <p style={{ textAlign: "center" }}>
          Lakukan verifikasi email sebelum anda memulai kegiatan belajar
          mengajar bersama USTI
        </p>
        <p style={{ textAlign: "center" }}>
          Token hanya akan berlaku selama 10 menit
        </p>
        <a
          style={{
            padding: "10px 20px",
            textDecoration: "none",
            margin: "0 auto",
            display: "block",
            backgroundColor: "#1e3a8a",
            width: "fit-content",
            color: "white",
            borderRadius: "10px",
          }}
          href={`http://localhost:3000/auth/new-verification?token=${token}`}
        >
          Verifikasi Email
        </a>
      </body>
    </html>
  );
}
