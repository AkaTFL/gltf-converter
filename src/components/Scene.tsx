import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { GLTFModel } from "./GLTFModel";
import type { HitboxData } from "@/types/hitbox";

interface SceneProps {
  fileUrl: string | null;
  hitboxes: HitboxData[];
  showModel: boolean;
  showHitboxes: boolean;
}

export function Scene({ fileUrl, hitboxes, showModel, showHitboxes }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [3, 3, 3], fov: 50 }}
      className="rounded-lg"
      style={{ background: "hsl(220, 20%, 5%)" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#00ffcc" />

      <Suspense fallback={null}>
        {fileUrl && showModel && <GLTFModel url={fileUrl} />}
        {showHitboxes &&
          hitboxes.map((hb, i) => (
            <HitboxMesh key={i} hitbox={hb} />
          ))}
      </Suspense>

      <Grid
        infiniteGrid
        cellSize={0.5}
        sectionSize={2}
        cellColor="#1a2a3a"
        sectionColor="#0d3d5c"
        fadeDistance={20}
      />
      <OrbitControls makeDefault />
      <Environment preset="night" />
    </Canvas>
  );
}

function HitboxMesh({ hitbox }: { hitbox: HitboxData }) {
  const color = hitbox.type === "trimesh" ? "#00ffaa" : "#00ccff";

  if (hitbox.type === "box") {
    return (
      <mesh position={hitbox.position}>
        <boxGeometry args={hitbox.size} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
      </mesh>
    );
  }

  if (hitbox.type === "sphere") {
    return (
      <mesh position={hitbox.position}>
        <sphereGeometry args={[hitbox.radius, 16, 16]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
      </mesh>
    );
  }

  if (hitbox.type === "trimesh" && hitbox.geometry) {
    return (
      <mesh position={[0, 0, 0]} geometry={hitbox.geometry}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>
    );
  }

  return null;
}
