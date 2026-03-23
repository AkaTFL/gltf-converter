import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

interface GLTFModelProps {
  url: string;
}

export function GLTFModel({ url }: GLTFModelProps) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    return () => {
      useGLTF.preload(url);
    };
  }, [url]);

  return <primitive object={scene.clone()} />;
}
