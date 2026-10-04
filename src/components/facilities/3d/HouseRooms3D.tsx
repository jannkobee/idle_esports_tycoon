import React from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { HOUSE_ROOMS } from '../../../core/engine/HouseLayout';
import { HOUSE_WALLS } from '../../../core/house/houseGeometry';
import { Facility, FacilityId } from '../../../core/types/facility.types';
import { useGameStore } from '../../../core/store/useGameStore';

interface HouseRooms3DProps {
  facilities: Record<FacilityId, Facility>;
  selectedRoomId: FacilityId;
  onSelectRoom: (id: FacilityId) => void;
}

export const HouseRooms3D: React.FC<HouseRooms3DProps> = ({
  facilities,
  selectedRoomId,
  onSelectRoom,
}) => {
  const wallpaperStyle = useGameStore((s) => s.houseInterior.wallpaperStyle) ?? 'default';
  const flooringStyle = useGameStore((s) => s.houseInterior.flooringStyle) ?? 'default';
  const facadeStyle = useGameStore((s) => s.houseInterior.facadeStyle) ?? 'default';
  const hallColor = flooringStyle === 'oak' ? '#c99560' : flooringStyle === 'marble' ? '#f8fafc' : flooringStyle === 'neon' ? '#67e8f9' : '#d1d5db';
  const facadeColor = facadeStyle === 'sandstone' ? '#f5deb3' : facadeStyle === 'glass' ? '#a5d8ed' : facadeStyle === 'carbon' ? '#64748b' : '#e2e8f0';

  const wallColor =
    wallpaperStyle === 'cyberpunk'
      ? '#0f172a'
      : wallpaperStyle === 'carbon'
      ? '#1e293b'
      : wallpaperStyle === 'minimalist'
      ? '#fef3c7'
      : '#cbd5e1';

  const trimColor =
    wallpaperStyle === 'cyberpunk'
      ? '#06b6d4'
      : wallpaperStyle === 'carbon'
      ? '#38bdf8'
      : wallpaperStyle === 'minimalist'
      ? '#d97706'
      : '#1e293b';
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Concrete Foundation Base Plinth */}
      <mesh position={[7, -0.3, 7]} receiveShadow>
        <boxGeometry args={[14.6, 0.4, 14.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Main Floor Slab */}
      <mesh position={[7, -0.05, 7]} receiveShadow>
        <boxGeometry args={[14.2, 0.1, 14.2]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Common Corridors Flooring (Light Scandinavian Ash Wood Planks) */}
      {/* Horizontal Hall (H1: x: 0.4 - 13.6, z: 6.2 - 7.5) */}
      <mesh position={[7, 0.005, 6.85]} receiveShadow>
        <boxGeometry args={[13.2, 0.01, 1.3]} />
        <meshStandardMaterial color={hallColor} roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Vertical Hall (H2: x: 6.4 - 7.4, z: 0.4 - 14.0) */}
      <mesh position={[6.9, 0.006, 7.2]} receiveShadow>
        <boxGeometry args={[1.0, 0.01, 13.6]} />
        <meshStandardMaterial color={hallColor} roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Hallway Accent Inlay Strips (Lying Flat on Floor) */}
      <mesh position={[7, 0.008, 6.85]}>
        <boxGeometry args={[13.0, 0.012, 0.04]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[6.9, 0.008, 7.2]}>
        <boxGeometry args={[0.04, 0.012, 13.4]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Room Floors with Distinct Materials */}
      {HOUSE_ROOMS.map((room) => {
        const facility = facilities[room.id];
        const isUnlocked = facility?.isUnlocked;
        const isSelected = selectedRoomId === room.id;
        const cx = room.x + room.w / 2;
        const cz = room.y + room.d / 2;

        const handleRoomClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelectRoom(room.id);
        };

        return (
          <group key={room.id}>
            {/* Room Base Floor Tile (Flat Box) */}
            <mesh
              position={[cx, 0.01, cz]}
              receiveShadow
              onClick={handleRoomClick}
            >
              <boxGeometry args={[room.w - 0.08, 0.015, room.d - 0.08]} />
              <meshStandardMaterial
                color={
                  !isUnlocked
                    ? '#a8b8c8' // Light unfinished concrete keeps locked rooms visible
                    : room.id === 'scrim_lab'
                    ? '#0f172a' // Dark tech slate
                    : room.id === 'streaming_pod'
                    ? '#181226' // Acoustic chevron dark wood
                    : room.id === 'analyst_room'
                    ? '#0f2027' // Executive dark stone
                    : room.id === 'gym'
                    ? '#171717' // Rubber gym mat
                    : '#f1f5f9' // Merch showroom light terrazzo
                }
                roughness={
                  room.id === 'merch_store' ? 0.35 : room.id === 'gym' ? 0.95 : 0.7
                }
                metalness={
                  room.id === 'scrim_lab' ? 0.3 : room.id === 'merch_store' ? 0.1 : 0.05
                }
              />
            </mesh>

            {/* Room Inset Carpet / Floor Runners (Flat on Floor) */}
            {isUnlocked && room.id === 'scrim_lab' && (
              <group position={[cx, 0.015, cz]}>
                {/* Cyan glowing floor perimeter runners */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[room.w - 0.4, 0.016, room.d - 0.4]} />
                  <meshStandardMaterial color="#0b1e28" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.8, 1.84, 4]} />
                  <meshBasicMaterial color="#06b6d4" />
                </mesh>
              </group>
            )}

            {isUnlocked && room.id === 'streaming_pod' && (
              <group position={[cx, 0.015, cz]}>
                {/* Circular plush purple velvet rug */}
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[2.4, 32]} />
                  <meshStandardMaterial color="#3b1d5c" roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[2.32, 2.38, 32]} />
                  <meshBasicMaterial color="#a855f7" />
                </mesh>
              </group>
            )}

            {isUnlocked && room.id === 'analyst_room' && (
              <group position={[cx, 0.015, cz]}>
                {/* Geometric tactical war-room border rug */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[room.w - 0.8, 0.016, room.d - 0.8]} />
                  <meshStandardMaterial color="#132438" roughness={0.85} />
                </mesh>
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[2.1, 2.15, 4]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
              </group>
            )}

            {isUnlocked && room.id === 'gym' && (
              <group position={[cx, 0.015, cz]}>
                {/* Yellow athletic safety boundary lines */}
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.1, 1.15, 4]} />
                  <meshBasicMaterial color="#eab308" />
                </mesh>
                <mesh position={[0, 0.005, 0]}>
                  <boxGeometry args={[0.08, 0.016, room.d - 0.6]} />
                  <meshBasicMaterial color="#f8fafc" />
                </mesh>
              </group>
            )}

            {isUnlocked && room.id === 'merch_store' && (
              <group position={[cx, 0.015, cz]}>
                {/* Polished brass showroom grid inlays */}
                <mesh position={[0, 0.005, 0]}>
                  <boxGeometry args={[room.w - 0.4, 0.016, 0.04]} />
                  <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            )}

            {/* Golden selection halo when room is tapped (Flat on floor) */}
            {isSelected && (
              <mesh position={[cx, 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry
                  args={[
                    Math.min(room.w, room.d) * 0.44,
                    Math.min(room.w, room.d) * 0.47,
                    32,
                  ]}
                />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Exterior Back Walls (Cutaway along camera angles; rear walls have panoramic glazed windows) */}
      {/* Rear Wall along North Perimeter (z = 0.4, x: 0.4 - 13.6) */}
      <group position={[7, 1.5, 0.35]}>
        {/* Main Solid Wall Portion */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[13.4, 3.0, 0.15]} />
          <meshStandardMaterial color={facadeColor} roughness={0.7} />
        </mesh>
        {/* Wall Baseboard Trim */}
        <mesh position={[0, -1.42, 0.09]}>
          <boxGeometry args={[13.4, 0.16, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Large Modern Panoramic Ribbon Windows */}
        {[2.2, 5.2, 8.8, 11.8].map((wx) => (
          <group key={wx} position={[wx - 7, 0.2, 0.01]}>
            {/* Open frame: no opaque slab behind the glass. */}
            {[-1.21, 1.21].map(edge => <mesh key={edge} position={[edge, 0, 0]}><boxGeometry args={[0.08, 1.8, 0.2]} /><meshStandardMaterial color="#94a3b8" /></mesh>)}
            {[-0.86, 0.86].map(edge => <mesh key={edge} position={[0, edge, 0]}><boxGeometry args={[2.5, 0.08, 0.2]} /><meshStandardMaterial color="#94a3b8" /></mesh>)}
            {/* Window Glass */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.3, 1.6, 0.04]} />
              <meshPhysicalMaterial
                color="#bae6fd"
                transparent
                opacity={0.35}
                roughness={0.1}
                metalness={0.2}
                transmission={0.7}
                thickness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rear Wall along West Perimeter (x = 0.4, z: 0.4 - 13.6) */}
      <group position={[0.35, 1.5, 7]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 3.0, 13.4]} />
          <meshStandardMaterial color={facadeColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.09, -1.42, 0]}>
          <boxGeometry args={[0.04, 0.16, 13.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* West Windows */}
        {[2.5, 5.5, 8.8, 11.8].map((wz) => (
          <group key={wz} position={[0.01, 0.2, wz - 7]}>
            {[-1.16, 1.16].map(edge => <mesh key={edge} position={[0, 0, edge]}><boxGeometry args={[0.2, 1.8, 0.08]} /><meshStandardMaterial color="#94a3b8" /></mesh>)}
            {[-0.86, 0.86].map(edge => <mesh key={edge} position={[0, edge, 0]}><boxGeometry args={[0.2, 0.08, 2.4]} /><meshStandardMaterial color="#94a3b8" /></mesh>)}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 1.6, 2.2]} />
              <meshPhysicalMaterial
                color="#bae6fd"
                transparent
                opacity={0.35}
                roughness={0.1}
                metalness={0.2}
                transmission={0.7}
                thickness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Interior Partition Walls with Real Door Openings from HOUSE_WALLS */}
      {HOUSE_WALLS.map((wall, idx) => {
        const cx = wall.rect.x + wall.rect.w / 2;
        const cz = wall.rect.y + wall.rect.d / 2;
        const wallHeight = 1.35; // Cutaway height for optimal mobile interior visibility

        return (
          <group key={idx}>
            {/* Wall Segment */}
            <mesh position={[cx, wallHeight / 2, cz]} castShadow receiveShadow>
              <boxGeometry args={[wall.rect.w, wallHeight, wall.rect.d]} />
              <meshStandardMaterial color={wallColor} roughness={0.65} metalness={0.1} />
            </mesh>
            {/* Baseboard Trim */}
            <mesh position={[cx, 0.08, cz]}>
              <boxGeometry
                args={[
                  wall.axis === 'x' ? wall.rect.w : wall.rect.w + 0.04,
                  0.15,
                  wall.axis === 'y' ? wall.rect.d : wall.rect.d + 0.04,
                ]}
              />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
            {/* Wall Top Aluminum Cap Trim */}
            <mesh position={[cx, wallHeight + 0.02, cz]}>
              <boxGeometry
                args={[
                  wall.axis === 'x' ? wall.rect.w : wall.rect.w + 0.03,
                  0.04,
                  wall.axis === 'y' ? wall.rect.d : wall.rect.d + 0.03,
                ]}
              />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Atmospheric Room Interior Lighting */}
      {/* Scrim Lab: High-tech Cyan Ambience */}
      <pointLight
        position={[3.4, 2.2, 3.3]}
        color="#06b6d4"
        intensity={9}
        distance={8}
        decay={2}
      />
      {/* Stream Studio: Neon Purple Studio Glow */}
      <pointLight
        position={[10.5, 2.2, 3.3]}
        color="#a855f7"
        intensity={12}
        distance={8}
        decay={2}
      />
      {/* Strategy Room: Tactical Blue War Room Glow */}
      <pointLight
        position={[3.4, 2.2, 10.5]}
        color="#38bdf8"
        intensity={8}
        distance={8}
        decay={2}
      />
      {/* Team Gym: Energetic Daylight Lighting */}
      <pointLight
        position={[8.9, 2.2, 10.5]}
        color="#fef08a"
        intensity={7}
        distance={7}
        decay={2}
      />
      {/* Merch Store: Warm Retail Lighting */}
      <pointLight
        position={[12.3, 2.2, 10.5]}
        color="#fef3c7"
        intensity={7}
        distance={7}
        decay={2}
      />
      {/* Central Corridor Downlight */}
      <pointLight
        position={[6.9, 2.2, 6.9]}
        color="#e2e8f0"
        intensity={6}
        distance={7}
        decay={2}
      />
    </group>
  );
};
