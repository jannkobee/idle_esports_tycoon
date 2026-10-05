import { equipmentTierIndex, getEquipmentTier } from '../../../core/facilities/equipmentProgression';
import type { FacilityId } from '../../../core/types/facility.types';

function Display({ x = 0, y = 1.03, z = 0, width = 0.65, angle = 0, color }: { x?: number; y?: number; z?: number; width?: number; angle?: number; color: string }) {
  return <group position={[x, y, z]} rotation={[0, angle, 0]}>
    <mesh castShadow><boxGeometry args={[width, 0.36, 0.055]} /><meshStandardMaterial color="#0f172a" /></mesh>
    <mesh position={[0, 0, 0.029]}><planeGeometry args={[width - 0.04, 0.31]} /><meshBasicMaterial color="#082f49" /></mesh>
    {[-0.08, 0, 0.08].map((dy, i) => <mesh key={dy} position={[-width * 0.12, dy, 0.031]}><planeGeometry args={[width * (0.35 + i * 0.13), 0.02]} /><meshBasicMaterial color={color} /></mesh>)}
    <mesh position={[0, -0.26, -0.015]}><boxGeometry args={[0.035, 0.2, 0.04]} /><meshStandardMaterial color="#64748b" /></mesh>
  </group>;
}

/** All variants stay inside the same desk footprint and retain the same seat. */
export function EvolvingRig({ x, z, level, compact = false }: { x: number; z: number; level: number; compact?: boolean }) {
  const tier = equipmentTierIndex(level);
  const { color, finish } = getEquipmentTier(level);
  const width = compact ? 0.85 : 1.44;
  const depth = compact ? 0.58 : 0.94;
  const seatZ = compact ? 0.45 : 0.74;
  const displays = tier === 0 ? [{ x: 0, width: width * 0.58, angle: 0 }]
    : tier === 1 ? [-1, 1].map(side => ({ x: side * width * 0.24, width: width * 0.43, angle: -side * 0.1 }))
    : tier === 2 ? [{ x: 0, width: width * 0.9, angle: 0 }]
    : tier === 3 ? [-1, 0, 1].map(side => ({ x: side * width * 0.31, width: width * 0.3, angle: -side * 0.28 }))
    : [-1, 0, 1].map(side => ({ x: side * width * 0.3, width: width * (side ? 0.29 : 0.4), angle: -side * 0.5 }));
  return <group name={`equipment-pc-tier-${tier}`} position={[x, 0, z]}>
    <mesh position={[0, 0.68, 0]} castShadow receiveShadow><boxGeometry args={[width, 0.07, depth]} /><meshStandardMaterial color={finish} roughness={tier ? 0.4 : 0.85} metalness={tier ? 0.4 : 0} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * (width / 2 - 0.08), 0.33, 0]} castShadow><boxGeometry args={[0.07, 0.66, depth * 0.8]} /><meshStandardMaterial color={tier === 5 ? color : '#334155'} /></mesh>)}
    {tier > 0 && <mesh position={[0, 0.64, depth / 2]}><boxGeometry args={[width - 0.04, 0.025, 0.015]} /><meshBasicMaterial color={color} /></mesh>}
    {displays.map((display, i) => <Display key={i} {...display} z={-depth * 0.27} color={color} />)}
    <mesh position={[-0.08, 0.728, depth * 0.22]}><boxGeometry args={[width * 0.4, 0.025, depth * 0.2]} /><meshStandardMaterial color={tier >= 4 ? '#f8fafc' : '#020617'} /></mesh>
    <mesh position={[width * 0.29, 0.733, depth * 0.22]}><sphereGeometry args={[0.045, 8, 6]} /><meshStandardMaterial color={color} /></mesh>
    <group position={[-width * 0.29, 0.33, -0.02]}>
      <mesh castShadow><boxGeometry args={[width * 0.24, 0.52, depth * 0.62]} /><meshStandardMaterial color={tier >= 4 ? '#f1f5f9' : '#1e293b'} /></mesh>
      {Array.from({ length: tier === 0 ? 1 : tier >= 4 ? 3 : 2 }, (_, i) => <mesh key={i} position={[0, -0.14 + i * 0.14, depth * 0.32]}>
        <torusGeometry args={[width * 0.065, 0.012, 6, 12]} /><meshBasicMaterial color={color} />
      </mesh>)}
      {tier >= 4 && <mesh position={[width * 0.125, 0, 0]}><torusGeometry args={[0.14, 0.018, 6, 12]} /><meshStandardMaterial color={color} metalness={0.7} /></mesh>}
    </group>
    <group position={[0, 0, seatZ]}>
      <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[compact ? 0.36 : 0.48, 0.1, 0.4]} /><meshStandardMaterial color={tier >= 4 ? '#e2e8f0' : '#1e293b'} /></mesh>
      <mesh position={[0, 0.68, 0.17]} castShadow><boxGeometry args={[compact ? 0.36 : 0.48, 0.5, 0.08]} /><meshStandardMaterial color={finish} /></mesh>
      <mesh position={[0, 0.19, 0]}><cylinderGeometry args={[0.035, 0.05, 0.38, 8]} /><meshStandardMaterial color="#64748b" /></mesh>
      {tier > 1 && <mesh position={[0, 0.95, 0.17]}><boxGeometry args={[0.24, 0.12, 0.09]} /><meshStandardMaterial color={color} /></mesh>}
    </group>
    {tier === 5 && <group position={[0, 1.3, -depth * 0.35]}>
      <mesh><boxGeometry args={[width * 0.72, 0.035, 0.05]} /><meshStandardMaterial color={color} metalness={0.8} /></mesh>
      <mesh position={[0, 0.1, 0]}><octahedronGeometry args={[0.09]} /><meshStandardMaterial color={color} metalness={0.8} /></mesh>
    </group>}
  </group>;
}

/** Facility-specific equipment attachments; capped topology, never room scaling. */
export function RoomEquipmentUpgrade({ id, level, position }: { id: FacilityId; level: number; position: [number, number, number] }) {
  const tier = equipmentTierIndex(level);
  const { color } = getEquipmentTier(level);
  if (!tier) return null;
  return <group name={`equipment-${id}-tier-${tier}`} position={position}>
    {id === 'streaming_pod' ? <>
      <mesh position={[0, 1.25, 0]}><torusGeometry args={[0.26, 0.035, 8, 24]} /><meshBasicMaterial color={color} /></mesh>
      {Array.from({ length: Math.min(tier, 3) }, (_, i) => <group key={i} position={[(i - 1) * 0.5, 0.8, 0]}><mesh><boxGeometry args={[0.24, 0.17, 0.2]} /><meshStandardMaterial color="#334155" /></mesh><mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.075, 0.075, 0.12, 12]} /><meshStandardMaterial color={color} /></mesh></group>)}
    </> : id === 'gym' ? <>
      <Display y={1.15} width={tier >= 3 ? 1.1 : 0.65} color={color} />
      {tier >= 2 && [-0.5, 0.5].map(x => <mesh key={x} position={[x, 0.6, 0]}><boxGeometry args={[0.06, 1.1, 0.06]} /><meshStandardMaterial color={color} /></mesh>)}
      {tier >= 4 && <mesh position={[0, 1.5, 0]}><boxGeometry args={[1.15, 0.06, 0.18]} /><meshBasicMaterial color={color} /></mesh>}
    </> : <>
      <Display y={1.3} width={tier >= 3 ? 1.3 : 0.8} color={color} />
      {tier >= 2 && <Display x={0.8} y={1.3} width={0.45} angle={-0.25} color={color} />}
      {tier >= 3 && <mesh position={[0, 1.58, 0]}><boxGeometry args={[1.6, 0.08, id === 'cafeteria' ? 0.7 : 0.18]} /><meshStandardMaterial color={color} metalness={0.5} /></mesh>}
      {tier >= 4 && <mesh position={[0, 0.95, 0.14]}><boxGeometry args={[1.45, 0.025, 0.35]} /><meshStandardMaterial color="#f8fafc" /></mesh>}
    </>}
    {tier === 5 && <mesh position={[0, 1.8, 0]}><octahedronGeometry args={[0.16]} /><meshStandardMaterial color={color} metalness={0.85} /></mesh>}
  </group>;
}
