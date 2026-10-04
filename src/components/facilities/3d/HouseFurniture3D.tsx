import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Facility, FacilityId } from '../../../core/types/facility.types';
import { useGameStore } from '../../../core/store/useGameStore';

interface HouseFurniture3DProps {
  facilities: Record<FacilityId, Facility>;
}

// -------------------------------------------------------------
// CONSTRUCTION / LOCKED ROOM BARRIERS & PROPS
// -------------------------------------------------------------
function ConstructionZone({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const cx = x + w / 2;
  const cz = z + d / 2;

  return (
    <group position={[cx, 0, cz]}>
      {/* Bare concrete subfloor markings (chalk crosshatch) */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.4, d - 0.4]} />
        <meshStandardMaterial color="#a8b8c8" roughness={0.95} />
      </mesh>

      {/* Wooden Cargo Pallet with Cardboard Gear Crates */}
      <group position={[-0.8, 0, -0.6]}>
        {/* Pallet base */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[1.5, 0.14, 1.3]} />
          <meshStandardMaterial color="#854d0e" roughness={0.9} />
        </mesh>
        {/* Shipping Crates */}
        <mesh position={[-0.3, 0.45, -0.2]} castShadow>
          <boxGeometry args={[0.7, 0.6, 0.65]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 0.4, 0.1]} castShadow>
          <boxGeometry args={[0.65, 0.5, 0.7]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
        {/* "FRAGILE / ESPORTS RIGS" Label on Crate */}
        <mesh position={[-0.3, 0.5, 0.13]}>
          <planeGeometry args={[0.35, 0.2]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      </group>

      {/* Heavy-Duty Timber Sawhorse */}
      <group position={[0.7, 0, 0.5]}>
        {/* Top crossbeam */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[1.4, 0.1, 0.14]} />
          <meshStandardMaterial color="#a16207" roughness={0.85} />
        </mesh>
        {/* Angled A-frame legs */}
        {[-0.5, 0.5].map((lx, i) => (
          <group key={i} position={[lx, 0.32, 0]}>
            <mesh position={[0, 0, -0.2]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.68, 0.08]} />
              <meshStandardMaterial color="#854d0e" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0, 0.2]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.68, 0.08]} />
              <meshStandardMaterial color="#854d0e" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* High-Visibility Orange Traffic Safety Cones */}
      {[
        [-w / 2 + 0.9, -d / 2 + 0.9],
        [w / 2 - 0.9, -d / 2 + 0.9],
        [0, d / 2 - 0.8],
      ].map(([coneX, coneZ], idx) => (
        <group key={idx} position={[coneX, 0, coneZ]}>
          {/* Base */}
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.36, 0.05, 0.36]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
          {/* Cone body */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.15, 0.6, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.6} />
          </mesh>
          {/* Reflective White Stripes */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.105, 0.12, 0.1, 12]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.065, 0.08, 0.08, 12]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}

      {/* Aluminum Stepladder */}
      <group position={[w / 2 - 1.2, 0, -d / 2 + 1.1]}>
        <mesh position={[-0.2, 0.55, 0]} rotation={[0, 0, 0.18]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, 0.55, 0]} rotation={[0, 0, -0.18]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Steps */}
        {[0.3, 0.55, 0.8, 1.05].map((sy) => (
          <mesh key={sy} position={[0, sy, 0]}>
            <boxGeometry args={[0.38 - sy * 0.18, 0.04, 0.14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Heavy-Duty Metal Toolbox */}
      <mesh position={[0.2, 0.14, -0.4]} castShadow>
        <boxGeometry args={[0.48, 0.25, 0.26]} />
        <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Prominent "CONSTRUCTION · OPENING SOON" Barricade Sign */}
      <group position={[0, 0, d / 2 - 0.4]}>
        {/* Frame Feet */}
        <mesh position={[-0.7, 0.03, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.5]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.7, 0.03, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.5]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Upright posts */}
        <mesh position={[-0.7, 0.45, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.84, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.7, 0.45, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.84, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Signboard Panel */}
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[1.5, 0.48, 0.04]} />
          <meshStandardMaterial color="#facc15" roughness={0.5} />
        </mesh>
        {/* Black & Yellow Hazard Stripes */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((sx, i) => (
          <mesh key={i} position={[sx, 0.58, 0.025]} rotation={[0, 0, 0.4]}>
            <planeGeometry args={[0.08, 0.5]} />
            <meshBasicMaterial color="#090d16" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// DETAILED SCRIM LAB GAMING BATTLESTATION
// -------------------------------------------------------------
function BattlestationRig({
  x,
  z,
  upgraded = false,
}: {
  x: number;
  z: number;
  upgraded?: boolean;
}) {
  const fanRef = useRef<Group>(null);

  // Subtle cooling fan rotation inside PC
  useFrame(({ clock }) => {
    if (fanRef.current) {
      fanRef.current.rotation.z = clock.elapsedTime * 15;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Carbon Fiber Desk Top */}
      <mesh position={[0.72, 0.68, 0.48]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.07, 0.94]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* Desk Underglow RGB Strip */}
      <mesh position={[0.72, 0.64, 0.94]}>
        <boxGeometry args={[1.42, 0.015, 0.015]} />
        <meshBasicMaterial color={upgraded ? '#a855f7' : '#06b6d4'} />
      </mesh>

      {/* Sleek K-Frame Angular Metal Legs */}
      <mesh position={[0.1, 0.34, 0.48]} castShadow>
        <boxGeometry args={[0.08, 0.66, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.34, 0.34, 0.48]} castShadow>
        <boxGeometry args={[0.08, 0.66, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Lower Crossbar Stretcher */}
      <mesh position={[0.72, 0.16, 0.2]}>
        <boxGeometry args={[1.2, 0.04, 0.04]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Dual Curved Ultrawide Monitors on Articulated Arms */}
      {/* Center Main High-Refresh Esports Monitor */}
      <group position={[0.62, 0.72, 0.2]}>
        {/* Heavy-Duty Metal Gas-Spring Arm */}
        <mesh position={[0, 0.22, -0.05]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.42, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Monitor Bezel */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.82, 0.48, 0.04]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Esports Gameplay Display Screen */}
        <mesh position={[0, 0.45, 0.022]}>
          <planeGeometry args={[0.78, 0.44]} />
          <meshStandardMaterial
            color={upgraded ? '#3b0764' : '#032030'}
            roughness={0.2}
            emissive={upgraded ? '#581c87' : '#083344'}
            emissiveIntensity={0.65}
          />
        </mesh>

        {/* --- IN-GAME FPS HUD GRAPHICS --- */}
        {/* Arena corridor 3D perspective backdrop */}
        <mesh position={[0, 0.42, 0.023]}>
          <planeGeometry args={[0.74, 0.32]} />
          <meshBasicMaterial color={upgraded ? '#2e1065' : '#0f172a'} />
        </mesh>
        {/* Tactical arena floor grid */}
        <mesh position={[0, 0.31, 0.024]}>
          <planeGeometry args={[0.74, 0.12]} />
          <meshBasicMaterial color={upgraded ? '#3b0764' : '#1e293b'} />
        </mesh>
        {/* First-person weapon viewmodel on right */}
        <mesh position={[0.22, 0.32, 0.025]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.18, 0.06, 0.005]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <mesh position={[0.26, 0.35, 0.026]}>
          <boxGeometry args={[0.04, 0.015, 0.005]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>

        {/* Center Crosshair with 4 tick reticles */}
        <group position={[0, 0.45, 0.026]}>
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[0.006, 8]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <mesh position={[-0.018, 0, 0]}>
            <planeGeometry args={[0.012, 0.003]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <mesh position={[0.018, 0, 0]}>
            <planeGeometry args={[0.012, 0.003]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <mesh position={[0, 0.018, 0]}>
            <planeGeometry args={[0.003, 0.012]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <mesh position={[0, -0.018, 0]}>
            <planeGeometry args={[0.003, 0.012]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
        </group>

        {/* Minimap Radar UI on Top-Left with scan ping */}
        <group position={[-0.26, 0.55, 0.025]}>
          <mesh>
            <circleGeometry args={[0.065, 16]} />
            <meshBasicMaterial color="#022c22" />
          </mesh>
          <mesh>
            <ringGeometry args={[0.062, 0.065, 16]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0.015, 0.01, 0.001]}>
            <circleGeometry args={[0.009, 8]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          <mesh position={[-0.02, -0.015, 0.001]}>
            <circleGeometry args={[0.008, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Top Center Round Timer & Score: 12 - 10 */}
        <group position={[0, 0.61, 0.025]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.18, 0.04]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh position={[-0.04, 0, 0.001]}>
            <planeGeometry args={[0.045, 0.02]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          <mesh position={[0.04, 0, 0.001]}>
            <planeGeometry args={[0.045, 0.02]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Top-Right Killfeed Entry */}
        <group position={[0.24, 0.61, 0.025]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.16, 0.03]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[-0.04, 0, 0.001]}>
            <planeGeometry args={[0.05, 0.015]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          <mesh position={[0.04, 0, 0.001]}>
            <planeGeometry args={[0.04, 0.015]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Bottom-Left Health & Armor Bars: 100 HP | 50 AP */}
        <group position={[-0.24, 0.28, 0.025]}>
          <mesh position={[0, 0.015, 0]}>
            <planeGeometry args={[0.18, 0.018]} />
            <meshBasicMaterial color="#14532d" />
          </mesh>
          <mesh position={[-0.01, 0.015, 0.001]}>
            <planeGeometry args={[0.16, 0.014]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <planeGeometry args={[0.18, 0.014]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
          <mesh position={[-0.03, -0.01, 0.001]}>
            <planeGeometry args={[0.12, 0.01]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Bottom-Right Ammo Counter: 30 / 90 */}
        <group position={[0.26, 0.28, 0.025]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.12, 0.028]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh position={[-0.02, 0, 0.001]}>
            <planeGeometry args={[0.04, 0.016]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.03, 0, 0.001]}>
            <planeGeometry args={[0.03, 0.012]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      </group>

      {/* Secondary Angled Strategy / Chat Monitor */}
      <group position={[1.18, 0.72, 0.26]} rotation={[0, -0.42, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.55, 0.44, 0.04]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.42, 0.022]}>
          <planeGeometry args={[0.52, 0.41]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#4338ca"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* Discord Voice & Team Comms Bubbles */}
        <group position={[0, 0.42, 0.024]}>
          {[-0.14, -0.05, 0.04, 0.13].map((vy, i) => (
            <group key={i} position={[-0.16, vy, 0]}>
              <mesh>
                <circleGeometry args={[0.025, 12]} />
                <meshBasicMaterial color={i === 0 ? '#22c55e' : '#475569'} />
              </mesh>
              <mesh position={[0.12, 0, 0]}>
                <planeGeometry args={[0.16, 0.015]} />
                <meshBasicMaterial color={i === 0 ? '#38bdf8' : '#64748b'} />
              </mesh>
            </group>
          ))}
          {/* Tactical map telemetry mini graph on lower half */}
          <mesh position={[0, -0.12, 0]}>
            <planeGeometry args={[0.42, 0.1]} />
            <meshBasicMaterial color="#090d16" />
          </mesh>
          <mesh position={[-0.08, -0.12, 0.001]}>
            <planeGeometry args={[0.18, 0.04]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        </group>
      </group>

      {/* Extended Gaming Desk Pad */}
      <mesh position={[0.72, 0.72, 0.6]}>
        <boxGeometry args={[0.9, 0.01, 0.46]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Mechanical RGB Keyboard with Keycap Rows */}
      <mesh position={[0.58, 0.732, 0.65]}>
        <boxGeometry args={[0.42, 0.018, 0.16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.58, 0.742, 0.65]}>
        <boxGeometry args={[0.38, 0.008, 0.13]} />
        <meshBasicMaterial color={upgraded ? '#c084fc' : '#22d3ee'} />
      </mesh>

      {/* Ergonomic Optical Gaming Mouse */}
      <mesh position={[0.94, 0.732, 0.65]}>
        <boxGeometry args={[0.09, 0.024, 0.14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Liquid-Cooled Gaming PC Tower */}
      <group position={[0.15, 0.72, 0.28]}>
        {/* Chassis */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.24, 0.58, 0.54]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Tempered Glass Side Panel */}
        <mesh position={[0.125, 0.3, 0]}>
          <planeGeometry args={[0.5, 0.52]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.9}
            transmission={0.8}
          />
        </mesh>
        {/* Internal Illuminated GPU */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.32]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.4} />
        </mesh>
        {/* Glowing RAM RGB Bars */}
        <mesh position={[-0.04, 0.42, -0.06]}>
          <boxGeometry args={[0.02, 0.1, 0.08]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        {/* Dual Front Radiator Intake Fans */}
        <group ref={fanRef} position={[0, 0.32, 0.27]}>
          <mesh>
            <circleGeometry args={[0.09, 8]} />
            <meshBasicMaterial color={upgraded ? '#a855f7' : '#06b6d4'} />
          </mesh>
        </group>
      </group>

      {/* Ergonomic Racing Gaming Chair */}
      <group position={[0.74, 0, 1.2]}>
        {/* 5-Star Wheeled Base with Dual Casters */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Hydraulic Gas-Lift Piston */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.34, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Bucket Seat Base Cushion with Side Bolsters */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.48]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Contrast Trim Piping */}
        <mesh position={[0, 0.44, 0.23]}>
          <boxGeometry args={[0.48, 0.08, 0.03]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.4} />
        </mesh>
        {/* Tall Racing Backrest with Wing Bolsters */}
        <mesh position={[0, 0.82, 0.22]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.68, 0.09]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        {/* Harness Cutout Accents */}
        <mesh position={[0, 1.05, 0.25]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.1]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Memory Foam Lumbar Cushion */}
        <mesh position={[0, 0.6, 0.18]}>
          <boxGeometry args={[0.34, 0.14, 0.07]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.6} />
        </mesh>
        {/* 3D Padded Armrests */}
        <mesh position={[-0.27, 0.58, 0.05]}>
          <boxGeometry args={[0.07, 0.26, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <mesh position={[0.27, 0.58, 0.05]}>
          <boxGeometry args={[0.07, 0.26, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// STREAM STUDIO (PODS, LIGHTING, LOUNGE SOFA)
// -------------------------------------------------------------
function StreamStudioContent({ level }: { level: number }) {
  return (
    <group position={[7.4, 0, 0.4]}>
      {/* Acoustic Foam Pyramid Sound Diffusers on Rear Wall */}
      <group position={[3.1, 1.8, 0.05]}>
        {[-2.2, -1.1, 0, 1.1, 2.2].map((ax, i) => (
          <group key={i} position={[ax, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.9, 1.1, 0.06]} />
              <meshStandardMaterial color="#181226" roughness={0.95} />
            </mesh>
            {/* Pyramid acoustic tile shapes */}
            {[-0.25, 0.25].map((px, j) => (
              <mesh key={j} position={[px, 0, 0.04]} rotation={[0, 0, Math.PI / 4]}>
                <coneGeometry args={[0.18, 0.08, 4]} />
                <meshStandardMaterial color="#3b1d5c" roughness={0.9} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Glowing Neon "LIVE" Wall Sign */}
      <group position={[3.1, 2.3, 0.1]}>
        <mesh>
          <boxGeometry args={[1.2, 0.4, 0.04]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Neon Lettering Glow */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.0, 0.28]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
      </group>

      {/* 3 Stream Pods (Unlocked based on level: L1, L3, L6) */}
      {[0, 1, 2].map((k) => {
        const minLevel = [1, 3, 6][k];
        if (level < minLevel) return null;
        const dx = 0.7 + 1.85 * k;

        return (
          <group key={k} position={[dx, 0, 0.6]}>
            {/* Broadcast Desk */}
            <mesh position={[0.72, 0.68, 0.48]} castShadow>
              <boxGeometry args={[1.44, 0.07, 0.94]} />
              <meshStandardMaterial color="#181226" roughness={0.35} metalness={0.6} />
            </mesh>
            {/* Purple LED Desk Lip */}
            <mesh position={[0.72, 0.64, 0.94]}>
              <boxGeometry args={[1.42, 0.015, 0.015]} />
              <meshBasicMaterial color="#a855f7" />
            </mesh>

            {/* Triple Monitor Streamer Setup */}
            <group position={[0.72, 0.72, 0.2]}>
              {/* Center Main Screen */}
              <mesh position={[0, 0.42, 0]} castShadow>
                <boxGeometry args={[0.76, 0.46, 0.04]} />
                <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.42, 0.022]}>
                <planeGeometry args={[0.72, 0.42]} />
                <meshStandardMaterial color="#3b0764" emissive="#7e22ce" emissiveIntensity={0.6} />
              </mesh>
              {/* Left Vertical Stream Chat Monitor */}
              <mesh position={[-0.48, 0.44, 0.08]} rotation={[0, 0.45, 0]}>
                <boxGeometry args={[0.3, 0.52, 0.03]} />
                <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[-0.48, 0.44, 0.098]} rotation={[0, 0.45, 0]}>
                <planeGeometry args={[0.27, 0.48]} />
                <meshBasicMaterial color="#1e1b4b" />
              </mesh>
            </group>

            {/* Broadcast Condenser Mic on Articulated Scissor Boom Arm */}
            <group position={[0.25, 0.72, 0.42]}>
              {/* Scissor Arm */}
              <mesh position={[0, 0.25, 0]} rotation={[0.4, 0, 0.3]}>
                <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Condenser Capsule */}
              <mesh position={[0.1, 0.44, 0.15]}>
                <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Circular Pop Filter */}
              <mesh position={[0.1, 0.44, 0.22]}>
                <ringGeometry args={[0.04, 0.05, 16]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
            </group>

            {/* Telescoping Ring Light on Stand */}
            <group position={[1.4, 0, 0.3]}>
              <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.02, 0.025, 1.8, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Glowing Halo Ring */}
              <mesh position={[0, 1.8, 0]}>
                <torusGeometry args={[0.25, 0.04, 12, 24]} />
                <meshBasicMaterial color="#fef08a" />
              </mesh>
            </group>

            {/* Stream Deck Console */}
            <mesh position={[0.42, 0.73, 0.65]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.2, 0.04, 0.14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Streamer Luxury Chair */}
            <group position={[0.74, 0, 1.22]}>
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.04, 5]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.44, 0]} castShadow>
                <boxGeometry args={[0.5, 0.1, 0.48]} />
                <meshStandardMaterial color="#3b1d5c" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.82, 0.22]} rotation={[-0.1, 0, 0]} castShadow>
                <boxGeometry args={[0.48, 0.68, 0.09]} />
                <meshStandardMaterial color="#241238" roughness={0.7} />
              </mesh>
              {/* Memory Foam Headrest */}
              <mesh position={[0, 1.14, 0.25]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.28, 0.14, 0.08]} />
                <meshStandardMaterial color="#a855f7" roughness={0.6} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Studio Lounge Sofa (Break Spot at x=9.4-7.4=2.0, z=4.55-0.4=4.15) */}
      <group position={[2.6, 0, 4.15]}>
        {/* Main Deep Sofa Cushion */}
        <mesh position={[0.9, 0.32, 0]} castShadow>
          <boxGeometry args={[2.5, 0.38, 0.9]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.8} />
        </mesh>
        {/* Sofa Backrest */}
        <mesh position={[0.9, 0.64, -0.36]} castShadow>
          <boxGeometry args={[2.5, 0.48, 0.24]} />
          <meshStandardMaterial color="#3b1d5c" roughness={0.85} />
        </mesh>
        {/* Side Armrests */}
        <mesh position={[-0.3, 0.48, 0]}>
          <boxGeometry args={[0.22, 0.42, 0.9]} />
          <meshStandardMaterial color="#2e1065" roughness={0.85} />
        </mesh>
        <mesh position={[2.1, 0.48, 0]}>
          <boxGeometry args={[0.22, 0.42, 0.9]} />
          <meshStandardMaterial color="#2e1065" roughness={0.85} />
        </mesh>
        {/* Accent Throw Pillows */}
        <mesh position={[0.1, 0.48, -0.18]} rotation={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.32, 0.32, 0.12]} />
          <meshStandardMaterial color="#c084fc" roughness={0.7} />
        </mesh>
        <mesh position={[1.7, 0.48, -0.18]} rotation={[0.2, -0.3, 0]}>
          <boxGeometry args={[0.32, 0.32, 0.12]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.7} />
        </mesh>

        {/* Low Minimalist Glass-Top Coffee Table */}
        <group position={[0.9, 0, 0.85]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.5, 0.05, 0.55]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              transparent
              opacity={0.5}
              roughness={0.1}
              metalness={0.2}
              transmission={0.8}
            />
          </mesh>
          {[-0.65, 0.65].map((tx, ti) => (
            <mesh key={ti} position={[tx, 0.1, 0]}>
              <boxGeometry args={[0.06, 0.2, 0.45]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}
          {/* Coffee Mug */}
          <mesh position={[0.2, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// STRATEGY / ANALYST WAR ROOM
// -------------------------------------------------------------
function AnalystRoomContent({ level }: { level: number }) {
  return (
    <group position={[0.4, 0, 7.5]}>
      {/* Massive 3x2 Video Wall Display (Tactical Map, Stats, Telemetry) */}
      <group position={[0.08, 1.5, 2.7]}>
        {/* Frame Bezel */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 2.2, 3.8]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* 6 High-Res Tactical Display Panels */}
        {[-1.2, 0, 1.2].flatMap((pz) =>
          [-0.5, 0.5].map((py) => (
            <mesh key={`${pz}-${py}`} position={[0.045, py, pz]}>
              <planeGeometry args={[0.01, 0.94]} />
              <meshStandardMaterial
                color="#0369a1"
                emissive="#0284c7"
                emissiveIntensity={0.65}
                roughness={0.25}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Long Executive Walnut Conference War Table */}
      <group position={[2.9, 0, 2.9]}>
        {/* Boat-Shaped Table Top */}
        <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.08, 1.65]} />
          <meshStandardMaterial color="#451a03" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Brushed-Metal Inset Power / Cable Trough */}
        <mesh position={[0, 0.722, 0]}>
          <boxGeometry args={[2.2, 0.01, 0.14]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Heavy Table Base Pedestals */}
        {[-1.0, 1.0].map((px, i) => (
          <mesh key={i} position={[px, 0.32, 0]} castShadow>
            <boxGeometry args={[0.3, 0.64, 1.1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}

        {/* Laptops and Strategy Tablets on Table */}
        {[-0.8, 0, 0.8].map((lx, i) => (
          <group key={i} position={[lx, 0.72, 0.4]}>
            {/* Laptop Base */}
            <mesh position={[0, 0.008, 0]}>
              <boxGeometry args={[0.34, 0.014, 0.24]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Open Laptop Screen */}
            <mesh position={[0, 0.12, -0.1]} rotation={[-0.25, 0, 0]}>
              <boxGeometry args={[0.34, 0.22, 0.014]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.12, -0.09]} rotation={[-0.25, 0, 0]}>
              <planeGeometry args={[0.32, 0.2]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Executive Mesh Swivel Chairs */}
      {/* 3 Near Chairs (Facing War Table) */}
      {[2.15, 3.05, 3.95].map((nearX, idx) => (
        <group key={idx} position={[nearX, 0, 4.3]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 5]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.34, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[0.46, 0.08, 0.44]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Curved Mesh Backrest */}
          <mesh position={[0, 0.8, 0.19]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.44, 0.65, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Head Chairs (East and West) */}
      {level >= 3 && (
        <group position={[4.9, 0, 2.9]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 5]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[0.46, 0.08, 0.44]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.8, 0.19]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.44, 0.65, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </group>
      )}

      {level >= 5 && (
        <group position={[0.9, 0, 2.9]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 5]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[0.46, 0.08, 0.44]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.8, 0.19]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.44, 0.65, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* Rolling Tactical Whiteboard */}
      <group position={[4.9, 0, 4.8]} rotation={[0, -0.35, 0]}>
        {/* Wheeled Metal Stand */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Frame Uprights */}
        {[-0.55, 0.55].map((wx, i) => (
          <mesh key={i} position={[wx, 0.7, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.3, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Whiteboard Board */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[1.1, 0.8, 0.04]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
      </group>

      {/* Trophy & Playbook Bookshelf at x=5.65-0.4=5.25, z=12.75-7.5=5.25 */}
      <group position={[5.25, 0, 5.25]}>
        {/* Bookshelf Frame */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.7, 2.0, 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Shelves with Championship Trophies */}
        {[0.5, 0.95, 1.4, 1.85].map((sy, i) => (
          <group key={i} position={[0, sy, 0.1]}>
            {/* Gold Trophy Cup */}
            <mesh position={[-0.15, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.04, 0.16, 12]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Playbook Binders */}
            <mesh position={[0.15, 0.08, 0]}>
              <boxGeometry args={[0.16, 0.14, 0.22]} />
              <meshStandardMaterial color={['#0284c7', '#7c3aed', '#059669', '#dc2626'][i]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// TEAM GYM & RECOVERY AREA
// -------------------------------------------------------------
function GymContent({ level }: { level: number }) {
  const treadmillRef = useRef<Mesh>(null);
  const barbellRef = useRef<Group>(null);
  const bikeWheelRef = useRef<Mesh>(null);

  // Subtle equipment animations
  useFrame(({ clock }) => {
    if (bikeWheelRef.current) {
      bikeWheelRef.current.rotation.x = clock.elapsedTime * 6;
    }
  });

  return (
    <group position={[7.4, 0, 7.5]}>
      {/* Motorized Running Treadmill at x=7.8-7.4=0.4, z=8.2-7.5=0.7 */}
      <group position={[0.77, 0, 1.55]}>
        {/* Heavy Steel Running Deck Base */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.75, 0.18, 1.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Running Belt */}
        <mesh ref={treadmillRef} position={[0, 0.232, 0]}>
          <boxGeometry args={[0.55, 0.01, 1.45]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} />
        </mesh>
        {/* Angled Upright Handrails */}
        <mesh position={[-0.32, 0.65, -0.35]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.32, 0.65, -0.35]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Digital LED Dashboard Console */}
        <mesh position={[0, 1.08, -0.48]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.62, 0.26, 0.08]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.08, -0.44]} rotation={[-0.4, 0, 0]}>
          <planeGeometry args={[0.54, 0.2]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Olympic Flat Bench Press (Level >= 2) at x=9.3-7.4=1.9, z=8.2-7.5=0.7 */}
      {level >= 2 && (
        <group position={[2.3, 0, 1.45]}>
          {/* Bench Frame Uprights */}
          {[-0.45, 0.45].map((bx, i) => (
            <mesh key={i} position={[bx, 0.6, -0.55]} castShadow>
              <boxGeometry args={[0.08, 1.2, 0.08]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          {/* Upholstered Vinyl Bench Pad */}
          <mesh position={[0, 0.38, 0.1]} castShadow>
            <boxGeometry args={[0.42, 0.14, 1.3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Red contrast stitch line */}
          <mesh position={[0, 0.452, 0.1]}>
            <boxGeometry args={[0.4, 0.01, 1.25]} />
            <meshBasicMaterial color="#ef4444" wireframe />
          </mesh>
          {/* Olympic Barbell loaded with Bumper Plates */}
          <group ref={barbellRef} position={[0, 1.15, -0.55]}>
            {/* Chrome Bar */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.8, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* 45lb Olympic Red Bumper Plates */}
            {[-0.72, 0.72].map((px, i) => (
              <mesh key={i} position={[px, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} />
              </mesh>
            ))}
            {/* 35lb Olympic Blue Bumper Plates */}
            {[-0.8, 0.8].map((px, i) => (
              <mesh key={i} position={[px, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
                <meshStandardMaterial color="#2563eb" roughness={0.4} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* Stationary Magnetic Spin Bike (Level >= 4) at x=7.8-7.4=0.4, z=11.2-7.5=3.7 */}
      {level >= 4 && (
        <group position={[0.77, 0, 4.4]}>
          {/* Bike Steel Chassis */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.9]} />
            <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Weighted Front Flywheel */}
          <mesh ref={bikeWheelRef} position={[0, 0.35, -0.32]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Racing Saddle */}
          <mesh position={[0, 0.75, 0.2]}>
            <boxGeometry args={[0.16, 0.06, 0.28]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          {/* Bullhorn Handlebars */}
          <mesh position={[0, 0.9, -0.28]}>
            <boxGeometry args={[0.42, 0.04, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Stretching & Warmup Exercise Mat at x=9.0-7.4=1.6, z=11.1-7.5=3.6 */}
      <group position={[2.15, 0, 4.5]}>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[1.1, 0.02, 1.8]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.9} />
        </mesh>
        {/* Foam Recovery Roller */}
        <mesh position={[0.35, 0.08, 0.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// MERCH SHOWROOM & APPAREL
// -------------------------------------------------------------
function MerchContent({ level }: { level: number }) {
  return (
    <group position={[11.0, 0, 7.5]}>
      {/* POS Checkout Counter with Glass Showcase */}
      <group position={[1.3, 0, 5.1]}>
        {/* Counter Body */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[1.5, 0.96, 0.65]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Glass Front Display Inset */}
        <mesh position={[0, 0.48, 0.33]}>
          <planeGeometry args={[1.3, 0.6]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.8}
          />
        </mesh>
        {/* iPad POS Terminal on Swivel Stand */}
        <group position={[0.25, 1.0, 0]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[0.26, 0.18, 0.015]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Industrial Tubular Clothing Racks (Levels 1, 3, 6) */}
      {[0, 1, 2].map((k) => {
        const minLevel = [1, 3, 6][k];
        if (level < minLevel) return null;
        const rz = 0.5 + 1.8 * k;

        return (
          <group key={k} position={[1.2, 0, rz]}>
            {/* Matte Black Steel Rack Frame */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[1.6, 0.06, 0.5]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
            </mesh>
            {[-0.7, 0.7].map((rx, i) => (
              <mesh key={i} position={[rx, 0.75, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.45, 8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
              </mesh>
            ))}
            {/* Top Hanging Bar */}
            <mesh position={[0, 1.48, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
              <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Hanging Official Team Jerseys & Hoodies */}
            {[-0.45, -0.22, 0, 0.22, 0.45].map((hx, i) => (
              <group key={i} position={[hx, 1.05, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.16, 0.65, 0.38]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? '#1e293b' : '#0284c7'}
                    roughness={0.8}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// -------------------------------------------------------------
// HALLWAY COMMONS (VENDING, COOLER, DECOR)
// -------------------------------------------------------------
function HallwayContent() {
  const loungeTvLevel = useGameStore((s) => s.houseInterior.loungeTvLevel) ?? 1;

  return (
    <group position={[0, 0, 0]}>
      {/* Upgradable Indoor Team Lounge Big Screen TV & Esports Entertainment Wall */}
      <group position={[6.4, 0, 6.16]}>
        {/* TV Wall Mount Chassis */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <boxGeometry
            args={[
              loungeTvLevel === 3 ? 2.5 : loungeTvLevel === 2 ? 1.9 : 1.4,
              loungeTvLevel === 3 ? 1.3 : loungeTvLevel === 2 ? 1.05 : 0.8,
              0.08,
            ]}
          />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Bezel frame with glowing team crest indicator */}
        <mesh position={[0, 1.45, 0.042]}>
          <boxGeometry
            args={[
              loungeTvLevel === 3 ? 2.54 : loungeTvLevel === 2 ? 1.94 : 1.44,
              loungeTvLevel === 3 ? 1.34 : loungeTvLevel === 2 ? 1.09 : 0.84,
              0.02,
            ]}
          />
          <meshStandardMaterial color="#06b6d4" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Broadcast TV Display Screen */}
        <mesh position={[0, 1.45, 0.054]}>
          <planeGeometry
            args={[
              loungeTvLevel === 3 ? 2.45 : loungeTvLevel === 2 ? 1.85 : 1.35,
              loungeTvLevel === 3 ? 1.25 : loungeTvLevel === 2 ? 1.0 : 0.75,
            ]}
          />
          <meshStandardMaterial
            color="#082f49"
            emissive={loungeTvLevel === 3 ? '#0284c7' : '#0369a1'}
            emissiveIntensity={0.8}
            roughness={0.15}
          />
        </mesh>

        {/* On-screen esports broadcast graphics: Tournament Trophy + Live Score */}
        <group position={[0, 1.45, 0.056]}>
          <mesh position={[0, 0.28, 0]}>
            <planeGeometry args={[1.1, 0.1]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh position={[-0.2, 0.28, 0.001]}>
            <planeGeometry args={[0.35, 0.05]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          <mesh position={[0.2, 0.28, 0.001]}>
            <planeGeometry args={[0.35, 0.05]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Level 3 Trophy Display Shelf below TV */}
          {loungeTvLevel === 3 && (
            <group position={[0, -0.75, 0.15]}>
              <mesh castShadow>
                <boxGeometry args={[2.2, 0.05, 0.35]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Golden Trophy on Shelf */}
              <mesh position={[-0.5, 0.14, 0]}>
                <cylinderGeometry args={[0.07, 0.03, 0.22, 10]} />
                <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0.5, 0.14, 0]}>
                <cylinderGeometry args={[0.07, 0.03, 0.22, 10]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          )}
        </group>

        {/* Ambient Glow illuminating the common hallway */}
        <pointLight
          position={[0, 1.45, 0.45]}
          color="#38bdf8"
          intensity={loungeTvLevel === 3 ? 1.4 : 0.8}
          distance={4.8}
        />
      </group>

      {/* Bottled Water Cooler at (x=0.5, z=6.32) */}
      <group position={[0.7, 0, 6.55]}>
        {/* White Cooler Base Unit */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.38, 0.9, 0.38]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Inverted 5-Gallon Translucent Blue Bottle */}
        <mesh position={[0, 1.08, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.38, 16]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.65}
            roughness={0.1}
            transmission={0.85}
          />
        </mesh>
        {/* Dispenser Levers (Hot Red / Cold Blue) */}
        <mesh position={[-0.06, 0.68, 0.2]}>
          <boxGeometry args={[0.03, 0.06, 0.04]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.06, 0.68, 0.2]}>
          <boxGeometry args={[0.03, 0.06, 0.04]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Refrigerated Snack & Beverage Vending Machine at (x=13.15, z=6.3) */}
      <group position={[13.15, 0, 6.7]}>
        {/* Metal Machine Housing */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.45, 1.8, 0.85]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Illuminated Front Glass Window */}
        <mesh position={[-0.23, 1.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.75, 1.2]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// MAIN HOUSE FURNITURE 3D ORCHESTRATOR
// -------------------------------------------------------------
export const HouseFurniture3D: React.FC<HouseFurniture3DProps> = ({ facilities }) => {
  const cosmetics = useGameStore((s) => s.empire.vipInventory);
  const scrimUnlocked = facilities.scrim_lab?.isUnlocked ?? true;
  const streamUnlocked = facilities.streaming_pod?.isUnlocked ?? false;
  const analystUnlocked = facilities.analyst_room?.isUnlocked ?? false;
  const gymUnlocked = facilities.gym?.isUnlocked ?? false;
  const merchUnlocked = facilities.merch_store?.isUnlocked ?? false;
  const cafeteriaUnlocked = facilities.cafeteria?.isUnlocked ?? false;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. SCRIM LAB */}
      {scrimUnlocked ? (
        <group>
          {/* 6 Battlestations */}
          {[0, 1].flatMap((row) =>
            [0, 1, 2].map((col) => {
              const k = row * 3 + col;
              const dx = 0.9 + 1.6 * col;
              const dy = 0.9 + 2.2 * row;
              const minLevel = k < 4 ? 1 : 3;
              if ((facilities.scrim_lab?.level ?? 1) < minLevel) return null;
              return (
                <BattlestationRig
                  key={`scrim-${row}-${col}`}
                  x={dx}
                  z={dy}
                  upgraded={(facilities.scrim_lab?.level ?? 1) >= 5}
                />
              );
            })
          )}
        </group>
      ) : (
        <ConstructionZone x={0.4} z={0.4} w={6.0} d={5.8} />
      )}

      {/* 2. STREAM STUDIO */}
      {streamUnlocked ? (
        <StreamStudioContent level={facilities.streaming_pod?.level ?? 1} />
      ) : (
        <ConstructionZone x={7.4} z={0.4} w={6.2} d={5.8} />
      )}

      {/* 3. STRATEGY ROOM */}
      {analystUnlocked ? (
        <AnalystRoomContent level={facilities.analyst_room?.level ?? 1} />
      ) : (
        <ConstructionZone x={0.4} z={7.5} w={6.0} d={6.1} />
      )}

      {/* 4. TEAM GYM */}
      {gymUnlocked ? (
        <GymContent level={facilities.gym?.level ?? 1} />
      ) : (
        <ConstructionZone x={7.4} z={7.5} w={3.0} d={6.1} />
      )}

      {/* 5. MERCH SHOWROOM */}
      {merchUnlocked ? (
        <MerchContent level={facilities.merch_store?.level ?? 1} />
      ) : (
        <ConstructionZone x={11.0} z={7.5} w={2.6} d={6.1} />
      )}

      {/* 6. CAFETERIA - built only after funding or cash unlock */}
      {cafeteriaUnlocked ? <group>
        <mesh position={[-4.7, 0.45, 8.5]} castShadow><boxGeometry args={[3.5, 0.9, 0.65]} /><meshStandardMaterial color="#d97706" roughness={0.75} /></mesh>
        <mesh position={[-4.7, 0.92, 8.5]} castShadow><boxGeometry args={[3.55, 0.07, 0.72]} /><meshStandardMaterial color="#fef3c7" roughness={0.55} /></mesh>
        {[9.9, 11.6].map(z => <group key={z}>
          <mesh position={[-3.9, 0.42, z]} castShadow><cylinderGeometry args={[0.63, 0.63, 0.08, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          <mesh position={[-3.9, 0.2, z]}><cylinderGeometry args={[0.08, 0.08, 0.4, 10]} /><meshStandardMaterial color="#475569" /></mesh>
          <mesh position={[-2.9, 0.24, z]} castShadow><boxGeometry args={[0.48, 0.48, 0.5]} /><meshStandardMaterial color="#fb923c" /></mesh>
        </group>)}
      </group> : <ConstructionZone x={-5.4} z={7.5} w={5.2} d={6.1} />}

      {/* HALLWAY COMMONS (Vending, Water Cooler) */}
      <HallwayContent />
      {scrimUnlocked && cosmetics.includes('rgb_neon') && <group position={[3.4, 1.2, 0.55]}>
        <mesh><boxGeometry args={[2.2, 0.32, 0.05]} /><meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={1.8} /></mesh>
        <mesh position={[0, 0, 0.04]}><boxGeometry args={[1.8, 0.08, 0.02]} /><meshBasicMaterial color="#f0abfc" /></mesh>
      </group>}
      {cafeteriaUnlocked && cosmetics.includes('luxury_arcade') && <group position={[-6.2, 0.8, 10.9]}>
        <mesh castShadow><boxGeometry args={[0.6, 1.6, 0.7]} /><meshStandardMaterial color="#7c3aed" roughness={0.3} /></mesh>
        <mesh position={[0, 0.25, 0.36]}><boxGeometry args={[0.48, 0.55, 0.02]} /><meshBasicMaterial color="#22d3ee" /></mesh>
      </group>}
      {cosmetics.includes('gold_pedestal') && <group position={[7.75, 0.45, 6.85]}>
        <mesh castShadow><cylinderGeometry args={[0.32, 0.42, 0.9, 12]} /><meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} /></mesh>
        <mesh position={[0, 0.57, 0]}><octahedronGeometry args={[0.23]} /><meshStandardMaterial color="#fef08a" metalness={0.6} /></mesh>
      </group>}
    </group>
  );
};
