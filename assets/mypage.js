function renderProfile(user) {
  const profile = document.querySelector("[data-profile]");
  if (!profile) return;

  if (!user) {
    profile.innerHTML = `
      <div class="notice">
        로그인이 필요합니다.
        <div style="margin-top: 14px;">
          <a class="button primary" href="login.html">로그인</a>
        </div>
      </div>
    `;
    return;
  }

  profile.innerHTML = `
    <div class="notice" style="text-align: left;">
      <strong style="font-size: 20px;">${escapeHtml(user.name)}</strong>
      <p class="muted" style="margin-top: 8px;">${escapeHtml(user.email)}</p>
      <div style="margin-top: 18px;">
        <button class="button secondary" type="button" data-mypage-logout>로그아웃</button>
      </div>
    </div>
  `;

  profile.querySelector("[data-mypage-logout]").addEventListener("click", logoutUser);
}

function renderMyInquiries(inquiries) {
  const list = document.querySelector("[data-my-inquiries]");
  if (!list) return;

  if (!inquiries.length) {
    list.innerHTML = `<p class="empty">작성한 문의가 없습니다.</p>`;
    return;
  }

  list.innerHTML = inquiries
    .map(
      (item) => `
        <article class="inquiry-item">
          <strong>${escapeHtml(item.title)}</strong>
          <div class="inquiry-meta">${escapeHtml(item.category)} · ${escapeHtml(formatDate(item.createdAt))}</div>
          <p class="muted">${escapeHtml(item.content)}</p>
        </article>
      `,
    )
    .join("");
}

async function loadMypage() {
  let user = getStoredUser();

  try {
    user = await apiFetch("/api/auth/me");
    setStoredUser(user);
    updateHeaderUser();
  } catch (error) {
    user = getStoredUser();
  }

  renderProfile(user);

  if (!user) {
    renderMyInquiries([]);
    return;
  }

  try {
    const inquiries = await apiFetch("/api/inquiries");
    renderMyInquiries(inquiries.filter((item) => item.writer === user.name || item.writer === user.email));
  } catch (error) {
    const inquiries = getStoredInquiries().filter((item) => item.writer === user.name || item.writer === user.email);
    renderMyInquiries(inquiries);
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

document.addEventListener("DOMContentLoaded", loadMypage);
