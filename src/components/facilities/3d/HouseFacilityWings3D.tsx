import React from 'react';
import type { Facility, FacilityId } from '../../../core/types/facility.types';
import type { Rect } from '../../../core/types/house.types';
import { CAMPUS, arenaOpen, campusWalls } from '../../../core/house/campusLayout';
import { RoomDoor3D } from './RoomDoor3D';

// Abut the existing HQ roof instead of stacking coplanar panels over it.
function WingRoof({ rect }: { rect: Rect }) {
  const x = rect.x >= 0 ? Math.max(14.325, rect.x) : rect.x;
  const end = rect.x >= 0 ? rect.x + rect.w : Math.min(-0.325, rect.x + rect.w);
  return (
    <mesh position={[(x + end) / 2, 3.12, rect.y + rect.d / 2]} castShadow>
      <boxGeometry args={[end - x, 0.18, rect.d]} />
      <meshStandardMaterial color="#dbeafe" roughness={0.65} />
    </mesh>
  );
}

function MerchStorefrontEntrance() {
  return <RoomDoor3D x={14.15} z={13.6} width={1.7} />;
}
function CafeteriaDoorways() {
  return <group><RoomDoor3D x={-3.2} z={7.5} width={1.6} color="#b45309" /><RoomDoor3D x={-5.52} z={10.8} width={1.6} acrossZ /></group>;
}
function ArenaDoorway() {
  return <RoomDoor3D x={17.25} z={6.08} width={1.7} color="#7c3aed" />;
}

// Furnishings, agents, and walls use the same physical footprint.
export const HouseFacilityWings3D: React.FC<{
  facilities: Record<FacilityId, Facility>;
  showRoof: boolean;
  onSelectRoom: (id: FacilityId) => void;
}> = ({ facilities, showRoof, onSelectRoom }) => {
  const unlocked = new Set(Object.values(facilities).filter((f) => f.isUnlocked).map((f) => f.id));
  const levels = Object.fromEntries(Object.values(facilities).map((f) => [f.id, f.level]));
  const arena = arenaOpen(unlocked, levels);

  const sections: { id: FacilityId; rect: Rect; floorColor: string }[] = [];
  if (arena) sections.push({ id: 'scrim_lab', rect: CAMPUS.arena, floorColor: '#0f172a' });
  if (unlocked.has('merch_store'))
    sections.push({ id: 'merch_store', rect: CAMPUS.merch, floorColor: '#1e293b' });
  if (unlocked.has('cafeteria'))
    sections.push({ id: 'cafeteria', rect: CAMPUS.dining, floorColor: '#fed7aa' });

  const halls: Rect[] = [];
  if (arena || unlocked.has('merch_store')) halls.push(CAMPUS.eastHall);
  if (unlocked.has('cafeteria')) halls.push(CAMPUS.westHall);

  const walls = campusWalls(unlocked, levels);

  return (
    <group>
      {/* 1. Room Click Hitboxes & Roofs */}
      {sections.map(({ id, rect: r, floorColor }) => (
        <group
          key={id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRoom(id);
          }}
        >
          {/* Arena Floor Tile (when scrim_lab expansion is open) */}
          {id === 'scrim_lab' && (
            <mesh position={[r.x + r.w / 2, 0.01, r.y + r.d / 2]} receiveShadow>
              <boxGeometry args={[r.w - 0.08, 0.015, r.d - 0.08]} />
              <meshStandardMaterial color={floorColor} roughness={0.7} metalness={0.2} />
            </mesh>
          )}
          {showRoof && <WingRoof rect={r} />}
        </group>
      ))}

      {/* 2. Hall Roofs */}
      {halls.map((r, index) => (
        <group key={index}>
          {showRoof && <WingRoof rect={r} />}
        </group>
      ))}

      {/* 3. Architectural Walls with Baseboards and Aluminum Top Caps */}
      {walls.map((r, index) => {
        const wallH = showRoof ? 3.0 : 1.35;
        const cx = r.x + r.w / 2;
        const cz = r.y + r.d / 2;

        return (
          <group key={index}>
            {/* Main Wall Segment */}
            <mesh position={[cx, wallH / 2, cz]} castShadow receiveShadow>
              <boxGeometry args={[r.w, wallH, r.d]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            {/* Wall Baseboard Trim */}
            <mesh position={[cx, 0.08, cz]}>
              <boxGeometry args={[r.w + 0.03, 0.15, r.d + 0.03]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Wall Top Aluminum Cap Trim */}
            <mesh position={[cx, wallH + 0.02, cz]}>
              <boxGeometry args={[r.w + 0.03, 0.04, r.d + 0.03]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* 4. Merch Storefront Exterior Portal (Street/Sidewalk Accessible Entrance) */}
      {unlocked.has('merch_store') && <MerchStorefrontEntrance />}

      {/* 5. Cafeteria Doorways (Hallway Double Doors & Rear Patio Sliding Door) */}
      {unlocked.has('cafeteria') && <CafeteriaDoorways />}

      {/* 6. Multi-Title Arena Stage Double Door Entrance */}
      {arena && <ArenaDoorway />}
    </group>
  );
};
