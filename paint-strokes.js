/**
 * Scroll scores for Gill's painted surfaces. These describe visible gestures,
 * not a reconstruction of the artist's actual working process.
 * Coordinates and brush widths are normalized to the source image. The caller
 * supplies the paint: each gesture reveals pixels from the original artwork.
 */
export const paintings = [
  { key: 'pots', src: '/art/jacobs-pots.jpg', title: 'Jacob’s Pots', focus: [0.52, 0.5] },
  { key: 'tulips', src: '/art/tulips-impasto.jpg', title: 'Orange Tulips', focus: [0.51, 0.45] },
  { key: 'ribbon', src: '/art/the-ribbon.jpg', title: 'The Ribbon', focus: [0.53, 0.46] },
  { key: 'flowers', src: '/art/blue-gold.jpg', title: 'Blue & Gold', focus: [0.49, 0.4] },
  { key: 'reflections', src: '/art/reflections.jpg', title: 'Reflections', focus: [0.53, 0.5] },
  { key: 'branches', src: '/art/neon-bouquet.jpg', title: 'Neon Bouquet', focus: [0.49, 0.48] },
  { key: 'loops', src: '/art/loop-the-loop.jpg', title: 'Loop the Loop', focus: [0.5, 0.5] },
  { key: 'bud', src: '/art/the-bud.jpg', title: 'The Bud', focus: [0.53, 0.46] },
];

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;

function seededRandom(name) {
  let state = 2166136261;
  for (const character of name) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function cubic(a, b, c, d, count = 28) {
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = index / count;
    const u = 1 - t;
    return [
      u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ];
  });
}

function arc(cx, cy, rx, ry, from, to, rotation = 0, count = 26) {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return Array.from({ length: count + 1 }, (_, index) => {
    const angle = lerp(from, to, index / count);
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    return [cx + x * cosine - y * sine, cy + x * sine + y * cosine];
  });
}

function local(points, cx, cy, width, height, rotation = 0) {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return points.map(([px, py]) => {
    const x = px * width;
    const y = py * height;
    return [cx + x * cosine - y * sine, cy + x * sine + y * cosine];
  });
}

function waver(x, top, bottom, amplitude, phase, count = 28) {
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = index / count;
    const y = lerp(top, bottom, t);
    return [x + Math.sin(y * 13 + phase) * amplitude + Math.sin(y * 31 + phase * 0.7) * amplitude * 0.24, y];
  });
}

/** Return a deterministic, chronological list of brush gestures. */
export function buildStrokes(kind) {
  if (!paintings.some(painting => painting.key === kind)) throw new Error(`Unknown painting score: ${kind}`);
  const random = seededRandom(kind);
  const between = (low, high) => lerp(low, high, random());
  const strokes = [];
  const add = (points, width, start, duration, opacity = 0.97) => {
    // Mild bristle drift is coherent along each gesture, never pixel noise.
    const phase = random() * TAU;
    const drift = Math.min(width * 0.045, 0.0022);
    strokes.push({
      points: points.map(([x, y], index) => [
        x + Math.sin(index * 0.61 + phase) * drift,
        y + Math.cos(index * 0.47 + phase) * drift,
      ]),
      width,
      start: Math.max(0, Math.min(0.9, start)),
      duration: Math.max(0.025, Math.min(duration, 0.96 - start)),
      opacity,
    });
  };

  // Broad overlapping gestures lay a continuous surface underneath the marks.
  // Their offsets, lengths and curved courses are staggered rather than rastered.
  function underpaint(mode, count = 30) {
    for (let index = 0; index < count; index++) {
      const station = ((index * 0.61803398875) % 1) * 1.35 - 0.175;
      const start = between(0, 0.22);
      const width = between(0.16, 0.255);
      const reverse = index % 3 === 0;
      let points;
      if (mode === 'vertical') {
        points = cubic([station, -0.2], [station + between(-0.09, 0.09), 0.28], [station + between(-0.12, 0.12), 0.65], [station + between(-0.06, 0.06), 1.18]);
      } else if (mode === 'diagonal') {
        points = cubic([station - 0.38, 1.14], [station + 0.02, 0.84], [station - 0.15, 0.24], [station + 0.5, -0.14]);
      } else if (mode === 'fan') {
        const angle = index * 2.39996323;
        const end = [0.46 + Math.cos(angle) * 0.9, 0.48 + Math.sin(angle) * 0.9];
        points = cubic([0.48 + between(-0.15, 0.15), 0.52], [0.42, 0.25], [lerp(0.5, end[0], 0.65), lerp(0.5, end[1], 0.6)], end);
      } else if (mode === 'rings') {
        const radius = 0.12 + (index / count) * 0.74;
        const angle = index * 1.53;
        points = arc(0.5, 0.47, radius, radius * 0.95, angle, angle + Math.PI * between(0.85, 1.5), -0.18);
      } else {
        points = cubic([-0.2, station], [0.16, station + between(-0.18, 0.18)], [0.68, station + between(-0.15, 0.15)], [1.18, station + between(-0.07, 0.07)]);
      }
      if (reverse) points.reverse();
      add(points, width, start, between(0.19, 0.31), between(0.84, 0.97));
    }
  }

  function petal(cx, cy, width, height, rotation, start, passes = 4) {
    for (let index = 0; index < passes; index++) {
      const side = lerp(-0.3, 0.3, index / Math.max(1, passes - 1));
      const points = cubic([0, 0.49], [side - 0.27, 0.15], [side + 0.19, -0.17], [side * 0.7, -0.5]);
      add(local(points, cx, cy, width, height, rotation), width * between(0.24, 0.34), start + index * 0.012, between(0.13, 0.2));
    }
  }

  function outlinePetal(cx, cy, width, height, rotation, start) {
    const left = cubic([0, 0.49], [-0.52, 0.29], [-0.56, -0.12], [-0.06, -0.5], 14);
    const right = cubic([-0.06, -0.5], [0.27, -0.1], [0.63, 0.34], [0, 0.49], 14);
    add(local(left.concat(right.slice(1)), cx, cy, width, height, rotation), between(0.009, 0.016), start, between(0.065, 0.12));
  }

  function vessel(cx, cy, rx, ry, start, passes = 8) {
    for (let index = 0; index < passes; index++) {
      const height = lerp(-0.8, 0.85, index / (passes - 1));
      const reach = Math.sqrt(Math.max(0.18, 1 - height * height));
      const points = cubic([cx - rx * reach, cy + ry * height], [cx - rx * 0.34, cy + ry * height + ry * 0.23], [cx + rx * 0.44, cy + ry * height + ry * 0.15], [cx + rx * reach, cy + ry * height - 0.015]);
      if (index % 2) points.reverse();
      add(points, ry * between(0.26, 0.4), start + index * 0.012, between(0.13, 0.2));
    }
  }

  if (kind === 'pots') {
    underpaint('vertical', 32);
    const pots = [[0.07, 0.69, 0.26, 0.28], [0.3, 0.27, 0.16, 0.2], [0.41, 0.64, 0.105, 0.36], [0.78, 0.2, 0.23, 0.18], [0.72, 0.68, 0.185, 0.145], [0.57, 0.92, 0.23, 0.2], [0.94, 0.48, 0.09, 0.19]];
    pots.forEach((pot, index) => vessel(...pot, 0.19 + index * 0.042));
    const contours = [
      [[0.02, 0.16], [0.075, 0.16], [0.075, 0.41], [0.37, 0.48], [0.4, 0.71], [0.23, 0.97]],
      [[0.24, -0.05], [0.235, 0.105], [0.15, 0.13], [0.09, 0.2], [0.1, 0.4]],
      [[0.31, -0.05], [0.315, 0.185], [0.43, 0.24], [0.46, 0.295]],
      [[0.66, -0.05], [0.66, 0.08], [0.76, 0.09], [0.97, 0.09]],
      [[0.69, 0.38], [0.69, 0.49], [0.56, 0.55], [0.55, 0.7], [0.68, 0.81], [0.87, 0.76], [0.92, 0.64], [0.78, 0.53], [0.77, 0.38]],
      [[0.92, 0.23], [0.86, 0.23], [0.86, 0.29], [0.9, 0.31], [0.9, 0.38], [0.82, 0.44], [0.83, 0.53]],
      [[0.44, 0.73], [0.29, 0.84], [0.28, 0.95], [0.34, 1.05]],
    ];
    contours.forEach((points, index) => {
      add(points, 0.012, 0.67 + index * 0.018, 0.11);
      add(points.map(([x, y]) => [x + 0.006, y]), 0.027, 0.62 + index * 0.018, 0.12, 0.9);
    });
    for (let index = 0; index < 12; index++) {
      const angle = index * 0.37;
      add(arc(0.415, 0.339, 0.078 - (index % 3) * 0.014, 0.073 - (index % 3) * 0.014, angle, angle + 3.3), 0.016, 0.62 + index * 0.015, 0.09);
    }
    for (let index = 0; index < 10; index++) {
      const x = 0.58 + index * 0.018;
      add(cubic([x, 0.3], [x - 0.04, 0.245], [x + 0.06, 0.235], [x + 0.06, 0.34]), 0.02, 0.69 + index * 0.013, 0.08);
    }
  }

  if (kind === 'tulips') {
    underpaint('diagonal', 28);
    const blooms = [
      [0.19, 0.2, 0.21, 0.24, -0.45], [0.285, 0.14, 0.18, 0.25, 0.25],
      [0.243, 0.36, 0.16, 0.22, -0.4], [0.58, 0.285, 0.2, 0.22, 0.15],
      [0.78, 0.15, 0.2, 0.26, 0.15], [0.884, 0.12, 0.15, 0.24, 0.35],
      [0.752, 0.36, 0.18, 0.18, 0.55], [0.909, 0.422, 0.17, 0.23, 0.3],
      [0.1, 0.52, 0.2, 0.26, -0.65], [0.21, 0.668, 0.25, 0.25, -0.65],
      [0.333, 0.61, 0.17, 0.28, 0.05], [0.543, 0.53, 0.15, 0.25, 0.05],
      [0.69, 0.7, 0.2, 0.24, 0.35], [0.813, 0.78, 0.25, 0.2, 0.8],
      [0.915, 0.874, 0.21, 0.25, 1], [0.62, 0.933, 0.2, 0.24, 0.05],
    ];
    blooms.forEach((bloom, index) => {
      petal(...bloom, 0.24 + ((index * 5) % blooms.length) * 0.019);
      outlinePetal(...bloom, 0.68 + index * 0.009);
    });
    const leaves = [
      [[0.54, 1.1], [0.26, 0.72], [0.3, 0.4], [0.02, 0.2]],
      [[0.5, 1.08], [0.39, 0.71], [0.45, 0.23], [0.5, -0.07]],
      [[0.62, 1.1], [0.37, 0.82], [0.21, 0.73], [-0.1, 0.99]],
      [[0.49, 0.93], [0.56, 0.58], [0.82, 0.52], [1.06, 0.59]],
      [[0.6, 0.72], [0.62, 0.42], [0.73, 0.28], [1.02, 0.26]],
      [[0.55, 0.98], [0.69, 0.87], [0.92, 1.01], [1.12, 0.93]],
    ];
    leaves.forEach((points, index) => {
      for (let pass = 0; pass < 4; pass++) {
        add(cubic(...points).map(([x, y]) => [x + (pass - 1.5) * 0.013, y]), 0.035 + pass * 0.006, 0.18 + index * 0.039 + pass * 0.008, 0.2);
      }
    });
  }

  if (kind === 'ribbon') {
    underpaint('vertical', 30);
    const blooms = [[0.255, 0.237, 0.29, 0.3, -0.7], [0.532, 0.31, 0.22, 0.26, 0.1], [0.78, 0.21, 0.33, 0.3, 0.7], [0.55, 0.12, 0.23, 0.16, 1.1]];
    blooms.forEach((bloom, index) => {
      petal(...bloom, 0.21 + index * 0.057, 7);
      outlinePetal(...bloom, 0.69 + index * 0.027);
    });
    for (let index = 0; index < 24; index++) {
      const x = 0.38 + index / 24 * 0.37;
      add(cubic([x, 0.41], [x - 0.03, 0.65], [x + 0.08, 0.83], [x + 0.06, 1.1]), between(0.035, 0.075), 0.23 + index * 0.012, 0.24, 0.92);
    }
    const curls = [
      cubic([0.39, 0.71], [0.1, 0.76], [0.01, 0.35], [0.23, 0.47]),
      cubic([0.23, 0.47], [0.39, 0.55], [0.31, 0.65], [0.18, 0.53]),
      cubic([0.69, 0.66], [0.89, 0.57], [0.86, 0.88], [0.95, 0.85]),
      cubic([0.95, 0.85], [0.76, 0.86], [0.9, 0.73], [0.88, 0.81]),
    ];
    curls.forEach((points, index) => {
      for (let pass = 0; pass < 4; pass++) add(points.map(([x, y]) => [x + pass * 0.003, y]), 0.01 + pass * 0.005, 0.63 + index * 0.05 + pass * 0.008, 0.1);
    });
    for (let index = 0; index < 12; index++) {
      const y = 0.39 + index * 0.043;
      add(cubic([0.1, y + 0.015], [0.3, y - 0.02], [0.61, y + 0.009], [1.04, y - 0.032]), 0.012, 0.7 + index * 0.01, 0.085, 0.85);
    }
  }

  if (kind === 'flowers') {
    underpaint('rings', 30);
    const flowers = [
      [0.155, 0.381, 0.084], [0.32, 0.318, 0.065], [0.38, 0.232, 0.071],
      [0.494, 0.23, 0.068], [0.622, 0.205, 0.065], [0.799, 0.12, 0.101],
      [0.422, 0.34, 0.077], [0.312, 0.457, 0.085], [0.557, 0.305, 0.056],
      [0.658, 0.332, 0.057], [0.458, 0.447, 0.058], [0.561, 0.416, 0.048],
      [0.672, 0.442, 0.081], [0.59, 0.511, 0.087], [0.431, 0.532, 0.072],
      [0.301, 0.567, 0.064], [0.543, 0.631, 0.09], [0.679, 0.606, 0.083],
    ];
    flowers.forEach(([x, y, radius], index) => {
      const start = 0.2 + ((index * 7) % flowers.length) * 0.019;
      const phase = random() * TAU;
      for (let pass = 0; pass < 3; pass++) {
        const r = radius * (0.25 + pass * 0.3);
        add(arc(x, y, r, r * 0.9, phase + pass * 0.9, phase + pass * 0.9 + 5.5, -0.18), radius * 0.55, start + pass * 0.025, 0.18);
      }
      add(arc(x, y, radius, radius * 0.9, phase, phase + 5.9, -0.18), 0.011, 0.665 + index * 0.009, 0.1);
    });
    for (let index = 0; index < 12; index++) {
      const x = 0.375 + index * 0.018;
      add(cubic([x, 0.62], [x + 0.008, 0.75], [x - 0.009, 0.89], [x + 0.006, 0.965]), index % 3 ? 0.021 : 0.011, 0.37 + index * 0.02, 0.18);
    }
    const leaves = [[0.342, 0.12, 0.1, 0.17, -0.3], [0.538, 0.09, 0.08, 0.21, 0.45], [0.218, 0.24, 0.1, 0.22, -1.25], [0.739, 0.306, 0.11, 0.23, 0.85], [0.777, 0.482, 0.15, 0.23, -0.8], [0.364, 0.664, 0.08, 0.2, -0.18]];
    leaves.forEach((leaf, index) => petal(...leaf, 0.22 + index * 0.042, 3));
    for (let index = 0; index < 12; index++) {
      const flower = flowers[index];
      add(arc(flower[0], flower[1], flower[2] * 0.18, flower[2] * 0.17, 0, TAU), 0.011, 0.75 + index * 0.006, 0.065);
    }
  }

  if (kind === 'reflections') {
    // The whole source consists of vertical flowing bands; individual bands
    // grow at unequal speeds, never as a single horizontal wipe.
    for (let index = 0; index < 32; index++) {
      const x = ((index * 0.61803398875) % 1) * 1.2 - 0.1;
      const points = waver(x, -0.16, 1.16, between(0.012, 0.031), x * 19);
      if (index % 3 === 1) points.reverse();
      add(points, between(0.095, 0.17), between(0, 0.22), between(0.22, 0.36), 0.9);
    }
    const bands = [0.065, 0.107, 0.163, 0.216, 0.284, 0.334, 0.391, 0.438, 0.504, 0.578, 0.65, 0.713, 0.762, 0.815, 0.888, 0.947];
    bands.forEach((x, index) => {
      for (let pass = 0; pass < 4; pass++) {
        const points = waver(x + (pass - 1.5) * 0.012, -0.1 + pass * 0.033, 1.1 - pass * 0.018, 0.012 + index % 3 * 0.004, x * 19);
        if ((index + pass) % 3 === 0) points.reverse();
        add(points, between(0.017, 0.037), 0.19 + ((index * 7) % bands.length) * 0.019 + pass * 0.025, 0.26);
      }
    });
    for (let index = 0; index < 32; index++) {
      const x = bands[index % bands.length] + (index > 15 ? 0.02 : -0.006);
      const startY = index % 2 ? 0.98 : -0.06;
      const endY = index % 2 ? -0.06 : 1.05;
      add(waver(x, startY, endY, 0.007 + index % 4 * 0.002, x * 19), between(0.006, 0.013), 0.65 + ((index * 11) % 32) * 0.005, 0.12, 0.93);
    }
  }

  if (kind === 'branches') {
    underpaint('fan', 30);
    const roots = [0.47, 0.48];
    const ends = [[0.02, 0.13], [0.16, -0.04], [0.36, -0.09], [0.58, -0.08], [0.84, 0.01], [1.1, 0.22], [1.09, 0.42], [1.12, 0.65], [0.96, 0.92], [0.77, 1.08], [0.57, 1.13], [0.29, 1.05], [0.01, 0.89], [-0.08, 0.65]];
    ends.forEach((end, index) => {
      const delta = [end[0] - roots[0], end[1] - roots[1]];
      const control = [roots[0] + delta[0] * 0.35 - delta[1] * 0.15, roots[1] + delta[1] * 0.35 + delta[0] * 0.15];
      const path = cubic(roots, control, [end[0] - delta[0] * 0.28, end[1] - delta[1] * 0.28], end);
      add(path, 0.037, 0.2 + index * 0.023, 0.23, 0.94);
      add(path, 0.011, 0.66 + index * 0.009, 0.13);
      for (let pass = 0; pass < 4; pass++) {
        const t = 0.34 + pass * 0.16;
        const anchor = path[Math.min(path.length - 1, Math.floor(t * (path.length - 1)))];
        const side = pass % 2 ? 1 : -1;
        const rotation = Math.atan2(delta[1], delta[0]) + Math.PI / 2 + side * 0.7;
        petal(anchor[0] - delta[1] * side * 0.045, anchor[1] + delta[0] * side * 0.045, 0.08, 0.13, rotation, 0.28 + index * 0.018 + pass * 0.025, 1);
      }
    });
    for (let index = 0; index < 18; index++) {
      const angle = index * 0.86;
      const radius = 0.13 + index % 6 * 0.065;
      const x = 0.47 + Math.cos(angle) * radius;
      const y = 0.48 + Math.sin(angle) * radius;
      outlinePetal(x, y, 0.066, 0.11, angle + Math.PI / 2, 0.68 + index * 0.008);
    }
  }

  if (kind === 'loops') {
    underpaint('horizontal', 30);
    const cups = [[0.177, 0.126, 0.22, 0.24, -0.25], [0.411, 0.095, 0.17, 0.18, 0.2], [0.384, 0.31, 0.26, 0.2, -0.03], [0.682, 0.215, 0.23, 0.23, -0.25], [0.785, 0.11, 0.2, 0.2, 0.2], [0.943, 0.29, 0.17, 0.24, 0.27], [0.597, 0.343, 0.19, 0.14, 0.05], [0.179, 0.411, 0.27, 0.18, 1.02], [0.46, 0.46, 0.2, 0.23, 0.72], [0.625, 0.559, 0.19, 0.22, 0.1], [0.749, 0.468, 0.21, 0.16, 0.76], [0.94, 0.566, 0.2, 0.23, 0.55], [0.075, 0.68, 0.18, 0.25, -0.24], [0.418, 0.759, 0.16, 0.28, -0.31], [0.679, 0.739, 0.25, 0.19, 0.6]];
    cups.forEach((cup, index) => {
      petal(...cup, 0.22 + ((index * 7) % cups.length) * 0.023, 3);
      outlinePetal(...cup, 0.68 + index * 0.009);
    });
    vessel(0.18, 0.77, 0.24, 0.36, 0.18, 8);
    vessel(0.46, 0.78, 0.23, 0.24, 0.25, 8);
    vessel(0.72, 0.8, 0.21, 0.22, 0.31, 8);
    const loopPaths = [
      cubic([-0.04, 0.205], [0.29, -0.08], [0.56, -0.04], [0.56, 0.32]),
      cubic([0.56, 0.32], [0.58, 0.48], [0.49, 0.78], [0.47, 0.9]),
      cubic([0.47, 0.9], [0.35, 1.14], [0.21, 0.62], [0.24, 0.58]),
      cubic([0.24, 0.58], [0.37, 0.41], [0.46, 0.66], [0.35, 0.59]),
      cubic([0.35, 0.59], [0.24, 0.51], [0.23, 0.92], [0.18, 0.95]),
      cubic([0.18, 0.95], [-0.05, 0.99], [0.11, 0.54], [0.05, 0.41]),
      cubic([0.05, 0.41], [-0.09, 0.21], [0.22, 0.16], [0.24, 0.34]),
      cubic([0.55, 0.92], [0.45, 0.63], [0.99, 0.41], [0.83, 0.73]),
      cubic([0.83, 0.73], [0.82, 1.11], [0.39, 0.98], [0.55, 0.92]),
      cubic([0.78, 0.18], [0.82, 0.36], [0.79, 0.65], [0.98, 0.68]),
    ];
    loopPaths.forEach((path, index) => {
      add(path, 0.02, 0.58 + index * 0.017, 0.14);
      add(path, 0.008, 0.73 + index * 0.009, 0.075);
    });
  }

  if (kind === 'bud') {
    underpaint('rings', 30);
    for (let index = 0; index < 30; index++) {
      const radius = 0.31 + index / 30 * 0.27;
      const phase = index * 0.71;
      add(arc(0.515, 0.46, radius, radius * 0.99, phase, phase + between(1.8, 3.7), -0.27), between(0.04, 0.075), 0.18 + index * 0.009, 0.23);
    }
    const petals = [
      [0.66, 0.159, 0.21, 0.08, 0.57],
      [0.522, 0.29, 0.285, 0.1, -0.13],
      [0.455, 0.474, 0.25, 0.14, -0.58],
      [0.574, 0.645, 0.272, 0.148, -0.49],
      [0.831, 0.525, 0.07, 0.159, 0.26],
    ];
    petals.forEach(([x, y, rx, ry, rotation], index) => {
      for (let pass = 0; pass < 7; pass++) {
        const offset = lerp(-0.7, 0.7, pass / 6);
        const path = cubic([-0.95, offset], [-0.27, offset + 0.13], [0.55, offset - 0.12], [0.95, offset + 0.04]);
        add(local(path, x, y, rx, ry, rotation), 0.038, 0.26 + index * 0.052 + pass * 0.011, 0.16);
      }
      for (let pass = 0; pass < 3; pass++) {
        add(arc(x, y, rx + pass * 0.007, ry + pass * 0.008, -0.2 + pass, 5.8 + pass, rotation), 0.008 + pass * 0.003, 0.69 + index * 0.024 + pass * 0.01, 0.1);
      }
    });
    for (let index = 0; index < 16; index++) {
      const radius = 0.43 + index * 0.005;
      const phase = index * 0.63;
      add(arc(0.52, 0.46, radius, radius * 0.99, phase, phase + 2.7, -0.27), 0.0055, 0.73 + index * 0.006, 0.09, 0.94);
    }
    for (let index = 0; index < 8; index++) {
      add(cubic([-0.08 + index * 0.006, 1.08], [0.09 + index * 0.004, 0.89], [0.2, 0.745], [0.294 + index * 0.004, 0.649]), index % 2 ? 0.009 : 0.023, 0.39 + index * 0.024, 0.18);
    }
  }

  return strokes.sort((left, right) => left.start - right.start);
}
