import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { HitboxData, HitboxType } from "@/types/hitbox";

export async function generateHitboxes(
  fileUrl: string,
  type: HitboxType
): Promise<HitboxData[]> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      fileUrl,
      (gltf) => {
        const hitboxes: HitboxData[] = [];
        let meshIndex = 0;

        gltf.scene.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;

          const mesh = child as THREE.Mesh;
          const geo = mesh.geometry;
          geo.computeBoundingBox();
          geo.computeBoundingSphere();

          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);

          const worldScale = new THREE.Vector3();
          mesh.getWorldScale(worldScale);

          if (type === "box") {
            const box = geo.boundingBox!;
            const size = new THREE.Vector3();
            box.getSize(size);
            size.multiply(worldScale);

            const center = new THREE.Vector3();
            box.getCenter(center);
            center.multiply(worldScale).add(worldPos);

            hitboxes.push({
              type: "box",
              name: mesh.name || `mesh_${meshIndex}`,
              position: [center.x, center.y, center.z],
              size: [size.x, size.y, size.z],
            });
          } else if (type === "sphere") {
            const sphere = geo.boundingSphere!;
            const radius = sphere.radius * Math.max(worldScale.x, worldScale.y, worldScale.z);
            const center = sphere.center.clone().multiply(worldScale).add(worldPos);

            hitboxes.push({
              type: "sphere",
              name: mesh.name || `mesh_${meshIndex}`,
              position: [center.x, center.y, center.z],
              radius,
            });
          } else if (type === "trimesh") {
            const clonedGeo = geo.clone();
            clonedGeo.applyMatrix4(mesh.matrixWorld);

            const posAttr = clonedGeo.getAttribute("position");
            const index = clonedGeo.index;

            hitboxes.push({
              type: "trimesh",
              name: mesh.name || `mesh_${meshIndex}`,
              position: [0, 0, 0],
              geometry: clonedGeo,
              vertices: posAttr.count,
              triangles: index ? index.count / 3 : posAttr.count / 3,
            });
          }

          meshIndex++;
        });

        resolve(hitboxes);
      },
      undefined,
      reject
    );
  });
}

export function hitboxToRapierCode(hitboxes: HitboxData[]): string {
  const lines: string[] = [
    "import RAPIER from '@dimforge/rapier3d-compat';",
    "",
    "// Initialize Rapier",
    "await RAPIER.init();",
    "const gravity = { x: 0.0, y: -9.81, z: 0.0 };",
    "const world = new RAPIER.World(gravity);",
    "",
  ];

  hitboxes.forEach((hb, i) => {
    lines.push(`// Collider ${i}: ${hb.name} (${hb.type})`);

    if (hb.type === "box" && hb.size) {
      const [hx, hy, hz] = hb.size.map((s) => (s / 2).toFixed(4));
      lines.push(`const bodyDesc${i} = RAPIER.RigidBodyDesc.fixed()`);
      lines.push(`  .setTranslation(${hb.position.map((p) => p.toFixed(4)).join(", ")});`);
      lines.push(`const body${i} = world.createRigidBody(bodyDesc${i});`);
      lines.push(`const colliderDesc${i} = RAPIER.ColliderDesc.cuboid(${hx}, ${hy}, ${hz});`);
      lines.push(`world.createCollider(colliderDesc${i}, body${i});`);
    } else if (hb.type === "sphere" && hb.radius) {
      lines.push(`const bodyDesc${i} = RAPIER.RigidBodyDesc.fixed()`);
      lines.push(`  .setTranslation(${hb.position.map((p) => p.toFixed(4)).join(", ")});`);
      lines.push(`const body${i} = world.createRigidBody(bodyDesc${i});`);
      lines.push(`const colliderDesc${i} = RAPIER.ColliderDesc.ball(${hb.radius.toFixed(4)});`);
      lines.push(`world.createCollider(colliderDesc${i}, body${i});`);
    } else if (hb.type === "trimesh") {
      lines.push(`// Trimesh collider - requires vertex/index arrays from geometry`);
      lines.push(`// vertices: ${hb.vertices}, triangles: ${hb.triangles}`);
      lines.push(`// const colliderDesc${i} = RAPIER.ColliderDesc.trimesh(vertices, indices);`);
      lines.push(`// world.createCollider(colliderDesc${i});`);
    }

    lines.push("");
  });

  return lines.join("\n");
}
