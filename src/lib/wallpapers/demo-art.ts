/**
 * Procedurally generated STARTER artwork. These are not the owner's wallpapers: they exist so the
 * site looks complete on first launch and are flagged `is_demo` so they can be removed in one click
 * from Admin → Wallpapers → "Remove starter wallpapers".
 */
export const ART_WIDTH = 1170;
export const ART_HEIGHT = 2532;
const W = ART_WIDTH;
const H = ART_HEIGHT;

function rng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stars(seed: number, count: number, maxY = H, maxRadius = 2.4): string {
  const random = rng(seed);
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const x = (random() * W).toFixed(1);
    const y = (random() * maxY).toFixed(1);
    const r = (random() * maxRadius + 0.4).toFixed(2);
    const o = (random() * 0.7 + 0.25).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}"/>`;
  }
  return out;
}

function ridge(seed: number, baseY: number, amplitude: number, fill: string, opacity = 1): string {
  const random = rng(seed);
  let d = `M0 ${H} L0 ${baseY}`;
  for (let x = 0; x <= W + 60; x += 60) {
    d += ` L${x} ${(baseY + (random() - 0.5) * amplitude * 2).toFixed(0)}`;
  }
  d += ` L${W + 60} ${H} Z`;
  return `<path d="${d}" fill="${fill}" opacity="${opacity}"/>`;
}

function wrap(defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${defs}
<filter id="blur120" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="120"/></filter>
<filter id="blur60" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
<filter id="blur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
</defs>${body}</svg>`;
}

const verticalGradient = (id: string, stops: Array<[number, string]>): string =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
    .map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`)
    .join("")}</linearGradient>`;

function violetHorizon(): string {
  return wrap(
    `${verticalGradient("bg", [[0, "#07050f"], [0.55, "#1c1036"], [1, "#05030a"]])}
     <radialGradient id="glow"><stop offset="0" stop-color="#c4b5fd" stop-opacity="0.9"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
     <linearGradient id="line" x1="0" x2="1"><stop offset="0" stop-color="#a78bfa" stop-opacity="0"/><stop offset="0.5" stop-color="#ddd6fe"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <circle cx="585" cy="1260" r="520" fill="url(#glow)" opacity="0.5"/>
     <g fill="none" stroke="#a78bfa">
       <circle cx="585" cy="1260" r="150" stroke-opacity="0.5" stroke-width="2"/>
       <circle cx="585" cy="1260" r="260" stroke-opacity="0.28" stroke-width="2"/>
       <circle cx="585" cy="1260" r="390" stroke-opacity="0.14" stroke-width="2"/>
     </g>
     <circle cx="585" cy="1260" r="70" fill="#ede9fe"/>
     <rect x="120" y="1259" width="930" height="2" fill="url(#line)"/>`,
  );
}

function nebulaDrift(): string {
  return wrap(
    `${verticalGradient("bg", [[0, "#04030a"], [1, "#0a0618"]])}`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <g filter="url(#blur120)">
       <ellipse cx="300" cy="700" rx="420" ry="360" fill="#6d28d9" opacity="0.75"/>
       <ellipse cx="860" cy="1250" rx="380" ry="460" fill="#2563eb" opacity="0.55"/>
       <ellipse cx="420" cy="1850" rx="440" ry="340" fill="#c026d3" opacity="0.5"/>
       <ellipse cx="800" cy="2200" rx="300" ry="260" fill="#4c1d95" opacity="0.8"/>
     </g>${stars(11, 260)}`,
  );
}

function midnightRidge(): string {
  return wrap(
    `${verticalGradient("sky", [[0, "#0a0720"], [0.5, "#2a1458"], [0.78, "#8a4fb0"], [1, "#f1b4a6"]])}`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>${stars(21, 160, 1300)}
     <circle cx="860" cy="760" r="90" fill="#fdf4ff" opacity="0.95"/>
     <circle cx="860" cy="760" r="200" fill="#e9d5ff" opacity="0.12" filter="url(#blur20)"/>
     ${ridge(31, 1500, 90, "#4a2a82", 0.75)}${ridge(32, 1700, 110, "#34195f", 0.9)}
     ${ridge(33, 1920, 120, "#1f0f40")}${ridge(34, 2150, 100, "#10082a")}${ridge(35, 2350, 70, "#07041a")}`,
  );
}

function quietOrbit(): string {
  const cx = 585;
  const cy = 1180;
  return wrap(
    `${verticalGradient("bg", [[0, "#03020a"], [1, "#0b0720"]])}
     <radialGradient id="planet" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#e9d5ff"/><stop offset="0.35" stop-color="#8b5cf6"/><stop offset="1" stop-color="#150a33"/></radialGradient>
     <linearGradient id="ring" x1="0" x2="1"><stop offset="0" stop-color="#c4b5fd" stop-opacity="0.1"/><stop offset="0.5" stop-color="#ddd6fe" stop-opacity="0.9"/><stop offset="1" stop-color="#c4b5fd" stop-opacity="0.1"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${stars(41, 320)}
     <circle cx="${cx}" cy="${cy}" r="360" fill="#7c3aed" opacity="0.3" filter="url(#blur60)"/>
     <g transform="rotate(-18 ${cx} ${cy})">
       <ellipse cx="${cx}" cy="${cy}" rx="560" ry="130" fill="none" stroke="url(#ring)" stroke-width="10"/>
       <circle cx="${cx}" cy="${cy}" r="270" fill="url(#planet)"/>
       <path d="M${cx - 560} ${cy} A560 130 0 0 0 ${cx + 560} ${cy}" fill="none" stroke="url(#ring)" stroke-width="10"/>
     </g>`,
  );
}

function voidLight(): string {
  return wrap(
    `<radialGradient id="bg" cx="0.5" cy="0.2" r="0.9"><stop offset="0" stop-color="#1a1230"/><stop offset="0.5" stop-color="#07050f"/><stop offset="1" stop-color="#010103"/></radialGradient>
     <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd" stop-opacity="0.85"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <polygon points="560,0 610,0 900,2100 270,2100" fill="url(#beam)" opacity="0.28" filter="url(#blur60)"/>
     <rect x="583" y="0" width="4" height="1500" fill="url(#beam)" opacity="0.9"/>
     <circle cx="585" cy="1500" r="10" fill="#ede9fe" opacity="0.9"/>
     <circle cx="585" cy="1500" r="60" fill="#a78bfa" opacity="0.18" filter="url(#blur20)"/>`,
  );
}

function duskLines(): string {
  let stripes = "";
  for (let i = 0; i < 9; i += 1) stripes += `<rect x="0" y="${1250 + i * 52 + i * i * 2}" width="${W}" height="${6 + i * 3}" fill="#000"/>`;
  let reflection = "";
  for (let i = 0; i < 14; i += 1) {
    const y = 1620 + i * 62;
    const half = 300 - i * 14;
    reflection += `<rect x="${585 - half}" y="${y}" width="${half * 2}" height="${5 + i * 0.6}" rx="3" fill="#ffb18a" opacity="${(0.55 - i * 0.035).toFixed(2)}"/>`;
  }
  return wrap(
    `${verticalGradient("sky", [[0, "#140c2b"], [0.35, "#3b1d6e"], [0.62, "#a24ea1"], [1, "#ffb18a"]])}
     ${verticalGradient("sea", [[0, "#2a1450"], [1, "#07050f"]])}
     ${verticalGradient("sun", [[0, "#ffe2c7"], [1, "#ff8fb0"]])}
     <mask id="slice"><rect width="${W}" height="${H}" fill="#fff"/>${stripes}</mask>`,
    `<rect width="${W}" height="1580" fill="url(#sky)"/>
     <circle cx="585" cy="1330" r="290" fill="url(#sun)" mask="url(#slice)"/>
     <rect y="1580" width="${W}" height="${H - 1580}" fill="url(#sea)"/>${reflection}`,
  );
}

function glassTowers(): string {
  const random = rng(77);
  let towers = "";
  let x = -40;
  while (x < W) {
    const width = 110 + random() * 120;
    const height = 700 + random() * 1100;
    const shade = Math.floor(14 + random() * 22);
    towers += `<rect x="${x.toFixed(0)}" y="${(H - height).toFixed(0)}" width="${width.toFixed(0)}" height="${height.toFixed(0)}" fill="rgb(${shade},${shade - 4},${shade + 24})"/>
      <rect x="${x.toFixed(0)}" y="${(H - height).toFixed(0)}" width="${width.toFixed(0)}" height="${height.toFixed(0)}" fill="url(#win)" opacity="${(0.35 + random() * 0.4).toFixed(2)}"/>
      <rect x="${x.toFixed(0)}" y="${(H - height).toFixed(0)}" width="3" height="${height.toFixed(0)}" fill="#c4b5fd" opacity="0.25"/>`;
    x += width + 8;
  }
  return wrap(
    `${verticalGradient("sky", [[0, "#05030c"], [0.6, "#1a0f33"], [1, "#4a2a82"]])}
     <pattern id="win" width="26" height="40" patternUnits="userSpaceOnUse"><rect x="6" y="8" width="12" height="18" rx="1" fill="#c4b5fd"/></pattern>
     ${verticalGradient("fog", [[0, "#7c3aed"], [1, "#05030c"]])}`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>${stars(55, 120, 900)}${towers}
     <rect y="1900" width="${W}" height="${H - 1900}" fill="url(#fog)" opacity="0.35"/>`,
  );
}

function moonlitWatcher(): string {
  return wrap(
    `${verticalGradient("bg", [[0, "#07050f"], [1, "#1b1036"]])}
     <radialGradient id="moon" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#fdf4ff"/><stop offset="1" stop-color="#c4b5fd"/></radialGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${stars(66, 180, 1500)}
     <circle cx="585" cy="1230" r="420" fill="#a78bfa" opacity="0.22" filter="url(#blur60)"/>
     <circle cx="585" cy="1230" r="330" fill="url(#moon)"/>
     <g fill="#07050c">
       <ellipse cx="585" cy="1560" rx="125" ry="170"/>
       <circle cx="585" cy="1330" r="88"/>
       <polygon points="508,1300 522,1205 575,1262"/>
       <polygon points="662,1300 648,1205 595,1262"/>
       <path d="M690 1690 C840 1690 880 1540 810 1470" fill="none" stroke="#07050c" stroke-width="30" stroke-linecap="round"/>
       <rect x="160" y="1720" width="850" height="70" rx="6"/>
       <rect x="0" y="1790" width="${W}" height="${H - 1790}"/>
     </g>`,
  );
}

function floatingSpheres(): string {
  const spheres: Array<[number, number, number, string, string]> = [
    [400, 800, 230, "#c4b5fd", "#4c1d95"],
    [800, 1250, 170, "#f0abfc", "#701a75"],
    [330, 1650, 130, "#93c5fd", "#1e3a8a"],
    [770, 1950, 220, "#ddd6fe", "#5b21b6"],
  ];
  const defs = spheres
    .map(
      ([, , , light, dark], i) =>
        `<radialGradient id="s${i}" cx="0.33" cy="0.28" r="0.85"><stop offset="0" stop-color="#fff"/><stop offset="0.18" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`,
    )
    .join("");
  const body = spheres
    .map(
      ([cx, cy, r], i) =>
        `<ellipse cx="${cx + 40}" cy="${cy + r + 260}" rx="${r * 0.9}" ry="${r * 0.14}" fill="#000" opacity="0.55" filter="url(#blur20)"/>
         <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#s${i})"/>`,
    )
    .join("");
  return wrap(
    `${verticalGradient("bg", [[0, "#120b26"], [1, "#04030a"]])}${defs}`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${body}`,
  );
}

function moonKeep(): string {
  const towers: Array<[number, number, number]> = [
    [430, 70, 1480],
    [500, 170, 1560],
    [670, 70, 1440],
    [740, 60, 1530],
  ];
  const windows = [
    [540, 1650],
    [585, 1700],
    [460, 1620],
    [695, 1600],
  ]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="14" height="24" rx="6" fill="#fde68a" opacity="0.85"/>`)
    .join("");
  const castle = towers
    .map(([x, w, top]) => `<rect x="${x}" y="${top}" width="${w}" height="${1880 - top}"/><polygon points="${x - 10},${top} ${x + w / 2},${top - 120} ${x + w + 10},${top}"/>`)
    .join("");
  return wrap(
    `${verticalGradient("sky", [[0, "#070514"], [0.6, "#241150"], [1, "#6b3fa0"]])}`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>${stars(88, 240, 1500)}
     <circle cx="760" cy="720" r="260" fill="#ede9fe" opacity="0.18" filter="url(#blur60)"/>
     <circle cx="760" cy="720" r="190" fill="#faf5ff"/>
     <g fill="#0b0720">${castle}<ellipse cx="585" cy="2000" rx="760" ry="230"/><rect y="1990" width="${W}" height="${H - 1990}"/></g>${windows}`,
  );
}

function softWaves(): string {
  let waves = "";
  const palette = ["#7c3aed", "#4f46e5", "#a855f7", "#2563eb", "#c026d3"];
  for (let i = 0; i < 10; i += 1) {
    const base = 900 + i * 150;
    const amp = 70 + i * 8;
    const phase = i * 0.9;
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W; x += 30) d += ` L${x} ${(base + Math.sin(x / 190 + phase) * amp).toFixed(1)}`;
    d += ` L${W} ${H} Z`;
    waves += `<path d="${d}" fill="${palette[i % palette.length]}" opacity="${(0.16 + i * 0.03).toFixed(2)}"/>`;
  }
  return wrap(
    `${verticalGradient("bg", [[0, "#0a0618"], [1, "#030208"]])}`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${waves}`,
  );
}

function stellarField(): string {
  return wrap(
    `${verticalGradient("bg", [[0, "#020208"], [1, "#07041a"]])}
     <linearGradient id="band" x1="0" x2="1"><stop offset="0" stop-color="#7c3aed" stop-opacity="0"/><stop offset="0.5" stop-color="#d8b4fe"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <g transform="rotate(-62 585 1266)">
       <ellipse cx="585" cy="1266" rx="1500" ry="190" fill="url(#band)" opacity="0.45" filter="url(#blur60)"/>
       <ellipse cx="585" cy="1266" rx="1200" ry="60" fill="#f5f3ff" opacity="0.25" filter="url(#blur20)"/>
     </g>${stars(99, 700, H, 2)}${stars(100, 40, H, 3.6)}`,
  );
}

export interface DemoWallpaperSpec {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  featured: boolean;
  format: "jpg" | "png" | "webp";
  svg: () => string;
}

const STARTER_NOTE = "Starter artwork generated by the platform — replace or remove it from the admin dashboard.";

export const DEMO_WALLPAPERS: DemoWallpaperSpec[] = [
  { title: "Violet Horizon", description: `Concentric rings around a single pale moon. ${STARTER_NOTE}`, categoryId: "minimalist", tags: ["starter", "minimal", "violet", "rings"], featured: true, format: "jpg", svg: violetHorizon },
  { title: "Nebula Drift", description: `Soft clouds of violet and blue light drifting through deep space. ${STARTER_NOTE}`, categoryId: "abstract", tags: ["starter", "nebula", "gradient", "purple"], featured: true, format: "jpg", svg: nebulaDrift },
  { title: "Midnight Ridge", description: `Layered mountain ridges fading into a violet dusk. ${STARTER_NOTE}`, categoryId: "nature", tags: ["starter", "mountains", "dusk", "landscape"], featured: false, format: "jpg", svg: midnightRidge },
  { title: "Quiet Orbit", description: `A ringed planet floating in silence. ${STARTER_NOTE}`, categoryId: "space", tags: ["starter", "planet", "stars", "cosmic"], featured: true, format: "png", svg: quietOrbit },
  { title: "Void Light", description: `A single beam of light cutting through absolute darkness. ${STARTER_NOTE}`, categoryId: "dark", tags: ["starter", "black", "amoled", "beam"], featured: false, format: "jpg", svg: voidLight },
  { title: "Dusk Lines", description: `A striped sun setting over a calm violet sea. ${STARTER_NOTE}`, categoryId: "aesthetic", tags: ["starter", "sunset", "retro", "vaporwave"], featured: true, format: "webp", svg: duskLines },
  { title: "Glass Towers", description: `A moody city skyline lit from within. ${STARTER_NOTE}`, categoryId: "architecture", tags: ["starter", "city", "skyline", "night"], featured: false, format: "jpg", svg: glassTowers },
  { title: "Moonlit Watcher", description: `A silhouetted cat keeping watch beneath a huge moon. ${STARTER_NOTE}`, categoryId: "cats", tags: ["starter", "cat", "moon", "silhouette"], featured: false, format: "jpg", svg: moonlitWatcher },
  { title: "Floating Spheres", description: `Glossy 3D-style spheres suspended in a soft studio glow. ${STARTER_NOTE}`, categoryId: "3d-art", tags: ["starter", "spheres", "render", "glossy"], featured: false, format: "jpg", svg: floatingSpheres },
  { title: "Moon Keep", description: `A distant castle glowing beneath a pale moon. ${STARTER_NOTE}`, categoryId: "fantasy", tags: ["starter", "castle", "moon", "kingdom"], featured: false, format: "jpg", svg: moonKeep },
  { title: "Soft Waves", description: `Overlapping translucent waves in violet and indigo. ${STARTER_NOTE}`, categoryId: "abstract", tags: ["starter", "waves", "layers", "gradient"], featured: false, format: "jpg", svg: softWaves },
  { title: "Stellar Field", description: `A dense field of stars crossed by a faint galactic band. ${STARTER_NOTE}`, categoryId: "space", tags: ["starter", "galaxy", "milky way", "stars"], featured: false, format: "jpg", svg: stellarField },
];
