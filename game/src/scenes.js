// scenes.js — three original scenes, drawn entirely in code with Canvas 2D.
// Each scene draws itself twice: the left panel with no differences applied and
// the right panel with every difference applied. `on` is the set of difference
// indices applied to this panel. Every difference has a hit point (x, y) in
// panel space (560 x 420) shared by both panels, and a short Indonesian label.

function disc(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function cloud(ctx, x, y, scale, fill) {
  ctx.fillStyle = fill;
  disc(ctx, x, y, 18 * scale, fill);
  disc(ctx, x + 20 * scale, y - 8 * scale, 15 * scale, fill);
  disc(ctx, x + 40 * scale, y, 17 * scale, fill);
  rect(ctx, x - 14 * scale, y - 2 * scale, 68 * scale, 16 * scale, fill);
}

function birdMark(ctx, x, y) {
  ctx.strokeStyle = '#2c1e4a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.quadraticCurveTo(x - 4, y - 7, x, y);
  ctx.quadraticCurveTo(x + 4, y - 7, x + 9, y);
  ctx.stroke();
}

function sittingCat(ctx, x, y, tailUp, coat) {
  // Body, head, ears; tailUp draws the tail curled up, else lying flat.
  ctx.fillStyle = coat;
  ellipse(ctx, x, y, 20, 26, coat);
  disc(ctx, x + 2, y - 30, 15, coat);
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 40);
  ctx.lineTo(x - 12, y - 52);
  ctx.lineTo(x - 2, y - 43);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 40);
  ctx.lineTo(x + 16, y - 52);
  ctx.lineTo(x + 6, y - 43);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = coat;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tailUp) {
    ctx.moveTo(x - 18, y + 18);
    ctx.quadraticCurveTo(x - 34, y + 8, x - 30, y - 14);
  } else {
    ctx.moveTo(x - 18, y + 20);
    ctx.quadraticCurveTo(x - 36, y + 24, x - 44, y + 18);
  }
  ctx.stroke();
  disc(ctx, x + 7, y - 32, 2, '#171226');
  disc(ctx, x - 3, y - 32, 2, '#171226');
}

function flower(ctx, x, y, petal) {
  ctx.strokeStyle = '#2e7d4f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 22);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    disc(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, petal);
  }
  disc(ctx, x, y, 5, '#ffd166');
}

function starfish(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawTaman(ctx, on) {
  // Sky: dusk gradient, sun, clouds, hills, lawn.
  const sky = ctx.createLinearGradient(0, 0, 0, 310);
  sky.addColorStop(0, '#ff9a5a');
  sky.addColorStop(0.55, '#c65d8e');
  sky.addColorStop(1, '#4a2545');
  rect(ctx, 0, 0, 560, 310, sky);
  const lawn = ctx.createLinearGradient(0, 300, 0, 420);
  lawn.addColorStop(0, '#3a6b4f');
  lawn.addColorStop(1, '#22402e');
  rect(ctx, 0, 300, 560, 120, lawn);
  ellipse(ctx, 120, 305, 260, 34, '#5b2d6e');
  ellipse(ctx, 460, 302, 220, 30, '#5b2d6e');

  // Sun with rays (difference 0: the right panel has no rays).
  disc(ctx, 455, 78, 36, '#ffd166');
  disc(ctx, 455, 78, 28, '#ffdf8a');
  if (!on.has(0)) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(455 + Math.cos(a) * 44, 78 + Math.sin(a) * 44);
      ctx.lineTo(455 + Math.cos(a) * 56, 78 + Math.sin(a) * 56);
      ctx.stroke();
    }
  }
  cloud(ctx, 110, 58, 0.9, 'rgba(255, 220, 200, 0.85)');
  cloud(ctx, 300, 44, 0.7, 'rgba(255, 220, 200, 0.7)');

  // Birds (difference 2: the right panel has one bird less).
  birdMark(ctx, 300, 80);
  if (!on.has(2)) birdMark(ctx, 340, 62);

  // Big tree with apples (difference 1: one apple missing on the right).
  rect(ctx, 96, 190, 22, 112, '#6b4226');
  disc(ctx, 80, 165, 42, '#2e7d4f');
  disc(ctx, 140, 150, 46, '#37905c');
  disc(ctx, 105, 120, 40, '#2e7d4f');
  disc(ctx, 150, 185, 34, '#2e7d4f');
  const apples = [[70, 140], [110, 120], [150, 150], [90, 175], [135, 185]];
  apples.forEach(([ax, ay], i) => {
    if (i === 2 && on.has(1)) return;
    disc(ctx, ax, ay, 7, '#ef476f');
    disc(ctx, ax - 2, ay - 2, 2, '#ff8fa3');
  });

  // Bench with a book (difference 4: no book on the right).
  rect(ctx, 282, 296, 84, 10, '#8d5a2b');
  rect(ctx, 282, 272, 84, 9, '#8d5a2b');
  rect(ctx, 288, 306, 7, 22, '#5d3a1a');
  rect(ctx, 353, 306, 7, 22, '#5d3a1a');
  if (!on.has(4)) {
    rect(ctx, 308, 284, 26, 9, '#e63946');
    rect(ctx, 308, 284, 26, 3, '#f6ead8');
  }

  // Cat (difference 5: tail up on the left, lying flat on the right).
  sittingCat(ctx, 205, 330, !on.has(5), '#f4a261');

  // Flower bed (difference 3: the middle flower is red left, yellow right).
  flower(ctx, 440, 358, '#ef476f');
  flower(ctx, 470, 355, on.has(3) ? '#ffd166' : '#ef476f');
  flower(ctx, 500, 362, '#e8b4d0');

  // Butterfly (difference 6: gone on the right).
  if (!on.has(6)) {
    ctx.fillStyle = '#b8a7ff';
    ellipse(ctx, 424, 296, 9, 6, '#b8a7ff');
    ellipse(ctx, 436, 296, 9, 6, '#b8a7ff');
    ellipse(ctx, 424, 304, 7, 5, '#8f7ae0');
    ellipse(ctx, 436, 304, 7, 5, '#8f7ae0');
    ctx.strokeStyle = '#171226';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(430, 294);
    ctx.lineTo(430, 308);
    ctx.stroke();
  }
}

function drawWarung(ctx, on) {
  // Morning sky, sun, pavement.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#a8d8f0');
  sky.addColorStop(1, '#fff3c4');
  rect(ctx, 0, 0, 560, 300, sky);
  rect(ctx, 0, 300, 560, 120, '#c9a876');
  rect(ctx, 0, 300, 560, 8, '#a8895e');
  disc(ctx, 495, 58, 28, '#ffd166');
  cloud(ctx, 60, 48, 0.8, 'rgba(255,255,255,0.9)');
  cloud(ctx, 380, 40, 0.65, 'rgba(255,255,255,0.85)');

  // Stall: posts, striped awning, roof cat.
  rect(ctx, 118, 132, 12, 118, '#6b4226');
  rect(ctx, 428, 132, 12, 118, '#6b4226');
  const stripe = on.has(4) ? '#2a9d8f' : '#e63946';
  for (let i = 0; i < 8; i++) {
    rect(ctx, 96 + i * 46, 100, 46, 36, i % 2 === 0 ? stripe : '#fff8e7');
  }
  rect(ctx, 96, 132, 368, 7, '#5d3a1a');
  // Roof cat (difference 3: gone on the right).
  if (!on.has(3)) {
    ctx.fillStyle = '#3d405b';
    ellipse(ctx, 280, 92, 18, 12, '#3d405b');
    disc(ctx, 292, 80, 9, '#3d405b');
    ctx.beginPath();
    ctx.moveTo(286, 74);
    ctx.lineTo(284, 64);
    ctx.lineTo(291, 72);
    ctx.closePath();
    ctx.fill();
  }

  // Hanging KOPI sign (difference 6: gone on the right).
  if (!on.has(6)) {
    ctx.strokeStyle = '#5d3a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, 136);
    ctx.lineTo(130, 158);
    ctx.stroke();
    rect(ctx, 104, 158, 52, 30, '#fff8e7');
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2;
    ctx.strokeRect(104, 158, 52, 30);
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 15px Trebuchet MS, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOPI', 130, 179);
  }

  // Counter, kettle with steam, cups.
  rect(ctx, 108, 246, 344, 58, '#8d5a2b');
  rect(ctx, 108, 246, 344, 10, '#a9743f');
  // Kettle (difference 0: steam gone on the right).
  ctx.fillStyle = '#4a4e69';
  ctx.beginPath();
  ctx.moveTo(158, 246);
  ctx.lineTo(162, 212);
  ctx.quadraticCurveTo(180, 198, 198, 212);
  ctx.lineTo(202, 246);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(198, 220);
  ctx.lineTo(216, 208);
  ctx.lineTo(214, 222);
  ctx.lineTo(200, 232);
  ctx.closePath();
  ctx.fill();
  disc(ctx, 180, 204, 6, '#4a4e69');
  if (!on.has(0)) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(172, 196);
    ctx.quadraticCurveTo(166, 182, 174, 170);
    ctx.quadraticCurveTo(180, 160, 176, 150);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(188, 196);
    ctx.quadraticCurveTo(194, 184, 188, 172);
    ctx.stroke();
  }
  // Cups (difference 1: one cup missing on the right).
  const cups = [300, 330, 360];
  cups.forEach((cx, i) => {
    if (i === 1 && on.has(1)) return;
    rect(ctx, cx - 12, 220, 24, 24, '#f6ead8');
    rect(ctx, cx - 12, 220, 24, 5, '#e63946');
    ctx.strokeStyle = '#f6ead8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx + 13, 232, 6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    rect(ctx, cx - 14, 244, 28, 3, '#d8c8a8');
  });
  // Jar of coffee beans on the counter (same on both panels).
  rect(ctx, 404, 226, 20, 20, '#a3b18a');
  rect(ctx, 402, 222, 24, 5, '#5d3a1a');
  disc(ctx, 410, 236, 3, '#5d3a1a');
  disc(ctx, 417, 240, 3, '#5d3a1a');

  // Menu board (difference 2: three chalk lines left, two right).
  rect(ctx, 428, 148, 92, 84, '#2c1e4a');
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.strokeRect(428, 148, 92, 84);
  ctx.strokeStyle = '#f6ead8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(440, 168);
  ctx.lineTo(508, 168);
  ctx.moveTo(440, 188);
  ctx.lineTo(508, 188);
  ctx.stroke();
  if (!on.has(2)) {
    ctx.beginPath();
    ctx.moveTo(440, 208);
    ctx.lineTo(496, 208);
    ctx.stroke();
  }

  // Bicycle with a basket (difference 5: bread gone on the right).
  ctx.strokeStyle = '#22223b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(88, 336, 26, 0, Math.PI * 2);
  ctx.arc(158, 336, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(88, 336);
  ctx.lineTo(122, 306);
  ctx.lineTo(158, 336);
  ctx.moveTo(122, 306);
  ctx.lineTo(146, 306);
  ctx.lineTo(158, 336);
  ctx.moveTo(146, 306);
  ctx.lineTo(170, 300);
  ctx.stroke();
  rect(ctx, 156, 292, 34, 20, '#b08968');
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(156, 292, 34, 20);
  if (!on.has(5)) {
    ellipse(ctx, 173, 292, 14, 7, '#e0a458');
    ellipse(ctx, 173, 289, 10, 5, '#f0c078');
  }
}

function drawPantai(ctx, on) {
  // Sky, sun, clouds, sea, sand.
  const sky = ctx.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, '#8ecae6');
  sky.addColorStop(1, '#caf0f8');
  rect(ctx, 0, 0, 560, 170, sky);
  const sea = ctx.createLinearGradient(0, 150, 0, 235);
  sea.addColorStop(0, '#219ebc');
  sea.addColorStop(1, '#126782');
  rect(ctx, 0, 150, 560, 85, sea);
  rect(ctx, 0, 232, 560, 188, '#f4d58d');
  disc(ctx, 490, 58, 30, '#ffd166');
  // Clouds (difference 5: the middle cloud is gone on the right).
  cloud(ctx, 110, 52, 0.9, 'rgba(255,255,255,0.95)');
  if (!on.has(5)) cloud(ctx, 200, 62, 0.7, 'rgba(255,255,255,0.95)');
  cloud(ctx, 330, 42, 0.75, 'rgba(255,255,255,0.9)');
  // Waves.
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  [168, 192, 216].forEach((wy, i) => {
    ctx.beginPath();
    for (let x = 20; x <= 540; x += 10) {
      const y = wy + Math.sin((x + i * 40) / 34) * 4;
      if (x === 20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Boat with a sail (difference 1: red sail left, white sail right).
  ctx.fillStyle = '#8d5a2b';
  ctx.beginPath();
  ctx.moveTo(360, 176);
  ctx.lineTo(448, 176);
  ctx.lineTo(428, 196);
  ctx.lineTo(380, 196);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(404, 176);
  ctx.lineTo(404, 108);
  ctx.stroke();
  ctx.fillStyle = on.has(1) ? '#f6ead8' : '#e63946';
  ctx.beginPath();
  ctx.moveTo(404, 112);
  ctx.lineTo(404, 172);
  ctx.lineTo(438, 172);
  ctx.closePath();
  ctx.fill();

  // Palm tree with coconuts (difference 2: three coconuts left, two right).
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(112, 392);
  ctx.quadraticCurveTo(100, 300, 116, 196);
  ctx.stroke();
  ctx.strokeStyle = '#2e7d4f';
  ctx.lineWidth = 7;
  [[116, 192, -70, -34], [116, 192, 66, -40], [116, 192, -30, -66], [116, 192, 34, -64]].forEach(([fx, fy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo(fx + dx * 0.6, fy + dy * 0.4, fx + dx, fy + dy);
    ctx.stroke();
  });
  disc(ctx, 105, 190, 7, '#6b4226');
  disc(ctx, 120, 185, 7, '#6b4226');
  if (!on.has(2)) disc(ctx, 135, 195, 7, '#6b4226');

  // Starfish (difference 0: gone on the right).
  if (!on.has(0)) starfish(ctx, 120, 350, 16, '#fb8500');

  // Crab (difference 3: gone on the right).
  if (!on.has(3)) {
    ellipse(ctx, 300, 330, 18, 12, '#e63946');
    disc(ctx, 284, 322, 6, '#e63946');
    disc(ctx, 316, 322, 6, '#e63946');
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 3;
    [286, 296, 306].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(lx, 340);
      ctx.lineTo(lx - 6, 352);
      ctx.stroke();
    });
  }

  // Beach ball (difference 4: striped left, all yellow right).
  if (on.has(4)) {
    disc(ctx, 480, 330, 24, '#ffd166');
  } else {
    disc(ctx, 480, 330, 24, '#f6ead8');
    ctx.save();
    ctx.beginPath();
    ctx.arc(480, 330, 24, 0, Math.PI * 2);
    ctx.clip();
    rect(ctx, 462, 306, 12, 48, '#e63946');
    rect(ctx, 486, 306, 12, 48, '#219ebc');
    ctx.restore();
  }
  ctx.strokeStyle = '#c9a876';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(480, 330, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Footprints (difference 6: gone on the right).
  if (!on.has(6)) {
    ctx.fillStyle = '#c9a876';
    [[238, 366], [252, 378], [266, 368], [280, 380]].forEach(([fx, fy]) => {
      ellipse(ctx, fx, fy, 6, 4, '#c9a876');
    });
  }
}

export const SCENES = [
  {
    id: 'taman',
    name: 'Taman Senja',
    sub: 'Level 1 · 7 perbedaan · 150 detik',
    time: 150,
    draw: drawTaman,
    diffs: [
      { x: 455, y: 78, label: 'Sinar matahari hilang' },
      { x: 150, y: 150, label: 'Apel di pohon berkurang' },
      { x: 300, y: 80, label: 'Burung di langit berkurang' },
      { x: 470, y: 355, label: 'Warna bunga berubah' },
      { x: 320, y: 290, label: 'Buku di bangku hilang' },
      { x: 215, y: 335, label: 'Ekor kucing berubah arah' },
      { x: 430, y: 300, label: 'Kupu-kupu hilang' },
    ],
  },
  {
    id: 'warung',
    name: 'Warung Kopi',
    sub: 'Level 2 · 7 perbedaan · 135 detik',
    time: 135,
    draw: drawWarung,
    diffs: [
      { x: 180, y: 165, label: 'Uap ketel hilang' },
      { x: 330, y: 235, label: 'Cangkir berkurang' },
      { x: 465, y: 180, label: 'Baris menu berkurang' },
      { x: 280, y: 88, label: 'Kucing di atap hilang' },
      { x: 280, y: 120, label: 'Warna atap berubah' },
      { x: 165, y: 295, label: 'Roti di keranjang hilang' },
      { x: 130, y: 180, label: 'Papan KOPI hilang' },
    ],
  },
  {
    id: 'pantai',
    name: 'Pantai Pagi',
    sub: 'Level 3 · 7 perbedaan · 120 detik',
    time: 120,
    draw: drawPantai,
    diffs: [
      { x: 120, y: 350, label: 'Bintang laut hilang' },
      { x: 400, y: 140, label: 'Warna layar perahu berubah' },
      { x: 135, y: 195, label: 'Kelapa berkurang' },
      { x: 300, y: 330, label: 'Kepiting hilang' },
      { x: 480, y: 330, label: 'Bola pantai jadi kuning' },
      { x: 200, y: 60, label: 'Awan berkurang' },
      { x: 255, y: 378, label: 'Jejak kaki hilang' },
    ],
  },
];

export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 420;
export const HIT_RADIUS = 30;
