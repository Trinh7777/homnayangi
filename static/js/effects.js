// Hiệu ứng nổ hạt trên canvas + chớp sáng + rung màn hình
const rand = (a, b) => a + Math.random() * (b - a);

export class FX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.running = false;
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = innerWidth * this.dpr;
    this.canvas.height = innerHeight * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /** Nổ tại (x, y). tier 1..5 quyết định độ hoành tráng */
  burst(x, y, color, tier = 1) {
    const P = this.particles;

    // Tia lửa
    const sparks = 50 + tier * 45;
    for (let i = 0; i < sparks; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(2, 7 + tier * 2.4);
      P.push({
        kind: "spark", x, y, px: x, py: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0, max: rand(40, 70 + tier * 12),
        w: rand(1.5, 3.2), color: Math.random() < 0.25 ? "#ffffff" : color,
        drag: 0.955, g: 0.09,
      });
    }

    // Sóng xung kích
    const rings = tier >= 3 ? 3 : tier >= 2 ? 2 : 1;
    for (let i = 0; i < rings; i++) {
      P.push({ kind: "ring", x, y, r: 10, vr: 9 + tier * 2 - i * 2, life: -i * 7, max: 38, w: 10 - i * 2, color });
    }

    // Lấp lánh bay chậm
    for (let i = 0; i < 14 * tier; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.5, 3 + tier);
      P.push({
        kind: "glitter", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
        life: 0, max: rand(70, 140), size: rand(1.5, 3.5), color, drag: 0.97, g: 0.02,
        phase: rand(0, 6),
      });
    }

    // Pháo giấy cho Huyền Thoại / Thần Thoại
    if (tier >= 4) {
      const palette = tier >= 5
        ? ["#ffc531", "#fff09a", "#ff8a1f", "#ffffff", "#ffdf6b"]
        : [color, "#ffffff", "#ff8a8a", "#ffd0d4"];
      const count = tier >= 5 ? 220 : 120;
      for (let i = 0; i < count; i++) {
        const a = rand(-Math.PI, 0);
        const s = rand(6, 16);
        P.push({
          kind: "confetti", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 0, max: rand(120, 200), w: rand(6, 11), h: rand(3, 6),
          rot: rand(0, 6), vrot: rand(-0.3, 0.3),
          color: palette[(Math.random() * palette.length) | 0], drag: 0.975, g: 0.18,
        });
      }
    }

    if (!this.running) { this.running = true; requestAnimationFrame(() => this._loop()); }
  }

  /** Mưa pháo hoa quanh màn hình (dùng cho Thần Thoại) */
  fireworks(color, times = 5) {
    for (let i = 0; i < times; i++) {
      setTimeout(() => this.burst(rand(innerWidth * 0.15, innerWidth * 0.85),
        rand(innerHeight * 0.15, innerHeight * 0.5), color, 2), 300 + i * 260);
    }
  }

  _loop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const alive = [];

    for (const p of this.particles) {
      p.life++;
      if (p.life < 0) { alive.push(p); continue; }
      const t = p.life / p.max;
      if (t >= 1) continue;
      alive.push(p);

      if (p.kind === "ring") {
        p.r += p.vr * (1 - t);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = (1 - t) * 0.8;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.w * (1 - t) + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }

      p.px = p.x; p.py = p.y;
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
      p.x += p.vx; p.y += p.vy;

      if (p.kind === "spark") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.w * (1 - t * 0.6);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else if (p.kind === "glitter") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = (1 - t) * (0.5 + 0.5 * Math.sin(p.life * 0.3 + p.phase));
        ctx.fillStyle = p.color;
        this._star(p.x, p.y, p.size);
      } else if (p.kind === "confetti") {
        p.rot += p.vrot;
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = Math.min(1, (1 - t) * 2);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.life * 0.2));
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    this.particles = alive;
    if (alive.length) requestAnimationFrame(() => this._loop());
    else { this.running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  _star(x, y, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2);
    ctx.lineTo(x + r * 0.5, y - r * 0.5);
    ctx.lineTo(x + r * 2, y);
    ctx.lineTo(x + r * 0.5, y + r * 0.5);
    ctx.lineTo(x, y + r * 2);
    ctx.lineTo(x - r * 0.5, y + r * 0.5);
    ctx.lineTo(x - r * 2, y);
    ctx.lineTo(x - r * 0.5, y - r * 0.5);
    ctx.closePath();
    ctx.fill();
  }
}

export function flashScreen(el, color) {
  el.style.background = `radial-gradient(circle at 50% 45%, #fff 0%, ${color} 35%, transparent 75%)`;
  el.classList.remove("on");
  void el.offsetWidth;
  el.classList.add("on");
}

export function shake(el, strong = false) {
  const cls = strong ? "shake-strong" : "shake";
  el.classList.remove("shake", "shake-strong");
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
}

export function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
