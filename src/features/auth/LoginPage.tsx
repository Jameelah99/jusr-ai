
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api/authService";
import { useUser } from "../../context/UserContext";

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      loginUser(user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#F5F7F5",
      padding: "24px",
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFFFF",
          padding: "36px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>Welcome to Jusr AI</h1>
        <p style={{ color: "#667085", marginBottom: "28px" }}>
          Sign in to continue to your workspace.
        </p>

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="username"
          placeholder="Enter your email"
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 20px",
            boxSizing: "border-box",
          }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 20px",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p role="alert" style={{ color: "#B42318", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            background: "#009802",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "wait" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
