import * as THREE from "three";
import { OrbitControls } from "./vendor/three/OrbitControls.js";
import { mergeGeometries } from "./vendor/three/BufferGeometryUtils.js";

// The landscape and inhabitants are procedural 3D models, rendered locally with WebGL.
const api =
  window.memoryIslands ||
  (await new Promise((resolve) => {
    document.addEventListener(
      "memory-islands-ready",
      () => resolve(window.memoryIslands),
      { once: true },
    );
  }));
const $ = (selector) => document.querySelector(selector);
const stage = $("#map-viewport");
const section = $("#map-section");
const status = $("#scene-status");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const colors = {
  grass: 0xa7c891,
  sand: 0xe9d3a5,
  cream: 0xfff2d6,
  roof: 0xc58b76,
  sage: 0x77967a,
  leaf: 0x89ae7c,
  pink: 0xe6b4ad,
  trunk: 0x9c8667,
  skin: 0xe8bf9a,
  hair: 0x574b43,
  water: 0xc2e0df,
  lavender: 0xc8bbda,
};
const materialCache = new Map();
function material(color) {
  if (!materialCache.has(color))
    materialCache.set(
      color,
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 }),
    );
  return materialCache.get(color);
}
const shapeGeometry = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 10, 8),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 10),
  cone: new THREE.ConeGeometry(1, 1, 8),
};
function mesh(
  parent,
  geometry,
  color,
  position = [0, 0, 0],
  scale = [1, 1, 1],
) {
  const object = new THREE.Mesh(geometry, material(color));
  object.position.set(...position);
  object.scale.set(...scale);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
const box = (parent, color, p, s) =>
  mesh(parent, shapeGeometry.box, color, p, s);
const ball = (parent, color, p, s) =>
  mesh(parent, shapeGeometry.sphere, color, p, s);
const cone = (parent, color, p, s) =>
  mesh(parent, shapeGeometry.cone, color, p, s);
const cylinder = (parent, color, p, s) =>
  mesh(parent, shapeGeometry.cylinder, color, p, s);
function beam(parent, a, b, radius, color) {
  const start = V(...a),
    end = V(...b),
    direction = end.clone().sub(start);
  const object = cylinder(
    parent,
    color,
    start.clone().add(end).multiplyScalar(0.5).toArray(),
    [radius, direction.length(), radius],
  );
  object.quaternion.setFromUnitVectors(V(0, 1, 0), direction.normalize());
  return object;
}
function group(parent, x = 0, y = 0, z = 0) {
  const root = new THREE.Group();
  root.position.set(x, y, z);
  parent.add(root);
  return root;
}

// Bake static scenery into a single colored mesh per island; moving limbs remain separate.
// This keeps draw calls low on phones without giving up real geometry, light, or shadows.
function bake(root) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const geometries = [],
    objects = [];
  function visit(object) {
    if (object !== root && object.userData.dynamic) return;
    if (
      object.isMesh &&
      !Array.isArray(object.material) &&
      !object.material.transparent
    ) {
      const geometry = object.geometry.index
        ? object.geometry.toNonIndexed()
        : object.geometry.clone();
      geometry.applyMatrix4(
        new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld),
      );
      geometry.deleteAttribute("uv");
      geometry.deleteAttribute("uv1");
      const position = geometry.getAttribute("position");
      const color = new Float32Array(position.count * 3);
      for (let i = 0; i < position.count; i++)
        object.material.color.toArray(color, i * 3);
      geometry.setAttribute("color", new THREE.BufferAttribute(color, 3));
      geometries.push(geometry);
      objects.push(object);
    }
    [...object.children].forEach(visit);
  }
  visit(root);
  if (!geometries.length) return;
  const combined = mergeGeometries(geometries, false);
  if (!combined) throw new Error("Could not prepare 3D scenery");
  const result = new THREE.Mesh(
    combined,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94 }),
  );
  result.castShadow = true;
  result.receiveShadow = true;
  objects.forEach((object) => object.removeFromParent());
  geometries.forEach((geometry) => geometry.dispose());
  root.add(result);
}
function tree(parent, x, z, size = 1, pink = false) {
  const root = group(parent, x, 0.35, z);
  root.scale.setScalar(size);
  cylinder(root, colors.trunk, [0, 0.85, 0], [0.16, 1.7, 0.16]);
  ball(root, pink ? colors.pink : colors.leaf, [0, 2.25, 0], [1.05, 1.1, 0.95]);
  ball(root, pink ? 0xecc3b5 : 0x9aba85, [-0.65, 1.95, 0.1], [0.7, 0.8, 0.7]);
  ball(root, pink ? 0xe6b3a8 : 0xa7c48f, [0.65, 2.1, 0.1], [0.7, 0.8, 0.7]);
  return root;
}
function shrub(parent, x, z, size = 0.6) {
  return ball(parent, 0x9cba7d, [x, 0.45, z], [size, 0.45, size]);
}
function flower(parent, x, z, color = colors.pink) {
  cylinder(parent, 0x78996e, [x, 0.55, z], [0.035, 0.6, 0.035]);
  ball(parent, color, [x, 0.91, z], [0.17, 0.18, 0.17]);
  ball(parent, 0xf2d596, [x, 0.99, z + 0.08], [0.08, 0.07, 0.06]);
}
function bench(parent, x, z, rotation = 0) {
  const root = group(parent, x, 0.35, z);
  root.rotation.y = rotation;
  for (let i = 0; i < 3; i++)
    box(root, 0xc3a27b, [0, 0.5, i * 0.16 - 0.16], [1.55, 0.1, 0.12]);
  box(root, 0xc3a27b, [0, 1, -0.27], [1.55, 0.45, 0.08]);
  for (const dx of [-0.58, 0.58]) {
    box(root, 0x6e826b, [dx, 0.25, 0], [0.09, 0.5, 0.45]);
    box(root, 0x6e826b, [dx, 0.7, -0.3], [0.07, 0.75, 0.07]);
  }
}
function gable(parent, width, depth, height, color, x, y, z) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(0, height);
  shape.lineTo(width / 2, 0);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
  return mesh(parent, geometry, color, [x, y, z - depth / 2]);
}
function cottage(parent) {
  const root = group(parent, 0, 0.35, -0.65);
  box(root, colors.cream, [0, 1.35, 0], [3.6, 2.7, 2.9]);
  gable(root, 4.35, 3.6, 1.6, colors.roof, 0, 2.7, 0);
  box(root, 0xddb990, [1.05, 3.65, -0.6], [0.55, 1.55, 0.55]);
  box(root, 0x71907e, [0.4, 0.92, 1.48], [0.72, 1.84, 0.12]);
  ball(root, 0xdfc28a, [0.62, 0.9, 1.57], [0.06, 0.06, 0.06]);
  for (const dx of [-1.15, 1.2]) {
    box(root, 0xe6d6b0, [dx, 1.65, 1.49], [0.87, 0.95, 0.12]);
    box(root, 0xaac6c4, [dx, 1.65, 1.57], [0.69, 0.76, 0.05]);
    box(root, 0xfff2d8, [dx, 1.65, 1.62], [0.065, 0.76, 0.035]);
    box(root, 0xfff2d8, [dx, 1.65, 1.62], [0.69, 0.065, 0.035]);
  }
  box(root, 0xaac6c4, [1.83, 1.6, -0.4], [0.07, 0.9, 1]);
  box(root, 0xf8e9cc, [1.88, 1.6, -0.4], [0.05, 0.065, 1]);
  box(root, 0xdec9a2, [0.4, 0.08, 1.9], [1.2, 0.16, 0.7]);
  tree(parent, -3.5, -1.5, 1.05);
  tree(parent, 3, -2, 1.2);
  shrub(parent, -2.8, 1.2);
  shrub(parent, 2.9, 1.5);
  bench(parent, 3.5, 1.6, -0.4);
  for (let i = 0; i < 6; i++)
    flower(
      parent,
      -4 + i * 0.36,
      2.2 + (i % 2) * 0.2,
      i % 2 ? 0xe6bd8b : colors.pink,
    );
  return root;
}
function mountain(parent, x, z, radius, height, color, snow = false) {
  cone(parent, color, [x, 0.35 + height / 2, z], [radius, height, radius]);
  if (snow)
    cone(
      parent,
      0xfff7e5,
      [x, 0.35 + height * 0.865, z],
      [radius * 0.3, height * 0.3, radius * 0.3],
    );
}
function palm(parent, x, z, size = 1) {
  const root = group(parent, x, 0.3, z);
  root.scale.setScalar(size);
  beam(root, [0, 0, 0], [0.25, 1.6, 0], 0.12, colors.trunk);
  beam(root, [0.25, 1.6, 0], [0.05, 3.4, 0.1], 0.11, colors.trunk);
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const leaf = ball(
      root,
      0x8da96f,
      [Math.sin(angle) * 0.85, 3.48, Math.cos(angle) * 0.85],
      [0.28, 0.15, 1.25],
    );
    leaf.rotation.y = angle;
    leaf.rotation.x = 0.15;
  }
  ball(root, 0xb7996c, [0.04, 3.25, 0.1], [0.3, 0.25, 0.27]);
}
const mechanisms = [];
function model(parent, id) {
  switch (id) {
    case "home":
      cottage(parent);
      break;
    case "taiwan":
      mountain(parent, -2, -1.5, 2.4, 4.3, 0x7da38a);
      mountain(parent, 0.5, -2, 2.1, 3.5, 0x99b28a);
      for (let i = 0; i < 6; i++)
        box(
          parent,
          i % 2 ? 0x9bbeb1 : 0x83aa9a,
          [1.6, 0.7 + i * 0.58, -0.4],
          [1.03 - i * 0.04, 0.5, 1.03 - i * 0.04],
        );
      cylinder(parent, 0x859d8b, [1.6, 4.4, -0.4], [0.06, 1.1, 0.06]);
      tree(parent, -3, 1.6, 0.75);
      shrub(parent, 3, 1.5);
      break;
    case "japan":
      mountain(parent, -1.1, -1.4, 2.9, 4.8, 0xa7c0c0, true);
      for (const x of [-1.2, 1.2])
        cylinder(parent, 0xba7464, [x, 1.6, 1.2], [0.12, 2.5, 0.12]);
      box(parent, 0xb66f5f, [0, 2.7, 1.2], [3.1, 0.19, 0.22]);
      box(parent, 0xcd8a75, [0, 3, 1.2], [3.5, 0.18, 0.28]);
      box(parent, 0xb66f5f, [0, 2.25, 1.2], [2.8, 0.12, 0.14]);
      tree(parent, 3.1, 0.2, 1.12, true);
      tree(parent, -3.1, 1.9, 0.7, true);
      break;
    case "philippines": {
      palm(parent, -2.8, -1, 1.15);
      palm(parent, 2.8, -1, 0.95);
      const shade = cone(parent, 0xe5aa91, [0.9, 2.4, 0.2], [1.3, 0.65, 1.3]);
      shade.rotation.y = 0.4;
      cylinder(parent, colors.trunk, [0.9, 1.2, 0.2], [0.045, 2.1, 0.045]);
      const towel = box(parent, 0xfff2d6, [-0.6, 0.4, 1.6], [1, 0.045, 1.9]);
      towel.rotation.y = -0.4;
      box(parent, 0xd3a48a, [-0.6, 0.43, 1.5], [1, 0.03, 0.16]);
      bench(parent, 2.3, 1.7, 0.2);
      break;
    }
    case "hongkong": {
      const heights = [2.2, 3.8, 2.8, 4.9, 3.2, 2];
      heights.forEach((height, i) => {
        const x = -3 + i * 1.15;
        box(
          parent,
          [0x98b3b2, 0xbbc6b5, 0xa5bfb6][i % 3],
          [x, 0.35 + height / 2, -1],
          [0.87, height, 1.1],
        );
        for (let y = 1; y < height; y += 0.75)
          box(parent, 0xe2e8d0, [x, y, -0.43], [0.6, 0.1, 0.025]);
      });
      beam(parent, [0.45, 5.2, -1], [0.45, 5.9, -1], 0.035, 0x89a5a0);
      shrub(parent, -3.5, 2);
      bench(parent, 2, 1.6);
      break;
    }
    case "belgium": {
      [-2.3, 0, 2.3].forEach((x, i) => {
        const h = i === 1 ? 3.4 : 2.5;
        box(
          parent,
          [0xcfa68b, 0xf0dfb6, 0xd7b5a3][i],
          [x, 0.35 + h / 2, -0.6],
          [1.8, h, 1.8],
        );
        for (let j = 0; j < 3; j++)
          box(
            parent,
            0xcda48b,
            [x, 0.35 + h + j * 0.23, -0.6],
            [1.8 - j * 0.47, 0.24, 1.85],
          );
        for (const dx of [-0.43, 0.43])
          for (const y of [1.25, 2.2])
            box(parent, 0xa2bdb5, [x + dx, y, 0.32], [0.4, 0.55, 0.08]);
        box(parent, 0x8a9b7f, [x, 0.83, 0.32], [0.4, 0.95, 0.08]);
      });
      flower(parent, -3.3, 1.7);
      flower(parent, 3.2, 1.7, 0xe7c986);
      break;
    }
    case "netherlands": {
      cylinder(parent, 0xead9b7, [0, 1.7, -0.7], [1.15, 2.7, 1.15]);
      cone(parent, 0x8f8271, [0, 3.65, -0.7], [1.4, 1.2, 1.4]);
      box(parent, 0x7a9987, [0, 1.0, 0.48], [0.6, 1.4, 0.07]);
      const rotor = group(parent, 0, 3.1, 0.6);
      rotor.userData.dynamic = true;
      for (let i = 0; i < 4; i++) {
        const arm = group(rotor);
        arm.rotation.z = (i * Math.PI) / 2;
        box(arm, 0x9d9378, [0, 1.3, 0], [0.13, 2.6, 0.13]);
        box(arm, 0xf5ecd3, [0.27, 1.5, 0], [0.48, 1.85, 0.08]);
        for (let j = 0; j < 5; j++)
          box(arm, 0xa99e80, [0.27, 0.65 + j * 0.4, 0.06], [0.5, 0.055, 0.04]);
      }
      ball(rotor, 0xa0896b, [0, 0, 0.1], [0.22, 0.22, 0.15]);
      bake(rotor);
      mechanisms.push({ object: rotor, kind: "windmill" });
      for (let i = 0; i < 16; i++)
        flower(
          parent,
          -3 + (i % 8) * 0.8,
          1.6 + Math.floor(i / 8) * 0.65,
          i % 3 === 0 ? 0xe4b66d : colors.pink,
        );
      break;
    }
    case "france": {
      const feet = [
        [-1.6, 1.3],
        [1.6, 1.3],
        [-1.6, -1.3],
        [1.6, -1.3],
      ];
      for (const [x, z] of feet) {
        beam(parent, [x, 0.35, z], [x * 0.28, 3.5, z * 0.28], 0.12, 0x8f9d8b);
        beam(parent, [x * 0.28, 3.5, z * 0.28], [0, 6.1, 0], 0.075, 0x8f9d8b);
      }
      for (const y of [1.3, 2.5, 3.5]) {
        const w = ((6.1 - y) / 5.75) * 2.5;
        box(parent, 0x9aa58e, [0, y, 0], [w, 0.1, w * 0.85]);
      }
      beam(parent, [0, 6.1, 0], [0, 6.8, 0], 0.035, 0x8f9d8b);
      tree(parent, -3.2, -0.2, 0.9);
      tree(parent, 3, -1, 0.8);
      bench(parent, 2.2, 2.1, -0.3);
      break;
    }
    case "marriage": {
      for (const x of [-1.7, 1.7])
        cylinder(parent, 0xf7e8c8, [x, 1.55, -0.4], [0.13, 2.4, 0.13]);
      const arch = mesh(
        parent,
        new THREE.TorusGeometry(1.7, 0.13, 8, 24, Math.PI),
        0xf7e8c8,
        [0, 2.75, -0.4],
      );
      for (let i = 0; i < 9; i++) {
        const t = (i * Math.PI) / 8;
        ball(
          parent,
          i % 2 ? 0xeff0d1 : colors.pink,
          [Math.cos(t) * 1.7, 2.75 + Math.sin(t) * 1.7, -0.4],
          [0.26, 0.26, 0.22],
        );
      }
      box(parent, 0xf6edcf, [0, 0.38, 1.8], [1.65, 0.05, 3.6]);
      for (const x of [-0.47, 0.47]) {
        const ring = mesh(
          parent,
          new THREE.TorusGeometry(0.74, 0.095, 8, 24),
          0xd8b877,
          [x, 1.5, 0.6],
        );
        ring.rotation.y = x * 0.4;
      }
      tree(parent, -3.4, 0, 0.9, true);
      tree(parent, 3.3, 0, 0.9, true);
      break;
    }
    case "cats": {
      tree(parent, -3, -1.5, 0.9);
      cylinder(parent, 0xc6b58e, [0.4, 1.25, -1], [0.16, 1.8, 0.16]);
      cylinder(parent, 0xc6b58e, [1.8, 0.9, -0.8], [0.13, 1.1, 0.13]);
      box(parent, 0xe2ceaa, [0.4, 2.2, -1], [1.4, 0.16, 1.2]);
      box(parent, 0xe2ceaa, [1.7, 1.45, -0.8], [1.2, 0.16, 1]);
      ball(parent, 0xeee1c5, [0.4, 2.35, -1], [0.6, 0.2, 0.5]);
      mesh(
        parent,
        new THREE.TorusGeometry(0.65, 0.16, 8, 16),
        0xd1ad90,
        [-2, 0.65, 2],
      ).rotation.x = Math.PI / 2;
      ball(parent, 0xd8a999, [2.9, 0.52, 1.3], [0.23, 0.23, 0.23]);
      shrub(parent, 3.2, -0.5);
      break;
    }
    case "baby": {
      const planet = group(parent, 0, 3, -0.6);
      planet.userData.dynamic = true;
      ball(planet, colors.lavender, [0, 0, 0], [2, 2, 2]);
      ball(planet, 0xdcd0e5, [0.7, 0.8, 1.35], [0.4, 0.35, 0.13]);
      const ring = mesh(
        planet,
        new THREE.TorusGeometry(2.65, 0.13, 8, 48),
        0xead6be,
        [0, 0, 0],
      );
      ring.rotation.x = 1.1;
      ring.rotation.y = 0.35;
      bake(planet);
      mechanisms.push({ object: planet, kind: "planet", y: 3 });
      const crib = group(parent, 0, 0.5, 2.05);
      box(crib, 0xf8eed8, [0, 0.6, 0], [1.8, 0.3, 1.05]);
      for (const x of [-0.9, 0.9])
        box(crib, 0xe5d5b8, [x, 0.9, 0], [0.1, 1.2, 1.15]);
      for (let i = 0; i < 6; i++)
        for (const z of [-0.5, 0.5])
          box(crib, 0xe5d5b8, [-0.78 + i * 0.31, 1.0, z], [0.06, 0.8, 0.06]);
      ball(crib, colors.skin, [-0.45, 0.94, 0], [0.23, 0.23, 0.23]);
      box(crib, 0xdfc8d7, [0.25, 0.95, 0], [1, 0.22, 0.8]);
      for (const [x, y, z] of [
        [-3, 4, 0],
        [2.8, 5, -1],
        [3, 2.4, 1],
      ]) {
        const star = mesh(
          parent,
          new THREE.OctahedronGeometry(0.35),
          0xf0d49b,
          [x, y, z],
        );
        star.rotation.z = 0.4;
      }
      break;
    }
  }
}

const actors = [];
function person(parent, look, phase, radius = 3.6) {
  const root = group(parent);
  root.userData.dynamic = true;
  const body = group(root);
  const shirt = look === 0 ? 0x789b91 : 0xd99e8b;
  cylinder(body, shirt, [0, 0.74, 0], [0.24, 0.55, 0.18]);
  if (look === 1) cone(body, shirt, [0, 0.46, 0], [0.31, 0.4, 0.25]);
  ball(body, colors.skin, [0, 1.25, 0], [0.25, 0.28, 0.24]);
  ball(body, colors.hair, [0, 1.42, -0.03], [0.26, 0.16, 0.25]);
  if (look === 1) ball(body, colors.hair, [0, 1.23, -0.16], [0.26, 0.29, 0.12]);
  for (const x of [-0.09, 0.09])
    ball(body, 0x514e45, [x, 1.28, 0.228], [0.026, 0.032, 0.02]);
  bake(body);
  const limbs = [];
  for (const side of [-1, 1]) {
    const arm = group(root, side * 0.29, 0.96, 0);
    cylinder(arm, shirt, [0, -0.22, 0], [0.08, 0.43, 0.085]);
    ball(arm, colors.skin, [0, -0.46, 0], [0.08, 0.095, 0.08]);
    bake(arm);
    limbs.push(arm);
  }
  for (const side of [-1, 1]) {
    const leg = group(root, side * 0.115, 0.49, 0);
    cylinder(leg, 0x7b8271, [0, -0.2, 0], [0.085, 0.39, 0.09]);
    box(leg, 0xded3b6, [0, -0.41, 0.05], [0.17, 0.12, 0.28]);
    bake(leg);
    limbs.push(leg);
  }
  root.scale.setScalar(1.02);
  actors.push({
    root,
    limbs,
    phase,
    radius,
    speed: 0.2,
    kind: "person",
    island: parent.userData.id,
  });
}
function cat(parent, look, phase) {
  const root = group(parent);
  root.userData.dynamic = true;
  const color = look === 0 ? 0xf4ead4 : 0xf4dfbd,
    patch = look === 0 ? 0x798c84 : 0xc79f80;
  const body = group(root);
  ball(body, color, [0, 0.38, 0], [0.27, 0.29, 0.47]);
  ball(body, color, [0, 0.7, 0.36], [0.3, 0.28, 0.26]);
  cone(body, patch, [-0.18, 0.97, 0.36], [0.13, 0.3, 0.13]);
  cone(body, color, [0.18, 0.97, 0.36], [0.13, 0.3, 0.13]);
  ball(body, patch, [-0.12, 0.79, 0.4], [0.17, 0.19, 0.22]);
  for (const x of [-0.12, 0.12])
    ball(body, 0x4e665b, [x, 0.74, 0.597], [0.035, 0.045, 0.025]);
  ball(body, 0xd4a38e, [0, 0.64, 0.61], [0.04, 0.03, 0.02]);
  bake(body);
  const legs = [];
  for (const x of [-0.16, 0.16])
    for (const z of [-0.25, 0.25]) {
      const leg = group(root, x, 0.35, z);
      cylinder(leg, color, [0, -0.15, 0], [0.07, 0.3, 0.07]);
      bake(leg);
      legs.push(leg);
    }
  const tail = group(root, 0, 0.5, -0.35);
  beam(tail, [0, 0, 0], [0.2, 0.65, -0.25], 0.065, patch);
  bake(tail);
  legs.push(tail);
  root.scale.setScalar(1.25);
  actors.push({
    root,
    limbs: legs,
    phase,
    radius: 2.8,
    speed: 0.24,
    kind: "cat",
    island: "cats",
  });
}
function landscape(island, index) {
  const root = new THREE.Group();
  root.userData.id = island.id;
  const radius = island.id === "home" ? 5.6 : 4.5;
  const shape = new THREE.Shape();
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const r = radius * (1 + 0.055 * Math.sin(i * 2.31 + index));
    const x = Math.cos(angle) * r,
      z = Math.sin(angle) * r * 0.85;
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  }
  shape.closePath();
  const sandGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.7,
    bevelEnabled: true,
    bevelSize: 0.35,
    bevelThickness: 0.16,
    bevelSegments: 2,
    steps: 1,
  });
  sandGeometry.rotateX(-Math.PI / 2);
  const sand = mesh(
    root,
    sandGeometry,
    colors.sand,
    [0, -1.25, 0],
    [1.1, 1, 1.1],
  );
  const grassGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.95,
    bevelEnabled: true,
    bevelSize: 0.16,
    bevelThickness: 0.12,
    bevelSegments: 1,
    steps: 1,
  });
  grassGeometry.rotateX(-Math.PI / 2);
  mesh(
    root,
    grassGeometry,
    island.id === "baby" ? 0xc8c6c0 : colors.grass,
    [0, -0.7, 0],
  );
  if (island.id !== "baby" && island.id !== "cats") {
    const path = new THREE.RingGeometry(0.94, 1.03, 48);
    path.rotateX(-Math.PI / 2);
    mesh(
      root,
      path,
      0xe3d7b4,
      [0, 0.39, island.id === "home" ? 2.4 : 2.05],
      [radius * 0.76, 1, radius * 0.76 * 0.2],
    );
  }
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.4 + index;
    const r = radius * 0.82;
    const rock = ball(
      root,
      i % 2 ? 0xbcbd9a : 0xd5cba6,
      [Math.cos(angle) * r, 0.34, Math.sin(angle) * r * 0.85],
      [0.3 + (i % 2) * 0.2, 0.22, 0.3],
    );
    rock.rotation.y = angle;
  }
  model(root, island.id);
  bake(root);
  if (island.id === "cats") {
    cat(root, 0, 0);
    cat(root, 1, Math.PI);
  } else if (island.id !== "baby") {
    person(root, 0, 0, radius * 0.76);
    person(root, 1, 0.48, radius * 0.76);
  }
  return root;
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
} catch (error) {
  status.textContent = "這個瀏覽器無法啟用 3D，先以插畫地圖探索回憶。";
  console.info("3D view unavailable; accessible illustrated map retained.");
}
if (renderer) {
  try {
    startScene();
  } catch (error) {
    renderer.dispose();
    window.memory3DActive = false;
    section.classList.remove("is-3d");
    $("#island-map").removeAttribute("aria-hidden");
    $("#map-world").inert = false;
    stage.querySelector(".island-labels")?.remove();
    stage.querySelector("canvas")?.remove();
    status.hidden = false;
    status.textContent = "3D 載入遇到問題，先以插畫地圖探索回憶。";
    console.error(error);
  }
}
function startScene() {
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5),
  );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.id = "island-canvas";
  renderer.domElement.setAttribute(
    "aria-label",
    "可旋轉的 3D 島嶼，小人物與哞哞花花在島上散步",
  );
  renderer.domElement.setAttribute("role", "img");
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd7e9e5, 90, 180);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 260);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minDistance = 20;
  controls.maxDistance = 125;
  controls.minPolarAngle = 0.32;
  controls.maxPolarAngle = Math.PI / 2.65;
  controls.autoRotateSpeed = 0.45;
  controls.screenSpacePanning = true;
  controls.enablePan = true;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  scene.add(new THREE.HemisphereLight(0xfff7e4, 0x8faeaa, 2.4));
  const sun = new THREE.DirectionalLight(0xffedcd, 3.2);
  sun.position.set(-24, 46, 22);
  sun.castShadow = true;
  const shadowSize = 1024;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, {
    left: -48,
    right: 48,
    top: 45,
    bottom: -45,
    near: 1,
    far: 120,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd6edf1, 0.8);
  fill.position.set(25, 15, -25);
  scene.add(fill);

  const seaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      base: { value: new THREE.Color(0x9bd1cd) },
      foam: { value: new THREE.Color(0xe6f0df) },
    },
    vertexShader: `varying vec3 world; void main(){vec4 p=modelMatrix*vec4(position,1.);world=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
    fragmentShader: `uniform float time;uniform vec3 base;uniform vec3 foam;varying vec3 world;void main(){vec2 p=world.xz;float ripple=sin(p.x*1.6+p.y*.8+time*.35)*sin(p.y*2.4-time*.24);float line=smoothstep(.94,.99,ripple);float broad=sin(p.x*.07+p.y*.08)*.025;vec3 color=mix(base,foam,line*.18)+broad;gl_FragColor=vec4(color,1.);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>}`,
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), seaMaterial);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.7;
  scene.add(sea);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(130, 130),
    new THREE.ShadowMaterial({ opacity: 0.12 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.68;
  shadow.receiveShadow = true;
  scene.add(shadow);

  const labelLayer = document.createElement("div");
  labelLayer.className = "island-labels";
  labelLayer.setAttribute("aria-label", "3D 島嶼目錄");
  stage.append(labelLayer);
  const islands = new Map(),
    pickables = [];
  const right = V(0.846, 0, -0.533),
    front = V(0.533, 0, 0.846);
  api.islands.forEach((island, index) => {
    const root = landscape(island, index);
    const sx = (island.x - 775) / 18.5,
      sz = (island.y - 475) / 15.5;
    root.position.copy(
      right.clone().multiplyScalar(sx).addScaledVector(front, sz),
    );
    root.rotation.y = -0.25 + (index % 3) * 0.18;
    if (island.id === "home") root.scale.setScalar(1.08);
    scene.add(root);
    const label = document.createElement("button");
    label.className = `island island-3d-label ${island.id === "home" ? "label-home" : ""}`;
    label.dataset.id = island.id;
    const name = document.createElement("strong"),
      subtitle = document.createElement("small");
    label.append(name, subtitle);
    labelLayer.append(label);
    label.addEventListener("click", () => api.openIsland(island.id));
    label.addEventListener("focus", () => {
      if (label.dataset.offscreen === "true") focusIsland(island.id);
    });
    islands.set(island.id, {
      data: island,
      root,
      label,
      name,
      subtitle,
      phase: index * 0.8,
    });
    root.traverse((object) => {
      if (object.isMesh) {
        object.userData.islandId = island.id;
        pickables.push(object);
      }
    });
    for (let ring = 0; ring < 2; ring++) {
      const points = [];
      for (let n = 0; n < 65; n++) {
        const a = (n / 64) * Math.PI * 2;
        const r = (island.id === "home" ? 7 : 5.9) + ring * 0.8;
        points.push(V(Math.cos(a) * r, -1.61, Math.sin(a) * r * 0.84));
      }
      const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0x9dbfb1,
          transparent: true,
          opacity: 0.24 - ring * 0.08,
        }),
      );
      line.position.copy(root.position);
      scene.add(line);
    }
  });
  function updateNames() {
    for (const item of islands.values()) {
      item.name.textContent = api.getName(item.data);
      item.subtitle.textContent =
        item.data.id === "cats"
          ? "哞哞 ＆ 花花"
          : item.data.id === "baby"
            ? "2027 · 期待抵達"
            : item.data.en;
      item.label.setAttribute("aria-label", `探索${api.getName(item.data)}`);
    }
  }
  updateNames();
  document.addEventListener("memory-data-change", updateNames);
  function applyFilter(filter) {
    renderer.shadowMap.needsUpdate = true;
    for (const item of islands.values()) {
      const dim = filter !== "all" && item.data.type !== filter;
      item.label.classList.toggle("dimmed", dim);
      item.root.traverse((object) => {
        if (!object.isMesh) return;
        if (!object.userData.filterMaterial) {
          object.material = object.material.clone();
          object.userData.filterMaterial = true;
        }
        object.material.transparent = dim;
        object.material.opacity = dim ? 0.23 : 1;
        object.material.depthWrite = !dim;
        object.castShadow = !dim;
      });
    }
  }
  document.addEventListener("memory-filter-change", (event) =>
    applyFilter(event.detail),
  );
  applyFilter(api.getFilter());
  function routes() {
    const links = [
      ["home", "cats"],
      ["cats", "france"],
      ["home", "belgium"],
      ["belgium", "netherlands"],
      ["home", "baby"],
      ["home", "taiwan"],
      ["taiwan", "japan"],
      ["taiwan", "philippines"],
      ["philippines", "hongkong"],
      ["hongkong", "marriage"],
      ["home", "marriage"],
    ];
    for (const [from, to] of links) {
      const a = islands.get(from).root.position.clone(),
        b = islands.get(to).root.position.clone();
      a.y = -1.58;
      b.y = -1.58;
      const midpoint = a
        .clone()
        .lerp(b, 0.5)
        .add(V(-1.2, 0, 1.2));
      const curve = new THREE.QuadraticBezierCurve3(a, midpoint, b);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
        new THREE.LineDashedMaterial({
          color: 0x8eac97,
          dashSize: 0.2,
          gapSize: 0.38,
          transparent: true,
          opacity: 0.42,
        }),
      );
      line.computeLineDistances();
      scene.add(line);
    }
  }
  routes();
  // A tiny sailboat circles the archipelago; all scenery stays inside this page.
  const boat = group(scene);
  boat.userData.dynamic = true;
  const hull = box(boat, 0xc89e7b, [0, 0.12, 0], [0.8, 0.3, 1.8]);
  hull.rotation.z = 0.08;
  cylinder(boat, 0xb5a27d, [0, 1.1, 0], [0.035, 2, 0.035]);
  const sailGeometry = new THREE.BufferGeometry().setFromPoints([
    V(0, 2, 0),
    V(0, 0.45, 0.85),
    V(0, 0.45, 0),
  ]);
  sailGeometry.setIndex([0, 1, 2]);
  sailGeometry.computeVertexNormals();
  const sail = new THREE.Mesh(
    sailGeometry,
    new THREE.MeshStandardMaterial({ color: 0xfff4d9, side: THREE.DoubleSide }),
  );
  boat.add(sail);
  bake(boat);
  for (let n = 0; n < 4; n++) {
    const cloud = group(
      scene,
      -29 + n * 19,
      9 + (n % 2) * 2,
      -24 - (n % 2) * 8,
    );
    ball(cloud, 0xfffaed, [0, 0, 0], [2.3, 0.65, 0.95]);
    ball(cloud, 0xfffaed, [-0.7, 0.5, 0], [1.1, 0.85, 0.9]);
    ball(cloud, 0xfffaed, [0.8, 0.25, 0], [1, 0.65, 0.8]);
    bake(cloud);
  }

  function settleControls() {
    const damping = controls.enableDamping;
    const orbit = controls.autoRotate;
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.update();
    controls.enableDamping = damping;
    controls.autoRotate = orbit;
  }
  function resetCamera() {
    settleControls();
    const mobile = stage.clientWidth < 700;
    controls.target.copy(
      mobile
        ? V(0, 0, 1)
        : right.clone().multiplyScalar(-5).addScaledVector(front, 1.6),
    );
    camera.position
      .copy(controls.target)
      .add(mobile ? V(29, 40, 48) : V(30.8, 39.6, 49.28));
    if (mobile) camera.position.addScaledVector(front, -5);
    camera.lookAt(controls.target);
    controls.update();
  }
  function resize() {
    const width = stage.clientWidth,
      height = stage.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  resetCamera();
  new ResizeObserver(resize).observe(stage);
  function dolly(factor) {
    camera.position
      .sub(controls.target)
      .multiplyScalar(factor)
      .add(controls.target);
    controls.update();
  }
  $("#zoom-in").addEventListener("click", () => dolly(0.82));
  $("#zoom-out").addEventListener("click", () => dolly(1.22));
  document.addEventListener("memory-map-reset", () => {
    controls.autoRotate = false;
    $("#toggle-orbit").setAttribute("aria-pressed", "false");
    resetCamera();
  });
  function focusIsland(id) {
    const item = islands.get(id);
    if (!item) return;
    settleControls();
    controls.autoRotate = false;
    $("#toggle-orbit").setAttribute("aria-pressed", "false");
    controls.target.copy(item.root.position);
    camera.position.copy(item.root.position).add(V(12, 15, 21));
    controls.update();
  }

  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  let press = null,
    pointerCount = 0;
  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerCount++;
    if (pointerCount > 1) {
      if (press) press.moved = true;
      return;
    }
    press = { x: event.clientX, y: event.clientY, moved: false };
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (
      press &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6
    )
      press.moved = true;
    if (press) return;
    setRay(event);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    renderer.domElement.style.cursor = hit ? "pointer" : "grab";
  });
  function setRay(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
  }
  renderer.domElement.addEventListener("pointerup", (event) => {
    pointerCount = Math.max(0, pointerCount - 1);
    const click = press && !press.moved && pointerCount === 0;
    press = null;
    if (!click) return;
    setRay(event);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    if (hit) focusIsland(hit.object.userData.islandId);
  });
  renderer.domElement.addEventListener("pointercancel", () => {
    pointerCount = 0;
    press = null;
  });
  window.addEventListener("blur", () => {
    pointerCount = 0;
    press = null;
  });

  let living = !reducedMotion.matches,
    lifeTime = 0,
    last = performance.now(),
    frameCount = 0,
    visible = true;
  const toggle = $("#toggle-life");
  function updateLifeButton() {
    toggle.setAttribute("aria-pressed", String(living));
    toggle.querySelector("span").textContent = living
      ? "島民散步中"
      : "島民休息中";
    toggle.classList.toggle("paused", !living);
  }
  toggle.addEventListener("click", () => {
    living = !living;
    updateLifeButton();
  });
  updateLifeButton();
  $("#toggle-orbit").addEventListener("click", (event) => {
    controls.autoRotate = !controls.autoRotate;
    event.currentTarget.setAttribute(
      "aria-pressed",
      String(controls.autoRotate),
    );
  });
  reducedMotion.addEventListener("change", (event) => {
    living = !event.matches;
    if (event.matches) controls.autoRotate = false;
    updateLifeButton();
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(stage);
  const projected = V();
  function positionLabels() {
    for (const item of islands.values()) {
      const facing = camera.position.clone().sub(controls.target);
      facing.y = 0;
      facing.normalize();
      projected
        .copy(item.root.position)
        .addScaledVector(facing, item.data.id === "home" ? 7.2 : 5.6)
        .add(V(0, -0.7, 0));
      projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * stage.clientWidth,
        y = (-projected.y * 0.5 + 0.5) * stage.clientHeight;
      const offscreen =
        projected.z > 1 ||
        x < -70 ||
        x > stage.clientWidth + 70 ||
        y < -20 ||
        y > stage.clientHeight + 30;
      item.label.dataset.offscreen = String(offscreen);
      item.label.style.visibility = offscreen ? "hidden" : "visible";
      item.label.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
    }
  }
  function animate(now) {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.1));
    last = now;
    if (document.hidden || !visible || document.querySelector("dialog[open]"))
      return;
    if (living) lifeTime += dt;
    for (const actor of actors) {
      const t = lifeTime * actor.speed + actor.phase;
      const depth = actor.kind === "person" ? 0.2 : 0.72;
      const center =
        actor.kind === "person" ? (actor.island === "home" ? 2.4 : 2.05) : 0;
      actor.root.position.set(
        Math.cos(t) * actor.radius,
        0.4,
        center + Math.sin(t) * actor.radius * depth,
      );
      actor.root.rotation.y = Math.atan2(-Math.sin(t), Math.cos(t) * depth);
      actor.root.position.y +=
        Math.abs(Math.sin(lifeTime * 5 + actor.phase)) * 0.035;
      actor.limbs.forEach((limb, i) => {
        limb.rotation.x =
          Math.sin(lifeTime * 5 + actor.phase + (i % 2) * Math.PI) * 0.36;
      });
    }
    for (const mechanism of mechanisms) {
      if (mechanism.kind === "windmill")
        mechanism.object.rotation.z = -lifeTime * 0.35;
      else
        mechanism.object.position.y =
          mechanism.y + Math.sin(lifeTime * 0.7) * 0.16;
    }
    boat.position.set(
      Math.cos(lifeTime * 0.035) * 32,
      -1.15,
      Math.sin(lifeTime * 0.035) * 23,
    );
    boat.rotation.y = -lifeTime * 0.035;
    seaMaterial.uniforms.time.value = lifeTime;
    controls.update(dt);
    positionLabels();
    // Refresh the moving shadows at a lower rate; camera input stays responsive.
    if (living && frameCount % 4 === 0) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    frameCount++;
  }
  window.memory3DActive = true;
  section.classList.add("is-3d");
  $("#map-world").inert = true;
  $("#island-map").setAttribute("aria-hidden", "true");
  status.hidden = true;
  $("#scene-actions").hidden = false;
  renderer.setAnimationLoop(animate);
  // Read-only inspection is useful for functional browser checks of geometry and movement.
  window.memory3D = {
    getState: () => ({
      ready: true,
      frames: frameCount,
      living,
      actors: actors.length,
      camera: camera.position.toArray(),
      target: controls.target.toArray(),
      positions: actors.map((actor) => actor.root.position.toArray()),
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      islandCenters: [...islands.values()].map((item) => {
        const p = item.root.position.clone().project(camera);
        return {
          id: item.data.id,
          x: (p.x * 0.5 + 0.5) * stage.clientWidth,
          y: (-p.y * 0.5 + 0.5) * stage.clientHeight,
        };
      }),
    }),
    focusIsland,
  };
  document.dispatchEvent(new Event("memory-3d-ready"));
}
