/**
 * ASAB | AEROLAB 3D - Procedural Aerospace Texture Engine
 * 100% self-contained procedural textures: carbon fiber weave, panel lines & rivets,
 * tactical Arabic sovereign stencils, optical glass coatings, and thermal exhaust.
 * Zero external image dependencies - pure WebGL CanvasTexture pipeline.
 */

import * as THREE from 'three';

/**
 * Procedural 2x2 Twill Carbon Fiber Weave Texture
 */
export function createCarbonFiberTexture(baseColor = '#201b17'): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const cellSize = 16;
  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const isAlt = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0;

      // Draw fiber thread lines
      for (let i = 0; i < cellSize; i += 2) {
        if (isAlt) {
          ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i, y + cellSize);
          ctx.stroke();
        } else {
          ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.moveTo(x, y + i);
          ctx.lineTo(x + cellSize, y + i);
          ctx.stroke();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Aerospace Panel Lines & Rivets Bump Map
 */
export function createPanelLinesBumpMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Neutral grey height base (128 = flat)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Panel lines (darker = indented grooves)
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 2;

  // Major longitudinal structural seams
  ctx.beginPath();
  ctx.moveTo(0, 128); ctx.lineTo(size, 128);
  ctx.moveTo(0, 256); ctx.lineTo(size, 256);
  ctx.moveTo(0, 384); ctx.lineTo(size, 384);
  ctx.moveTo(128, 0); ctx.lineTo(128, size);
  ctx.moveTo(256, 0); ctx.lineTo(256, size);
  ctx.moveTo(384, 0); ctx.lineTo(384, size);
  ctx.stroke();

  // Access hatches
  ctx.strokeStyle = '#303030';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 60, 48, 36);
  ctx.strokeRect(320, 160, 56, 40);
  ctx.strokeRect(180, 300, 64, 48);

  // Flush aerodynamic rivets along panel seams (lighter rim, darker center)
  const drawRivet = (rx: number, ry: number) => {
    ctx.fillStyle = '#202020';
    ctx.beginPath();
    ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };

  for (let x = 16; x < size; x += 24) {
    drawRivet(x, 124);
    drawRivet(x, 252);
    drawRivet(x, 380);
  }
  for (let y = 16; y < size; y += 24) {
    drawRivet(124, y);
    drawRivet(252, y);
    drawRivet(380, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Tactical Sovereign Markings & Arabic Calligraphy Texture
 */
export function createAircraftMarkingsTexture(scheme: 'stealth' | 'sovereign' | 'camo' | 'test' = 'stealth'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  const accentColor =
    scheme === 'sovereign' ? '#9a6a3a' :
    scheme === 'camo' ? '#e0ba68' :
    scheme === 'test' ? '#ff7a00' : '#9a6a3a';

  const textColor = scheme === 'test' ? '#221c16' : '#f6ecdd';

  // Sovereign Chevron / Roundel Emblem
  ctx.save();
  ctx.translate(256, 140);

  // Outer polygon ring
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * 70;
    const y = Math.sin(angle) * 70;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Sovereign emblem inner wings
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(40, 20);
  ctx.lineTo(15, 12);
  ctx.lineTo(0, 35);
  ctx.lineTo(-15, 12);
  ctx.lineTo(-40, 20);
  ctx.closePath();
  ctx.fill();

  // Arabic Calligraphic Title: عَصَب
  ctx.font = 'bold 36px "IBM Plex Sans Arabic", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText('عَصَب', 0, 78);
  ctx.restore();

  // Tactical Text Badges
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText('ASAB | SA-VTOL-X100', 256, 260);

  ctx.font = '14px monospace';
  ctx.fillStyle = accentColor;
  ctx.fillText('SOVEREIGN AIRBORNE NETWORK NODE', 256, 285);

  // Arabic Warning Stencils
  ctx.font = 'bold 13px "IBM Plex Sans Arabic", sans-serif';
  ctx.direction = 'rtl';

  // Danger Jet exhaust
  ctx.fillStyle = '#e8584a';
  ctx.fillText('⚠️ خطر: عادم نفاث ساخن / DANGER EXHAUST', 256, 340);

  // Caution Propeller
  ctx.fillStyle = '#f5b82e';
  ctx.fillText('⚠️ تحذير: منطقة دوران مراوح الرفع VTOL', 256, 375);

  // Hoist & Grounding
  ctx.fillStyle = '#8fc46a';
  ctx.fillText('⚓ نقطة رفع أرضية سيادية معتمدة [KSA-DEF-01]', 256, 410);

  // Hash/Border corner technical ticks
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  const drawCorner = (cx: number, cy: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * 20);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * 20, cy);
    ctx.stroke();
  };
  drawCorner(20, 20, 1, 1);
  drawCorner(492, 20, -1, 1);
  drawCorner(20, 492, 1, -1);
  drawCorner(492, 492, -1, -1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Optical Lens Multi-Coating Dichroic Glass Texture
 */
export function createOpticalGlassTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(181, 121, 63, 0.85)');   // Optical core
  gradient.addColorStop(0.4, 'rgba(216, 185, 138, 0.7)');   // Dichroic cyan
  gradient.addColorStop(0.75, 'rgba(224, 160, 110, 0.6)');  // Magenta flare
  gradient.addColorStop(1, 'rgba(35, 26, 18, 0.95)');      // Rim bezel

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Anti-reflective crosshairs
  ctx.strokeStyle = 'rgba(216, 185, 138, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 20); ctx.lineTo(64, 108);
  ctx.moveTo(20, 64); ctx.lineTo(108, 64);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural High-Fidelity Tarmac / Ground Grid Texture
 */
export function createTarmacTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#1a140e';
  ctx.fillRect(0, 0, size, size);

  // Asphalt gravel noise
  for (let i = 0; i < 4000; i++) {
    const nx = Math.random() * size;
    const ny = Math.random() * size;
    const shade = Math.floor(18 + Math.random() * 20);
    ctx.fillStyle = `rgb(${shade + 10}, ${shade + 4}, ${shade})`;
    ctx.fillRect(nx, ny, 1.5, 1.5);
  }

  // Tarmac expansion joints
  ctx.strokeStyle = '#120e0a';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, size, size);

  // Tactical Helipad / VTOL Landing Marking
  ctx.strokeStyle = '#9a6a3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 180, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(216, 185, 138, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 210, 0, Math.PI * 2);
  ctx.stroke();

  // Inner VTOL "H" & "عَصَب" Landing target
  ctx.strokeStyle = '#b5793f';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(200, 190); ctx.lineTo(200, 322);
  ctx.moveTo(312, 190); ctx.lineTo(312, 322);
  ctx.moveTo(200, 256); ctx.lineTo(312, 256);
  ctx.stroke();

  // Arabic Sovereign Marking
  ctx.font = 'bold 22px "IBM Plex Sans Arabic", sans-serif';
  ctx.fillStyle = '#9a6a3a';
  ctx.textAlign = 'center';
  ctx.fillText('منصة هبوط الطائرات السيادية - عَصَب', 256, 140);
  ctx.fillText('SOVEREIGN VTOL APRON 01', 256, 385);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
