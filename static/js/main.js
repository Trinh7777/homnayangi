// Điều phối toàn bộ game
import * as api from "./api.js";
import { createCard } from "./card.js";
import { Reel } from "./reel.js";
import { FX, flashScreen, shake, centerOf } from "./effects.js";
import { sound } from "./sound.js";
import { addHistory, clearHistory, renderHistory } from "./history.js";

const data = JSON.parse(document.getElementById("game-data").textContent);
const $ = (id) => document.getElementById(id);

const el = {
  stage: $("stage"),
  modeTag: $("mode-tag"), modeTitle: $("mode-title"), modeSub: $("mode-sub"),
  reelFrame: $("reel-frame"),
  btnSpin: $("btn-spin"), btnOpenBox: $("btn-open-box"), btnBack: $("btn-back"), boxCount: $("box-count"),
  showcase: $("showcase"), history: $("history"),
  resultModal: $("result-modal"), resultSlot: $("result-card-slot"),
  resultLabel: $("result-label"), resultRarity: $("result-rarity"), resultName: $("result-name"),
  resultPrice: $("result-price"), resultDesc: $("result-desc"), resultActions: $("result-actions"),
  ratesModal: $("rates-modal"), btnRates: $("btn-rates"), btnSound: $("btn-sound"),
  btnClearHistory: $("btn-clear-history"),
  flash: $("flash"), toast: $("toast"),
};

const state = { mode: "normal", spinning: false, pending: data.pending_boxes || 0 };
const cooldownState = {
  enabled: !!data.cooldown?.enabled,
  remainingSeconds: data.cooldown?.remaining_seconds || 0,
};

const itemOf = (id) => data.items[id];
const rarityOf = (id) => data.rarities[itemOf(id).rarity];
const buildCard = (id, size) => createCard(itemOf(id), rarityOf(id), size);

const fx = new FX($("fx-canvas"));
const reel = new Reel($("reel-viewport"), $("reel-track"), (id) => buildCard(id), {
  onTick: () => sound.tick(),
});

// ---------- Chế độ (thường / hộp quà) ----------
function randomStrip(poolId, n = 30) {
  const probs = data.pools[poolId].probabilities;
  const ids = Object.keys(probs);
  return Array.from({ length: n }, () => {
    let r = Math.random();
    for (const id of ids) { if ((r -= probs[id]) <= 0) return id; }
    return ids[ids.length - 1];
  });
}

function setMode(mode) {
  state.mode = mode;
  const pool = data.pools[mode];
  document.body.dataset.mode = mode;
  el.modeTag.textContent = mode === "mystery" ? "HỘP QUÀ BÍ ẨN" : "GACHA ẨM THỰC";
  el.modeTitle.textContent = pool.name;
  el.modeSub.textContent = pool.subtitle;
  renderShowcase(mode);
  reel.showIdle(randomStrip(mode), 15);
  updateButtons();
}

function renderShowcase(mode) {
  const pool = data.pools[mode];
  const sorted = [...pool.items].sort((a, b) => rarityOf(b).tier - rarityOf(a).tier);
  el.showcase.replaceChildren(...sorted.map((id) => {
    const wrap = document.createElement("div");
    wrap.className = "showcase-item";
    wrap.style.setProperty("--rc", rarityOf(id).color);
    wrap.append(buildCard(id, "mini"));
    const rate = document.createElement("span");
    rate.className = "showcase-rate";
    rate.textContent = formatPercent(pool.probabilities[id]);
    wrap.append(rate);
    return wrap;
  }));
}

const formatPercent = (p) => `${+(p * 100).toFixed(2)}%`;

function formatCountdown(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600);
    return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

let timerId = null;
function startCooldownTimer() {
  if (timerId) clearInterval(timerId);
  updateButtons();
  if (!cooldownState.enabled || cooldownState.remainingSeconds <= 0) return;

  timerId = setInterval(() => {
    cooldownState.remainingSeconds--;
    if (cooldownState.remainingSeconds <= 0) {
      cooldownState.remainingSeconds = 0;
      clearInterval(timerId);
      timerId = null;
      sound.tick();
      toast("🎉 Đã hồi phục lượt quay mới! Chọn món ngay thôi!");
    }
    updateButtons();
  }, 1000);
}

function updateButtons() {
  const busy = state.spinning;
  const inMystery = state.mode === "mystery";
  const inCooldown = cooldownState.enabled && cooldownState.remainingSeconds > 0;

  el.btnSpin.classList.toggle("hidden", inMystery);
  el.btnSpin.disabled = busy || inCooldown;
  el.btnSpin.classList.toggle("cooldown", inCooldown && !busy);

  const btnText = el.btnSpin.querySelector(".btn-main-text");
  const btnHint = el.btnSpin.querySelector(".btn-main-hint");
  if (btnText && btnHint) {
    if (inCooldown) {
      btnText.textContent = `⏳ HỒI SAU: ${formatCountdown(cooldownState.remainingSeconds)}`;
      btnHint.textContent = `Mỗi ${data.cooldown?.label || "1 phút"} chỉ quay 1 lần`;
    } else {
      btnText.textContent = "QUAY NGAY";
      btnHint.textContent = "Phím Space";
    }
  }

  el.btnOpenBox.disabled = busy;
  el.btnOpenBox.classList.toggle("hidden", state.pending <= 0);
  el.boxCount.textContent = state.pending;
  el.btnBack.classList.toggle("hidden", !inMystery || busy);
}

// ---------- Quay ----------
async function doSpin(mode) {
  if (state.spinning) return;
  if (mode === "normal" && cooldownState.enabled && cooldownState.remainingSeconds > 0) {
    toast(`⏳ Bạn đang trong thời gian chờ (còn ${formatCountdown(cooldownState.remainingSeconds)})!`);
    return;
  }
  if (mode !== state.mode) setMode(mode);
  state.spinning = true;
  updateButtons();

  try {
    const res = await api.spin(mode);
    state.pending = res.pending_boxes;
    if (res.remaining_seconds !== undefined) {
      cooldownState.remainingSeconds = res.remaining_seconds;
      startCooldownTimer();
    }

    sound.start();
    el.reelFrame.classList.add("spinning");

    const winCard = await reel.spin(res.reel, res.win_index);
    el.reelFrame.classList.remove("spinning");

    const rarity = rarityOf(res.winner);
    const c = centerOf(winCard);
    sound.land();
    fx.burst(c.x, c.y, rarity.color, Math.max(1, rarity.tier - 2));
    await wait(550);

    showResult(res.winner);
    if (!itemOf(res.winner).action) addHistory(res.winner);
    renderHistory(el.history, data);
  } catch (err) {
    el.reelFrame.classList.remove("spinning");
    toast(err.message);
    if (err.remaining_seconds) {
      cooldownState.remainingSeconds = err.remaining_seconds;
      startCooldownTimer();
    }
  } finally {
    state.spinning = false;
    updateButtons();
  }
}

// ---------- Kết quả ----------
function showResult(id) {
  const item = itemOf(id);
  const rarity = rarityOf(id);
  const isBox = item.action === "open_mystery";
  const inCooldown = cooldownState.enabled && cooldownState.remainingSeconds > 0;

  el.resultModal.style.setProperty("--rc", rarity.color);
  el.resultModal.dataset.tier = rarity.tier;
  el.resultLabel.textContent = rarity.tier >= 5 ? "🎉 JACKPOT THẦN THOẠI 🎉" : "✨ MLEM MLEM! BẠN SẼ ĂN: ✨";
  el.resultSlot.replaceChildren(buildCard(id, "big"));
  el.resultRarity.textContent = rarity.stars
    ? `${"★".repeat(rarity.stars)}  ${rarity.name.toUpperCase()}`
    : `✨ ${rarity.name.toUpperCase()} ✨`;
  el.resultName.textContent = item.name;
  el.resultPrice.textContent = isBox ? "Giá: ???" : item.price_text;
  el.resultDesc.textContent = item.desc;

  const actions = isBox
    ? [
        ["🎁 MỞ HỘP NGAY THÔI!", "primary", () => { closeResult(); doSpin("mystery"); }],
        ["Để lát nữa", "secondary", closeResult],
      ]
    : [
        ["CHỐT MÓN NÀY! 😋", "primary", () => { closeResult(); if (state.pending <= 0) setMode("normal"); }],
        inCooldown
          ? ["⏳ ĐỢI HỒI LƯỢT", "secondary", () => {
              closeResult();
              toast(`Lượt quay tiếp theo sau: ${formatCountdown(cooldownState.remainingSeconds)}`);
            }]
          : ["QUAY LẠI 🎲", "secondary", () => {
              closeResult();
              doSpin(state.mode === "mystery" && state.pending > 0 ? "mystery" : "normal");
            }],
      ];
  el.resultActions.replaceChildren(...actions.map(([text, cls, fn]) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.className = cls;
    b.onclick = fn;
    return b;
  }));

  openModal(el.resultModal);

  // Nổ lớn ở giữa thẻ kết quả
  requestAnimationFrame(() => {
    const c = centerOf(el.resultSlot);
    fx.burst(c.x, c.y, rarity.color, rarity.tier);
    flashScreen(el.flash, rarity.color);
    sound.reveal(rarity.tier);
    if (rarity.tier >= 4) shake(document.body, rarity.tier >= 5);
    if (rarity.tier >= 5) fx.fireworks(rarity.color, 7);
  });
}

function closeResult() { closeModal(el.resultModal); }

// ---------- Tiện ích ----------
function openModal(m) { m.classList.remove("hidden"); m.setAttribute("aria-hidden", "false"); }
function closeModal(m) { m.classList.add("hidden"); m.setAttribute("aria-hidden", "true"); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let toastTimer;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 3000);
}

function refreshSoundIcon() { el.btnSound.textContent = sound.muted ? "🔇" : "🔊"; }

// ---------- Sự kiện ----------
el.btnSpin.onclick = () => doSpin("normal");
el.btnOpenBox.onclick = () => doSpin("mystery");
el.btnBack.onclick = () => setMode("normal");
el.btnRates.onclick = () => openModal(el.ratesModal);
el.ratesModal.addEventListener("click", (e) => {
  if (e.target === el.ratesModal || e.target.hasAttribute("data-close")) closeModal(el.ratesModal);
});
el.btnSound.onclick = () => { sound.toggle(); refreshSoundIcon(); };
el.btnClearHistory.onclick = () => { clearHistory(); renderHistory(el.history, data); };

document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") { closeModal(el.ratesModal); return; }
  if (e.code !== "Space" || state.spinning) return;
  if (!el.resultModal.classList.contains("hidden") || !el.ratesModal.classList.contains("hidden")) return;
  e.preventDefault();
  if (state.mode === "mystery" && state.pending > 0) {
    doSpin("mystery");
  } else if (cooldownState.enabled && cooldownState.remainingSeconds > 0) {
    toast(`⏳ Bạn đang trong thời gian chờ (còn ${formatCountdown(cooldownState.remainingSeconds)})!`);
  } else {
    doSpin("normal");
  }
});

// ---------- Khởi động ----------
refreshSoundIcon();
renderHistory(el.history, data);
setMode("normal");
startCooldownTimer();

// Xem trước màn hình kết quả khi chỉnh giao diện: http://127.0.0.1:5000/#demo=lau
const demo = location.hash.match(/^#demo=(\w+)/);
if (demo && data.items[demo[1]]) showResult(demo[1]);
