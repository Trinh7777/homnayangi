// Dải quay trượt ngang kiểu gacha
const SPIN_DURATION = 6500;                       // ms
const SPIN_EASING = "cubic-bezier(0.08, 0.62, 0.1, 1)";
const START_INDEX = 3;                            // ô đứng giữa lúc bắt đầu quay

export class Reel {
  /**
   * @param {HTMLElement} viewport
   * @param {HTMLElement} track
   * @param {(id:string)=>HTMLElement} buildCard
   * @param {{onTick?:Function}} opts
   */
  constructor(viewport, track, buildCard, { onTick } = {}) {
    this.viewport = viewport;
    this.track = track;
    this.buildCard = buildCard;
    this.onTick = onTick || (() => {});
    this.cards = [];
    this.centerIndex = 0;
    window.addEventListener("resize", () => this._setX(this._xFor(this.centerIndex)));
  }

  fill(ids) {
    this.track.replaceChildren(...ids.map((id) => this.buildCard(id)));
    this.cards = [...this.track.children];
  }

  /** Hiển thị dải tĩnh, đặt ô index ở giữa */
  showIdle(ids, index) {
    this.fill(ids);
    this.centerIndex = index;
    this._setX(this._xFor(index));
  }

  _metrics() {
    const style = getComputedStyle(this.track);
    const cardW = this.cards[0].offsetWidth;
    const gap = parseFloat(style.columnGap || style.gap) || 0;
    return {
      cardW,
      step: cardW + gap,
      pad: parseFloat(style.paddingLeft) || 0,
      vw: this.viewport.clientWidth,
    };
  }

  _xFor(index, offset = 0) {
    if (!this.cards.length) return 0;
    const m = this._metrics();
    return -(m.pad + index * m.step + m.cardW / 2 - m.vw / 2 + offset);
  }

  _setX(x, transition = "none") {
    this.track.style.transition = transition;
    this.track.style.transform = `translate3d(${x}px,0,0)`;
  }

  _currentX() {
    return new DOMMatrixReadOnly(getComputedStyle(this.track).transform).m41;
  }

  /** Quay tới ô winIndex. Trả về Promise<HTMLElement thẻ trúng> */
  spin(ids, winIndex, duration = SPIN_DURATION) {
    return new Promise((resolve) => {
      this.fill(ids);
      this.centerIndex = winIndex;

      const m = this._metrics();
      // Dừng lệch ngẫu nhiên trong thẻ cho tự nhiên, sau đó "hít" vào giữa
      const jitter = (Math.random() * 2 - 1) * m.cardW * 0.42;

      this._setX(this._xFor(START_INDEX));
      void this.track.offsetWidth; // ép trình duyệt áp vị trí đầu

      requestAnimationFrame(() => {
        this._setX(this._xFor(winIndex, jitter), `transform ${duration}ms ${SPIN_EASING}`);
      });

      // Âm "tách tách" mỗi khi 1 thẻ đi qua kim
      let lastIdx = -1;
      let raf;
      const watch = () => {
        const idx = Math.floor((-this._currentX() + m.vw / 2 - m.pad) / m.step);
        if (idx !== lastIdx) { if (lastIdx !== -1) this.onTick(); lastIdx = idx; }
        raf = requestAnimationFrame(watch);
      };
      raf = requestAnimationFrame(watch);

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        setTimeout(() => {
          this._setX(this._xFor(winIndex), "transform 450ms cubic-bezier(.3,1.5,.5,1)");
          setTimeout(() => {
            const card = this.cards[winIndex];
            card.classList.add("win");
            resolve(card);
          }, 470);
        }, 220);
      };
      this.track.addEventListener("transitionend", function handler(e) {
        if (e.target !== this) return;
        this.removeEventListener("transitionend", handler);
        finish();
      });
      setTimeout(finish, duration + 200); // dự phòng khi tab bị ẩn
    });
  }
}
