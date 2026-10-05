
/** Open sliding leaves park against the wall, never across a walkable doorway. */
export function RoomDoor3D({ x, z, width = 1.2, acrossZ = false, open = true, color = '#334155' }: {
  x: number; z: number; width?: number; acrossZ?: boolean; open?: boolean; color?: string;
}) {
  return <group position={[x, 0, z]} rotation={[0, acrossZ ? Math.PI / 2 : 0, 0]}>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * width / 2, 0.72, 0]}><boxGeometry args={[0.06, 1.44, 0.12]} /><meshStandardMaterial color={color} /></mesh>
      <group position={[side * width * (open ? 0.76 : 0.25), 0.69, 0.08]}>
        <mesh><boxGeometry args={[width * 0.47, 1.32, 0.035]} /><meshStandardMaterial color="#bae6fd" transparent opacity={0.28} depthWrite={false} /></mesh>
        {[-1, 1].map(edge => <mesh key={edge} position={[edge * width * 0.235, 0, 0]}><boxGeometry args={[0.025, 1.34, 0.05]} /><meshStandardMaterial color={color} /></mesh>)}
        <mesh position={[-side * width * 0.17, 0, 0.04]}><boxGeometry args={[0.025, 0.3, 0.03]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
      </group>
    </group>)}
    <mesh position={[0, 1.44, 0]}><boxGeometry args={[width + 0.12, 0.08, 0.15]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0, 0.025, 0]}><boxGeometry args={[width - 0.12, 0.025, 0.22]} /><meshStandardMaterial color={open ? '#67e8f9' : '#fbbf24'} /></mesh>
  </group>;
}
