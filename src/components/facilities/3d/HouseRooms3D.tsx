import React from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { HOUSE_ROOMS } from '../../../core/engine/HouseLayout';
import { HOUSE_WALLS } from '../../../core/house/houseGeometry';
import { Facility, FacilityId } from '../../../core/types/facility.types';
import { useGameStore } from '../../../core/store/useGameStore';
import { arenaOpen, CORE_SHELL_WALLS } from '../../../core/house/campusLayout';
import { RoomDoor3D } from './RoomDoor3D';

interface HouseRooms3DProps {
  facilities: Record<FacilityId, Facility>;
  selectedRoomId: FacilityId;
  onSelectRoom: (id: FacilityId) => void;
  showRoof: boolean;
}

type DoorOrientation = 'acrossX' | 'acrossZ';
const InteriorDoor = ({ x, z, orientation }: { x: number; z: number; orientation: DoorOrientation; swing?: 1 | -1 }) =>
  <RoomDoor3D x={x} z={z} acrossZ={orientation === 'acrossZ'} />;

const INTERIOR_DOORS: Array<{ x: number; z: number; orientation: DoorOrientation; swing?: 1 | -1 }> = [
  { x: 5, z: 6.08, orientation: 'acrossX' },
  { x: 6.28, z: 5.3, orientation: 'acrossZ', swing: -1 },
  { x: 7.4, z: 3.5, orientation: 'acrossZ' },
  { x: 5, z: 7.5, orientation: 'acrossX', swing: -1 },
  { x: 6.28, z: 8.6, orientation: 'acrossZ' },
  { x: 8.9, z: 7.5, orientation: 'acrossX' },
  { x: 12.5, z: 7.5, orientation: 'acrossX', swing: -1 },
];

export const HouseRooms3D: React.FC<HouseRooms3DProps> = ({
  facilities,
  selectedRoomId,
  onSelectRoom,
  showRoof,
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
  const cafeteriaUnlocked = facilities.cafeteria?.isUnlocked ?? false;
  const merchUnlocked = facilities.merch_store?.isUnlocked ?? false;
  const unlockedSet = new Set(Object.values(facilities).filter((f) => f.isUnlocked).map((f) => f.id));
  const levels = Object.fromEntries(Object.values(facilities).map((f) => [f.id, f.level]));
  const arenaUnlocked = arenaOpen(unlockedSet, levels);

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Concrete Foundation Base Plinth - Main Core */}
      <mesh position={[7, -0.3, 7]} receiveShadow>
        <boxGeometry args={[14.6, 0.4, 14.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Main Floor Slab - Main Core */}
      <mesh position={[7, -0.05, 7]} receiveShadow>
        <boxGeometry args={[14.2, 0.1, 14.2]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* West Wing Attached Foundation Plinth & Slab (Cafeteria + West Corridor) */}
      {cafeteriaUnlocked && (
        <group>
          <mesh position={[-2.55, -0.3, 9.95]} receiveShadow>
            <boxGeometry args={[5.9, 0.4, 7.5]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[-2.55, -0.05, 9.95]} receiveShadow>
            <boxGeometry args={[5.9, 0.1, 7.5]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* East Wing Attached Foundation Plinth & Slab (Merch Store + East Corridor) */}
      {merchUnlocked && (
        <group>
          <mesh position={[13.85, -0.3, 9.95]} receiveShadow>
            <boxGeometry args={[6.9, 0.4, 7.5]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[13.85, -0.05, 9.95]} receiveShadow>
            <boxGeometry args={[6.9, 0.1, 7.5]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* North-East Wing Attached Foundation Plinth & Slab (Multi-Title Arena) */}
      {arenaUnlocked && (
        <group>
          <mesh position={[17.1, -0.3, 3.8]} receiveShadow>
            <boxGeometry args={[7.0, 0.4, 7.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[17.1, -0.05, 3.8]} receiveShadow>
            <boxGeometry args={[7.0, 0.1, 7.2]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        </group>
      )}

      {showRoof && <group>
        <mesh position={[7, 3.12, 7]} castShadow receiveShadow>
          <boxGeometry args={[14.65, 0.18, 14.65]} />
          <meshStandardMaterial color="#dbeafe" roughness={0.65} metalness={0.15} />
        </mesh>
        <mesh position={[7, 3.23, 7]}><boxGeometry args={[14.9, 0.05, 14.9]} /><meshStandardMaterial color="#38bdf8" roughness={0.45} metalness={0.35} /></mesh>
      </group>}

      {/* Unified Continuous Horizontal Hallway (H1: Continuous from Cafeteria to Merch/Arena) */}
      {(() => {
        const hallStartX = cafeteriaUnlocked ? -5.4 : 0.4;
        const hallEndX = (merchUnlocked || arenaUnlocked) ? (arenaUnlocked ? 20.5 : 17.2) : 13.6;
        const hallW = hallEndX - hallStartX;
        const hallMidX = (hallStartX + hallEndX) / 2;
        return (
          <group>
            <mesh position={[hallMidX, 0.005, 6.85]} receiveShadow>
              <boxGeometry args={[hallW, 0.01, 1.3]} />
              <meshStandardMaterial color={hallColor} roughness={0.65} metalness={0.05} />
            </mesh>
            {/* Continuous Cyan Accent Runner */}
            <mesh position={[hallMidX, 0.008, 6.85]}>
              <boxGeometry args={[hallW - 0.2, 0.012, 0.04]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          </group>
        );
      })()}

      {/* Vertical Hall (H2: x: 6.4 - 7.4, z: 0.4 - 14.0) */}
      <mesh position={[6.9, 0.006, 7.2]} receiveShadow>
        <boxGeometry args={[1.0, 0.01, 13.6]} />
        <meshStandardMaterial color={hallColor} roughness={0.65} metalness={0.05} />
      </mesh>

      <mesh position={[6.9, 0.008, 7.2]}>
        <boxGeometry args={[0.04, 0.012, 13.4]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Floating Architectural Staircase connecting 1F to 2F (North Corridor Alcove x = 6.9, z = 0.6..2.7, rising to y = 3.2) */}
      <group position={[6.9, 0, 0.6]}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((step) => {
          const sy = step * 0.26;
          const sz = step * 0.19;
          return (
            <group key={step} position={[0, sy, sz]}>
              {/* Solid Oak Floating Tread */}
              <mesh position={[0, 0.13, 0]} castShadow>
                <boxGeometry args={[1.0, 0.05, 0.24]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.6} />
              </mesh>
              {/* Steel Stringer Support */}
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.35, 0.12, 0.24]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} />
              </mesh>
              {/* Cyan LED under-tread runner */}
              <mesh position={[0, 0.11, 0.1]}>
                <boxGeometry args={[0.96, 0.01, 0.02]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>
          );
        })}
        {/* Tempered Glass Side Balustrades & Handrails */}
        <mesh position={[-0.52, 1.6, 1.1]} rotation={[-0.62, 0, 0]}>
          <boxGeometry args={[0.02, 0.85, 2.75]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.35} transmission={0.7} />
        </mesh>
        <mesh position={[-0.52, 2.05, 1.1]} rotation={[-0.62, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 2.8]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
        </mesh>
        <mesh position={[0.52, 1.6, 1.1]} rotation={[-0.62, 0, 0]}>
          <boxGeometry args={[0.02, 0.85, 2.75]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.35} transmission={0.7} />
        </mesh>
        <mesh position={[0.52, 2.05, 1.1]} rotation={[-0.62, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 2.8]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
        </mesh>
      </group>

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

      {/* Shared collision shell with real glazing, not glass over opaque walls. */}
      {CORE_SHELL_WALLS.map((wall, index) => {
        const alongX = wall.w > wall.d;
        const length = alongX ? wall.w : wall.d;
        const height = showRoof ? 3 : 1.35;
        return <group key={index} position={[wall.x + wall.w / 2, 0, wall.y + wall.d / 2]} rotation={[0, alongX ? 0 : Math.PI / 2, 0]}>
          <mesh position={[0, 0.275, 0]} castShadow receiveShadow><boxGeometry args={[length, 0.55, 0.12]} /><meshStandardMaterial color={facadeColor} roughness={0.7} /></mesh>
          <mesh position={[0, (height + 0.55) / 2, 0]}><boxGeometry args={[length - 0.12, height - 0.55, 0.035]} /><meshStandardMaterial color="#bae6fd" transparent opacity={0.25} depthWrite={false} /></mesh>
          {[-1, 1].map(side => <mesh key={side} position={[side * (length / 2 - 0.04), height / 2, 0]}><boxGeometry args={[0.08, height, 0.15]} /><meshStandardMaterial color={facadeColor} /></mesh>)}
          <mesh position={[0, height, 0]}><boxGeometry args={[length, 0.06, 0.15]} /><meshStandardMaterial color={trimColor} /></mesh>
        </group>;
      })}

      {/* Structural Interior Partition Column bridging Gym & Merch Store */}
      {merchUnlocked && (
        <group position={[10.7, 0.675, 10.55]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 1.35, 6.1]} />
            <meshStandardMaterial color={wallColor} roughness={0.65} metalness={0.1} />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[0.64, 0.15, 6.14]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.69, 0]}>
            <boxGeometry args={[0.64, 0.04, 6.14]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}

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

      {/* Real door models make the existing room connections legible. */}
      {INTERIOR_DOORS.map((door, index) => <InteriorDoor key={index} {...door} />)}

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
