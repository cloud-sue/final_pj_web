let allProducts = [];

function productCard(product, index) {
  const discountRate = toNumber(product.discountRate);
  const originalPrice = toNumber(product.originalPrice);
  const currentPrice = getCurrentPrice(product);

  return `
    <a class="product-card" href="detail.html?id=${encodeURIComponent(product.productId)}">
      <div class="product-media">
        <img src="${escapeHtml(product.mainImageUrl)}" alt="${escapeHtml(product.productName)}" loading="lazy" onerror="this.onerror=null;this.src='${PRODUCT_IMAGE_FALLBACK}'">
        <span class="rank ${index < 3 ? "top" : ""}">${index + 1}위</span>
      </div>
      <p class="product-brand">${escapeHtml(product.brandName)}</p>
      <h3 class="product-name">${escapeHtml(product.productName)}</h3>
      <div class="price-row">
        ${discountRate > 0 ? `<span class="discount">${discountRate}%</span>` : ""}
        <span class="price">${formatWon(currentPrice)}</span>
        ${discountRate > 0 ? `<span class="original">${formatWon(originalPrice)}</span>` : ""}
      </div>
    </a>
  `;
}

function renderProducts(products) {
  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `<p class="empty">조건에 맞는 상품이 없습니다.</p>`;
    return;
  }

  grid.innerHTML = products.map(productCard).join("");
}

function applyFilter(filter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });

  const search = document.querySelector("[data-search]")?.value.trim().toLowerCase() || "";
  const filtered = allProducts.filter((product) => {
    const matchesSearch = `${product.brandName} ${product.productName}`.toLowerCase().includes(search);
    if (!matchesSearch) return false;
    if (filter === "best") return product.isGlobalBest === true;
    if (filter === "sale") return toNumber(product.discountRate) > 0;
    return true;
  });

  renderProducts(filtered);
}

async function loadProducts() {
  const grid = document.querySelector("[data-product-grid]");
  const status = document.querySelector("[data-load-status]");

  try {
    allProducts = await apiFetch("/api/products/all");
    if (status) status.textContent = `${new Date().toLocaleString("ko-KR")} 기준`;
  } catch (error) {
    console.error("상품 API 연결 실패", error);
    allProducts = [];
    if (status) status.textContent = "상품 API 연결 실패";
    if (grid) grid.innerHTML = `<p class="error">상품 데이터를 불러오지 못했습니다. Spring Boot WAS와 DB 연결을 확인해주세요.</p>`;
    return;
  }

  if (!Array.isArray(allProducts)) {
    grid.innerHTML = `<p class="error">상품 데이터 형식이 올바르지 않습니다.</p>`;
    return;
  }

  applyFilter("all");
}

function bindHomeEvents() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });

  document.querySelector("[data-search-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const activeFilter = document.querySelector("[data-filter].is-active")?.dataset.filter || "all";
    applyFilter(activeFilter);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindHomeEvents();
  loadProducts();
});
