import { useState } from "react";
import { useEffect } from "react";
import { apiFetch, setStoredUser } from "../lib/api";
import { hrefFor, navigate } from "../lib/router";

export default function LoginPage({ setUser, logout, onNavigate }) {
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    document.title = "K-Glow Beauty | 로그인";
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();

    if (!email || !password) {
      setMessage({ type: "error", text: "이메일과 비밀번호를 입력해주세요." });
      return;
    }

    let user;
    try {
      user = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      console.warn("로그인 API 연결 실패, 프론트 테스트 계정으로 저장합니다.", error);
      user = {
        email,
        name: email.split("@")[0] || "K-Glow Member",
        token: "local-preview-token",
      };
    }

    setStoredUser(user);
    setUser(user);
    setMessage({ type: "success", text: "로그인되었습니다." });
    setTimeout(() => navigate(hrefFor("home")), 400);
  };

  return (
    <main className="form-shell">
      <h1>로그인</h1>
      <p className="muted">회원 전용 혜택과 문의 내역을 편하게 확인하세요.</p>

      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" placeholder="member@kbeauty.com" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input id="password" name="password" type="password" placeholder="비밀번호" autoComplete="current-password" />
        </div>
        <button className="button primary" type="submit">
          로그인
        </button>
        <a className="button secondary" href={hrefFor("register")} onClick={(event) => onNavigate(event, hrefFor("register"))}>
          회원가입
        </a>
        <p className={`form-message ${message.type}`}>{message.text}</p>
      </form>

      <AuthPanel logout={logout} />
    </main>
  );
}

function AuthPanel({ logout }) {
  const raw = localStorage.getItem("kbeautyUser");
  const user = raw ? JSON.parse(raw) : null;
  if (!user) return null;

  return (
    <div className="notice" style={{ marginTop: 28 }}>
      <strong>{user.name}</strong>님으로 로그인되어 있습니다.
      <div style={{ marginTop: 14 }}>
        <button className="button secondary" type="button" onClick={logout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
