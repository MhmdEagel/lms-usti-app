interface PropTypes {
  token: string;
}

export default function ResetPasswordEmail(props: PropTypes) {
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
            Reset Password Anda
          </h1>
        </div>
        <p style={{ textAlign: "center" }}>
          Klik tombol di bawah ini untuk reset password
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
          href={`http://localhost:3000/auth/new-password?token=${token}`}
        >
          Reset Password
        </a>
      </body>
    </html>
  );
}
