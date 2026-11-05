import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { PARTS, TRASH, type PartId } from "@/content/parts";
import { EXPECTED_NODE_COUNT, MODEL_BYTES, MODEL_URL } from "./config";

export interface MaterialRecord {
  material: THREE.MeshStandardMaterial;
  emissive: THREE.Color;
  emissiveIntensity: number;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}

export interface PartRuntime {
  id: PartId;
  pivot: THREE.Group;
  /** Исходная позиция pivot (центр мирового Box3 группы). */
  base: THREE.Vector3;
  offset: THREE.Vector3;
  meshes: THREE.Mesh[];
  materials: MaterialRecord[];
  // Текущие сглаженные значения анимации.
  t: number;
  opacity: number;
  highlight: number;
  appliedOpacity: number;
  appliedHighlight: number;
  raycastOn: boolean;
}

export interface TrashItem {
  pivot: THREE.Group;
  base: THREE.Vector3;
  materials: MaterialRecord[];
}

export interface PreparedShip {
  root: THREE.Group;
  parts: Map<PartId, PartRuntime>;
  conveyorTrash: TrashItem[];
  basketTrash: TrashItem[];
  trashRoot: THREE.Group;
  propellers: { pivot: THREE.Group; dir: 1 | -1 }[];
  beacon: MaterialRecord | null;
  woundLine: THREE.Object3D | null;
  missing: string[];
  found: number;
}

const sanitize = THREE.PropertyBinding.sanitizeNodeName;

/** Загружает GLB с реальным прогрессом по байтам. */
export function loadShipGLTF(onProgress: (p: number) => void) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      MODEL_URL,
      (gltf) => resolve(gltf.scene),
      (e) => {
        const total = e.lengthComputable && e.total > 0 ? e.total : MODEL_BYTES;
        onProgress(Math.min(0.99, e.loaded / total));
      },
      reject,
    );
  });
}

function cloneMaterials(object: THREE.Object3D, cache: Map<THREE.Material, MaterialRecord>) {
  const records: MaterialRecord[] = [];
  object.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const swap = (m: THREE.Material) => {
      let rec = cache.get(m);
      if (!rec) {
        const material = m.clone() as THREE.MeshStandardMaterial;
        rec = {
          material,
          emissive: material.emissive.clone(),
          emissiveIntensity: material.emissiveIntensity,
          opacity: material.opacity,
          transparent: material.transparent,
          depthWrite: material.depthWrite,
        };
        cache.set(m, rec);
        records.push(rec);
      }
      return rec.material;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
  });
  return records;
}

function collectMeshes(object: THREE.Object3D) {
  const meshes: THREE.Mesh[] = [];
  object.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  return meshes;
}

/** Создаёт Group в центре мирового Box3 узлов и переносит узлы в неё через attach(). */
function makePivot(root: THREE.Group, nodes: THREE.Object3D[], name: string, parent: THREE.Object3D = root) {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const n of nodes) box.union(tmp.setFromObject(n));
  const center = box.getCenter(new THREE.Vector3());
  const pivot = new THREE.Group();
  pivot.name = name;
  parent.add(pivot);
  parent.updateMatrixWorld(true);
  pivot.position.copy(parent.worldToLocal(center.clone()));
  pivot.updateMatrixWorld(true);
  for (const n of nodes) pivot.attach(n);
  return pivot;
}

/**
 * Propeller blades и Propeller hubs содержат оба винта в одном меше.
 * Делим индексы по знаку мировой Z центра треугольника и возвращаем две половины.
 */
function splitBySide(mesh: THREE.Mesh): [THREE.Mesh, THREE.Mesh] | null {
  const geo = mesh.geometry;
  const pos = geo.getAttribute("position");
  if (!pos) return null;
  mesh.updateMatrixWorld(true);
  const index = geo.getIndex();
  const count = index ? index.count : pos.count;
  const neg: number[] = [];
  const posSide: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let i = 0; i < count; i += 3) {
    const ia = index ? index.getX(i) : i;
    const ib = index ? index.getX(i + 1) : i + 1;
    const ic = index ? index.getX(i + 2) : i + 2;
    a.fromBufferAttribute(pos, ia).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(pos, ib).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(pos, ic).applyMatrix4(mesh.matrixWorld);
    const z = (a.z + b.z + c.z) / 3;
    (z < 0 ? neg : posSide).push(ia, ib, ic);
  }
  if (!neg.length || !posSide.length) return null;
  const make = (indices: number[]) => {
    const g = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(geo.attributes)) g.setAttribute(name, attr);
    g.setIndex(indices);
    g.computeBoundingBox();
    g.computeBoundingSphere();
    return g;
  };
  const port = mesh;
  const starboard = new THREE.Mesh(make(posSide), mesh.material);
  port.geometry = make(neg);
  starboard.name = `${mesh.name}_starboard`;
  starboard.position.copy(mesh.position);
  starboard.quaternion.copy(mesh.quaternion);
  starboard.scale.copy(mesh.scale);
  mesh.parent?.add(starboard);
  return [port, starboard];
}

export function prepareShip(scene: THREE.Group): PreparedShip {
  const root = new THREE.Group();
  root.name = "CaspianGuard";
  root.add(scene);
  root.updateMatrixWorld(true);

  // Узлы glTF: у них GLTFLoader сохраняет исходное имя в userData.name.
  const byName = new Map<string, THREE.Object3D>();
  let nodeCount = 0;
  scene.traverse((o) => {
    if (o === scene || o.userData.name === undefined) return;
    nodeCount++;
    if (!byName.has(o.name)) byName.set(o.name, o);
  });
  const missing: string[] = [];
  const find = (name: string) => {
    const o = byName.get(sanitize(name));
    if (!o) missing.push(name);
    return o;
  };

  const parts = new Map<PartId, PartRuntime>();
  for (const part of PARTS) {
    const nodes = part.nodes.map(find).filter(Boolean) as THREE.Object3D[];
    if (!nodes.length) continue;
    const pivot = makePivot(root, nodes, `pivot_${part.id}`);
    pivot.userData.partId = part.id;
    const records = cloneMaterials(pivot, new Map());
    parts.set(part.id, {
      id: part.id,
      pivot,
      base: pivot.position.clone(),
      offset: new THREE.Vector3(...part.explodeOffset),
      meshes: [],
      materials: records,
      t: 0,
      opacity: 1,
      highlight: 0,
      appliedOpacity: 1,
      appliedHighlight: 0,
      raycastOn: true,
    });
  }

  // Винты: делим общие меши на левый и правый винт и вращаем каждый вокруг своей оси X.
  const propellers: PreparedShip["propellers"] = [];
  const thrusters = parts.get("thrusters");
  if (thrusters) {
    const halves: { port: THREE.Mesh[]; starboard: THREE.Mesh[] } = { port: [], starboard: [] };
    for (const name of ["Propeller hubs", "Propeller blades"]) {
      const obj = byName.get(sanitize(name));
      const meshes = obj ? collectMeshes(obj) : [];
      for (const m of meshes) {
        const pair = splitBySide(m);
        if (pair) {
          halves.port.push(pair[0]);
          halves.starboard.push(pair[1]);
        }
      }
    }
    for (const [side, meshes] of Object.entries(halves) as ["port" | "starboard", THREE.Mesh[]][]) {
      if (!meshes.length) continue;
      const pivot = makePivot(root, meshes, `propeller_${side}`, thrusters.pivot);
      propellers.push({ pivot, dir: side === "port" ? 1 : -1 });
    }
  }

  // Мусор: отдельные pivot для пар «бутылка + этикетка».
  const trashRoot = new THREE.Group();
  trashRoot.name = "trash";
  root.add(trashRoot);
  const trashCache = new Map<THREE.Material, MaterialRecord>();
  const makeTrash = (groups: readonly (readonly string[])[]) =>
    groups
      .map((names, i) => {
        const nodes = names.map(find).filter(Boolean) as THREE.Object3D[];
        if (!nodes.length) return null;
        const pivot = makePivot(root, nodes, `trash_${i}`, trashRoot);
        return { pivot, base: pivot.position.clone(), materials: cloneMaterials(pivot, trashCache) };
      })
      .filter(Boolean) as TrashItem[];
  const conveyorTrash = makeTrash(TRASH.conveyor);
  const basketTrash = makeTrash(TRASH.basket);

  // Мусор и солнечные панели не участвуют в выборе лучом.
  trashRoot.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.raycast = () => {};
  });

  for (const p of parts.values()) {
    p.meshes = collectMeshes(p.pivot);
    for (const m of p.meshes) m.userData.partId = p.id;
  }

  // Маяк пульсирует отдельно, поэтому у него собственный материал.
  let beacon: MaterialRecord | null = null;
  const beaconObj = byName.get(sanitize("Amber rotating beacon"));
  if (beaconObj) {
    const mesh = collectMeshes(beaconObj)[0];
    if (mesh) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      mesh.material = material;
      beacon = {
        material,
        emissive: material.emissive.clone(),
        emissiveIntensity: material.emissiveIntensity,
        opacity: material.opacity,
        transparent: material.transparent,
        depthWrite: material.depthWrite,
      };
      parts.get("navigation")?.materials.push(beacon);
    }
  }

  const woundLine = byName.get(sanitize("Wound rescue line")) ?? null;

  // Проверка: все ли 163 узла найдены и распределены.
  const assigned = PARTS.reduce((s, p) => s + p.nodes.length, 0) +
    [...TRASH.conveyor, ...TRASH.basket].reduce((s, g) => s + g.length, 0);
  const found = assigned - missing.length;
  if (missing.length) console.warn(`[CaspianGuard] Не найдены узлы (${missing.length}):`, missing);
  if (nodeCount !== EXPECTED_NODE_COUNT || found !== EXPECTED_NODE_COUNT) {
    console.warn(
      `[CaspianGuard] Узлов в модели: ${nodeCount}, распределено по группам: ${found}, ожидалось ${EXPECTED_NODE_COUNT}.`,
    );
  } else if (process.env.NODE_ENV !== "production") {
    console.info(`[CaspianGuard] Найдены все ${found} узлов модели.`);
  }

  return { root, parts, conveyorTrash, basketTrash, trashRoot, propellers, beacon, woundLine, missing, found };
}
