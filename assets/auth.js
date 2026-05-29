function renderAuthState() {
  const user = getStoredUser();
  const panel = document.querySelector("[data-auth-panel]");
  if (!panel) return;

  if (!user) {
    panel.innerHTML = "";
    return;
  }

  panel.innerHTML = `
    <div class="notice">
      <strong>${escapeHtml(user.name)}</strong>님으로 로그인되어 있습니다.
      <div style="margin-top: 14px;">
        <button class="button secondary" type="button" data-logout>로그아웃</button>
      </div>
    </div>
  `;

  panel.querySelector("[data-logout]").addEventListener("click", logoutUser);
}

function redirectToHome() {
  setTimeout(() => {
    location.href = "index.html";
  }, 400);
}

function bindLoginForm() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();
    const message = document.querySelector("[data-login-message]");

    if (!email || !password) {
      message.className = "form-message error";
      message.textContent = "이메일과 비밀번호를 입력해주세요.";
      return;
    }

    try {
      const user = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStoredUser(user);
    } catch (error) {
      console.warn("로그인 API 연결 실패, 프론트 테스트 계정으로 저장합니다.", error);
      setStoredUser({
        email,
        name: email.split("@")[0] || "K-Glow Member",
        token: "local-preview-token",
      });
    }

    updateHeaderUser();
    renderAuthState();
    message.className = "form-message success";
    message.textContent = "로그인되었습니다.";
    redirectToHome();
  });
}

function bindRegisterForm() {
  const form = document.querySelector("[data-register-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();
    const passwordConfirm = String(formData.get("passwordConfirm")).trim();
    const message = document.querySelector("[data-register-message]");

    if (!name || !email || !password) {
      message.className = "form-message error";
      message.textContent = "이름, 이메일, 비밀번호를 모두 입력해주세요.";
      return;
    }

    if (password !== passwordConfirm) {
      message.className = "form-message error";
      message.textContent = "비밀번호 확인이 일치하지 않습니다.";
      return;
    }

    try {
      const user = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setStoredUser(user);
    } catch (error) {
      console.warn("회원가입 API 연결 실패, 프론트 테스트 계정으로 저장합니다.", error);
      setStoredUser({
        email,
        name,
        token: "local-preview-token",
      });
    }

    updateHeaderUser();
    message.className = "form-message success";
    message.textContent = "회원가입이 완료되었습니다.";
    redirectToHome();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindLoginForm();
  bindRegisterForm();
  renderAuthState();
});
