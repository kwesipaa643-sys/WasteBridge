"use client";
// React Three Fiber dumpster inventory: one box per bin, size sets scale, status sets color.
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";

const SCALE: Record<string, number> = { YD10: 0.8, YD20: 1, YD30: 1.2, YD40: 1.4 };
const COLOR: Record<string, string> = { AVAILABLE: "#10b981", DEPLOYED: "#f59e0b", MAINTENANCE: "#ef4444" };

export default function Dumpster3D({ items }: { items: { id: string; size: string; status: string }[] }) {
  const cols = 6;
  return (
    <Canvas camera={{ position: [8, 8, 10], fov: 40 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      {items.map((d, i) => {
        const s = SCALE[d.size] ?? 1;
        return (
          <mesh key={d.id} position={[(i % cols) * 2.2 - 5.5, 0.4 * s, Math.floor(i / cols) * 2.4 - 3]} scale={[1.6 * s, 0.8 * s, 1 * s]}>
            <boxGeometry />
            <meshStandardMaterial color={COLOR[d.status] ?? "#64748b"} />
          </mesh>
        );
      })}
      <ContactShadows position={[0, 0, 0]} opacity={0.4} blur={2} scale={20} />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
