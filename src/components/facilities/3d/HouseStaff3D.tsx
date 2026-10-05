import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import type { Facility, FacilityId } from '../../../core/types/facility.types';

interface HouseStaff3DProps {
  facilities: Record<FacilityId, Facility>;
  paused: boolean;
  branding: { primaryColor: string; accentColor: string };
}

// ============================================================================
// 1. CAFETERIA EXECUTIVE CHEF & BARISTA
// ============================================================================
function CafeteriaChefStaff({ paused }: { paused: boolean }) {
  const rootRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused || !rootRef.current) return;
    const t = clock.elapsedTime * 2.2;
    // Stirring and plating motion
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.9 + Math.sin(t * 1.8) * 0.22;
      rightArmRef.current.rotation.z = Math.cos(t * 1.8) * 0.15;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.65 + Math.cos(t * 1.2) * 0.12;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.2;
      headRef.current.rotation.x = 0.18 + Math.sin(t * 1.5) * 0.08;
    }
  });

  return (
    <group ref={rootRef} position={[-1.8, 0, 8.0]} rotation={[0, Math.PI * 0.15, 0]}>
      {/* Torso: Double-Breasted Chef Whites */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.36, 0.42, 0.24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Black buttons on tunic */}
      {[-0.05, 0.05].map((bx, i) => (
        <group key={i}>
          {[0.5, 0.6, 0.7].map((by, j) => (
            <mesh key={j} position={[bx, by, 0.125]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          ))}
        </group>
      ))}
      {/* White Apron Waist */}
      <mesh position={[0, 0.42, 0.02]} castShadow>
        <boxGeometry args={[0.38, 0.22, 0.24]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#e0ac69" roughness={0.75} />
        </mesh>
        {/* French Chef Toque (Tall pleated hat) */}
        <group position={[0, 0.16, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.14, 0.26, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.18, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
          {/* Hat band */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.142, 0.142, 0.06, 16]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      </group>

      {/* Left Arm: Holding Tasting Plate */}
      <group ref={leftArmRef} position={[-0.24, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Small Plate */}
        <mesh position={[0, -0.32, 0.12]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* Right Arm: Holding Stainless Spatula */}
      <group ref={rightArmRef} position={[0.24, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Spatula */}
        <group position={[0, -0.32, 0.15]} rotation={[0.4, 0, 0]}>
          <mesh position={[0, 0, -0.08]}>
            <boxGeometry args={[0.02, 0.02, 0.18]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.08, 0.008, 0.12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Legs (Black Kitchen Chef Trousers) */}
      <mesh position={[-0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CafeteriaBaristaStaff({ paused }: { paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 2.0;
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.75 + Math.sin(t * 1.5) * 0.15;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.18;
    }
  });

  return (
    <group position={[-4.5, 0, 8.0]} rotation={[0, Math.PI * 0.15, 0]}>
      {/* Torso with Olive Canvas Apron */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.54, 0.02]} castShadow>
        <boxGeometry args={[0.32, 0.36, 0.22]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>

      {/* Head with Flat Cap */}
      <group ref={headRef} position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#f5c5a3" roughness={0.7} />
        </mesh>
        {/* Newsboy / Barista Cap */}
        <mesh position={[0, 0.12, -0.02]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.08, 0.14]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Right Arm Operating Coffee Machine */}
      <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Steaming Mug */}
        <mesh position={[0, -0.32, 0.12]}>
          <cylinderGeometry args={[0.05, 0.04, 0.09, 10]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>

      {/* Left Arm */}
      <group position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

function CafeteriaDinerBooth({ branding, paused }: { branding: { primaryColor: string; accentColor: string }; paused: boolean }) {
  const armRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 1.8;
    if (armRef.current) {
      const biteCycle = Math.sin(t);
      armRef.current.rotation.x = -0.7 + Math.max(0, biteCycle) * 0.45;
      armRef.current.rotation.z = 0.2 + Math.max(0, biteCycle) * 0.2;
    }
    if (headRef.current) {
      headRef.current.rotation.x = 0.12 + Math.sin(t * 1.2) * 0.08;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <group position={[-4.65, 0, 12.4]} rotation={[0, Math.PI / 2, 0]}>
      {/* Torso: Cyan Hoodie */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.34, 0.38, 0.22]} />
        <meshStandardMaterial color={branding.primaryColor || '#0891b2'} roughness={0.7} />
      </mesh>

      {/* Seated Legs */}
      <group position={[0, 0.28, 0.14]}>
        {[-0.09, 0.09].map((lx, i) => (
          <group key={i} position={[lx, 0, 0]}>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.05, 0.24, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.14, 0.2]} castShadow>
              <cylinderGeometry args={[0.048, 0.042, 0.26, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.26, 0.23]}>
              <boxGeometry args={[0.07, 0.05, 0.12]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 0.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color="#f3c699" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.165, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Right Arm: Holding Burger */}
      <group ref={armRef} position={[0.22, 0.58, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.24, 8]} />
          <meshStandardMaterial color={branding.primaryColor || '#0891b2'} />
        </mesh>
        <group position={[0, -0.24, 0.12]} rotation={[0.4, 0, 0]}>
          <mesh position={[0, 0, 0.06]}>
            <cylinderGeometry args={[0.035, 0.03, 0.16, 8]} />
            <meshStandardMaterial color={branding.primaryColor || '#0891b2'} />
          </mesh>
          <group position={[0, 0.02, 0.16]}>
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.06, 0.055, 0.02, 10]} />
              <meshStandardMaterial color="#d97706" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.02, 10]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.015, 0]}>
              <boxGeometry args={[0.11, 0.008, 0.11]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <sphereGeometry args={[0.062, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color="#d97706" roughness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Left Arm: Resting */}
      <group position={[-0.22, 0.58, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.24, 8]} />
          <meshStandardMaterial color={branding.primaryColor || '#0891b2'} />
        </mesh>
        <mesh position={[0.05, -0.24, 0.16]} rotation={[0.5, 0, -0.2]}>
          <cylinderGeometry args={[0.035, 0.03, 0.18, 8]} />
          <meshStandardMaterial color={branding.primaryColor || '#0891b2'} />
        </mesh>
      </group>
    </group>
  );
}

function CafeteriaDinerTable({ branding, paused }: { branding: { primaryColor: string; accentColor: string }; paused: boolean }) {
  const armRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 1.5;
    if (armRef.current) {
      armRef.current.rotation.x = -0.65 + Math.sin(t * 1.6) * 0.18;
      armRef.current.rotation.z = -0.1 + Math.cos(t * 1.6) * 0.1;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.7) * 0.22;
      headRef.current.rotation.x = 0.15 + Math.sin(t * 1.4) * 0.06;
    }
  });

  return (
    <group position={[-1.8, 0, 11.6]} rotation={[0, Math.PI / 2, 0]}>
      {/* Torso: Dynasty Jersey */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.34, 0.38, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.46, 0.112]}>
        <boxGeometry args={[0.22, 0.03, 0.005]} />
        <meshBasicMaterial color={branding.accentColor || '#38bdf8'} />
      </mesh>

      {/* Seated Legs */}
      <group position={[0, 0.28, 0.14]}>
        {[-0.09, 0.09].map((lx, i) => (
          <group key={i} position={[lx, 0, 0]}>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.05, 0.24, 8]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, -0.14, 0.2]} castShadow>
              <cylinderGeometry args={[0.048, 0.042, 0.26, 8]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, -0.26, 0.23]}>
              <boxGeometry args={[0.07, 0.05, 0.12]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 0.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color="#d4a373" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.165, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>

      {/* Right Arm: Eating Salad Bowl with Fork */}
      <group ref={armRef} position={[0.22, 0.58, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.24, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, -0.26, 0.14]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.015, 0.015, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
        </mesh>
      </group>

      {/* Left Arm: Holding Smartphone */}
      <group position={[-0.22, 0.58, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.24, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <group position={[0.08, -0.24, 0.16]} rotation={[0.5, 0, -0.3]}>
          <mesh>
            <boxGeometry args={[0.06, 0.1, 0.01]} />
            <meshStandardMaterial color="#020617" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.006]}>
            <planeGeometry args={[0.052, 0.09]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ============================================================================
// 2. MERCH STORE STAFF & VISITOR NPCS
// ============================================================================
function MerchCashierStaff({ branding, paused }: { branding: { primaryColor: string; accentColor: string }; paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 2.0;
    if (rightArmRef.current) {
      // Barcode scanner trigger gesture
      rightArmRef.current.rotation.x = -0.85 + Math.sin(t * 1.4) * 0.15;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <group position={[15.6, 0, 12.1]} rotation={[0, -Math.PI * 0.65, 0]}>
      {/* Team Staff Branded Polo Shirt */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color={branding.primaryColor} roughness={0.7} />
      </mesh>
      {/* Accent Collar */}
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[0.36, 0.06, 0.24]} />
        <meshStandardMaterial color={branding.accentColor} />
      </mesh>
      {/* ID Badge Lanyard */}
      <mesh position={[0, 0.55, 0.118]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#ffd1b3" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1e1b18" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Arm: Barcode Scanner */}
      <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color={branding.primaryColor} />
        </mesh>
        {/* Scanner Gun */}
        <group position={[0, -0.32, 0.12]}>
          <mesh>
            <boxGeometry args={[0.05, 0.08, 0.1]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[0.04, 0.04]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>

      {/* Left Arm: Packing bags */}
      <group position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color={branding.primaryColor} />
        </mesh>
      </group>

      {/* Legs (Chinos) */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

// Active NPC Fan Shopping at Racks
function MerchVisitorShopper({ branding, paused }: { branding: { primaryColor: string; accentColor: string }; paused: boolean }) {
  const rootRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused || !rootRef.current) return;
    const t = clock.elapsedTime;
    const cycle = (t * 0.4) % 18;

    if (cycle < 6.0) {
      // Walking inside from the exterior entrance (z: 14.5 -> 9.5)
      const p = cycle / 6.0;
      rootRef.current.position.set(14.35, 0, 14.2 - p * 4.35);
      rootRef.current.rotation.y = Math.PI; // facing north
      const walk = t * 7;
      rootRef.current.position.y = Math.abs(Math.sin(walk * 1.5)) * 0.03;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walk) * 0.6;
        rightLegRef.current.rotation.x = -Math.sin(walk) * 0.6;
      }
    } else if (cycle < 12.0) {
      // Browsing jersey rack
      rootRef.current.position.set(14.35, 0, 9.85);
      rootRef.current.rotation.y = Math.PI / 2; // facing rack (East)
      rootRef.current.position.y = 0;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
      if (rightArmRef.current) {
        // Reaching out to touch jersey
        rightArmRef.current.rotation.x = -1.1 + Math.sin(t * 1.8) * 0.15;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.25;
      }
    } else {
      // Walking toward checkout / viewing hats
      const p = (cycle - 12.0) / 6.0;
      rootRef.current.position.set(14.35, 0, 9.85 + p * 4.35);
      rootRef.current.rotation.y = 0; // facing south
      const walk = t * 7;
      rootRef.current.position.y = Math.abs(Math.sin(walk * 1.5)) * 0.03;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walk) * 0.6;
        rightLegRef.current.rotation.x = -Math.sin(walk) * 0.6;
      }
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={rootRef} position={[14.0, 0, 14.2]}>
      {/* Casual Fan Hoodie */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color="#0284c7" roughness={0.7} />
      </mesh>
      {/* Team Logo print on chest */}
      <mesh position={[0, 0.62, 0.115]}>
        <planeGeometry args={[0.1, 0.1]} />
        <meshBasicMaterial color={branding.accentColor} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#f5c5a3" roughness={0.75} />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.08, 0.14]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
      {/* Left Arm */}
      <group position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Legs (Jeans) */}
      <group ref={leftLegRef} position={[-0.09, 0.38, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.36, 8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.09, 0.38, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.36, 8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Visitor buying gear at counter
function MerchVisitorBuyer({ branding, paused }: { branding: { primaryColor: string; accentColor: string }; paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 1.5;
    if (rightArmRef.current) {
      // Tap phone on POS terminal to pay
      rightArmRef.current.rotation.x = -1.1 + Math.sin(t) * 0.12;
    }
  });

  return (
    <group position={[15.6, 0, 13.2]} rotation={[0, Math.PI, 0]}>
      {/* Casual Jacket */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#c68642" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Right Arm: Holding Phone for NFC Pay */}
      <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Smartphone */}
        <mesh position={[0, -0.32, 0.1]}>
          <boxGeometry args={[0.06, 0.11, 0.015]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      </group>

      {/* Left Arm: Holding Dynasty Shopping Bag */}
      <group position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Shopping bag */}
        <group position={[0, -0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.28, 0.14]} />
            <meshStandardMaterial color={branding.primaryColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.072]}>
            <planeGeometry args={[0.14, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* Legs */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// Visitor checking sneakers & limited drop
function MerchVisitorSneakers({ paused }: { paused: boolean }) {
  const headRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime;
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
      headRef.current.rotation.x = 0.2; // looking down at sneaker pedestal
    }
  });

  return (
    <group position={[12.8, 0, 11.2]} rotation={[0, -Math.PI * 0.2, 0]}>
      {/* Streetwear Tee */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#8d5524" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1e1b18" />
        </mesh>
      </group>

      {/* Arms */}
      <group position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
      </group>
      <group position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// ============================================================================
// 3. TEAM GYM ATHLETIC COACH
// ============================================================================
function GymCoachStaff({ paused }: { paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 2.5;
    if (rightArmRef.current) {
      // Cheering / whistle / fist pump
      rightArmRef.current.rotation.x = -1.6 + Math.sin(t) * 0.35;
    }
    if (leftArmRef.current) {
      // Holding clipboard
      leftArmRef.current.rotation.x = -0.85;
    }
  });

  return (
    <group position={[8.8, 0, 10.1]} rotation={[0, -Math.PI * 0.75, 0]}>
      {/* Athletic Track Jacket */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.36, 0.42, 0.24]} />
        <meshStandardMaterial color="#ea580c" roughness={0.6} />
      </mesh>
      {/* Whistle hanging around neck */}
      <mesh position={[0, 0.6, 0.125]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#e0ac69" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.185, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1e1b18" />
        </mesh>
      </group>

      {/* Left Arm: Holding Workout Clipboard */}
      <group ref={leftArmRef} position={[-0.24, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        {/* Clipboard */}
        <group position={[0, -0.32, 0.12]}>
          <mesh>
            <boxGeometry args={[0.18, 0.24, 0.015]} />
            <meshStandardMaterial color="#854d0e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.15, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* Right Arm: Pumping fist encouraging athlete */}
      <group ref={rightArmRef} position={[0.24, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
      </group>

      {/* Athletic Training Shorts & Running Shoes */}
      <mesh position={[-0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// ============================================================================
// 4. STRATEGY ROOM LEAD ANALYST
// ============================================================================
function StrategyAnalystStaff({ paused }: { paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 1.6;
    if (rightArmRef.current) {
      // Gesturing toward whiteboard tactical map
      rightArmRef.current.rotation.x = -1.2 + Math.sin(t) * 0.2;
      rightArmRef.current.rotation.y = 0.35 + Math.cos(t) * 0.15;
    }
  });

  return (
    <group position={[2.2, 0, 8.6]} rotation={[0, Math.PI * 0.25, 0]}>
      {/* Navy Blazer */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
      </mesh>

      {/* Head with Glasses */}
      <group position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#ffd1b3" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#5c3d2e" />
        </mesh>
        {/* Glasses */}
        <mesh position={[0, 0.02, 0.17]}>
          <boxGeometry args={[0.22, 0.04, 0.02]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Right Arm: Pointing laser at match strategy board */}
      <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0, -0.32, 0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Left Arm: Holding Tactical Tablet */}
      <group position={[-0.22, 0.72, 0]} rotation={[-0.7, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0, -0.32, 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.18, 0.26, 0.015]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.32, 0.09]} rotation={[0.4, 0, 0]}>
          <planeGeometry args={[0.16, 0.24]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// ============================================================================
// 5. SCRIM LAB HEAD COACH
// ============================================================================
function ScrimCoachStaff({ branding, paused }: { branding: { primaryColor: string; accentColor: string }; paused: boolean }) {
  const rootRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (paused || !rootRef.current) return;
    const t = clock.elapsedTime;
    // Pacing slowly behind rigs
    const p = Math.sin(t * 0.45);
    rootRef.current.position.x = 3.2 + p * 1.1;
    rootRef.current.rotation.y = p > 0 ? Math.PI / 2 : -Math.PI / 2;
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.2) * 0.3;
      headRef.current.rotation.x = -0.15; // looking down at player screens
    }
  });

  return (
    <group ref={rootRef} position={[3.2, 0, 4.8]}>
      {/* Coach Jersey */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color={branding.primaryColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[0.36, 0.06, 0.24]} />
        <meshStandardMaterial color={branding.accentColor} />
      </mesh>

      {/* Head with Coach Headset around neck */}
      <group ref={headRef} position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#f5c5a3" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1e1b18" />
        </mesh>
        {/* Headset on neck */}
        <mesh position={[0, -0.1, 0]}>
          <torusGeometry args={[0.18, 0.025, 8, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} />
        </mesh>
      </group>

      {/* Arms holding tablet */}
      <group position={[0.22, 0.72, 0]} rotation={[-0.7, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color={branding.primaryColor} />
        </mesh>
      </group>
      <group position={[-0.22, 0.72, 0]} rotation={[-0.7, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color={branding.primaryColor} />
        </mesh>
        <mesh position={[0.22, -0.32, 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.24, 0.18, 0.015]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// ============================================================================
// 6. STREAM STUDIO PRODUCER
// ============================================================================
function StreamProducerStaff({ paused }: { paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 2.0;
    if (rightArmRef.current) {
      // Adjusting audio faders
      rightArmRef.current.rotation.x = -0.8 + Math.sin(t) * 0.15;
    }
  });

  return (
    <group position={[8.3, 0, 4.8]} rotation={[0, -Math.PI * 0.3, 0]}>
      {/* Production Hoodie */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Head with Studio Headphones */}
      <group position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#ffd1b3" roughness={0.7} />
        </mesh>
        {/* Studio Headphones */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.19, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
        <mesh position={[-0.19, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
          <meshStandardMaterial color="#a855f7" />
        </mesh>
        <mesh position={[0.19, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
          <meshStandardMaterial color="#a855f7" />
        </mesh>
      </group>

      {/* Right Arm: Operating Audio Switcher */}
      <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <group position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

// ============================================================================
// 7. PRO GARAGE WORKSHOP CHIEF MECHANIC
// ============================================================================
function GarageMechanicStaff({ paused }: { paused: boolean }) {
  const rightArmRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * 2.5;
    if (rightArmRef.current) {
      // Wrench tightening engine bolt
      rightArmRef.current.rotation.x = -1.1 + Math.sin(t) * 0.25;
    }
  });

  return (
    <group position={[19.8, -0.19, 11.2]} rotation={[0, Math.PI * 0.4, 0]}>
      {/* Heavy Work Overalls */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.36, 0.42, 0.24]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.85} />
      </mesh>
      {/* Tool Belt */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.38, 0.08, 0.26]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* Head with Baseball Cap Backwards */}
      <group position={[0, 0.94, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#c68642" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 0.08, -0.14]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.1]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Right Arm: Chrome Ratchet Wrench */}
      <group ref={rightArmRef} position={[0.24, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0, -0.32, 0.1]}>
          <boxGeometry args={[0.03, 0.03, 0.18]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group position={[-0.24, 0.72, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>

      {/* Overalls Legs */}
      <mesh position={[-0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.38, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.38, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
    </group>
  );
}

// ============================================================================
// MAIN COMPONENT: HOUSE STAFF & VISITOR ORCHESTRATOR
// ============================================================================
export const HouseStaff3D: React.FC<HouseStaff3DProps> = ({ facilities, paused, branding }) => {
  const cafeteriaUnlocked = facilities.cafeteria?.isUnlocked ?? false;
  const merchUnlocked = facilities.merch_store?.isUnlocked ?? false;
  const gymUnlocked = facilities.gym?.isUnlocked ?? false;
  const analystUnlocked = facilities.analyst_room?.isUnlocked ?? false;
  const scrimUnlocked = facilities.scrim_lab?.isUnlocked ?? false;
  const streamUnlocked = facilities.streaming_pod?.isUnlocked ?? false;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CAFETERIA STAFF & ACTIVE DINERS */}
      {cafeteriaUnlocked && (
        <group>
          <CafeteriaChefStaff paused={paused} />
          <CafeteriaBaristaStaff paused={paused} />
          <CafeteriaDinerBooth branding={branding} paused={paused} />
          <CafeteriaDinerTable branding={branding} paused={paused} />
        </group>
      )}

      {/* 2. MERCH STORE STAFF & VISITOR NPCS */}
      {merchUnlocked && (
        <group>
          <MerchCashierStaff branding={branding} paused={paused} />
          <MerchVisitorShopper branding={branding} paused={paused} />
          <MerchVisitorBuyer branding={branding} paused={paused} />
          <MerchVisitorSneakers paused={paused} />
        </group>
      )}

      {/* 3. TEAM GYM ATHLETIC COACH */}
      {gymUnlocked && <GymCoachStaff paused={paused} />}

      {/* 4. STRATEGY ROOM LEAD ANALYST */}
      {analystUnlocked && <StrategyAnalystStaff paused={paused} />}

      {/* 5. SCRIM LAB HEAD COACH */}
      {scrimUnlocked && <ScrimCoachStaff branding={branding} paused={paused} />}

      {/* 6. STREAM STUDIO BROADCAST PRODUCER */}
      {streamUnlocked && <StreamProducerStaff paused={paused} />}

      {/* 7. PRO GARAGE WORKSHOP LEAD MECHANIC */}
      <GarageMechanicStaff paused={paused} />
    </group>
  );
};
