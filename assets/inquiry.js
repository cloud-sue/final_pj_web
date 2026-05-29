function renderInquiries(inquiries = getStoredInquiries()) {
  const list = document.querySelector("[data-inquiry-list]");
  if (!list) return;

  if (!inquiries.length) {
    list.innerHTML = `<p class="empty">아직 등록된 문의가 없습니다.</p>`;
    return;
  }

  list.innerHTML = inquiries
    .map(
      (item) => `
        <article class="inquiry-item">
          <strong>${escapeHtml(item.title)}</strong>
          <div class="inquiry-meta">${escapeHtml(item.category)} · ${escapeHtml(item.writer)} · ${escapeHtml(formatCreatedAt(item.createdAt))}</div>
          <p class="muted">${escapeHtml(item.content)}</p>
        </article>
      `,
    )
    .join("");
}

function bindInquiryForm() {
  const form = document.querySelector("[data-inquiry-form]");
  if (!form) return;

  const user = getStoredUser();
  const writerInput = form.querySelector("[name='writer']");
  if (user && writerInput) writerInput.value = user.name;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const inquiry = {
      category: String(formData.get("category")).trim(),
      title: String(formData.get("title")).trim(),
      writer: String(formData.get("writer")).trim(),
      content: String(formData.get("content")).trim(),
      createdAt: new Date().toLocaleString("ko-KR"),
    };
    const message = document.querySelector("[data-inquiry-message]");

    if (!inquiry.title || !inquiry.writer || !inquiry.content) {
      message.className = "form-message error";
      message.textContent = "문의 제목, 작성자, 내용을 모두 입력해주세요.";
      return;
    }

    try {
      const savedInquiry = await apiFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify(inquiry),
      });
      renderInquiries([savedInquiry, ...getStoredInquiries()]);
    } catch (error) {
      console.warn("문의 API 연결 실패, 브라우저 저장소에 저장합니다.", error);
      addStoredInquiry(inquiry);
      renderInquiries();
    }

    form.reset();
    if (user && writerInput) writerInput.value = user.name;
    message.className = "form-message success";
    message.textContent = "문의가 등록되었습니다.";
  });
}

async function loadInquiries() {
  try {
    renderInquiries(await apiFetch("/api/inquiries"));
  } catch (error) {
    console.warn("문의 목록 API 연결 실패, 브라우저 저장소 목록을 표시합니다.", error);
    renderInquiries();
  }
}

function formatCreatedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

document.addEventListener("DOMContentLoaded", () => {
  bindInquiryForm();
  loadInquiries();
});
