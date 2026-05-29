function renderDetail(data) {
  const product = data.product;
  const images = data.imges || data.images || [];
  const discountRate = toNumber(product.discountRate);
  const currentPrice = getCurrentPrice(product);

  document.title = `${product.productName} | K-Glow Beauty`;
  document.querySelector("[data-detail-brand]").textContent = product.brandName;
  document.querySelector("[data-detail-title]").textContent = product.productName;
  document.querySelector("[data-detail-subtitle]").textContent = product.subTitle || "";
  const mainImage = document.querySelector("[data-detail-main-image]");
  mainImage.src = product.mainImageUrl;
  mainImage.alt = product.productName;
  mainImage.onerror = () => {
    mainImage.onerror = null;
    mainImage.src = PRODUCT_IMAGE_FALLBACK;
  };
  document.querySelector("[data-current-price]").textContent = formatWon(currentPrice);
  document.querySelector("[data-original-price]").textContent = discountRate > 0 ? formatWon(product.originalPrice) : "";
  document.querySelector("[data-discount]").textContent = discountRate > 0 ? `${discountRate}%` : "";
  document.querySelector("[data-content-title]").textContent = product.subTitle || product.productName;

  const imageWrap = document.querySelector("[data-detail-images]");
  if (images.length) {
    imageWrap.innerHTML = images
      .map((url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(product.productName)} 상세 이미지" loading="lazy" onerror="this.onerror=null;this.src='${PRODUCT_IMAGE_FALLBACK}'">`)
      .join("");
  } else {
    imageWrap.innerHTML = `<p class="empty">등록된 상세 이미지가 없습니다.</p>`;
  }
}

async function loadDetail() {
  const params = new URLSearchParams(location.search);
  const productId = params.get("id");
  const container = document.querySelector("[data-detail]");

  if (!productId) {
    container.innerHTML = `<p class="error">상품 ID가 없습니다. 메인에서 상품을 선택해주세요.</p>`;
    return;
  }

  try {
    const data = await apiFetch(`/api/products/${encodeURIComponent(productId)}`);
    renderDetail(data);
  } catch (error) {
    console.error("상세 API 연결 실패", error);
    container.innerHTML = `<p class="error">상품 상세 데이터를 불러오지 못했습니다. Spring Boot WAS와 DB 연결을 확인해주세요.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadDetail);
