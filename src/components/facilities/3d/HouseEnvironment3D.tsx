import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { useGameStore } from '../../../core/store/useGameStore';
import type { EmpireState } from '../../../core/store/useGameStore';

function FanWalker({ index, density }: { index: number; density: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * (0.35 + index * 0.03) + index * 1.7;
    ref.current.position.x = -18 + ((t * 2.4) % 38);
    ref.current.position.z = 27.6 + Math.sin(t) * (0.2 + density * 0.05);
  });
  const flash = index % 3 === 0;
  return <group ref={ref} position={[0, -0.35, 27.6]}>
    <mesh position={[0, 0.42, 0]}><capsuleGeometry args={[0.14, 0.38, 6, 10]} /><meshStandardMaterial color={index % 2 ? '#f43f5e' : '#0ea5e9'} /></mesh>
    <mesh position={[0, 0.78, 0]}><sphereGeometry args={[0.14, 10, 8]} /><meshStandardMaterial color={index % 2 ? '#c68642' : '#f5c5a3'} /></mesh>
    {flash && <pointLight position={[0.16, 0.65, -0.1]} intensity={0.35} distance={1.4} color="#ffffff" />}
  </group>;
}

/**
 * Exterior living simulation environment:
 * - Suburban neighborhood with moving street traffic (commuter sedans, esports courier vans)
 * - Outdoor covered patio deck with 65" big-screen esports match broadcast TV & lounge seating
 * - Driveway basketball half-court with pro acrylic backboard and breakaway rim
 * - High-fidelity team sports car with underglow neon, active headlights, and tournament departure mode
 * - Modern suburban houses, streetlights, and lush landscaping
 */
export const HouseEnvironment3D: React.FC<{ empire: EmpireState }> = ({ empire }) => {
  const isTournamentUnderway = useGameStore(s => s.isTournamentUnderway);
  const roster = useGameStore(s => s.roster);
  const totalFans = roster.reduce((sum, player) => sum + (player.fans ?? 0), 0);
  const fanCount = Math.min(10, 2 + Math.floor(totalFans / 6000) + empire.districtTier);
  const carRef = useRef<Group>(null);
  const exhaustRef = useRef<Group>(null);
  const underglowRef = useRef<Mesh>(null);
  const tvScreenRef = useRef<Mesh>(null);
  const trafficCar1Ref = useRef<Group>(null);
  const trafficCar2Ref = useRef<Group>(null);

  // Subtle sports car idle vibration, living traffic movement, and TV screen glow
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // Team sports car idle vibration (revs harder when tournament is underway)
    if (carRef.current) {
      const vibIntensity = isTournamentUnderway ? 0.007 : 0.0025;
      const vibSpeed = isTournamentUnderway ? 26 : 12;
      carRef.current.position.y = Math.sin(t * vibSpeed) * vibIntensity;
    }

    // Underglow neon pulsing
    if (underglowRef.current) {
      underglowRef.current.visible = true;
      const pulse = isTournamentUnderway
        ? 0.75 + Math.sin(t * 8) * 0.25
        : 0.4 + Math.sin(t * 2) * 0.15;
      const mat = underglowRef.current.material as any;
      if (mat) mat.opacity = pulse;
    }

    // Outdoor TV subtle screen flicker
    if (tvScreenRef.current) {
      const flicker = 0.88 + Math.sin(t * 5.3) * 0.07 + Math.cos(t * 11.2) * 0.05;
      const mat = tvScreenRef.current.material as any;
      if (mat) mat.opacity = flicker;
    }

    // Traffic Car 1: Silver commuter sedan going East (+x) on outer lane (z = 23.2)
    if (trafficCar1Ref.current) {
      trafficCar1Ref.current.position.x += 13.5 * delta;
      if (trafficCar1Ref.current.position.x > 46) {
        trafficCar1Ref.current.position.x = -38;
      }
    }

    // Traffic Car 2: Cyan delivery courier van going West (-x) on inner lane (z = 19.8)
    if (trafficCar2Ref.current) {
      trafficCar2Ref.current.position.x -= 10.5 * delta;
      if (trafficCar2Ref.current.position.x < -38) {
        trafficCar2Ref.current.position.x = 46;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================ */}
      {/* 1. TERRAIN, STREET, AND ROADS                                */}
      {/* ============================================================ */}
      {/* Surrounding Neighborhood Terrain */}
      <mesh position={[7, -0.6, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#14211d" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Outer Asphalt Street */}
      <mesh position={[7, -0.58, 21.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 11]} />
        <meshStandardMaterial color="#171b1f" roughness={0.88} metalness={0.15} />
      </mesh>

      {/* Street Centerline Markings (dashed yellow lines) */}
      {[-32, -24, -16, -8, 0, 8, 16, 24, 32, 40].map((xOffset) => (
        <mesh key={xOffset} position={[7 + xOffset, -0.575, 21.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.2, 0.28]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      ))}

      {/* Outer White Shoulder Lines */}
      <mesh position={[7, -0.574, 16.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 0.2]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[7, -0.574, 26.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 0.2]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* Concrete Curbs along the Street */}
      <mesh position={[7, -0.52, 16.2]} receiveShadow>
        <boxGeometry args={[44, 0.15, 0.35]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Front Landscaped Lawn & Garden Base */}
      <mesh position={[7, -0.5, 15.3]} receiveShadow>
        <boxGeometry args={[22, 0.12, 2.0]} />
        <meshStandardMaterial color="#1e3a2f" roughness={0.9} />
      </mesh>

      {/* Driveway Pavers / Asphalt Pad for the Team Sports Car & Basketball */}
      <mesh position={[12.4, -0.48, 15.4]} receiveShadow>
        <boxGeometry args={[6.8, 0.14, 3.8]} />
        <meshStandardMaterial color="#2d3748" roughness={0.75} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. FRONT ENTRANCE & SLIDING DOORS                            */}
      {/* ============================================================ */}
      {/* Front Entrance Concrete Steps */}
      <mesh position={[6.9, -0.38, 14.6]} receiveShadow>
        <boxGeometry args={[3.6, 0.14, 1.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.65} />
      </mesh>
      <mesh position={[6.9, -0.25, 14.2]} receiveShadow>
        <boxGeometry args={[3.2, 0.14, 0.8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>

      {/* Front Welcome Mat */}
      <mesh position={[6.9, -0.17, 14.0]}>
        <boxGeometry args={[1.8, 0.02, 0.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[6.9, -0.16, 14.0]}>
        <boxGeometry args={[1.4, 0.022, 0.5]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.7} />
      </mesh>

      {/* Modern Double Glass Sliding Doors */}
      <group position={[6.9, 1.3, 13.9]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 2.6, 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.58, 0, 0.01]}>
          <boxGeometry args={[1.1, 2.4, 0.04]} />
          <meshPhysicalMaterial
            color="#99f6e4"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.2}
            transmission={0.6}
            thickness={0.1}
          />
        </mesh>
        <mesh position={[0.58, 0, 0.01]}>
          <boxGeometry args={[1.1, 2.4, 0.04]} />
          <meshPhysicalMaterial
            color="#99f6e4"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.2}
            transmission={0.6}
            thickness={0.1}
          />
        </mesh>
        <mesh position={[-0.08, -0.1, 0.04]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, -0.1, 0.04]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. OUTDOOR COVERED PATIO DECK & BIG SCREEN TV                */}
      {/* ============================================================ */}
      <group position={[3.0, 0, 15.1]}>
        {/* Rich Cedar Timber Decking Platform */}
        <mesh position={[0, -0.42, 0]} receiveShadow>
          <boxGeometry args={[4.4, 0.16, 2.6]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.75} />
        </mesh>
        {/* Deck Slat Lines */}
        {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((dx) => (
          <mesh key={dx} position={[dx, -0.335, 0]}>
            <boxGeometry args={[0.04, 0.01, 2.56]} />
            <meshStandardMaterial color="#21100a" roughness={0.9} />
          </mesh>
        ))}

        {/* Modern Pergola Black Steel Posts */}
        {[
          [-2.1, -1.2],
          [2.1, -1.2],
          [-2.1, 1.2],
          [2.1, 1.2],
        ].map(([px, pz], idx) => (
          <mesh key={idx} position={[px, 0.75, pz]} castShadow>
            <boxGeometry args={[0.09, 2.4, 0.09]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Overhead Horizontal Pergola Roof Slats */}
        {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((sz) => (
          <mesh key={sz} position={[0, 1.96, sz]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[4.3, 0.06, 0.18]} />
            <meshStandardMaterial color="#542b18" roughness={0.7} />
          </mesh>
        ))}

        {/* 65" Outdoor Weatherproof Esports TV Screen on Stand */}
        <group position={[-1.75, 0, -0.2]}>
          {/* Base Stand & Media Pillar */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.2, 1.1, 0.55]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Back Chassis */}
          <mesh position={[0.05, 0.85, 0]} castShadow>
            <boxGeometry args={[0.06, 0.82, 1.4]} />
            <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Bezel Frame */}
          <mesh position={[0.08, 0.85, 0]}>
            <boxGeometry args={[0.02, 0.84, 1.42]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.2} />
          </mesh>
          {/* Glowing Animated TV Screen (facing +x toward the sofa) */}
          <mesh ref={tvScreenRef} position={[0.095, 0.85, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.36, 0.78]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.92} />
          </mesh>
          {/* TV Screen Broadcast Details */}
          <group position={[0.1, 0.85, 0]} rotation={[0, Math.PI / 2, 0]}>
            {/* Top Broadcast Bar */}
            <mesh position={[0, 0.32, 0]}>
              <planeGeometry args={[1.3, 0.08]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <mesh position={[-0.4, 0.32, 0.001]}>
              <planeGeometry args={[0.3, 0.05]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            {/* Health Bars: Dynasty Cyan vs Rival Red */}
            <mesh position={[-0.25, 0.22, 0.001]}>
              <planeGeometry args={[0.42, 0.05]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[0.25, 0.22, 0.001]}>
              <planeGeometry args={[0.42, 0.05]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            {/* Center Minimap & Arena Graphic */}
            <mesh position={[0, -0.08, 0.001]}>
              <planeGeometry args={[0.7, 0.42]} />
              <meshBasicMaterial color="#082f49" />
            </mesh>
            <mesh position={[0.05, -0.05, 0.002]}>
              <circleGeometry args={[0.03, 8]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            <mesh position={[-0.08, -0.12, 0.002]}>
              <circleGeometry args={[0.03, 8]} />
              <meshBasicMaterial color="#f43f5e" />
            </mesh>
          </group>

          {/* Ambient Screen Glow illuminating the Patio */}
          <pointLight position={[0.4, 0.85, 0]} color="#38bdf8" intensity={0.9} distance={3.8} />
        </group>

        {/* Outdoor Wicker Lounge Sofa facing the TV */}
        <group position={[0.3, -0.32, 0]}>
          {/* Wicker Base */}
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.32, 0.95]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0.75, 0.45, 0]} castShadow>
            <boxGeometry args={[0.18, 0.45, 0.95]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Plush Navy Cushions */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.35, 0.12, 0.85]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
          </mesh>
          {/* Cyan & Gold Accent Pillows */}
          <mesh position={[0.55, 0.48, -0.25]} rotation={[0, -0.2, 0.2]}>
            <boxGeometry args={[0.14, 0.26, 0.26]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.6} />
          </mesh>
          <mesh position={[0.55, 0.48, 0.25]} rotation={[0, 0.2, 0.2]}>
            <boxGeometry args={[0.14, 0.26, 0.26]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.6} />
          </mesh>
        </group>

        {/* Teak Low Coffee Table with Snacks & Cold Drinks */}
        <group position={[-0.8, -0.32, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.65, 0.24, 0.65]} />
            <meshStandardMaterial color="#65351a" roughness={0.7} />
          </mesh>
          {/* Cold Energy Drink Cans */}
          <mesh position={[-0.12, 0.28, -0.1]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0.28, 0.08]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Modern Stainless Steel BBQ Smoker Grill */}
        <group position={[-2.4, -0.32, 0.7]} rotation={[0, 0.4, 0]}>
          {/* Stainless Body Cabinet */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.55, 0.7, 0.75]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Domed Smoker Hood */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.75, 12, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Side Shelf */}
          <mesh position={[0.35, 0.6, 0]}>
            <boxGeometry args={[0.25, 0.04, 0.5]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 4. DRIVEWAY BASKETBALL HALF-COURT & PRO HOOP                 */}
      {/* ============================================================ */}
      <group position={[10.5, 0, 15.0]}>
        {/* Basketball Court Key Lines (painted white & cyan on driveway) */}
        <mesh position={[0, -0.405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 2.0]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
        {/* Free Throw Key Border Outline */}
        <mesh position={[0, -0.404, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.74, 24]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.404, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 0.05]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Heavy-Duty Basketball Hoop Post */}
        <group position={[0.3, -0.4, -0.5]}>
          {/* Padded Base */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.28, 0.8, 0.28]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          {/* Main Steel Pole */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[0.12, 2.4, 0.12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Overhang Extension Arm */}
          <mesh position={[0, 2.45, 0.35]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Clear Acrylic Backboard */}
          <group position={[0, 2.65, 0.72]}>
            <mesh castShadow>
              <boxGeometry args={[1.3, 0.85, 0.04]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.55}
                roughness={0.1}
                metalness={0.2}
                transmission={0.7}
              />
            </mesh>
            {/* Red Target Inner Box */}
            <mesh position={[0, -0.1, 0.025]}>
              <planeGeometry args={[0.45, 0.35]} />
              <meshBasicMaterial color="#ef4444" wireframe />
            </mesh>
            {/* Orange Breakaway Rim */}
            <mesh position={[0, -0.22, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.02, 10, 20]} />
              <meshStandardMaterial color="#ea580c" roughness={0.4} />
            </mesh>
            {/* White Nylon Net */}
            <mesh position={[0, -0.38, 0.25]}>
              <cylinderGeometry args={[0.19, 0.08, 0.32, 10, 1, true]} />
              <meshStandardMaterial color="#ffffff" wireframe />
            </mesh>
          </group>
        </group>

        {/* Orange Basketball on Court */}
        <mesh position={[-0.4, -0.34, 0.4]} castShadow>
          <sphereGeometry args={[0.11, 14, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.75} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 5. TEAM SPORTS CAR (PARKED ON DRIVEWAY)                      */}
      {/* ============================================================ */}
      <group position={[13.2, -0.4, 15.6]} rotation={[0, -0.22, 0]}>
        <group ref={carRef}>
          {/* Neon Underglow Glow Plane */}
          <mesh ref={underglowRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 4.8]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.45} />
          </mesh>

          {/* Main Aerodynamic Body Chassis */}
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.45, 4.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Sculpted Hood with Air Vent Accents */}
          <mesh position={[0, 0.52, 1.0]} castShadow>
            <boxGeometry args={[1.9, 0.16, 1.8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.61, 1.0]}>
            <boxGeometry args={[0.7, 0.02, 0.8]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Front Bumper & Carbon Splitter */}
          <mesh position={[0, 0.22, 2.15]} castShadow>
            <boxGeometry args={[2.1, 0.14, 0.4]} />
            <meshStandardMaterial color="#090d16" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.14, 2.22]} castShadow>
            <boxGeometry args={[2.24, 0.04, 0.35]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
          </mesh>

          {/* High-Tech Xenon Headlights */}
          <mesh position={[-0.8, 0.48, 2.16]}>
            <boxGeometry args={[0.42, 0.14, 0.06]} />
            <meshBasicMaterial color={isTournamentUnderway ? '#67e8f9' : '#a5f3fc'} />
          </mesh>
          <mesh position={[0.8, 0.48, 2.16]}>
            <boxGeometry args={[0.42, 0.14, 0.06]} />
            <meshBasicMaterial color={isTournamentUnderway ? '#67e8f9' : '#a5f3fc'} />
          </mesh>

          {/* Cabin Greenhouse & Tinted Windshield */}
          <mesh position={[0, 0.92, -0.32]} castShadow>
            <boxGeometry args={[1.7, 0.55, 2.1]} />
            <meshPhysicalMaterial
              color="#020617"
              roughness={0.1}
              metalness={0.9}
              transmission={0.3}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Aerodynamic Roof Scoop */}
          <mesh position={[0, 1.22, -0.2]}>
            <boxGeometry args={[0.5, 0.08, 0.9]} />
            <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Rear Aggressive GT Wing / Spoiler */}
          <mesh position={[0, 1.1, -1.95]} castShadow>
            <boxGeometry args={[2.1, 0.06, 0.45]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[-0.7, 0.85, -1.95]}>
            <boxGeometry args={[0.06, 0.45, 0.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.7, 0.85, -1.95]}>
            <boxGeometry args={[0.06, 0.45, 0.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Rear LED Light Strip (Cyberpunk Red Tail Light) */}
          <mesh position={[0, 0.52, -2.21]}>
            <boxGeometry args={[1.9, 0.08, 0.05]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          {/* Dual Chrome Exhaust Pipes */}
          <group ref={exhaustRef} position={[0, 0.24, -2.22]}>
            <mesh position={[-0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.14, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.14, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>

          {/* 4 Wheels (Alloy Rims + Red Brake Calipers) */}
          {[
            [-1.02, 0.32, 1.25],
            [1.02, 0.32, 1.25],
            [-1.02, 0.34, -1.35],
            [1.02, 0.34, -1.35],
          ].map(([wx, wy, wz], idx) => (
            <group key={idx} position={[wx, wy, wz]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.34, 0.34, 0.28, 18]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.24, 0.24, 0.29, 12]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.1, 0.14, 0.12]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ============================================================ */}
      {/* 6. ANIMATED LIVING STREET TRAFFIC (DRIVING CARS & VANS)      */}
      {/* ============================================================ */}
      {/* Traffic Car 1: Sleek Electric Sedan traveling East (+x, z = 23.5) */}
      <group ref={trafficCar1Ref} position={[-20, -0.4, 23.5]}>
        {/* Main Body */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[3.8, 0.44, 1.9]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Roof Cabin */}
        <mesh position={[-0.2, 0.82, 0]} castShadow>
          <boxGeometry args={[2.1, 0.48, 1.55]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Headlights (facing +x) */}
        <mesh position={[1.91, 0.4, 0.6]}>
          <boxGeometry args={[0.04, 0.14, 0.38]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[1.91, 0.4, -0.6]}>
          <boxGeometry args={[0.04, 0.14, 0.38]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Taillights (facing -x) */}
        <mesh position={[-1.91, 0.4, 0]}>
          <boxGeometry args={[0.04, 0.1, 1.6]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Wheels */}
        {[
          [1.1, 0.28, 0.95],
          [-1.1, 0.28, 0.95],
          [1.1, 0.28, -0.95],
          [-1.1, 0.28, -0.95],
        ].map(([wx, wy, wz], idx) => (
          <mesh key={idx} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Traffic Car 2: Esports Delivery Van traveling West (-x, z = 19.5) */}
      <group ref={trafficCar2Ref} position={[25, -0.4, 19.5]} rotation={[0, Math.PI, 0]}>
        {/* High-Roof Van Cargo Body */}
        <mesh position={[-0.3, 0.8, 0]} castShadow>
          <boxGeometry args={[4.2, 1.25, 2.1]} />
          <meshStandardMaterial color="#0891b2" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Front Cab */}
        <mesh position={[1.7, 0.65, 0]} castShadow>
          <boxGeometry args={[1.2, 0.95, 2.05]} />
          <meshStandardMaterial color="#0e7490" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Windshield */}
        <mesh position={[1.8, 0.88, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.04, 0.55, 1.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        {/* Headlights (facing +x local, -x global) */}
        <mesh position={[2.31, 0.45, 0.7]}>
          <boxGeometry args={[0.04, 0.16, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[2.31, 0.45, -0.7]}>
          <boxGeometry args={[0.04, 0.16, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Red Brake Lights */}
        <mesh position={[-2.41, 0.55, 0.75]}>
          <boxGeometry args={[0.04, 0.4, 0.2]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        <mesh position={[-2.41, 0.55, -0.75]}>
          <boxGeometry args={[0.04, 0.4, 0.2]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        {/* 4 Van Wheels */}
        {[
          [1.3, 0.3, 1.05],
          [-1.4, 0.3, 1.05],
          [1.3, 0.3, -1.05],
          [-1.4, 0.3, -1.05],
        ].map(([wx, wy, wz], idx) => (
          <mesh key={idx} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.25, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 7. SUBURBAN NEIGHBORHOOD HOUSES (ACROSS THE STREET)          */}
      {/* ============================================================ */}
      {/* House 1: Contemporary Two-Story Villa (Left, x = -10, z = 32) */}
      <group position={[-10, -0.5, 32]}>
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[9, 4.4, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[1, 4.5, 0]}>
          <boxGeometry args={[7, 0.2, 8.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Warm Illuminated Windows */}
        <mesh position={[-2, 1.5, -4.01]}>
          <planeGeometry args={[2.2, 1.6]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[2, 3.2, -4.01]}>
          <planeGeometry args={[3.2, 1.4]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      </group>

      {/* House 2: Modernist Gable Home (Center, x = 11, z = 34) */}
      <group position={[11, -0.5, 34]}>
        <mesh position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[10, 4.0, 7]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Pitched Roof */}
        <mesh position={[0, 4.5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[3.5, 3.5, 7.2]} />
          <meshStandardMaterial color="#090d16" roughness={0.4} />
        </mesh>
        {/* Warm Windows */}
        <mesh position={[-1.5, 1.8, -3.51]}>
          <planeGeometry args={[2.4, 1.6]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[2.5, 1.8, -3.51]}>
          <planeGeometry args={[2.0, 1.6]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      </group>

      {/* House 3: Sleek Dark Contemporary Residence (Right, x = 32, z = 31) */}
      <group position={[32, -0.5, 31]}>
        <mesh position={[0, 2.4, 0]} castShadow>
          <boxGeometry args={[8.5, 4.8, 8]} />
          <meshStandardMaterial color="#1e2229" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.5, -4.01]}>
          <planeGeometry args={[4.2, 2.2]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      </group>

      {/* Attached glass team garage: the vehicle evolves with the fleet tier. */}
      <group position={[16.2, -0.45, 11.2]}>
        <mesh position={[0, 1.65, 0]} castShadow><boxGeometry args={[6.8, 3.4, 5.6]} /><meshStandardMaterial color="#334155" roughness={0.72} /></mesh>
        <mesh position={[0, 1.55, -2.83]}><boxGeometry args={[5.5, 2.55, 0.05]} /><meshPhysicalMaterial color="#bae6fd" transparent opacity={0.38} transmission={0.45} /></mesh>
        {[-2, -1, 0, 1, 2].map(x => <mesh key={x} position={[x, 1.55, -2.88]}><boxGeometry args={[0.035, 2.5, 0.06]} /><meshStandardMaterial color="#e2e8f0" metalness={0.85} /></mesh>)}
        <mesh position={[-2.65, 0.75, 1.8]}><boxGeometry args={[0.7, 1.5, 0.45]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[-2.65, 1.58, 1.8]}><boxGeometry args={[0.62, 0.12, 0.48]} /><meshBasicMaterial color="#22c55e" /></mesh>
        <group position={[0.4, 0.08, 0.2]}>
          <mesh position={[0, empire.fleetTier === 3 ? 0.82 : 0.48, 0]} castShadow><boxGeometry args={[empire.fleetTier === 1 ? 3.1 : empire.fleetTier === 2 ? 4.7 : 5.4, empire.fleetTier === 1 ? 0.55 : empire.fleetTier === 2 ? 1.2 : 1.65, 1.85]} /><meshStandardMaterial color={empire.branding.primaryColor} metalness={0.65} roughness={0.24} /></mesh>
          <mesh position={[0, empire.fleetTier === 3 ? 1.6 : empire.fleetTier === 2 ? 1.22 : 0.88, -0.05]}><boxGeometry args={[empire.fleetTier === 1 ? 1.6 : empire.fleetTier === 2 ? 2.4 : 3.5, 0.45, 1.55]} /><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.12} /></mesh>
          {[-1, 1].map(x => <mesh key={x} position={[x * (empire.fleetTier === 3 ? 2 : 1.25), 0.3, 1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.34, 0.34, 0.24, 12]} /><meshStandardMaterial color="#020617" /></mesh>)}
        </group>
      </group>

      {/* Across-the-street district: Mart -> Plaza/Park -> Tech Promenade. */}
      <group position={[7, -0.45, 31.2]}>
        <mesh position={[0, 0, -4.1]}><boxGeometry args={[34, 0.12, 2.2]} /><meshStandardMaterial color="#cbd5e1" roughness={0.9} /></mesh>
        {[-1.4, -0.7, 0, 0.7, 1.4].map(x => <mesh key={x} position={[x, 0.08, -4.1]}><boxGeometry args={[0.42, 0.03, 2.0]} /><meshBasicMaterial color="#f8fafc" /></mesh>)}
        <group position={[-9, 0, 0]}>
          <mesh position={[0, 1.7, 0]} castShadow><boxGeometry args={[7, 3.4, 4.8]} /><meshStandardMaterial color={empire.districtTier === 3 ? '#172554' : '#f1f5f9'} /></mesh>
          <mesh position={[0, 2.45, -2.43]}><boxGeometry args={[5.8, 0.65, 0.06]} /><meshBasicMaterial color={empire.branding.accentColor} /></mesh>
          <mesh position={[0, 2.45, -2.48]}><planeGeometry args={[4.6, 0.35]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>
        {empire.districtTier >= 2 && <group position={[2, 0, 0]}>
          <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[2.6, 2.6, 0.25, 24]} /><meshStandardMaterial color="#86efac" /></mesh>
          <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.75, 0.85, 0.32, 20]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.16, 0.16, 0.35, 12]} /><meshBasicMaterial color="#67e8f9" /></mesh>
          <mesh position={[4, 1.75, 0]}><boxGeometry args={[3.5, 2.7, 3.5]} /><meshStandardMaterial color="#78350f" /></mesh>
          <mesh position={[4, 2.5, -1.76]}><boxGeometry args={[3.7, 0.35, 0.04]} /><meshBasicMaterial color="#f472b6" /></mesh>
        </group>}
        {empire.districtTier >= 3 && <group position={[11, 0, 0]}>
          <mesh position={[0, 2.4, 0]}><boxGeometry args={[8, 4.8, 5]} /><meshStandardMaterial color="#0f172a" metalness={0.45} /></mesh>
          <mesh position={[0, 2.8, -2.55]}><boxGeometry args={[6.8, 1, 0.04]} /><meshBasicMaterial color={empire.branding.primaryColor} /></mesh>
          <mesh position={[0, 3.8, -2.58]}><planeGeometry args={[5.8, 0.35]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>}
      </group>
      {Array.from({ length: fanCount }, (_, index) => <FanWalker key={index} index={index} density={empire.districtTier} />)}

      {/* Street Lamps along the Far Sidewalk */}
      {[-20, 2, 24].map((lx) => (
        <group key={lx} position={[lx, -0.5, 27]}>
          <mesh position={[0, 2.6, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 5.2, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Overhang Lantern */}
          <mesh position={[0.4, 5.1, 0]}>
            <boxGeometry args={[0.9, 0.12, 0.25]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.7, 4.95, 0]}>
            <boxGeometry args={[0.3, 0.16, 0.22]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <pointLight position={[0.7, 4.8, 0]} color="#fde047" intensity={0.65} distance={7} />
        </group>
      ))}

      {/* ============================================================ */}
      {/* 8. LANDSCAPED PLANTERS WITH LUSH SHRUBS                      */}
      {/* ============================================================ */}
      {[
        [-1.2, 15.6],
        [5.8, 15.8],
        [8.2, 15.8],
        [15.8, 15.6],
        [-1.2, 8.5],
        [-1.2, 1.5],
        [15.2, 1.5],
        [15.2, 8.5],
      ].map(([px, pz], idx) => (
        <group key={idx} position={[px, -0.45, pz]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.9, 0.5, 0.9]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.51, 0]}>
            <boxGeometry args={[0.82, 0.04, 0.82]} />
            <meshStandardMaterial color="#2d2218" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow>
            <sphereGeometry args={[0.42, 10, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#15803d' : '#166534'} roughness={0.85} />
          </mesh>
          <mesh position={[-0.1, 1.15, 0.05]} castShadow>
            <sphereGeometry args={[0.26, 8, 6]} />
            <meshStandardMaterial color="#22c55e" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
