// Lưu lịch sử quay vào localStorage
const KEY = "hnag_history";
const MAX = 15;

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function addHistory(itemId) {
  const list = loadHistory();
  list.unshift({ id: itemId, time: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function renderHistory(ul, data) {
  ul.replaceChildren(...loadHistory().filter((h) => data.items[h.id]).map((h) => {
    const item = data.items[h.id];
    const color = data.rarities[item.rarity].color;
    const time = new Date(h.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const li = document.createElement("li");
    li.style.setProperty("--rc", color);
    li.innerHTML = `
      <span class="h-emoji">${item.emoji}</span>
      <span class="h-name">${item.name}</span>
      <span class="h-price">${item.price_text}</span>
      <span class="h-time">${time}</span>`;
    return li;
  }));
}
