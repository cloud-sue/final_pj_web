const API_CONFIG = {
  baseUrl: localStorage.getItem("kbeautyApiBaseUrl") || "http://localhost:8080",
};

const PRODUCT_IMAGE_FALLBACK = "assets/img/product-fallback.svg";

function getApiBaseUrl() {
  return API_CONFIG.baseUrl.replace(/\/$/, "");
}

function setApiBaseUrl(baseUrl) {
  localStorage.setItem("kbeautyApiBaseUrl", baseUrl.replace(/\/$/, ""));
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (value == null) return 0;
  return Number(value);
}

function getCurrentPrice(product) {
  if (product.currentPrice != null) return Math.floor(toNumber(product.currentPrice));
  const originalPrice = toNumber(product.originalPrice);
  const discountRate = toNumber(product.discountRate);
  return Math.floor(originalPrice * (1 - discountRate / 100));
}

function formatWon(value) {
  return `${Math.floor(toNumber(value)).toLocaleString("ko-KR")}원`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStoredUser() {
  const raw = localStorage.getItem("kbeautyUser");
  return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user) {
  localStorage.setItem("kbeautyUser", JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem("kbeautyUser");
}

function getStoredInquiries() {
  return JSON.parse(localStorage.getItem("kbeautyInquiries") || "[]");
}

function addStoredInquiry(inquiry) {
  const next = [inquiry, ...getStoredInquiries()];
  localStorage.setItem("kbeautyInquiries", JSON.stringify(next));
  return next;
}

function updateHeaderUser() {
  const user = getStoredUser();
  document.querySelectorAll("[data-user-label]").forEach((node) => {
    node.textContent = user ? user.name : "로그인";
  });
  document.querySelectorAll("[data-user-link]").forEach((node) => {
    node.href = user ? "mypage.html" : "login.html";
    node.title = user ? "마이페이지" : "로그인";
  });
  document.querySelectorAll("[data-inquiry-link]").forEach((node) => {
    node.hidden = !user;
  });

  document.querySelectorAll("[data-logout-nav]").forEach((node) => node.remove());

  if (!user) return;

  document.querySelectorAll(".nav-actions").forEach((actions) => {
    const button = document.createElement("button");
    button.className = "icon-link";
    button.type = "button";
    button.title = "로그아웃";
    button.dataset.logoutNav = "true";
    button.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i><span>로그아웃</span>`;
    button.addEventListener("click", logoutUser);
    actions.append(button);
  });
}

async function logoutUser() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("로그아웃 API 호출 실패, 브라우저 로그인 정보만 삭제합니다.", error);
  }

  clearStoredUser();
  updateHeaderUser();

  if (typeof renderAuthState === "function") {
    renderAuthState();
  }
}

async function restoreSession() {
  try {
    const user = await apiFetch("/api/auth/me");
    setStoredUser(user);
    updateHeaderUser();
  } catch (error) {
    updateHeaderUser();
  }
}

function createServerInfoBar(info) {
  const bar = document.createElement("div");
  bar.className = "server-info";
  bar.innerHTML = `
    <div class="server-info-inner">
      <div class="server-info-item"><strong>Host Name</strong><span title="${escapeHtml(info.hostName)}">${escapeHtml(info.hostName)}</span></div>
      <div class="server-info-item"><strong>Server IP</strong><span title="${escapeHtml(info.serverIp)}">${escapeHtml(info.serverIp)}</span></div>
      <div class="server-info-item"><strong>LB Header</strong><span title="${escapeHtml(info.lbHeader)}">${escapeHtml(info.lbHeader)}</span></div>
      <div class="server-info-item"><strong>Azure Zone</strong><span title="${escapeHtml(info.azureZone)}">${escapeHtml(info.azureZone)}</span></div>
      <div class="server-info-item"><strong>DB Host</strong><span title="${escapeHtml(info.dbHost)}">${escapeHtml(info.dbHost)}</span></div>
    </div>
  `;
  document.body.prepend(bar);
}

async function loadServerInfo() {
  const fallback = {
    hostName: location.hostname || "local-file",
    serverIp: "확인 중",
    lbHeader: "N/A",
    azureZone: "N/A (Local/Non-Azure)",
    dbHost: "확인 중",
  };

  try {
    const info = await apiFetch("/api/server-info");
    createServerInfoBar({
      hostName: info.hostName || fallback.hostName,
      serverIp: info.serverIp || fallback.serverIp,
      lbHeader: info.lbHeader || fallback.lbHeader,
      azureZone: info.azureZone || fallback.azureZone,
      dbHost: info.dbHost || fallback.dbHost,
    });
  } catch (error) {
    console.warn("서버 배포 정보 API 연결 실패, 기본 정보를 표시합니다.", error);
    createServerInfoBar(fallback);
  }
}

function bindApiSettings() {
  const form = document.querySelector("[data-api-form]");
  if (!form) return;

  const input = form.querySelector("[name='apiBaseUrl']");
  input.value = getApiBaseUrl();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setApiBaseUrl(input.value.trim() || "http://localhost:8080");
    location.reload();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadServerInfo();
  restoreSession();
  bindApiSettings();
});
