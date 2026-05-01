import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register", { email, password });
      setSuccess("Kayıt başarılı! Giriş yapılıyor...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Kayıt başarısız.");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ProjeDanışmanAI</h1>
        <p style={styles.subtitle}>Yeni hesap oluştur</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Şifre (en az 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button style={styles.button} type="submit">
            Kayıt Ol
          </button>
        </form>

        <p style={styles.link}>
          Zaten hesabın var mı?{" "}
          <Link to="/login" style={styles.linkText}>
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f0f",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    background: "#2a2a2a",
    border: "1px solid #3a3a3a",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    background: "#7c5cbf",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
  error: {
    background: "#3a1a1a",
    border: "1px solid #7a2a2a",
    borderRadius: "8px",
    color: "#ff6b6b",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  success: {
    background: "#1a3a1a",
    border: "1px solid #2a7a2a",
    borderRadius: "8px",
    color: "#6bff6b",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  link: {
    color: "#888",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "20px",
  },
  linkText: {
    color: "#7c5cbf",
    textDecoration: "none",
  },
};