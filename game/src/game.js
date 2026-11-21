// game.js — SpotGame: state, input (mouse + keyboard), timer, hints, overlays.
// The two panels are drawn from the same scene: the left panel with no
// differences applied, the right panel with all of them applied. A click near
// an unfound difference marks it on both panels; a click elsewhere costs time.

import { SCENES, PANEL_WIDTH, PANEL_HEIGHT, HIT_RADIUS } from './scenes.js';
import { SoundFX } from './audio.js';

const $ = (id) => document.getElementById(id);

export class SpotGame {
  constructor() {
    this.left = $('panel-left');
    this.right = $('panel-right');
    this.ctxL = this.left.getContext('2d');
    this.ctxR = this.right.getContext('2d');
    this.sfx = new SoundFX();
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.hintsLeft = 3;
    this.timeLeft = SCENES[0].time;
    this.phase = 'title';
    this.frozen = false;
    this.crosshair = { panel: 0, x: 280, y: 210, visible: false };
    this.hintTarget = null;
    this.hintUntil = 0;
    this.missMarks = [];
    this.rafId = 0;
    this.timerId = 0;
    this.attachInput();
    this.applyShotParam();
    if (this.phase === 'title') this.showTitle();
    this.render();
    this.updateHud();
  }

  get scene() {
    return SCENES[this.levelIndex];
  }

  get totalDiffs() {
    return this.scene.diffs.length;
  }

  attachInput() {
    [this.left, this.right].forEach((canvas, panel) => {
      canvas.addEventListener('click', (event) => {
        this.sfx.unlock();
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * PANEL_WIDTH;
        const y = ((event.clientY - rect.top) / rect.height) * PANEL_HEIGHT;
        this.crosshair = { panel, x, y, visible: false };
        this.trySelect(x, y, panel);
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        this.crosshair.panel = 1 - this.crosshair.panel;
        this.crosshair.visible = true;
        this.markActivePanel();
        this.render();
        return;
      }
      const step = event.shiftKey ? 4 : 16;
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        this.sfx.unlock();
        this.crosshair.visible = true;
        if (event.key === 'ArrowLeft') this.crosshair.x = Math.max(10, this.crosshair.x - step);
        if (event.key === 'ArrowRight') this.crosshair.x = Math.min(PANEL_WIDTH - 10, this.crosshair.x + step);
        if (event.key === 'ArrowUp') this.crosshair.y = Math.max(10, this.crosshair.y - step);
        if (event.key === 'ArrowDown') this.crosshair.y = Math.min(PANEL_HEIGHT - 10, this.crosshair.y + step);
        this.markActivePanel();
        this.render();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.sfx.unlock();
        if (this.phase === 'playing') {
          this.trySelect(this.crosshair.x, this.crosshair.y, this.crosshair.panel);
        } else if (this.phase === 'level-done' || this.phase === 'finished' || this.phase === 'time-up') {
          this.advance();
        } else if (this.phase === 'title') {
          this.startLevel(0);
        }
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'h') this.useHint();
      if (key === 'r') this.restartLevel();
      if (key === 'n' && (this.phase === 'level-done' || this.phase === 'finished')) this.advance();
      if (key === 'm') this.toggleSound();
    });
    $('btn-hint').addEventListener('click', () => this.useHint());
    $('btn-restart').addEventListener('click', () => this.restartLevel());
    $('btn-sound').addEventListener('click', () => this.toggleSound());
    $('overlay-button').addEventListener('click', () => this.advance());
  }

  markActivePanel() {
    this.left.classList.toggle('active-panel', this.crosshair.visible && this.crosshair.panel === 0);
    this.right.classList.toggle('active-panel', this.crosshair.visible && this.crosshair.panel === 1);
  }

  // Deterministic states for screenshots (?shot=...): the game renders exactly
  // the same pixels every time, with the timer frozen.
  applyShotParam() {
    const shot = new URLSearchParams(window.location.search).get('shot');
    if (!shot) return;
    this.frozen = true;
    if (shot === 'start') {
      this.phase = 'title';
    } else if (shot === 'play') {
      this.levelIndex = 0;
      this.found = new Set([0, 2, 4]);
      this.timeLeft = 92;
      this.score = 300;
      this.phase = 'playing';
    } else if (shot === 'play2') {
      this.levelIndex = 1;
      this.found = new Set([1, 3]);
      this.timeLeft = 78;
      this.score = 520;
      this.hintsLeft = 2;
      this.hintTarget = 0;
      this.hintUntil = Infinity;
      this.phase = 'playing';
    } else if (shot === 'win') {
      this.levelIndex = 0;
      this.found = new Set([0, 1, 2, 3, 4, 5, 6]);
      this.timeLeft = 64;
      this.score = 828;
      this.phase = 'level-done';
      this.showLevelDone(128);
    }
    $('level-name').textContent = `Level ${this.levelIndex + 1} — ${this.scene.name}`;
    $('level-sub').textContent = this.scene.sub;
  }

  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.hintsLeft = 3;
    this.timeLeft = this.scene.time;
    this.hintTarget = null;
    this.missMarks = [];
    this.phase = 'playing';
    this.hideOverlay();
    $('level-name').textContent = `Level ${index + 1} — ${this.scene.name}`;
    $('level-sub').textContent = this.scene.sub;
    this.startTimer();
    this.render();
    this.updateHud();
  }

  restartLevel() {
    if (this.phase === 'title') return;
    this.sfx.click();
    this.startLevel(this.levelIndex);
  }

  startTimer() {
    clearInterval(this.timerId);
    if (this.frozen) return;
    this.timerId = setInterval(() => {
      if (this.phase !== 'playing') return;
      this.timeLeft -= 1;
      if (this.timeLeft <= 10 && this.timeLeft > 0) this.sfx.tick();
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.timeUp();
      }
      this.updateHud();
    }, 1000);
  }

  nearestUnfound(x, y) {
    let best = -1;
    let bestDist = HIT_RADIUS;
    this.scene.diffs.forEach((diff, i) => {
      if (this.found.has(i)) return;
      const d = Math.hypot(diff.x - x, diff.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  trySelect(x, y, panel) {
    if (this.phase !== 'playing') return;
    const i = this.nearestUnfound(x, y);
    if (i >= 0) {
      this.found.add(i);
      this.score += 100;
      this.sfx.find();
      this.render();
      this.updateHud();
      if (this.found.size === this.totalDiffs) this.levelDone();
    } else {
      this.missMarks.push({ x, y, panel, until: Date.now() + 700 });
      this.timeLeft = Math.max(0, this.timeLeft - 5);
      this.sfx.wrong();
      this.render();
      this.updateHud();
      this.kickAnimation();
    }
  }

  useHint() {
    if (this.phase !== 'playing' || this.hintsLeft <= 0) return;
    const next = this.scene.diffs.findIndex((_, i) => !this.found.has(i));
    if (next < 0) return;
    this.sfx.unlock();
    this.hintsLeft -= 1;
    this.hintTarget = next;
    this.hintUntil = this.frozen ? Infinity : Date.now() + 3000;
    this.sfx.hint();
    this.updateHud();
    this.kickAnimation();
    if (!this.frozen) {
      setTimeout(() => {
        this.hintTarget = null;
        this.render();
      }, 3000);
    }
  }

  toggleSound() {
    this.sfx.unlock();
    this.sfx.setMuted(!this.sfx.muted);
    $('btn-sound').textContent = this.sfx.muted ? 'Suara: Mati' : 'Suara: Nyala';
  }

  levelDone() {
    this.phase = 'level-done';
    clearInterval(this.timerId);
    const bonus = this.timeLeft * 2;
    this.score += bonus;
    this.sfx.win();
    this.updateHud();
    this.showLevelDone(bonus);
  }

  timeUp() {
    this.phase = 'time-up';
    clearInterval(this.timerId);
    this.sfx.wrong();
    this.showOverlay({
      kicker: 'Waktu habis',
      title: 'Belum Ketemu Semua',
      text: `Kamu menemukan ${this.found.size} dari ${this.totalDiffs} perbedaan di ${this.scene.name}. Kurangi klik yang meleset — tiap meleset memotong 5 detik.`,
      stars: '',
      score: `Skor level ini: ${this.score}`,
      button: 'Coba Lagi (R)',
      foot: 'Tekan R atau klik tombol untuk mengulang level ini.',
    });
  }

  advance() {
    if (this.phase === 'level-done') {
      if (this.levelIndex + 1 < SCENES.length) this.startLevel(this.levelIndex + 1);
      else this.finishGame();
    } else if (this.phase === 'time-up') {
      this.startLevel(this.levelIndex);
    } else if (this.phase === 'finished') {
      this.score = 0;
      this.startLevel(0);
    } else if (this.phase === 'title') {
      this.startLevel(0);
    }
  }

  finishGame() {
    this.phase = 'finished';
    this.sfx.win();
    this.showOverlay({
      kicker: 'Tiga adegan selesai',
      title: 'Kamu Menang!',
      text: 'Semua 21 perbedaan di Taman Senja, Warung Kopi, dan Pantai Pagi sudah ketemu. Mata elang!',
      stars: '★★★',
      score: `Skor akhir: ${this.score}`,
      button: 'Main Lagi (R)',
      foot: 'Tekan R atau klik tombol untuk main dari Level 1.',
    });
  }

  starsFor() {
    const frac = this.timeLeft / this.scene.time;
    return frac > 0.5 ? '★★★' : frac > 0.25 ? '★★☆' : '★☆☆';
  }

  showLevelDone(bonus = 0) {
    const next = this.levelIndex + 1 < SCENES.length
      ? `Lanjut ke Level ${this.levelIndex + 2} — ${SCENES[this.levelIndex + 1].name} (N)`
      : 'Lihat Skor Akhir (N)';
    this.showOverlay({
      kicker: `Level ${this.levelIndex + 1} selesai — ${this.scene.name}`,
      title: 'Semua Ketemu!',
      text: `Tujuh dari tujuh perbedaan ditemukan. Bonus waktu +${bonus} poin.`,
      stars: this.starsFor(),
      score: `Skor: ${this.score}`,
      button: next,
      foot: 'Tekan N atau klik tombol untuk lanjut.',
    });
  }

  showTitle() {
    this.showOverlay({
      kicker: 'Game cari bedanya · 3 level · 21 perbedaan',
      title: 'Senja di Taman',
      text: 'Dua gambar nyaris identik berdampingan. Temukan 7 perbedaan di tiap level sebelum waktu habis. Klik yang berbeda — atau gerakkan bidikan dengan tombol panah lalu tekan Enter. Tiap klik meleset memotong 5 detik.',
      stars: '🔍 ★ ★ ★',
      score: '',
      button: 'Mulai Main',
      foot: 'H = petunjuk (3 per level) · R = ulang level · M = suara',
    });
  }

  showOverlay({ kicker, title, text, stars, score, button, foot }) {
    $('overlay-kicker').textContent = kicker;
    $('overlay-title').textContent = title;
    $('overlay-text').textContent = text;
    $('overlay-stars').textContent = stars;
    $('overlay-score').textContent = score;
    $('overlay-button').textContent = button;
    $('overlay-foot').textContent = foot;
    $('overlay').classList.remove('hidden');
  }

  hideOverlay() {
    $('overlay').classList.add('hidden');
  }

  updateHud() {
    $('hud-level').textContent = `${this.levelIndex + 1} / ${SCENES.length}`;
    $('hud-found').textContent = `${this.found.size} / ${this.totalDiffs}`;
    $('hud-remaining').textContent = String(this.totalDiffs - this.found.size);
    const mm = String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
    const ss = String(this.timeLeft % 60).padStart(2, '0');
    $('hud-time').textContent = `${mm}:${ss}`;
    $('hud-score').textContent = String(this.score);
    $('hud-hints').textContent = String(this.hintsLeft);
    $('btn-hint').disabled = this.hintsLeft <= 0 || this.phase !== 'playing';
    const fill = $('time-fill');
    fill.style.width = `${(this.timeLeft / this.scene.time) * 100}%`;
    fill.classList.toggle('low', this.timeLeft <= 30);
  }

  kickAnimation() {
    if (this.rafId) return;
    const step = () => {
      this.rafId = 0;
      this.render();
      const now = Date.now();
      const hintActive = this.hintTarget !== null && now < this.hintUntil;
      const missActive = this.missMarks.some((m) => now < m.until);
      if (hintActive || missActive) {
        this.rafId = requestAnimationFrame(step);
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  drawMarkers(ctx) {
    this.scene.diffs.forEach((diff, i) => {
      if (!this.found.has(i)) return;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(23, 18, 38, 0.85)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(diff.x, diff.y - 24, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#171226';
      ctx.font = 'bold 13px Trebuchet MS, Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), diff.x, diff.y - 23);
    });
  }

  drawHint(ctx) {
    if (this.hintTarget === null) return;
    const diff = this.scene.diffs[this.hintTarget];
    const radius = this.frozen ? 30 : 26 + Math.sin(Date.now() / 140) * 6;
    ctx.strokeStyle = '#57cc99';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawMissMarks(ctx, panel) {
    const now = Date.now();
    this.missMarks = this.missMarks.filter((m) => now < m.until);
    this.missMarks.forEach((m) => {
      if (m.panel !== panel) return;
      ctx.strokeStyle = '#ef476f';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x - 12, m.y - 12);
      ctx.lineTo(m.x + 12, m.y + 12);
      ctx.moveTo(m.x + 12, m.y - 12);
      ctx.lineTo(m.x - 12, m.y + 12);
      ctx.stroke();
    });
  }

  drawCrosshair(ctx) {
    if (!this.crosshair.visible) return;
    const { x, y } = this.crosshair;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 20, y);
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
  }

  renderPanel(ctx, panel, applied) {
    ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
    this.scene.draw(ctx, applied);
    this.drawMarkers(ctx);
    this.drawHint(ctx);
    this.drawMissMarks(ctx, panel);
    if (this.crosshair.visible && this.crosshair.panel === panel) this.drawCrosshair(ctx);
  }

  render() {
    const all = new Set(this.scene.diffs.map((_, i) => i));
    this.renderPanel(this.ctxL, 0, new Set());
    this.renderPanel(this.ctxR, 1, all);
  }
}
