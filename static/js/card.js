// Tạo thẻ vật phẩm (HTML) từ dữ liệu
export function createCard(item, rarity, size = "") {
  const card = document.createElement("div");
  card.className = `card ${size}`.trim();
  card.dataset.id = item.id;
  card.dataset.tier = rarity.tier;
  card.style.setProperty("--rc", rarity.color);

  const stars = rarity.stars ? "★".repeat(rarity.stars) : "?";
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-img">
        <span class="card-emoji">${item.emoji}</span>
      </div>
      <span class="card-stars">${stars}</span>
      <div class="card-info">
        <div class="card-name">${item.name}</div>
        <div class="card-price">${item.price_text}</div>
      </div>
      <div class="card-bar"></div>
      <div class="card-shine"></div>
    </div>`;

  // Có ảnh thì dùng ảnh, lỗi/thiếu ảnh thì giữ emoji
  if (item.image) {
    const img = new Image();
    img.alt = item.name;
    img.draggable = false;
    img.onload = () => card.querySelector(".card-emoji")?.replaceWith(img);
    img.src = item.image;
  }
  return card;
}
