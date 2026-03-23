import type { BufferGeometry } from "three";

export type HitboxType = "box" | "sphere" | "trimesh";

export interface HitboxData {
  type: HitboxType;
  name: string;
  position: [number, number, number];
  size?: [number, number, number];
  radius?: number;
  geometry?: BufferGeometry;
  vertices?: number;
  triangles?: number;
}
