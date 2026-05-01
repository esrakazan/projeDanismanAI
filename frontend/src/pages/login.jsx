import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch (err) {
      setError("Email veya şifre hatalı.");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ProjeDanışmanAI</h1>
        <p style={styles.subtitle}>Hesabına giriş yap</p>

        {error && <div style={styles.error}>{error}</div>}

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
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">
            Giriş Yap
          </button>
        </form>

        <p style={styles.link}>
          Hesabın yok mu?{" "}
          <Link to="/register" style={styles.linkText}>
            Kayıt Ol
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