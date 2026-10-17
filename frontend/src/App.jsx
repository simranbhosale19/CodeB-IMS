import { useEffect } from "react";
import { useState } from "react";
import "./App.css";

const initialUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin@123",
    role: "Admin",
  },
];

export default function App() {
  
  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Sales Person",
  });

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [demoCode, setDemoCode] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
    setMessage("");
  }

  function goTo(nextPage) {
    setPage(nextPage);
    setError("");
    setMessage("");
  }


async function register(event) {
  event.preventDefault();
  setError("");
  setMessage("");
  setLoading(true);

  if (form.password.length < 8) {
    setError("Password must contain at least 8 characters.");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    setMessage("Registration successful! Please log in.");
    setForm({
      name: "",
      email: "",
      password: "",
      role: "Sales Person",
    });
    setPage("login");
  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
}


 async function login(event) {
  
  event.preventDefault();
  setError("");
  setMessage("");
  setLoading(true);

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    });

    const data = await response.json();
    console.log("REGISTER RESPONSE:", response.status, data);

    if (!response.ok) {
      throw new Error(data.message || "Invalid email or password.");
    }

    setUser({
      id: data.userId,
      name: data.fullName,
      email: data.email,
      role: data.role,
    });

    setPage("dashboard");
    setForm({
      name: "",
      email: "",
      password: "",
      role: "Sales Person",
    });
  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
}
  function startReset(event) {
    event.preventDefault();

    const found = users.find(
      (item) => item.email.toLowerCase() === resetEmail.trim().toLowerCase()
    );

    if (!found) {
      setError("No account found with this email.");
      return;
    }

    // DEMO ONLY: A real app must email this code from its backend.
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setDemoCode(code);
    setResetCode("");
    setNewPassword("");
    setError("");
    setMessage(`Demo verification code: ${code}`);
    setPage("reset");
  }

  function resetPassword(event) {
    event.preventDefault();

    if (resetCode !== demoCode) {
      setError("Incorrect verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    setUsers((previous) =>
      previous.map((item) =>
        item.email.toLowerCase() === resetEmail.trim().toLowerCase()
          ? { ...item, password: newPassword }
          : item
      )
    );

    setMessage("Password updated. Please log in.");
    setDemoCode("");
    setResetCode("");
    setNewPassword("");
    setPage("login");
  }

  function logout() {
    setUser(null);
    setPage("login");
    setMessage("You have logged out successfully.");
    setError("");
  
    
 

  }
  
useEffect(() => {
  if (!user) return;

  let timer;

  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      logout();
      setMessage("You were logged out due to inactivity.");
    }, INACTIVITY_LIMIT);
  };

  const events = ["mousemove", "keydown", "click", "scroll"];

  events.forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();

  return () => {
    clearTimeout(timer);
    events.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  };
}, [user]);


  
async function addUser(event) {
  event.preventDefault();
  setError("");
  setMessage("");

  if (form.password.length < 8) {
    setError("Password must contain at least 8 characters.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not add user.");
    }

    setForm({
      name: "",
      email: "",
      password: "",
      role: "Sales Person",
    });

    setMessage("New user added successfully.");
  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  }
}


  function field(label, name, type = "text", placeholder = "") {
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={updateField}
          required
          autoComplete={name === "password" ? "current-password" : name}
        />
      </div>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => goTo("login")}>
          <span className="brand-icon">C</span>
          <span>CodeB <strong>IMS</strong></span>
        </button>

        {user ? (
          <div className="top-user">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span className="top-user-name">{user.name}</span>
            <button className="outline-btn small-btn" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <span className="secure-label">● Secure Access</span>
        )}
      </header>

      <section className="main-content">
        {page === "login" && (
          <div className="auth-card">
            <div className="card-symbol">↗</div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1>Sign in to your account</h1>
            <p className="subtitle">
              Enter your details to access your workspace.
            </p>

            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}

            <form onSubmit={login}>
              {field("Email address", "email", "email", "you@example.com")}
              {field("Password", "password", "password", "Enter your password")}

              <div className="form-options">
                <span className="muted">Protected account access</span>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => goTo("forgot")}
                >
                  Forgot password?
                </button>
              </div>

              <button className="primary-btn" type="submit">
                Sign In <span>→</span>
              </button>
            </form>

            <p className="switch-text">
              Don't have an account?{" "}
              <button className="text-btn" onClick={() => goTo("register")}>
                Create account
              </button>
            </p>

            <div className="demo-note">
              <strong>Demo account</strong>
              <p>Email: admin@example.com</p>
              <p>Password: Admin@123</p>
            </div>
          </div>
        )}

        {page === "register" && (
          <div className="auth-card">
            <div className="card-symbol">＋</div>
            <p className="eyebrow">GET STARTED</p>
            <h1>Create an account</h1>
            <p className="subtitle">
              Register to access the CodeB IMS workspace.
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={register}>
              {field("Full name", "name", "text", "Enter your full name")}
              {field("Email address", "email", "email", "you@example.com")}
              {field("Password", "password", "password", "Minimum 8 characters")}

              <div className="field">
                <label htmlFor="role">Select role</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={updateField}
                >
                  <option value="Sales Person">Sales Person</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <p className="hint">
                Demo only: role selection is not secure until enforced by the
                backend.
              </p>

              <button className="primary-btn" type="submit">
                Create Account <span>→</span>
              </button>
            </form>

            <p className="switch-text">
              Already registered?{" "}
              <button className="text-btn" onClick={() => goTo("login")}>
                Sign in
              </button>
            </p>
          </div>
        )}

        {page === "forgot" && (
          <div className="auth-card">
            <div className="card-symbol">✉</div>
            <p className="eyebrow">ACCOUNT RECOVERY</p>
            <h1>Forgot password?</h1>
            <p className="subtitle">
              Enter your registered email to begin password recovery.
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={startReset}>
              <div className="field">
                <label htmlFor="resetEmail">Email address</label>
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => {
                    setResetEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button className="primary-btn" type="submit">
                Continue <span>→</span>
              </button>
            </form>

            <p className="switch-text">
              <button className="text-btn" onClick={() => goTo("login")}>
                ← Back to sign in
              </button>
            </p>
          </div>
        )}

        {page === "reset" && (
          <div className="auth-card">
            <div className="card-symbol">⌑</div>
            <p className="eyebrow">ACCOUNT RECOVERY</p>
            <h1>Reset password</h1>
            <p className="subtitle">
              Enter your verification code and choose a new password.
            </p>

            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}

            <form onSubmit={resetPassword}>
              <div className="field">
                <label htmlFor="resetCode">Verification code</label>
                <input
                  id="resetCode"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <button className="primary-btn" type="submit">
                Update Password <span>→</span>
              </button>
            </form>

            <p className="switch-text">
              <button className="text-btn" onClick={() => goTo("login")}>
                Back to sign in
              </button>
            </p>
          </div>
        )}

        {page === "dashboard" && user && (
          <div className="dashboard">
            <div className="welcome-panel">
              <div>
                <p className="eyebrow">YOUR WORKSPACE</p>
                <h1>Welcome, {user.name.split(" ")[0]}!</h1>
                <p className="subtitle">
                  You are successfully signed in to CodeB IMS.
                </p>
              </div>
              <div className="dashboard-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">♙</span>
                <p>Account role</p>
                <h2>{user.role}</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <p>Login status</p>
                <h2>Signed in</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon">♧</span>
                <p>Registered users</p>
                <h2>{users.length}</h2>
              </div>
            </div>

            {user.role === "Admin" ? (
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>User Management</h2>
                    <p className="subtitle">
                      Admin access: manage registered demo accounts.
                    </p>
                  </div>
                  <span className="role-badge">ADMIN</span>
                </div>

                {message && <div className="success">{message}</div>}
                {error && <div className="error">{error}</div>}

                <form className="admin-form" onSubmit={addUser}>
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="password">Temporary password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={updateField}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={updateField}
                    >
                      <option value="Sales Person">Sales Person</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <button className="primary-btn" type="submit">
                    + Add User
                  </button>
                </form>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.email}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>
                            <span className="role-badge">{item.role}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <section className="panel">
                <span className="role-badge">SALES PERSON</span>
                <h2>Your dashboard</h2>
                <p className="subtitle">
                  You are signed in as a Sales Person. Administrative user
                  management is restricted to Admin accounts.
                </p>
              </section>
            )}

            <div className="session-note">
              <span>●</span> Demo session active
              <button className="text-btn" onClick={logout}>
                Sign out securely
              </button>
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>© 2026 CodeB IMS</span>
        <span>User Authentication Module</span>
      </footer>
    </main>
  );
}
