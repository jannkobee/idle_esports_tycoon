import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

/**
 * Exterior landscaping, driveway, modern sports car, and suburban neighborhood.
 */
export const HouseEnvironment3D: React.FC = () => {
  const carRef = useRef<Group>(null);
  const exhaustRef = useRef<Group>(null);

  // Subtle sports car idle vibration
  useFrame(({ clock }) => {
    if (carRef.current) {
      carRef.current.position.y = Math.sin(clock.elapsedTime * 12) * 0.003;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Surrounding Neighborhood Terrain */}
      <mesh position={[7, -0.6, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#1b2a26" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Outer Asphalt Street */}
      <mesh position={[7, -0.58, 21.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 11]} />
        <meshStandardMaterial color="#181c20" roughness={0.88} metalness={0.15} />
      </mesh>

      {/* Street Centerline Markings (dashed white lines) */}
      {[-20, -12, -4, 4, 12, 20].map((xOffset) => (
        <mesh key={xOffset} position={[7 + xOffset, -0.575, 21.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.2, 0.28]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      ))}

      {/* Concrete Curbs along the Street */}
      <mesh position={[7, -0.52, 16.1]} receiveShadow>
        <boxGeometry args={[42, 0.15, 0.4]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Front Landscaped Lawn & Stone Walkway */}
      <mesh position={[7, -0.5, 15.3]} receiveShadow>
        <boxGeometry args={[22, 0.12, 2.0]} />
        <meshStandardMaterial color="#2d4a3e" roughness={0.9} />
      </mesh>

      {/* Driveway Pavers / Asphalt Pad for the Team Sports Car */}
      <mesh position={[13.2, -0.48, 15.6]} receiveShadow>
        <boxGeometry args={[5.8, 0.14, 4.2]} />
        <meshStandardMaterial color="#334155" roughness={0.75} />
      </mesh>

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
        {/* Aluminum Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 2.6, 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Left Glass Panel */}
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
        {/* Right Glass Panel */}
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
        {/* Sleek Door Handles */}
        <mesh position={[-0.08, -0.1, 0.04]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, -0.1, 0.04]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Team Sports Car Parked on Driveway */}
      <group position={[13.2, -0.4, 15.6]} rotation={[0, -0.22, 0]}>
        <group ref={carRef}>
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
            <meshBasicMaterial color="#a5f3fc" />
          </mesh>
          <mesh position={[0.8, 0.48, 2.16]}>
            <boxGeometry args={[0.42, 0.14, 0.06]} />
            <meshBasicMaterial color="#a5f3fc" />
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

          {/* Side Mirrors */}
          <mesh position={[-1.02, 0.76, 0.5]}>
            <boxGeometry args={[0.22, 0.12, 0.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[1.02, 0.76, 0.5]}>
            <boxGeometry args={[0.22, 0.12, 0.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
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

          {/* 4 Wheels (Alloy Rims + Red Brake Calipers + Low Profile Tires) */}
          {[
            [-1.02, 0.32, 1.25],
            [1.02, 0.32, 1.25],
            [-1.02, 0.34, -1.35],
            [1.02, 0.34, -1.35],
          ].map(([wx, wy, wz], idx) => (
            <group key={idx} position={[wx, wy, wz]}>
              {/* Rubber Tire */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.34, 0.34, 0.28, 18]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} />
              </mesh>
              {/* Alloy Rim */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.24, 0.24, 0.29, 12]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Sporty Red Brake Caliper */}
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.1, 0.14, 0.12]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Modern Landscaped Planters with Lush Shrubs */}
      {[
        [-1.2, 15.2],
        [2.2, 15.2],
        [11.6, 14.8],
        [-1.2, 8.5],
        [-1.2, 1.5],
        [15.2, 1.5],
        [15.2, 8.5],
      ].map(([px, pz], idx) => (
        <group key={idx} position={[px, -0.45, pz]}>
          {/* Concrete Ribbed Planter Box */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.9, 0.5, 0.9]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Top Soil */}
          <mesh position={[0, 0.51, 0]}>
            <boxGeometry args={[0.82, 0.04, 0.82]} />
            <meshStandardMaterial color="#2d2218" roughness={0.95} />
          </mesh>
          {/* Vibrant Plant Foliage */}
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

      {/* Pathway Landscape Bollard Lights */}
      {[
        [4.8, 15.6],
        [9.0, 15.6],
        [-0.6, 15.6],
      ].map(([bx, bz], idx) => (
        <group key={idx} position={[bx, -0.45, bz]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.9, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Emissive Lamp Head */}
          <mesh position={[0, 0.86, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.14, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

