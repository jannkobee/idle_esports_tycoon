import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group } from 'three';
import { useGameStore } from '../../../core/store/useGameStore';
import type { Facility, FacilityId } from '../../../core/types/facility.types';

interface HouseSecondFloor3DProps {
  facilities: Record<FacilityId, Facility>;
  showRoof: boolean;
  branding?: { primaryColor: string; accentColor: string };
}

/**
 * 2nd Floor (Upper Penthouse Living Quarters & Player Dormitories):
 * - Luxury Comfort Rooms / Restroom & Shower Suites (CR)
 * - Pro Player Master Dormitories (Alpha & Bravo Suites)
 * - Executive Player Lounge with 75" 4K TV & Bar
 * - Skyline Rooftop Balcony & Terrace overlooking backyard sports
 * - Architectural Stairwell connecting 1F and 2F
 */
export const HouseSecondFloor3D: React.FC<HouseSecondFloor3DProps> = ({
  facilities: _facilities,
  showRoof,
  branding = { primaryColor: '#0891b2', accentColor: '#38bdf8' },
}) => {
  const wallpaperStyle = useGameStore((s) => s.houseInterior.wallpaperStyle) ?? 'default';
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

  const floorY = 3.2;
  const wallH = showRoof ? 2.8 : 1.35;
  const tvAnimRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (tvAnimRef.current) {
      const pulse = (Math.sin(clock.elapsedTime * 2) + 1) * 0.5;
      tvAnimRef.current.position.y = 1.6 + pulse * 0.02;
    }
  });

  return (
    <group position={[0, floorY, 0]}>
      {/* =====================================================================
          1. 2ND FLOOR STRUCTURAL SLABS
          ===================================================================== */}
      {/* Main Core Floor Slab (Over 1F Main Villa x: 0.4..14.6, z: 0.4..14.6) */}
      {/* Four slab sections leave a genuine opening above the stairs. */}
      {[
        { x: 0.4, z: 0.4, w: 5.85, d: 14.2 },
        { x: 7.55, z: 0.4, w: 7.05, d: 14.2 },
        { x: 6.25, z: 0.4, w: 1.3, d: 0.2 },
        { x: 6.25, z: 3, w: 1.3, d: 11.6 },
      ].map((r, i) => <mesh key={i} position={[r.x + r.w / 2, -0.06, r.z + r.d / 2]} receiveShadow><boxGeometry args={[r.w, 0.12, r.d]} /><meshStandardMaterial color="#334155" roughness={0.7} /></mesh>)}
      {showRoof && <mesh position={[7.5, 2.92, 7.5]} castShadow receiveShadow><boxGeometry args={[14.4, 0.18, 14.4]} /><meshStandardMaterial color="#dbeafe" roughness={0.65} /></mesh>}

      {/* Stairwell Opening Cutout Void at North Corridor landing (x: 6.2..7.6, z: 0.6..3.0) */}
      <group position={[6.9, 0, 1.8]}>
        {/* Safety balustrade around stairwell void */}
        <mesh position={[-0.65, 0.5, 0]} castShadow>
          <boxGeometry args={[0.04, 0.95, 2.4]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.4} transmission={0.7} />
        </mesh>
        <mesh position={[0.65, 0.5, 0]} castShadow>
          <boxGeometry args={[0.04, 0.95, 2.4]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.4} transmission={0.7} />
        </mesh>
        <mesh position={[0, 0.5, -1.2]} castShadow>
          <boxGeometry args={[1.34, 0.95, 0.04]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.4} transmission={0.7} />
        </mesh>
        {/* Stainless Steel Handrails */}
        <mesh position={[-0.65, 0.98, 0]}>
          <boxGeometry args={[0.06, 0.04, 2.42]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>
        <mesh position={[0.65, 0.98, 0]}>
          <boxGeometry args={[0.06, 0.04, 2.42]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>
        <mesh position={[0, 0.98, -1.2]}>
          <boxGeometry args={[1.36, 0.04, 0.06]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>
      </group>

      {/* =====================================================================
          2. ROOFTOP SKYLINE BALCONY & TERRACE (x: -5.4..0.4, z: 7.5..13.6)
          ===================================================================== */}
      <group position={[-2.5, 0, 10.55]}>
        {/* Teak Wood Patio Decking */}
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <boxGeometry args={[5.8, 0.08, 6.1]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>

        {/* Tempered Glass Perimeter Balustrade */}
        {/* West railing (facing sports courts) */}
        <mesh position={[-2.85, 0.5, 0]} castShadow>
          <boxGeometry args={[0.04, 0.95, 6.0]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.35} transmission={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[-2.85, 0.98, 0]}>
          <boxGeometry args={[0.08, 0.04, 6.05]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>
        {/* South railing */}
        <mesh position={[0, 0.5, 3.0]} castShadow>
          <boxGeometry args={[5.7, 0.95, 0.04]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.35} transmission={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.98, 3.0]}>
          <boxGeometry args={[5.75, 0.04, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>
        {/* North railing */}
        <mesh position={[0, 0.5, -3.0]} castShadow>
          <boxGeometry args={[5.7, 0.95, 0.04]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.35} transmission={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.98, -3.0]}>
          <boxGeometry args={[5.75, 0.04, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>

        {/* Rattan Outdoor Lounge Sectional */}
        <group position={[-1.2, 0, 0]}>
          {/* Main Sofa Base */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.1, 0.35, 2.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Plush Teal Cushions */}
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.95, 0.12, 2.5]} />
            <meshStandardMaterial color="#0891b2" roughness={0.85} />
          </mesh>
          {/* Backrest */}
          <mesh position={[-0.45, 0.6, 0]} castShadow>
            <boxGeometry args={[0.18, 0.5, 2.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* Low Glass Coffee Table */}
          <group position={[0.95, 0, 0]}>
            <mesh position={[0, 0.16, 0]} castShadow>
              <boxGeometry args={[0.7, 0.3, 1.4]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <boxGeometry args={[0.75, 0.02, 1.45]} />
              <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.5} transmission={0.8} />
            </mesh>
            {/* Drinks / Tropical Mocktails */}
            {[-0.3, 0.2].map((dz, i) => (
              <mesh key={i} position={[0, 0.38, dz]}>
                <cylinderGeometry args={[0.04, 0.03, 0.1, 8]} />
                <meshStandardMaterial color={i === 0 ? '#f59e0b' : '#10b981'} />
              </mesh>
            ))}
          </group>

          {/* Potted Exotic Palms */}
          {[
            [-2.4, -2.4],
            [-2.4, 2.4],
          ].map(([px, pz], i) => (
            <group key={i} position={[px, 0, pz]}>
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.26, 0.2, 0.6, 12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.75, 0]}>
                <sphereGeometry args={[0.38, 8, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* =====================================================================
          3. MASTER LUXURY COMFORT ROOM & RESTROOM SUITE (CR)
          Location: x: 0.5..6.2, z: 7.5..14.0
          ===================================================================== */}
      <group position={[3.35, 0, 10.75]}>
        {/* Luxury Italian Marble Restroom Floor */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[5.6, 0.015, 6.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.15} />
        </mesh>
        {/* Grey Marble Inset Grid Lines */}
        {[-1.8, 0, 1.8].map((gx, i) => (
          <mesh key={i} position={[gx, 0.015, 0]}>
            <boxGeometry args={[0.02, 0.005, 6.0]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
        ))}

        {/* --- RESTROOM WALLS --- */}
        {/* South Wall */}
        <mesh position={[0, wallH / 2, 3.05]} castShadow receiveShadow>
          <boxGeometry args={[5.7, wallH, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.08, 3.05]}>
          <boxGeometry args={[5.72, 0.15, 0.14]} />
          <meshStandardMaterial color={trimColor} roughness={0.5} />
        </mesh>
        {/* North Wall with Restroom Entryway */}
        <mesh position={[-1.5, wallH / 2, -3.05]} castShadow receiveShadow>
          <boxGeometry args={[2.7, wallH, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>
        <mesh position={[1.8, wallH / 2, -3.05]} castShadow receiveShadow>
          <boxGeometry args={[2.1, wallH, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>
        {/* Restroom Entryway Portal at x = 0.35, z = -3.05 */}
        <group position={[0.35, 0, -3.05]}>
          <mesh position={[-0.55, wallH / 2, 0]}><boxGeometry args={[0.08, wallH, 0.14]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[0.55, wallH / 2, 0]}><boxGeometry args={[0.08, wallH, 0.14]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[0, wallH - 0.04, 0]}><boxGeometry args={[1.18, 0.08, 0.14]} /><meshStandardMaterial color="#334155" /></mesh>
        </group>

        {/* --- PRIVATE ENCLOSED TOILET STALLS (2 Stalls) --- */}
        {[-1.5, -0.1].map((stallX, idx) => (
          <group key={idx} position={[stallX, 0, 1.8]}>
            {/* Stall Divider Wall */}
            <mesh position={[-0.65, 0.7, 0]} castShadow>
              <boxGeometry args={[0.06, 1.4, 1.8]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0.65, 0.7, 0]} castShadow>
              <boxGeometry args={[0.06, 1.4, 1.8]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Stall Privacy Door with Silver Handle & Indicator */}
            <group position={[0, 0, 0.9]} rotation={[0, idx === 0 ? 0.25 : 0, 0]}>
              <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[1.24, 1.35, 0.04]} />
                <meshStandardMaterial color="#0284c7" roughness={0.4} />
              </mesh>
              {/* Chrome Turn Latch */}
              <mesh position={[0.5, 0.68, 0.03]}>
                <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
              </mesh>
              {/* Occupied / Free Indicator Badge */}
              <mesh position={[0.5, 0.78, 0.025]}>
                <circleGeometry args={[0.025, 8]} />
                <meshBasicMaterial color={idx === 0 ? '#10b981' : '#ef4444'} />
              </mesh>
            </group>

            {/* Porcelain Toilet Bowl Commode */}
            <group position={[0, 0, -0.45]}>
              {/* Base */}
              <mesh position={[0, 0.22, 0]} castShadow>
                <boxGeometry args={[0.38, 0.44, 0.52]} />
                <meshStandardMaterial color="#ffffff" roughness={0.15} />
              </mesh>
              {/* Toilet Seat & Lid */}
              <mesh position={[0, 0.44, 0]}>
                <boxGeometry args={[0.39, 0.04, 0.5]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
              </mesh>
              {/* Water Tank */}
              <mesh position={[0, 0.65, -0.22]} castShadow>
                <boxGeometry args={[0.42, 0.42, 0.22]} />
                <meshStandardMaterial color="#ffffff" roughness={0.15} />
              </mesh>
              {/* Flush Lever */}
              <mesh position={[0.18, 0.8, -0.1]}>
                <boxGeometry args={[0.04, 0.02, 0.06]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
              </mesh>
              {/* Toilet Paper Holder */}
              <group position={[-0.6, 0.55, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.06, 0.06, 0.12, 10]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.9} />
                </mesh>
              </group>
            </group>
          </group>
        ))}

        {/* --- DOUBLE PORCELAIN VANITY BASINS & LED BACKLIT MIRRORS --- */}
        <group position={[1.8, 0, 0.4]}>
          {/* Granite Vanity Counter Surface */}
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[1.5, 0.88, 0.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.89, 0]}>
            <boxGeometry args={[1.55, 0.04, 0.65]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.2} />
          </mesh>

          {/* 2 Sunk-in Porcelain Sinks */}
          {[-0.45, 0.45].map((sx, i) => (
            <group key={i} position={[sx, 0.9, 0]}>
              <mesh>
                <boxGeometry args={[0.42, 0.02, 0.36]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.1} />
              </mesh>
              {/* Chrome Faucet Gooseneck Mixer */}
              <mesh position={[0, 0.12, -0.14]}>
                <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.05} />
              </mesh>
              {/* Soap Dispenser Bottle */}
              <mesh position={[0.22, 0.08, -0.1]}>
                <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
                <meshStandardMaterial color="#0284c7" transparent opacity={0.8} />
              </mesh>
            </group>
          ))}

          {/* LED Backlit Vanity Mirror on Wall */}
          <group position={[0, 1.45, 0.31]}>
            {/* Mirror Glass */}
            <mesh>
              <boxGeometry args={[1.4, 0.85, 0.02]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.02} metalness={0.98} />
            </mesh>
            {/* Warm Glow LED Backlight Frame */}
            <mesh position={[0, 0, -0.015]}>
              <boxGeometry args={[1.46, 0.91, 0.01]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[0, 0, 0.2]} color="#fffbeb" intensity={2.5} distance={3} />
          </group>
        </group>

        {/* --- LUXURY FRAMELESS GLASS RAINFALL SHOWER CUBICLE --- */}
        <group position={[1.8, 0, -1.8]}>
          {/* Shower Tray with Drainage Grate */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[1.4, 0.04, 1.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.042, 0]}>
            <circleGeometry args={[0.06, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>

          {/* Frameless Glass Enclosure */}
          <mesh position={[-0.7, 0.75, 0]} castShadow>
            <boxGeometry args={[0.03, 1.5, 1.4]} />
            <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.35} transmission={0.85} roughness={0.05} />
          </mesh>
          <mesh position={[0, 0.75, -0.7]} castShadow>
            <boxGeometry args={[1.4, 1.5, 0.03]} />
            <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.35} transmission={0.85} roughness={0.05} />
          </mesh>

          {/* Chrome Rainfall Shower Column & Big Overhead Head */}
          <mesh position={[0.4, 0.85, -0.65]}>
            <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
          </mesh>
          <mesh position={[0.4, 1.5, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
          </mesh>
        </group>

        {/* Heated Towel Warmers with Fluffy White Towels */}
        <group position={[-2.6, 0.85, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 1.1, 0.65]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} wireframe />
          </mesh>
          {[-0.3, 0.1].map((ty, i) => (
            <mesh key={i} position={[0.04, ty, 0]}>
              <boxGeometry args={[0.06, 0.22, 0.55]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* =====================================================================
          4. PRO DORMITORY SUITE A (ALPHA SUITE - BEDROOM & RIG)
          Location: x: 0.5..6.2, z: 0.8..6.8
          ===================================================================== */}
      <group position={[3.35, 0, 3.8]}>
        {/* Soft Grey Luxury Bedroom Carpet */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[5.6, 0.015, 5.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Bedroom Walls */}
        <mesh position={[0, wallH / 2, -2.85]} castShadow receiveShadow>
          <boxGeometry args={[5.7, wallH, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>
        <mesh position={[-2.75, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, wallH, 5.8]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>

        {/* King Size Pro Platform Bed */}
        <group position={[-1.2, 0, -1.5]}>
          {/* Timber Bed Frame */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[1.8, 0.32, 2.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          {/* Upholstered Headboard */}
          <mesh position={[0, 0.65, -1.02]} castShadow>
            <boxGeometry args={[1.9, 0.8, 0.14]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          {/* Thick Mattress */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[1.7, 0.22, 2.0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
          {/* Cyan/Navy Pro Team Duvet */}
          <mesh position={[0, 0.44, 0.2]}>
            <boxGeometry args={[1.72, 0.12, 1.5]} />
            <meshStandardMaterial color={branding.primaryColor || '#0891b2'} roughness={0.7} />
          </mesh>
          {/* Dual Plush Pillows */}
          {[-0.45, 0.45].map((px, i) => (
            <mesh key={i} position={[px, 0.54, -0.7]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.55, 0.12, 0.38]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
          ))}

          {/* Bedside Nightstand with Lamp */}
          <group position={[1.2, 0, -0.8]}>
            <mesh position={[0, 0.22, 0]} castShadow>
              <boxGeometry args={[0.45, 0.44, 0.45]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Lamp base & shade */}
            <mesh position={[0, 0.48, 0]}>
              <cylinderGeometry args={[0.02, 0.04, 0.1, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <cylinderGeometry args={[0.1, 0.14, 0.18, 12]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>
            <pointLight position={[0, 0.65, 0]} color="#fef08a" intensity={1.8} distance={2.5} />
          </group>
        </group>

        {/* Bedroom Personal Gaming Desk */}
        <group position={[1.4, 0, -1.8]}>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[1.4, 0.06, 0.7]} />
            <meshStandardMaterial color="#020617" roughness={0.5} metalness={0.6} />
          </mesh>
          {[-0.6, 0.6].map((lx, i) => (
            <mesh key={i} position={[lx, 0.22, 0]}>
              <boxGeometry args={[0.05, 0.44, 0.6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          ))}
          {/* Laptop open with code/VOD review */}
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[0.34, 0.015, 0.24]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.6, -0.11]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.34, 0.22, 0.012]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Clothing Wardrobe with Hung Jerseys */}
        <group position={[2.0, 0, 1.2]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.6, 1.9, 1.5]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          {/* Open Section with jerseys */}
          <mesh position={[0.2, 0.95, 0]}>
            <boxGeometry args={[0.22, 1.6, 1.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>

      {/* =====================================================================
          5. PRO DORMITORY SUITE B (BRAVO DUO SUITE)
          Location: x: 7.8..14.0, z: 0.8..6.8
          ===================================================================== */}
      <group position={[10.9, 0, 3.8]}>
        {/* Soft Charcoal Carpet */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[6.0, 0.015, 5.8]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
        {/* North Wall */}
        <mesh position={[0, wallH / 2, -2.85]} castShadow receiveShadow>
          <boxGeometry args={[6.1, wallH, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>
        {/* East Wall */}
        <mesh position={[2.95, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, wallH, 5.8]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>

        {/* Duo Pro Beds */}
        {[-1.4, 1.4].map((bx, i) => (
          <group key={i} position={[bx, 0, -1.6]}>
            {/* Bed Frame */}
            <mesh position={[0, 0.16, 0]} castShadow>
              <boxGeometry args={[1.2, 0.32, 2.0]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, 0.36, 0]}>
              <boxGeometry args={[1.15, 0.18, 1.9]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Purple & Slate Duo Duvet */}
            <mesh position={[0, 0.42, 0.2]}>
              <boxGeometry args={[1.18, 0.1, 1.4]} />
              <meshStandardMaterial color={i === 0 ? '#a855f7' : '#f59e0b'} roughness={0.8} />
            </mesh>
            {/* Pillow */}
            <mesh position={[0, 0.5, -0.65]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.5, 0.1, 0.32]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Center Bedside Table */}
        <group position={[0, 0, -2.0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.45, 0.44, 0.45]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <pointLight position={[0, 0.55, 0]} color="#fde047" intensity={1.5} distance={2.5} />
        </group>

        {/* Wall Mounted Trophy Shelves */}
        <group position={[0, 1.2, -2.78]}>
          <mesh>
            <boxGeometry args={[1.8, 0.04, 0.22]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          {[-0.6, 0, 0.6].map((tx, j) => (
            <mesh key={j} position={[tx, 0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.03, 0.14, 10]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* =====================================================================
          6. EXECUTIVE PLAYER PENTHOUSE LOUNGE & RECREATION
          Location: x: 7.8..14.0, z: 7.5..14.0
          ===================================================================== */}
      <group position={[10.9, 0, 10.75]}>
        {/* Scandinavian Wood Flooring */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[6.0, 0.015, 6.2]} />
          <meshStandardMaterial color="#c99560" roughness={0.6} />
        </mesh>
        {/* South Wall */}
        <mesh position={[0, wallH / 2, 3.05]} castShadow receiveShadow>
          <boxGeometry args={[6.1, wallH, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>
        {/* East Wall */}
        <mesh position={[2.95, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, wallH, 6.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.65} />
        </mesh>

        {/* Large Plush Sectional Lounge Sofa */}
        <group position={[0.5, 0, 0.8]}>
          {/* Main sofa run */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[2.6, 0.38, 0.9]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[2.5, 0.12, 0.85]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Chaise extension */}
          <mesh position={[0.9, 0.22, 0.8]} castShadow>
            <boxGeometry args={[0.8, 0.38, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.9, 0.44, 0.8]}>
            <boxGeometry args={[0.75, 0.12, 1.15]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>

        {/* Low Designer Coffee Table */}
        <group position={[0.5, 0, -0.4]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[1.4, 0.28, 0.7]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <boxGeometry args={[1.45, 0.02, 0.75]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.4} transmission={0.7} />
          </mesh>
        </group>

        {/* 75" 4K Smart OLED Television on North Wall */}
        <group ref={tvAnimRef} position={[0.5, 1.4, -2.9]}>
          {/* Bezel frame */}
          <mesh castShadow>
            <boxGeometry args={[2.2, 1.2, 0.05]} />
            <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Glowing Animated Screen */}
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[2.14, 1.14]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
{!showRoof && <Html position={[0, 0, 0.04]} transform center distanceFactor={14} style={{ pointerEvents: 'none' }}>
            <div className="bg-slate-950/80 px-4 py-2 rounded-lg text-center select-none whitespace-nowrap border border-cyan-400/50 shadow-2xl">
              <div className="text-[7px] font-black text-amber-400 tracking-widest uppercase">DYNASTY VOD ARCHIVES</div>
              <div className="text-[10px] font-black text-cyan-300 mt-0.5">CHAMPIONSHIP HIGHLIGHTS</div>
              <div className="text-[7px] text-emerald-400 font-bold mt-0.5">4K HDR · 120 FPS</div>
            </div>
          </Html>}
        </group>

        {/* Mini Fridge & Snack Bar Station */}
        <group position={[-2.2, 0, 1.2]}>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[0.55, 0.88, 0.55]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Glass door */}
          <mesh position={[0.28, 0.44, 0]}>
            <boxGeometry args={[0.02, 0.84, 0.5]} />
            <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.4} transmission={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
