import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { useGameStore } from '../../../core/store/useGameStore';
import type { EmpireState } from '../../../core/store/useGameStore';
import { BRANCHES } from '../../../core/empire/BranchService';
import { CAMPUS } from '../../../core/house/campusLayout';
import { RoomDoor3D } from './RoomDoor3D';

// ============================================================================
// 1. ARTICULATED LIVING NPC FAN SYSTEM
// ============================================================================

type NpcRole =
  | 'photographer'
  | 'crosser'
  | 'boba_drinker'
  | 'boba_friend'
  | 'cheerer'
  | 'stroller'
  | 'shopper';

interface AnimatedNpcProps {
  id: number;
  role: NpcRole;
  basePos: [number, number, number];
  jerseyColors: { primaryColor: string; accentColor: string };
  isTournamentUnderway: boolean;
  totalFans: number;
}

const NPC_SKIN_TONES = ['#f5c5a3', '#e0ac69', '#c68642', '#8d5524', '#ffd1b3', '#fcd5b8'];
const NPC_CLOTHING_COLORS = ['#0284c7', '#f43f5e', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#3b82f6'];
const NPC_PANTS_COLORS = ['#1e293b', '#0f172a', '#334155', '#475569', '#1e3a8a'];

const AnimatedNpcFan: React.FC<AnimatedNpcProps> = ({
  id,
  role,
  basePos,
  jerseyColors,
  isTournamentUnderway,
  totalFans,
}) => {
  const rootRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const flashLightRef = useRef<any>(null);

  const skinColor = NPC_SKIN_TONES[id % NPC_SKIN_TONES.length];
  // Fans with higher index or when org is famous wear team jersey colors!
  const isSuperfan = id % 3 === 0 || totalFans > 8000;
  const topColor = isSuperfan ? jerseyColors.primaryColor : NPC_CLOTHING_COLORS[id % NPC_CLOTHING_COLORS.length];
  const pantsColor = NPC_PANTS_COLORS[id % NPC_PANTS_COLORS.length];
  const isSeated = role === 'boba_drinker' || role === 'boba_friend';

  useFrame(({ clock }) => {
    if (!rootRef.current) return;
    const t = clock.elapsedTime + id * 3.7;

    if (role === 'photographer') {
      // Walks along the house front sidewalk (x: 2.5 to 10.5, z: 16.5)
      // Pauses outside window and snaps photos with camera flash!
      const cycle = t % 14;
      if (cycle < 4.5) {
        // Walking East towards scrim lab window
        const progress = cycle / 4.5;
        rootRef.current.position.x = 2.5 + progress * 5.5;
        rootRef.current.position.z = 16.5;
        rootRef.current.rotation.y = Math.PI / 2; // facing East
        const walkCycle = cycle * 9;
        rootRef.current.position.y = -0.35 + Math.abs(Math.sin(walkCycle * 2)) * 0.03;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
          rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.6;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;
          rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.45;
        }
        if (flashLightRef.current) flashLightRef.current.intensity = 0;
      } else if (cycle < 8.5) {
        // Paused outside house window, taking photos!
        rootRef.current.position.x = 8.0;
        rootRef.current.position.z = 16.5;
        rootRef.current.rotation.y = Math.PI; // facing house (North)
        rootRef.current.position.y = -0.35;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
        }
        // Right arm raised holding phone up
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -1.35 + Math.sin(t * 2) * 0.05;
          rightArmRef.current.rotation.y = 0.25;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.8;
          leftArmRef.current.rotation.y = -0.2;
        }
        // Camera flash pulses at 5.5s, 6.4s, 7.3s
        const flashPhase = (cycle - 4.5) % 1.1;
        const isFlashing = flashPhase < 0.12;
        if (flashLightRef.current) {
          flashLightRef.current.intensity = isFlashing ? 2.5 : 0;
        }
      } else if (cycle < 12.0) {
        // Walking West back
        const progress = (cycle - 8.5) / 3.5;
        rootRef.current.position.x = 8.0 - progress * 5.5;
        rootRef.current.position.z = 16.5;
        rootRef.current.rotation.y = -Math.PI / 2; // facing West
        const walkCycle = cycle * 9;
        rootRef.current.position.y = -0.35 + Math.abs(Math.sin(walkCycle * 2)) * 0.03;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
          rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.6;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;
          rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.45;
        }
        if (flashLightRef.current) flashLightRef.current.intensity = 0;
      } else {
        // Stop by front gate and look around
        rootRef.current.position.x = 2.5;
        rootRef.current.position.z = 16.5;
        rootRef.current.rotation.y = 0;
        rootRef.current.position.y = -0.35;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
        }
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.3;
        if (flashLightRef.current) flashLightRef.current.intensity = 0;
      }
    } else if (role === 'crosser') {
      // Crosses street between house driveway (z = 16.5) and Dynasty Mart (z = 28.5)
      const cycle = t % 18;
      if (cycle < 3.0) {
        // Waiting at curb, looking both ways
        rootRef.current.position.set(-2.0, -0.35, 16.5);
        rootRef.current.rotation.y = 0; // facing street (+z)
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 5) * 0.5;
      } else if (cycle < 7.5) {
        // Crossing zebra crosswalk to the Mart (+z)
        const progress = (cycle - 3.0) / 4.5;
        rootRef.current.position.set(-2.0, -0.35 + Math.abs(Math.sin(cycle * 16)) * 0.03, 16.5 + progress * 11.5);
        rootRef.current.rotation.y = 0;
        const walkCycle = cycle * 10;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
          rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.6;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;
          rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.45;
        }
      } else if (cycle < 11.5) {
        // At Dynasty Mart vending machine
        rootRef.current.position.set(-5.5, -0.35, 29.5);
        rootRef.current.rotation.y = -Math.PI / 2; // facing machine
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.9 + Math.sin(t * 3) * 0.1;
        }
      } else if (cycle < 16.0) {
        // Crossing back to the house side (-z)
        const progress = (cycle - 11.5) / 4.5;
        rootRef.current.position.set(-2.0, -0.35 + Math.abs(Math.sin(cycle * 16)) * 0.03, 28.0 - progress * 11.5);
        rootRef.current.rotation.y = Math.PI;
        const walkCycle = cycle * 10;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
          rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.6;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;
          rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.45;
        }
      } else {
        rootRef.current.position.set(-2.0, -0.35, 16.5);
        rootRef.current.rotation.y = 0;
      }
    } else if (role === 'boba_drinker') {
      // Seated comfortably at GG Boba patio table 1
      rootRef.current.position.set(basePos[0], -0.35, basePos[2]);
      rootRef.current.rotation.y = Math.PI * 0.35;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.2;
        rightLegRef.current.rotation.x = -Math.PI / 2.2;
      }
      if (rightArmRef.current) {
        // Periodic sipping animation
        const sipCycle = Math.sin(t * 0.8);
        rightArmRef.current.rotation.x = sipCycle > 0.5 ? -1.1 : -0.5;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.2;
      }
    } else if (role === 'boba_friend') {
      // Seated across at GG Boba patio table 1
      rootRef.current.position.set(basePos[0], -0.35, basePos[2]);
      rootRef.current.rotation.y = -Math.PI * 0.65;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.2;
        rightLegRef.current.rotation.x = -Math.PI / 2.2;
      }
      if (rightArmRef.current && leftArmRef.current) {
        rightArmRef.current.rotation.x = -0.5 + Math.sin(t * 1.5) * 0.15;
        leftArmRef.current.rotation.x = -0.45 + Math.cos(t * 1.3) * 0.1;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.cos(t * 1.1) * 0.25;
      }
    } else if (role === 'cheerer') {
      // Stands at Champions Plaza watching Jumbotron
      rootRef.current.position.set(basePos[0], -0.35, basePos[2]);
      rootRef.current.rotation.y = 0; // facing Jumbotron (+z)
      const cheerSpeed = isTournamentUnderway ? 8 : 3.5;
      const jumpIntensity = isTournamentUnderway ? 0.06 : 0.02;
      rootRef.current.position.y = -0.35 + Math.abs(Math.sin(t * cheerSpeed)) * jumpIntensity;
      if (leftArmRef.current && rightArmRef.current) {
        // Both arms raised cheering!
        leftArmRef.current.rotation.x = -2.2 + Math.sin(t * cheerSpeed) * 0.3;
        leftArmRef.current.rotation.z = -0.35;
        rightArmRef.current.rotation.x = -2.2 + Math.cos(t * cheerSpeed) * 0.3;
        rightArmRef.current.rotation.z = 0.35;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.35; // looking up at big screen
      }
    } else if (role === 'shopper') {
      // Enter the open storefront, browse the counter, then return outside.
      const cycle = t % 14;
      const depth = cycle < 3 ? cycle / 3 : cycle < 9 ? 1 : cycle < 12 ? 1 - (cycle - 9) / 3 : 0;
      rootRef.current.position.set(basePos[0], -0.38, 28.8 + depth * 2.4);
      rootRef.current.rotation.y = cycle < 3 ? 0 : cycle < 9 ? Math.PI / 2 : Math.PI;
      const walking = cycle < 3 || (cycle >= 9 && cycle < 12);
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = walking ? Math.sin(t * 9) * 0.55 : 0;
        rightLegRef.current.rotation.x = walking ? -Math.sin(t * 9) * 0.55 : 0;
      }
      if (rightArmRef.current) rightArmRef.current.rotation.x = walking ? -Math.sin(t * 9) * 0.3 : -0.5;
    } else {
      // Stroller walking along commercial sidewalk (z = 27.8, x: -16 to 18)
      const walkSpan = 32;
      const cycle = (t * 1.8) % (walkSpan * 2);
      const isEast = cycle < walkSpan;
      const xPos = isEast ? -16 + cycle : 16 - (cycle - walkSpan);
      rootRef.current.position.set(xPos, -0.35 + Math.abs(Math.sin(t * 6)) * 0.03, 27.8);
      rootRef.current.rotation.y = isEast ? Math.PI / 2 : -Math.PI / 2;
      const walkCycle = t * 6;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
        rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.6;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;
        rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.45;
      }
    }
  });

  return (
    <group ref={rootRef} position={basePos}>
      {/* Torso / Jacket */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.26, 0.38, 0.16]} />
        <meshStandardMaterial color={topColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.72, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 10, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Hair / Cap */}
        {id % 2 === 0 ? (
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.115, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#1e1b18" roughness={0.9} />
          </mesh>
        ) : (
          <group position={[0, 0.05, 0]}>
            {/* Snapback Baseball Cap */}
            <mesh>
              <sphereGeometry args={[0.115, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color={jerseyColors.accentColor} />
            </mesh>
            <mesh position={[0, 0.01, 0.11]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.14, 0.02, 0.09]} />
              <meshStandardMaterial color={jerseyColors.accentColor} />
            </mesh>
          </group>
        )}
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.07, isSeated ? 0.28 : 0.28, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.08, 0.28, 0.09]} />
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </mesh>
        {/* Sneaker */}
        <mesh position={[0, -0.27, 0.02]}>
          <boxGeometry args={[0.085, 0.05, 0.14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.07, isSeated ? 0.28 : 0.28, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.08, 0.28, 0.09]} />
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </mesh>
        {/* Sneaker */}
        <mesh position={[0, -0.27, 0.02]}>
          <boxGeometry args={[0.085, 0.05, 0.14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.17, 0.56, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <boxGeometry args={[0.07, 0.26, 0.07]} />
          <meshStandardMaterial color={topColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.17, 0.56, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <boxGeometry args={[0.07, 0.26, 0.07]} />
          <meshStandardMaterial color={topColor} roughness={0.7} />
        </mesh>
        {/* Handheld Smartphone for Photographers */}
        {role === 'photographer' && (
          <group position={[0, -0.27, 0.06]} rotation={[0.4, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.05, 0.09, 0.015]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.008]}>
              <planeGeometry args={[0.045, 0.08]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <pointLight ref={flashLightRef} position={[0, 0, -0.1]} color="#ffffff" distance={3.5} intensity={0} />
          </group>
        )}
      </group>
    </group>
  );
};

// ============================================================================

// ============================================================================
// 1.5 BACKYARD SPORTS COMPLEX (UPGRADEABLE BASKETBALL & FOOTBALL)
// ============================================================================

interface SportsFacilityProps {
  tier: 1 | 2 | 3;
  primaryColor: string;
  accentColor: string;
  ballRef?: React.RefObject<any>;
}

const BackyardBasketballCourt: React.FC<SportsFacilityProps> = ({
  tier,
  primaryColor,
  ballRef,
}) => {
  return (
    <group position={[-2.5, 0, -13]}>
      {/* Finished permeable court base: no floating black slab. */}
      <mesh position={[0, -0.43, 0]} receiveShadow>
        <boxGeometry args={[10.8, 0.18, 8.8]} />
        <meshStandardMaterial
          color={tier === 1 ? '#64748b' : tier === 2 ? '#1e3a8a' : '#172554'}
          roughness={tier === 3 ? 0.35 : 0.65}
          metalness={tier === 3 ? 0.2 : 0.05}
        />
      </mesh>

      <mesh position={[0, -0.515, 0]} receiveShadow>
        <boxGeometry args={[11.2, 0.05, 9.2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {/* Tier 2 & 3: Colored Inner Paint Key & 3-Point Zone */}
      {tier >= 2 && (
        <mesh position={[0, -0.468, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9.8, 7.8]} />
          <meshStandardMaterial color={tier === 3 ? '#1e3a8a' : '#0284c7'} roughness={0.4} />
        </mesh>
      )}

      {/* Painted Court Boundary Line */}
      {[
        [0, -4.02, 10.1, 0.08], [0, 4.02, 10.1, 0.08],
        [-5.02, 0, 0.08, 8.1], [5.02, 0, 0.08, 8.1],
      ].map(([x, z, width, depth], index) => <mesh key={index} position={[x, -0.33, z]}><boxGeometry args={[width, 0.015, depth]} /><meshBasicMaterial color="#f8fafc" /></mesh>)}

      {/* Center Half-Court Line */}
      <mesh position={[0, -0.33, 0]}>
        <boxGeometry args={[0.08, 0.002, 8.0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Center Court Circle */}
      <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.38, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Tier 3: Team Crest in Center Court */}
      {tier === 3 && (
        <group position={[0, -0.462, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.2, 32]} />
            <meshStandardMaterial color={primaryColor} roughness={0.3} />
          </mesh>
          <Html position={[0, 0.1, 0]} center transform rotation={[-Math.PI / 2, 0, 0]} scale={0.28}>
            <div className="font-black text-slate-950 uppercase tracking-widest text-[16px] select-none pointer-events-none drop-shadow">
              DYNASTY
            </div>
          </Html>
        </group>
      )}

      {/* West Main Hoop Assembly */}
      <group position={[-4.8, -0.4, 0]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[0.16, 3.6, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.45, 3.2, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <boxGeometry args={[1.1, 0.12, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>

        <group position={[0.95, 3.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.05, 1.15, 1.8]} />
            {tier === 1 ? (
              <meshStandardMaterial color="#f8fafc" roughness={0.5} />
            ) : (
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.65}
                roughness={0.1}
                metalness={0.1}
                transmission={0.8}
              />
            )}
          </mesh>
          <mesh position={[0.026, -0.15, 0]}>
            <boxGeometry args={[0.01, 0.45, 0.6]} />
            <meshBasicMaterial color={tier >= 2 ? '#ef4444' : '#0284c7'} wireframe />
          </mesh>
          <mesh position={[0.3, -0.32, 0]}>
            <torusGeometry args={[0.26, 0.024, 12, 24]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.3, -0.55, 0]}>
            <cylinderGeometry args={[0.25, 0.14, 0.42, 12, 1, true]} />
            <meshStandardMaterial color="#f8fafc" wireframe transparent opacity={0.7} />
          </mesh>

          {tier === 3 && (
            <group position={[0, 0.78, 0]}>
              <mesh>
                <boxGeometry args={[0.12, 0.32, 0.55]} />
                <meshStandardMaterial color="#020617" roughness={0.3} />
              </mesh>
              <Html position={[0.07, 0, 0]} center transform rotation={[0, Math.PI / 2, 0]} scale={0.12}>
                <div className="bg-black/95 px-1 py-0.5 rounded border border-red-600 text-red-500 font-mono font-black text-[14px] tracking-widest">
                  24
                </div>
              </Html>
            </group>
          )}
        </group>

        {tier === 3 && (
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.42, 1.6, 0.42]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
          </mesh>
        )}
      </group>

      {/* Tier 3: East Opposite Hoop (Full Court) */}
      {tier === 3 && (
        <group position={[4.8, -0.4, 0]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.16, 3.6, 0.16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.45, 3.2, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
            <boxGeometry args={[1.1, 0.12, 0.12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          <group position={[0.95, 3.2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.05, 1.15, 1.8]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.65}
                roughness={0.1}
                transmission={0.8}
              />
            </mesh>
            <mesh position={[0.3, -0.32, 0]}>
              <torusGeometry args={[0.26, 0.024, 12, 24]} />
              <meshStandardMaterial color="#f97316" metalness={0.6} />
            </mesh>
            <mesh position={[0.3, -0.55, 0]}>
              <cylinderGeometry args={[0.25, 0.14, 0.42, 12, 1, true]} />
              <meshStandardMaterial color="#f8fafc" wireframe transparent opacity={0.7} />
            </mesh>
            <group position={[0, 0.78, 0]}>
              <mesh>
                <boxGeometry args={[0.12, 0.32, 0.55]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
              <Html position={[0.07, 0, 0]} center transform rotation={[0, Math.PI / 2, 0]} scale={0.12}>
                <div className="bg-black/95 px-1 py-0.5 rounded border border-red-600 text-red-500 font-mono font-black text-[14px]">
                  24
                </div>
              </Html>
            </group>
          </group>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.42, 1.6, 0.42]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Tier 1: Rear Chain-Link Fence */}
      {tier === 1 && (
        <group position={[-5.3, -0.4, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.04, 3.0, 8.4]} />
            <meshStandardMaterial color="#64748b" wireframe transparent opacity={0.55} />
          </mesh>
          {[-4, -1.3, 1.3, 4].map((pz) => (
            <mesh key={pz} position={[0, 1.5, pz]}>
              <cylinderGeometry args={[0.05, 0.05, 3.0, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Tier 2 & 3: Sports Floodlight Towers */}
      {tier >= 2 && (
        <>
          <group position={[-4.8, -0.4, -3.8]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 5.0, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
            <mesh position={[0.2, 4.9, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.45, 0.18, 0.6]} />
              <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
            <pointLight position={[0.5, 4.8, 0]} intensity={0.45} distance={12} color="#fef08a" />
          </group>
          <group position={[-4.8, -0.4, 3.8]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 5.0, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
            <mesh position={[0.2, 4.9, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.45, 0.18, 0.6]} />
              <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
            <pointLight position={[0.5, 4.8, 0]} intensity={0.45} distance={12} color="#fef08a" />
          </group>
        </>
      )}

      {/* Courtside Bench & Hydration */}
      {tier >= 2 && (
        <group position={[0, -0.4, 4.4]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[3.2, 0.08, 0.5]} />
            <meshStandardMaterial color={tier === 3 ? '#94a3b8' : '#334155'} metalness={tier === 3 ? 0.8 : 0.2} />
          </mesh>
          {[-1.2, 1.2].map((bx) => (
            <mesh key={bx} position={[bx, 0.12, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))}
          <mesh position={[1.8, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.5, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Ball Rack with Basketballs */}
      <group position={[-3.8, -0.4, 3.8]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.35, 0.9, 1.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} wireframe />
        </mesh>
        {[-0.35, 0, 0.35].map((bz) => (
          <mesh key={bz} position={[0, 0.65, bz]} castShadow>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Animated Bouncing Basketball */}
      <group ref={ballRef} position={[-2.0, -0.28, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 14, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.65} metalness={0.05} />
        </mesh>
      </group>
    </group>
  );
};

const BackyardFootballPitch: React.FC<SportsFacilityProps> = ({
  tier,
  ballRef,
}) => {
  return (
    <group position={[14.5, 0, -13]}>
      {/* Turf Foundation Pad (15m x 11m) */}
      <mesh position={[0, -0.43, 0]} receiveShadow>
        <boxGeometry args={[15.6, 0.18, 11.6]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      {/* Alternating Mowing Turf Grass Stripes */}
      {[-5, -3, -1, 1, 3, 5].map((sx, idx) => (
        <mesh key={sx} position={[sx * 1.25, -0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 10.8]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#4ade80' : '#34b66a'}
            roughness={0.85}
          />
        </mesh>
      ))}

      {/* Pitch Boundary Lines (White Chalk) */}
      {[
        [0, -5.2, 14.6, 0.08], [0, 5.2, 14.6, 0.08],
        [-7.3, 0, 0.08, 10.4], [7.3, 0, 0.08, 10.4],
      ].map(([x, z, width, depth], index) => <mesh key={index} position={[x, -0.32, z]}><boxGeometry args={[width, 0.015, depth]} /><meshBasicMaterial color="#f8fafc" /></mesh>)}

      {/* Halfway Line */}
      <mesh position={[0, -0.32, 0]}>
        <boxGeometry args={[0.08, 0.002, 10.4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Center Circle & Spot */}
      <mesh position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.78, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.30, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Penalty Boxes (West & East) */}
      {[-6.1, 6.1].map((px) => (
        <group key={px} position={[px, -0.464, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 5.2]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
          <mesh position={[px > 0 ? -1.4 : 1.4, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* 4 Corner Flags */}
      {[ 
        [-7.1, -5.0],
        [7.1, -5.0],
        [-7.1, 5.0],
        [7.1, 5.0],
      ].map(([fx, fz], idx) => (
        <group key={idx} position={[fx, -0.4, fz]}>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.3, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.12, 1.15, 0]}>
            <boxGeometry args={[0.24, 0.16, 0.01]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#ef4444' : '#0284c7'} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* TIER 1: Portable Mini Training Goals & Agility Cones */}
      {tier === 1 && (
        <>
          <group position={[-7.2, -0.4, 0]}>
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[0.6, 1.3, 2.2]} />
              <meshStandardMaterial color="#f8fafc" wireframe />
            </mesh>
          </group>
          <group position={[7.2, -0.4, 0]}>
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[0.6, 1.3, 2.2]} />
              <meshStandardMaterial color="#f8fafc" wireframe />
            </mesh>
          </group>
          {[-3.5, -2.1, -0.7, 0.7, 2.1, 3.5].map((cx, i) => (
            <mesh key={cx} position={[cx, -0.32, (i % 2 === 0 ? 0.6 : -0.6)]} castShadow>
              <coneGeometry args={[0.12, 0.3, 8]} />
              <meshStandardMaterial color="#f97316" roughness={0.4} />
            </mesh>
          ))}
        </>
      )}

      {/* TIER 2 & 3: Full-Size Pro Tubular Steel Football Goals */}
      {tier >= 2 && (
        <>
          <group position={[-7.3, -0.4, 0]}>
            <mesh position={[0, 1.3, -1.8]}>
              <cylinderGeometry args={[0.06, 0.06, 2.6, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.3, 1.8]}>
              <cylinderGeometry args={[0.06, 0.06, 2.6, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 3.6, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[-0.6, 1.3, 0]}>
              <boxGeometry args={[1.2, 2.5, 3.6]} />
              <meshStandardMaterial color="#f8fafc" wireframe transparent opacity={0.65} />
            </mesh>
          </group>

          <group position={[7.3, -0.4, 0]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 1.3, -1.8]}>
              <cylinderGeometry args={[0.06, 0.06, 2.6, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.3, 1.8]}>
              <cylinderGeometry args={[0.06, 0.06, 2.6, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 3.6, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[-0.6, 1.3, 0]}>
              <boxGeometry args={[1.2, 2.5, 3.6]} />
              <meshStandardMaterial color="#f8fafc" wireframe transparent opacity={0.65} />
            </mesh>
          </group>
        </>
      )}

      {/* TIER 2: Substitution Bench */}
      {tier === 2 && (
        <group position={[0, -0.4, 5.8]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[4.2, 0.08, 0.6]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[-2.4, 0.35, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.55, 12]} />
            <meshStandardMaterial color="#10b981" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* TIER 3: Covered Team Dugouts */}
      {tier === 3 && (
        <group position={[0, -0.4, 5.9]}>
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[5.4, 0.08, 1.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.9, 0.65]}>
            <boxGeometry args={[5.2, 1.6, 0.06]} />
            <meshPhysicalMaterial color="#93c5fd" transparent opacity={0.4} transmission={0.7} />
          </mesh>
          {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((sx, idx) => (
            <mesh key={sx} position={[sx, 0.38, 0.1]} castShadow>
              <boxGeometry args={[0.48, 0.55, 0.48]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#1e3a8a' : '#0284c7'} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* TIER 3: Electronic LED Stadium Scoreboard */}
      {tier === 3 && (
        <group position={[0, -0.4, -6.2]}>
          <mesh position={[-2.2, 2.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 5.0, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[2.2, 2.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 5.0, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 4.4, 0]}>
            <boxGeometry args={[5.8, 1.6, 0.35]} />
            <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
          </mesh>
          <Html position={[0, 4.4, 0.2]} center transform scale={0.16}>
            <div className="bg-slate-950/95 border-2 border-emerald-500/80 rounded-xl p-2.5 shadow-2xl flex flex-col items-center gap-1 select-none pointer-events-none min-w-[280px]">
              <div className="flex items-center justify-between w-full text-[11px] font-black text-slate-400 border-b border-slate-800 pb-1">
                <span className="text-emerald-400 uppercase tracking-widest">PRO DYNASTY ARENA</span>
                <span className="text-amber-400 animate-pulse">78' LIVE</span>
              </div>
              <div className="flex items-center justify-between w-full px-2 pt-0.5">
                <div className="text-center">
                  <div className="text-[12px] font-black text-cyan-300">DYNASTY FC</div>
                  <div className="text-[24px] font-black text-white font-mono leading-none">3</div>
                </div>
                <div className="text-[14px] font-black text-slate-500 font-mono">VS</div>
                <div className="text-center">
                  <div className="text-[12px] font-black text-slate-300">RIVALS</div>
                  <div className="text-[24px] font-black text-slate-300 font-mono leading-none">0</div>
                </div>
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* TIER 3: Sideline Sponsor A-Boards */}
      {tier === 3 && (
        <group position={[0, -0.4, -5.5]}>
          {[-4.5, -1.5, 1.5, 4.5].map((bx) => (
            <mesh key={bx} position={[bx, 0.25, 0]} rotation={[-Math.PI / 12, 0, 0]} castShadow>
              <boxGeometry args={[2.7, 0.45, 0.15]} />
              <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* Stadium Floodlight Towers (Tier 2 & 3) */}
      {tier >= 2 && (
        <>
          <group position={[-7.5, -0.4, -5.4]}>
            <mesh position={[0, 3.2, 0]}>
              <cylinderGeometry args={[0.08, 0.15, 6.4, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
            <mesh position={[0.3, 6.3, 0.3]} rotation={[Math.PI / 4, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.8, 0.25, 0.5]} />
              <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
            <pointLight position={[0.5, 6.2, 0.5]} intensity={0.55} distance={15} color="#e0f2fe" />
          </group>
          <group position={[7.5, -0.4, -5.4]}>
            <mesh position={[0, 3.2, 0]}>
              <cylinderGeometry args={[0.08, 0.15, 6.4, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
            <mesh position={[-0.3, 6.3, 0.3]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
              <boxGeometry args={[0.8, 0.25, 0.5]} />
              <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
            <pointLight position={[-0.5, 6.2, 0.5]} intensity={0.55} distance={15} color="#e0f2fe" />
          </group>
        </>
      )}

      {/* Animated Football (Soccer Ball) */}
      <group ref={ballRef} position={[0, -0.32, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 14, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// 2. MAIN ENVIRONMENT COMPONENT
// ============================================================================

export const HouseEnvironment3D: React.FC<{ empire: EmpireState; showRoof: boolean }> = ({ empire, showRoof }) => {
  const isTournamentUnderway = useGameStore((s) => s.isTournamentUnderway);
  const roster = useGameStore((s) => s.roster);
  const totalFans = roster.reduce((sum, player) => sum + (player.fans ?? 0), 0);
  // Density grows with organization fandom, while district upgrades raise the ceiling.
  const extraFanCount = Math.min(3 + empire.districtTier * 4, Math.floor(totalFans / 600));
  const carRef = useRef<Group>(null);
  const underglowRef = useRef<Mesh>(null);
  const tvScreenRef = useRef<Mesh>(null);
  const jumbotronRef = useRef<Mesh>(null);
  const trafficCar1Ref = useRef<Group>(null);
  const trafficCar2Ref = useRef<Group>(null);
  const bballRef = useRef<Group>(null);
  const soccerBallRef = useRef<Group>(null);

  // Subtle vehicle idle vibration, living traffic movement, and screen glows
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // Team sports car idle vibration
    if (carRef.current) {
      const vibIntensity = isTournamentUnderway ? 0.007 : 0.0025;
      const vibSpeed = isTournamentUnderway ? 26 : 12;
      carRef.current.position.y = Math.sin(t * vibSpeed) * vibIntensity;
    }

    // Underglow neon pulsing
    if (underglowRef.current) {
      const pulse = isTournamentUnderway
        ? 0.75 + Math.sin(t * 8) * 0.25
        : 0.45 + Math.sin(t * 2) * 0.15;
      const mat = underglowRef.current.material as any;
      if (mat) mat.opacity = pulse;
    }

    // Outdoor TV screen flicker
    if (tvScreenRef.current) {
      const flicker = 0.88 + Math.sin(t * 5.3) * 0.07 + Math.cos(t * 11.2) * 0.05;
      const mat = tvScreenRef.current.material as any;
      if (mat) mat.opacity = flicker;
    }

    // Outdoor Jumbotron screen pulse
    if (jumbotronRef.current) {
      const pulse = 0.92 + Math.sin(t * 3.8) * 0.06;
      const mat = jumbotronRef.current.material as any;
      if (mat) mat.opacity = pulse;
    }

    // Traffic Car 1: Silver commuter sedan going East (+x) on outer lane (z = 23.2)
    if (trafficCar1Ref.current) {
      trafficCar1Ref.current.position.x += 13.5 * delta;
      if (trafficCar1Ref.current.position.x > 50) {
        trafficCar1Ref.current.position.x = -42;
      }
    }

    // Traffic Car 2: Cyan delivery courier van going West (-x) on inner lane (z = 19.8)
    if (trafficCar2Ref.current) {
      trafficCar2Ref.current.position.x -= 10.5 * delta;
      if (trafficCar2Ref.current.position.x < -42) {
        trafficCar2Ref.current.position.x = 50;
      }
    }
    // Animated bouncing basketball in backyard
    if (bballRef.current) {
      const bCycle = (t * 4.2) % (Math.PI * 2);
      bballRef.current.position.y = -0.28 + Math.abs(Math.sin(bCycle)) * 0.95;
      bballRef.current.rotation.x = t * 3.5;
    }

    // Animated rolling/passing soccer ball in backyard
    if (soccerBallRef.current) {
      const sCycle = Math.sin(t * 1.4);
      soccerBallRef.current.position.x = sCycle * 2.8;
      soccerBallRef.current.position.z = Math.cos(t * 1.4) * 1.2;
      soccerBallRef.current.rotation.y = t * 2.0;
      soccerBallRef.current.rotation.z = sCycle * 1.5;
    }

  });

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================ */}
      {/* 1. SURROUNDING TERRAIN & SEAMLESS GREEN GROUND               */}
      {/* ============================================================ */}
      {/* Expanded lush manicured lawn terrain - eliminates pitch-black void! */}
      <mesh position={[7, -0.6, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[320, 320]} />
        <meshStandardMaterial color="#166534" roughness={0.88} metalness={0.05} />
      </mesh>

      {/* Main Property Paved Stone Lawn Edging */}
      <mesh position={[7, -0.585, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[68, 58]} />
        <meshStandardMaterial color="#15803d" roughness={0.82} />
      </mesh>

      {/* Solid landscaped backyard pad ties the sports facilities into the property. */}
      <mesh position={[7, -0.58, -13]} receiveShadow>
        <boxGeometry args={[32.2, 0.22, 26.4]} />
        <meshStandardMaterial color="#3f9a5a" roughness={0.92} />
      </mesh>
      <mesh position={[7, -0.455, -13]} receiveShadow>
        <boxGeometry args={[31.8, 0.04, 26]} />
        <meshStandardMaterial color="#5fbe72" roughness={0.95} />
      </mesh>

      {/* Groundcover beds remove the empty void between patio, courts, and fence. */}
      {[
        [-7.1, -4.5, 1.1, 12.8], [21.1, -4.5, 1.1, 12.8],
        [5.9, -22.2, 27.8, 1.15], [5.8, -5.6, 8.2, 1.0],
      ].map(([x, z, width, depth], index) => <mesh key={index} position={[x, -0.405, z]} receiveShadow>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color="#2f855a" roughness={1} />
      </mesh>)}

      {[[-6.2, -20.4], [-4.4, -21.1], [18.4, -21], [20.2, -19.5], [5.6, -5.5]].map(([x, z], index) => (
        <group key={index} position={[x, -0.38, z]}>
          <mesh position={[0, 0.28, 0]} castShadow><sphereGeometry args={[0.42, 12, 10]} /><meshStandardMaterial color={index % 2 ? '#f59e0b' : '#ec4899'} roughness={0.8} /></mesh>
          <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.08, 0.11, 0.34, 8]} /><meshStandardMaterial color="#166534" roughness={0.9} /></mesh>
        </group>
      ))}

      {/* ============================================================ */}
      {/* 2. NORTH BACKYARD SPORTS COMPLEX (UPGRADEABLE)               */}
      {/* ============================================================ */}
      {/* Estate Perimeter Privacy Fences (North, West, East) */}
      {/* North Perimeter Privacy Fence (z = -26.5) */}
      <group position={[7, -0.5, -26.5]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[40, 0.16, 0.25]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[39.8, 1.9, 0.08]} />
          <meshStandardMaterial color="#78350f" roughness={0.75} />
        </mesh>
        {[-0.6, -0.2, 0.2, 0.6].map((sy) => (
          <mesh key={sy} position={[0, 1.1 + sy, 0.045]}>
            <boxGeometry args={[39.8, 0.03, 0.02]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        ))}
        {[-19, -13, -7, -1, 5, 11, 17].map((px) => (
          <mesh key={px} position={[px, 1.15, 0]} castShadow>
            <boxGeometry args={[0.16, 2.1, 0.16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* West Perimeter Side Fence (x = -9, stretching z = 0 to -26.5) */}
      <group position={[-9, -0.5, -13.25]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.08, 1.9, 26.5]} />
          <meshStandardMaterial color="#78350f" roughness={0.75} />
        </mesh>
        {[-11, -5, 0, 5, 11].map((pz) => (
          <mesh key={pz} position={[0, 1.15, pz]} castShadow>
            <boxGeometry args={[0.16, 2.1, 0.16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* East Perimeter Side Fence (x = 23, stretching z = 0 to -26.5) */}
      <group position={[23, -0.5, -13.25]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.08, 1.9, 26.5]} />
          <meshStandardMaterial color="#78350f" roughness={0.75} />
        </mesh>
        {[-11, -5, 0, 5, 11].map((pz) => (
          <mesh key={pz} position={[0, 1.15, pz]} castShadow>
            <boxGeometry args={[0.16, 2.1, 0.16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Backyard Terrace Patio (attached to rear of house) */}
      <group position={[7, -0.48, -1.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[14, 0.14, 2.8]} />
          <meshStandardMaterial color="#334155" roughness={0.75} />
        </mesh>
        {/* Terrace Step */}
        <mesh position={[0, -0.04, -1.5]}>
          <boxGeometry args={[14.4, 0.08, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        {/* Rear Sliding Glass Door Frame */}
        <mesh position={[0, 1.5, 1.3]}>
          <boxGeometry args={[3.2, 2.6, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 1.5, 1.3]}>
          <boxGeometry args={[3.0, 2.4, 0.04]} />
          <meshPhysicalMaterial color="#99f6e4" transparent opacity={0.35} transmission={0.6} />
        </mesh>
      </group>

      {/* Cobblestone Garden Walkways to Sports Courts */}
      {/* Path to Basketball Court (West) */}
      {[-1.0, -1.8, -2.5, -3.2].map((wx, idx) => (
        <mesh key={wx} position={[wx, -0.46, -4.5 - idx * 2.0]} receiveShadow>
          <boxGeometry args={[1.6, 0.02, 1.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
      ))}

      {/* Path to Football Pitch (East) */}
      {[10.5, 11.5, 12.5, 13.5].map((wx, idx) => (
        <mesh key={wx} position={[wx, -0.46, -4.5 - idx * 2.0]} receiveShadow>
          <boxGeometry args={[1.6, 0.02, 1.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
      ))}

      {/* Solar Landscape Path Lights */}
      {[
        [-1.8, -4.5],
        [-3.2, -8.5],
        [10.5, -4.5],
        [13.5, -8.5],
        [1.5, -2.5],
        [12.5, -2.5],
      ].map(([lx, lz], i) => (
        <group key={i} position={[lx, -0.45, lz]}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.44, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.1, 8]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 0.45, 0]} intensity={0.15} distance={3.5} color="#fef08a" />
        </group>
      ))}

      {/* 🏀 UPGRADEABLE BASKETBALL COURT (WEST BACKYARD) */}
      <BackyardBasketballCourt
        tier={(empire.basketballTier ?? 1) as 1 | 2 | 3}
        primaryColor={empire.branding.primaryColor}
        accentColor={empire.branding.accentColor}
        ballRef={bballRef}
      />

      {/* ⚽ UPGRADEABLE FOOTBALL PITCH (EAST BACKYARD) */}
      <BackyardFootballPitch
        tier={(empire.footballTier ?? 1) as 1 | 2 | 3}
        primaryColor={empire.branding.primaryColor}
        accentColor={empire.branding.accentColor}
        ballRef={soccerBallRef}
      />

      {/* Neighboring Suburban Houses North of Fence (Moved further back) */}
      {/* North House 1: Contemporary Villa (x = -10, z = -34) */}
      <group position={[-10, -0.5, -34]}>
        <mesh position={[0, 2.4, 0]} castShadow>
          <boxGeometry args={[11, 4.8, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        <mesh position={[0, 5.0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[4.2, 4.2, 8.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <mesh position={[2, 2.0, 4.02]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[-2.5, 3.2, 4.02]}>
          <planeGeometry args={[3.0, 1.4]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      </group>

      {/* North House 2: Scandinavian Gable Residence (x = 14, z = -36) */}
      <group position={[14, -0.5, -36]}>
        <mesh position={[0, 2.6, 0]} castShadow>
          <boxGeometry args={[12, 5.2, 9]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>
        <mesh position={[0, 5.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[4.6, 4.6, 9.2]} />
          <meshStandardMaterial color="#020617" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.2, 4.52]}>
          <planeGeometry args={[4.5, 2.0]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      </group>

      {/* Lush Tree Line along North Perimeter (z = -29 to -33) */}
      {[
        [-17, -30, 4.5, 1.2],
        [-13, -32, 5.2, 1.4],
        [-4, -30.5, 4.8, 1.3],
        [1, -31.5, 5.5, 1.5],
        [7, -30, 4.2, 1.1],
        [15, -31, 5.8, 1.6],
        [21, -30, 4.6, 1.2],
        [26, -32, 5.0, 1.3],
      ].map(([tx, tz, th, tr], idx) => (
        <group key={idx} position={[tx, -0.5, tz]}>
          <mesh position={[0, th * 0.35, 0]} castShadow>
            <cylinderGeometry args={[tr * 0.16, tr * 0.22, th * 0.7, 8]} />
            <meshStandardMaterial color="#542b18" roughness={0.9} />
          </mesh>
          <mesh position={[0, th * 0.7, 0]} castShadow>
            <coneGeometry args={[tr * 1.3, th * 0.65, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#14532d' : '#15803d'} roughness={0.85} />
          </mesh>
          <mesh position={[0, th * 1.05, 0]} castShadow>
            <coneGeometry args={[tr * 0.95, th * 0.55, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#166534' : '#16a34a'} roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* ============================================================ */}
      {/* 3. STREET ASPHALT, CROSSWALK, AND CURBS                      */}
      {/* ============================================================ */}
      {/* Outer Asphalt Street */}
      <mesh position={[7, -0.58, 21.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[110, 11]} />
        <meshStandardMaterial color="#1e2229" roughness={0.88} metalness={0.12} />
      </mesh>

      {/* Street Centerline Markings (dashed yellow lines) */}
      {[-36, -28, -20, -12, -4, 4, 12, 20, 28, 36, 44].map((xOffset) => (
        <mesh key={xOffset} position={[7 + xOffset, -0.575, 21.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.2, 0.28]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      ))}

      {/* Outer White Shoulder Lines */}
      <mesh position={[7, -0.574, 16.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 0.2]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[7, -0.574, 26.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 0.2]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* Pedestrian Zebra Crosswalk connecting House driveway to Dynasty Mart */}
      <group position={[-2.0, -0.573, 21.5]} rotation={[-Math.PI / 2, 0, 0]}>
        {[-4.0, -2.4, -0.8, 0.8, 2.4, 4.0].map((pz) => (
          <mesh key={pz} position={[0, pz, 0]}>
            <planeGeometry args={[2.4, 0.55]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Concrete Curbs along the Street */}
      <mesh position={[7, -0.52, 16.3]} receiveShadow>
        <boxGeometry args={[48, 0.15, 0.35]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[7, -0.52, 26.7]} receiveShadow>
        <boxGeometry args={[48, 0.15, 0.35]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Front Sidewalk */}
      <mesh position={[7, -0.51, 15.6]} receiveShadow>
        <boxGeometry args={[26, 0.12, 1.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>

      {/* Driveway Pavers / Asphalt Pad for Basketball Court & Garage Ramp */}
      <mesh position={[21.8, -0.48, 15.4]} receiveShadow>
        <boxGeometry args={[8.4, 0.14, 3.8]} />
        <meshStandardMaterial color="#2d3748" roughness={0.75} />
      </mesh>

      {/* ============================================================ */}
      {/* 4. FRONT ENTRANCE & SLIDING DOORS                            */}
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

      <RoomDoor3D x={6.9} z={13.6} width={1} />

      {/* ============================================================ */}
      {/* 5. LOW-PROFILE ENTRY GARDEN — not an outdoor living room.    */}
      {/* ============================================================ */}
      <group position={[3.0, 0, 15.1]}>
        {/* Rich Cedar Timber Decking Platform */}
        <mesh position={[0, -0.42, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.12, 1.5]} />
          <meshStandardMaterial color="#64748b" roughness={0.75} />
        </mesh>
        {/* Deck Slat Lines */}
        {[-1.2, -0.6, 0, 0.6, 1.2].map((dx) => (
          <mesh key={dx} position={[dx, -0.335, 0]}>
            <boxGeometry args={[0.04, 0.01, 1.45]} />
            <meshStandardMaterial color="#21100a" roughness={0.9} />
          </mesh>
        ))}

        {/* Low entry bollards replace the oversized pergola. */}
        {[
          [-2.1, -1.2],
          [2.1, -1.2],
          [-2.1, 1.2],
          [2.1, 1.2],
        ].map(([px, pz], idx) => (
          <mesh key={idx} position={[px * 0.6, -0.1, pz * 0.45]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.45, 10]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}

        {/* Ground-level path lights, with no roof blocking the house. */}
        {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((sz) => (
          <mesh key={sz} position={[-1.15 + (sz + 1) * 1.15, -0.12, 0.58]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        ))}

        {/* Compact wayfinding sign replaces the misplaced outdoor TV. */}
        <group position={[-1.25, -0.28, -0.2]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.12, 0.55, 0.18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.05, 0.85, 0]} castShadow>
            <boxGeometry args={[0.05, 0.4, 0.65]} />
            <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.08, 0.85, 0]}>
            <boxGeometry args={[0.02, 0.42, 0.67]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.2} />
          </mesh>
          <mesh ref={tvScreenRef} position={[0.095, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.61, 0.36]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.92} />
          </mesh>
          <pointLight position={[0.4, 0.45, 0]} color="#38bdf8" intensity={0.35} distance={2} />
        </group>

        {/* One small waiting bench keeps the entrance readable. */}
        <group position={[0.3, -0.4, 0]}>
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 0.22, 0.42]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          <mesh position={[0.75, 0.45, 0]} castShadow>
            <boxGeometry args={[0.12, 0.32, 0.42]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.05, 0.08, 0.34]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 6. MOTORSPORTS DRIVEWAY PARKING & APPROACH                   */}
      {/* ============================================================ */}
      <group position={[10.5, 0, 15.0]}>
        <mesh position={[0, -0.405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 2.8]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, -0.404, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.0, 2.6]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 7. AUTHENTIC PRO MOTORSPORTS GARAGE WORKSHOP (REDESIGNED)    */}
      {/* ============================================================ */}
      {/* Dedicated garage plot, separated from the expanded Merch showroom. */}
      <group position={[CAMPUS.garage.x + CAMPUS.garage.w / 2, -0.45, CAMPUS.garage.y + CAMPUS.garage.d / 2]}>
        {/* Concrete Garage Foundation Slab */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[7.2, 0.2, 6.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>

        {/* Polished Epoxy Checkerboard Floor */}
        <group position={[0, 0.16, 0]}>
          {[-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((gx, ix) =>
            [-2.2, -1.3, -0.4, 0.5, 1.4, 2.3].map((gz, iz) => (
              <mesh key={`${ix}-${iz}`} position={[gx, 0, gz]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.88, 0.88]} />
                <meshStandardMaterial
                  color={(ix + iz) % 2 === 0 ? '#0f172a' : '#334155'}
                  roughness={0.2}
                  metalness={0.3}
                />
              </mesh>
            ))
          )}
          {/* Yellow Safety Hazard Boundary Stripes */}
          <mesh position={[0, 0.005, 2.78]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.2, 0.12]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </group>

        {/* Sloped Concrete Driveway Apron connecting Garage to Street */}
        <mesh position={[0, 0.02, 3.8]} rotation={[-0.08, 0, 0]} receiveShadow>
          <boxGeometry args={[6.2, 0.14, 1.8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* Architectural Steel Frame Columns */}
        {[
          [-3.4, 1.7, -2.8],
          [3.4, 1.7, -2.8],
          [-3.4, 1.7, 2.8],
          [3.4, 1.7, 2.8],
        ].map(([cx, cy, cz], idx) => (
          <mesh key={idx} position={[cx, cy, cz]} castShadow>
            <boxGeometry args={[0.3, 3.4, 0.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* Solid Back Wall with Team Deco */}
        <mesh position={[0, 1.7, -2.85]} castShadow>
          <boxGeometry args={[6.8, 3.2, 0.18]} />
          <meshStandardMaterial color="#1e2229" roughness={0.8} />
        </mesh>
        {/* Interior Garage Back Wall Acoustic Panels */}
        <mesh position={[0, 1.7, -2.73]}>
          <boxGeometry args={[6.4, 2.6, 0.04]} />
          <meshStandardMaterial color="#090d16" roughness={0.9} />
        </mesh>

        {/* Interior Access Door to Main House (Left Wall) */}
        <mesh position={[-3.45, 1.7, 0]} castShadow>
          <boxGeometry args={[0.18, 3.2, 5.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[-3.34, 1.2, 0.5]}>
          <boxGeometry args={[0.04, 2.2, 1.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} />
        </mesh>

        {/* Camera-Facing Right Side: Floor-to-Ceiling Panoramic Glass Curtain Wall */}
        {/* Allows full crystal-clear view into the garage from camera angle! */}
        <group position={[3.45, 1.7, 0]}>
          <mesh>
            <boxGeometry args={[0.06, 3.1, 5.5]} />
            <meshPhysicalMaterial
              color="#bae6fd"
              transparent
              opacity={0.32}
              transmission={0.55}
              roughness={0.1}
              metalness={0.2}
            />
          </mesh>
          {/* Black Steel Mullions */}
          {[-1.8, 0, 1.8].map((mz) => (
            <mesh key={mz} position={[0, 0, mz]}>
              <boxGeometry args={[0.1, 3.15, 0.08]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.08, 5.5]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Garage Roof with Cantilevered Fascia */}
        {showRoof && <mesh position={[0, 3.45, 0]} castShadow>
          <boxGeometry args={[7.4, 0.35, 6.4]} />
          <meshStandardMaterial color="#dbeafe" metalness={0.2} roughness={0.6} />
        </mesh>}

        {/* Overhead Hexagonal Honeycomb LED Ceiling Grid (Luxury Supercar Garage Lighting) */}
        <group position={[0, 3.2, 0]} visible={showRoof}>
          {[-1.5, 0, 1.5].map((hx) =>
            [-1.0, 0.8].map((hz) => (
              <group key={`${hx}-${hz}`} position={[hx, 0, hz]}>
                {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const nextRad = ((deg + 60) * Math.PI) / 180;
                  const mx = (Math.cos(rad) + Math.cos(nextRad)) * 0.35;
                  const mz = (Math.sin(rad) + Math.sin(nextRad)) * 0.35;
                  return (
                    <mesh key={i} position={[mx, 0, mz]} rotation={[0, -rad - Math.PI / 6, 0]}>
                      <boxGeometry args={[0.03, 0.02, 0.4]} />
                      <meshBasicMaterial color="#ffffff" />
                    </mesh>
                  );
                })}
              </group>
            ))
          )}
          {/* Daylight Interior Illumination */}
          <pointLight position={[0, -0.3, 0]} color="#e0f2fe" intensity={1.8} distance={7} />
        </group>

        {/* Front Garage Opening with Segmented Roll-up Industrial Door */}
        <group position={[0, 0, 2.85]}>
          {/* Header Beam & Door Track Housing */}
          <mesh position={[0, 3.1, 0]} castShadow>
            <boxGeometry args={[6.2, 0.5, 0.28]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Segmented glass roll-up door: daylight enters the attached team garage. */}
          <group position={[0, 2.45, 0]}>
            {[0, 0.22, 0.44].map((sy, i) => (
              <mesh key={i} position={[0, sy, 0]}>
                <boxGeometry args={[5.6, 0.2, 0.06]} />
                <meshPhysicalMaterial color="#bae6fd" metalness={0.25} roughness={0.08} transmission={0.45} transparent opacity={0.72} />
              </mesh>
            ))}
            {/* Rubber Bottom Weather Seal */}
            <mesh position={[0, -0.11, 0]}>
              <boxGeometry args={[5.6, 0.05, 0.08]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
          </group>
          {/* Torsion Springs Cylinder */}
          <mesh position={[0, 3.0, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 5.2, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Glowing Header Marquee Sign: "DYNASTY MOTORSPORTS" */}
          <group position={[0, 3.48, 0.18]}>
            <mesh castShadow>
              <boxGeometry args={[4.6, 0.5, 0.1]} />
              <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.052]}>
              <boxGeometry args={[4.7, 0.54, 0.02]} />
              <meshBasicMaterial color={empire.branding.primaryColor} />
            </mesh>
            <Html position={[0, 0, 0.08]} center distanceFactor={13} style={{ pointerEvents: 'none' }}>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950/95 border border-cyan-400 shadow-xl whitespace-nowrap select-none">
                <span className="text-amber-400 font-black text-[11px]">🏁</span>
                <span className="text-white font-black text-[11px] tracking-wider">DYNASTY MOTORSPORTS</span>
                <span className="text-cyan-400 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                  GARAGE
                </span>
              </div>
            </Html>
          </group>
        </group>

        {/* Snap-On Red Multi-Drawer Rolling Tool Chest System */}
        <group position={[-2.8, 0.16, 0.6]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[1.8, 1.2, 0.6]} />
            <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Chrome Drawer Pull Handles */}
          {[-0.35, -0.15, 0.05, 0.25, 0.45].map((dy) => (
            <mesh key={dy} position={[0, 0.65 + dy, 0.31]}>
              <boxGeometry args={[1.4, 0.03, 0.03]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}
          {/* Hardwood Butcher-Block Workbench Top */}
          <mesh position={[0, 1.28, 0]}>
            <boxGeometry args={[1.86, 0.08, 0.64]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
          {/* Mounted Cast Iron Bench Vice */}
          <mesh position={[-0.7, 1.38, 0.15]}>
            <boxGeometry args={[0.18, 0.16, 0.22]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>

        {/* Heavy-Duty Wall-Mounted Racing Slick Tire Racks (Back Wall) */}
        <group position={[1.4, 1.6, -2.6]}>
          {/* Black Steel Rack Bars */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.4, 0.04, 0.45]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[2.4, 0.04, 0.45]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* 4 Competition Racing Tires Mounted */}
          {[-0.8, -0.25, 0.3, 0.85].map((tx, idx) => (
            <group key={idx} position={[tx, 0.2, 0.05]} rotation={[0, 0, Math.PI / 2]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.34, 0.34, 0.24, 16]} />
                <meshStandardMaterial color="#171717" roughness={0.9} />
              </mesh>
              {/* Pirelli-style Yellow/Cyan Racing Stripe */}
              <mesh position={[0, 0.122, 0]}>
                <ringGeometry args={[0.22, 0.25, 16]} />
                <meshBasicMaterial color={idx % 2 === 0 ? '#eab308' : '#06b6d4'} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Industrial Blue Air Compressor & Tank */}
        <group position={[-2.8, 0.16, -1.8]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.7, 14]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Brass Regulator Gauge */}
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>
          {/* Coiled Red Air Hose */}
          <mesh position={[0, 0.45, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.035, 8, 16]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        </group>

        {/* Hydraulic Vehicle Lift Service Bay on Showroom Floor */}
        <group position={[0.2, 0.17, 0.2]}>
          <mesh position={[-1.0, 0.04, 0]}>
            <boxGeometry args={[0.42, 0.08, 4.2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[1.0, 0.04, 0]}>
            <boxGeometry args={[0.42, 0.08, 4.2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Yellow Safety Ramp Tips */}
          <mesh position={[-1.0, 0.03, 2.15]}>
            <boxGeometry args={[0.42, 0.06, 0.3]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          <mesh position={[1.0, 0.03, 2.15]}>
            <boxGeometry args={[0.42, 0.06, 0.3]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
        </group>

        {/* Dynamic High-Detail Team Vehicle on the Detailing Bay */}
        <group position={[0.2, 0.26, 0.2]}>
          <group ref={carRef}>
            {/* Underglow Neon */}
            <mesh ref={underglowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.4, 4.6]} />
              <meshBasicMaterial color={empire.branding.accentColor} transparent opacity={0.5} />
            </mesh>

            {/* Coupe → Sprinter → real high-roof Tour Bus silhouette. */}
            <mesh position={[0, 0.38, 0]} castShadow>
              <boxGeometry
                args={[
                  empire.fleetTier === 1 ? 2.1 : empire.fleetTier === 2 ? 2.3 : 2.65,
                  empire.fleetTier === 1 ? 0.44 : empire.fleetTier === 2 ? 0.95 : 1.28,
                  empire.fleetTier === 1 ? 4.3 : empire.fleetTier === 2 ? 4.8 : 5.4,
                ]}
              />
              <meshStandardMaterial
                color={empire.vipInventory.includes('hypercar_wrap') ? '#facc15' : empire.branding.primaryColor}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>

            {/* Greenhouse Windshield & Cabin */}
            <mesh
              position={[0, empire.fleetTier === 1 ? 0.78 : empire.fleetTier === 2 ? 1.05 : 1.48, empire.fleetTier === 1 ? -0.25 : empire.fleetTier === 2 ? 0.2 : -0.05]}
              castShadow
            >
              <boxGeometry
                args={[
                  empire.fleetTier === 1 ? 1.65 : empire.fleetTier === 2 ? 1.95 : 2.35,
                  empire.fleetTier === 1 ? 0.5 : empire.fleetTier === 2 ? 0.75 : 0.82,
                  empire.fleetTier === 1 ? 1.95 : empire.fleetTier === 2 ? 2.8 : 4.15,
                ]}
              />
              <meshPhysicalMaterial
                color="#020617"
                metalness={0.9}
                roughness={0.1}
                transmission={0.35}
                transparent
                opacity={0.9}
              />
            </mesh>

            {empire.fleetTier === 3 && [-1.45, -0.5, 0.5, 1.45].map((z) => (
              <mesh key={z} position={[1.34, 1.5, z]}>
                <boxGeometry args={[0.03, 0.48, 0.62]} />
                <meshBasicMaterial color="#67e8f9" transparent opacity={0.65} />
              </mesh>
            ))}

            {/* Dual Front Xenon Headlights */}
            <mesh position={[-0.75, 0.42, 2.16]}>
              <boxGeometry args={[0.35, 0.12, 0.05]} />
              <meshBasicMaterial color={isTournamentUnderway ? '#67e8f9' : '#ffffff'} />
            </mesh>
            <mesh position={[0.75, 0.42, 2.16]}>
              <boxGeometry args={[0.35, 0.12, 0.05]} />
              <meshBasicMaterial color={isTournamentUnderway ? '#67e8f9' : '#ffffff'} />
            </mesh>

            {/* Rear Aggressive Wing for Tier 2/3 */}
            {empire.fleetTier === 2 && (
              <group position={[0, 0.95, -2.1]}>
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[2.1, 0.06, 0.4]} />
                  <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[-0.7, -0.22, 0]}>
                  <boxGeometry args={[0.06, 0.4, 0.18]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.7, -0.22, 0]}>
                  <boxGeometry args={[0.06, 0.4, 0.18]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
              </group>
            )}

            {/* 4 Alloy Rims with Disc Calipers */}
            {[
              [-1.02, 0.28, 1.25],
              [1.02, 0.28, 1.25],
              [-1.02, 0.28, -1.35],
              [1.02, 0.28, -1.35],
            ].map(([wx, wy, wz], idx) => (
              <group key={idx} position={[wx, wy, wz]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.32, 0.32, 0.26, 16]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.9} />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.22, 0.22, 0.27, 12]} />
                  <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.15} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 8. ACROSS-THE-STREET COMMERCIAL DISTRICT (CLEARLY NAMED)     */}
      {/* ============================================================ */}
      {/* Sidewalk across the street along z = 27.5 */}
      <mesh position={[7, -0.5, 27.5]} receiveShadow>
        <boxGeometry args={[56, 0.14, 2.2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
      </mesh>

      {/* ------------------------------------------------------------ */}
      {/* STORE 1: "DYNASTY 24/7 MART" (The Pro Gamers' Convenience Store) */}
      {/* ------------------------------------------------------------ */}
      <group position={[-8, -0.45, 32.2]}>
        {/* Open cutaway interior so pros visibly enter, browse, and leave. */}
        <mesh position={[0, 0.04, 0]} receiveShadow><boxGeometry args={[7.8, 0.12, 5.2]} /><meshStandardMaterial color="#dbeafe" roughness={0.7} /></mesh>
        <mesh position={[0, 1.9, 2.54]} castShadow><boxGeometry args={[7.8, 3.8, 0.12]} /><meshStandardMaterial color="#a7b8c8" /></mesh>
        {[-3.84, 3.84].map(x => <mesh key={x} position={[x, 1.9, 0]} castShadow><boxGeometry args={[0.12, 3.8, 5.2]} /><meshStandardMaterial color="#cbd5e1" /></mesh>)}
        {[-2.5, 2.1].map(x => <group key={x} position={[x, 0, 1.05]}>
          <mesh position={[0, 0.66, 0]} castShadow><boxGeometry args={[0.65, 1.3, 2.5]} /><meshStandardMaterial color="#64748b" /></mesh>
          {[0.3, 0.8, 1.25].map(y => <mesh key={y} position={[0.36, y, 0]}><boxGeometry args={[0.08, 0.1, 2.3]} /><meshStandardMaterial color="#fbbf24" /></mesh>)}
        </group>)}
        <mesh position={[0, 0.55, 1.85]} castShadow><boxGeometry args={[2.4, 1.0, 0.6]} /><meshStandardMaterial color="#10b981" /></mesh>
        {/* Large Glass Storefront Display Window */}
        <mesh position={[0, 1.2, -2.62]}>
          <planeGeometry args={[6.6, 2.0]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.2}
            transmission={0.65}
          />
        </mesh>
        {/* Interior Soft Cooler Glow */}
        <pointLight position={[0, 1.4, -1.8]} color="#06b6d4" intensity={1.2} distance={4.5} />

        {/* Classic Striped Canvas Awning */}
        <group position={[0, 2.35, -2.85]} rotation={[0.25, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[6.8, 0.1, 1.2]} />
            <meshStandardMaterial color="#10b981" roughness={0.7} />
          </mesh>
          {[-2.8, -1.7, -0.6, 0.5, 1.6, 2.7].map((ax) => (
            <mesh key={ax} position={[ax, 0.055, 0]}>
              <boxGeometry args={[0.55, 0.02, 1.2]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* High-Impact Illuminated Marquee Header Sign */}
        <group position={[0, 3.1, -2.68]}>
          <mesh castShadow>
            <boxGeometry args={[7.0, 0.75, 0.14]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.075]}>
            <boxGeometry args={[7.1, 0.8, 0.02]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <Html position={[0, 0, 0.1]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
            <div className="flex flex-col items-center select-none whitespace-nowrap bg-slate-950/95 border-2 border-emerald-400 px-3.5 py-1 rounded-md shadow-2xl">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-black text-xs">🏪</span>
                <span className="text-white font-black text-xs tracking-wider">DYNASTY MART 24/7</span>
                <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded ml-1">
                  OPEN
                </span>
              </div>
              <span className="text-[8px] text-emerald-300 font-extrabold tracking-widest mt-0.5">
                ENERGY DRINKS • SNACKS • GEAR
              </span>
            </div>
          </Html>
        </group>

        {/* Outdoor Japanese-Style Esports Drink Vending Machine */}
        <group position={[2.8, 0, -2.9]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.9, 1.9, 0.75]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Illuminated Product Display Window */}
          <mesh position={[0, 1.25, 0.38]}>
            <planeGeometry args={[0.72, 0.8]} />
            <meshBasicMaterial color="#a5f3fc" />
          </mesh>
          {/* Can Retrieval Slot */}
          <mesh position={[0, 0.35, 0.38]}>
            <planeGeometry args={[0.6, 0.3]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Outdoor Ice Freezer Chest */}
        <group position={[-2.8, 0, -2.9]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.9, 0.7]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.55, 0.36]}>
            <planeGeometry args={[0.8, 0.25]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------ */}
      {/* STORE 2: "GG BOBA & ESPORTS CAFE" (Team Meetup & Lounge)     */}
      {/* ------------------------------------------------------------ */}
      {empire.districtTier >= 2 && <>
      <group position={[3.2, -0.45, 32.2]}>
        {/* Open cafe interior with a service bar and seating. */}
        <mesh position={[0, 0.04, 0]} receiveShadow><boxGeometry args={[7.2, 0.12, 5.0]} /><meshStandardMaterial color="#f5deb3" roughness={0.75} /></mesh>
        <mesh position={[0, 1.8, 2.44]} castShadow><boxGeometry args={[7.2, 3.6, 0.12]} /><meshStandardMaterial color="#b45309" /></mesh>
        {[-3.54, 3.54].map(x => <mesh key={x} position={[x, 1.8, 0]} castShadow><boxGeometry args={[0.12, 3.6, 5.0]} /><meshStandardMaterial color="#c08457" /></mesh>)}
        <mesh position={[0, 0.55, 1.8]} castShadow><boxGeometry args={[3.8, 1, 0.7]} /><meshStandardMaterial color="#7c2d12" /></mesh>
        {[-2.1, 2.1].map(x => <group key={x} position={[x, 0, 0.9]}>
          <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.42, 0.42, 0.08, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.07, 0.07, 0.5, 10]} /><meshStandardMaterial color="#475569" /></mesh>
        </group>)}
        {/* Timber Slat Wall Accents */}
        {[-2.8, -1.4, 0, 1.4, 2.8].map((sx) => (
          <mesh key={sx} position={[sx, 1.8, -2.52]}>
            <boxGeometry args={[0.08, 3.5, 0.05]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        ))}

        {/* Glowing Marquee Header Sign */}
        <group position={[0, 3.0, -2.58]}>
          <mesh castShadow>
            <boxGeometry args={[6.2, 0.75, 0.12]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[6.3, 0.8, 0.02]} />
            <meshBasicMaterial color="#f472b6" />
          </mesh>
          <Html position={[0, 0, 0.09]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
            <div className="flex flex-col items-center select-none whitespace-nowrap bg-slate-950/95 border-2 border-pink-400 px-3.5 py-1 rounded-md shadow-2xl">
              <div className="flex items-center gap-1.5">
                <span className="text-pink-400 font-black text-xs">🧋</span>
                <span className="text-white font-black text-xs tracking-wider">GG BOBA & CAFE</span>
                <span className="bg-pink-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded ml-1">
                  COFFEE
                </span>
              </div>
              <span className="text-[8px] text-pink-300 font-extrabold tracking-widest mt-0.5">
                ARTISAN TEAS • ESPRESSO • SWEETS
              </span>
            </div>
          </Html>
        </group>

        {/* Outdoor Bistro Café Patio Deck with Umbrellas & Tables */}
        <group position={[0, 0, -3.2]}>
          {/* Round Table 1 with Parasol Umbrella */}
          <group position={[-1.6, 0, 0]}>
            <mesh position={[0, 0.36, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.05, 20]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.36, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Parasol Pole & Cone Shade */}
            <mesh position={[0, 1.25, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 2.05, 0]} castShadow>
              <coneGeometry args={[1.1, 0.45, 16]} />
              <meshStandardMaterial color="#06b6d4" roughness={0.7} />
            </mesh>
            {/* Iced Boba Cups on Table */}
            <mesh position={[-0.15, 0.42, 0.1]}>
              <cylinderGeometry args={[0.05, 0.04, 0.12, 10]} />
              <meshStandardMaterial color="#f472b6" roughness={0.3} />
            </mesh>
            <mesh position={[0.15, 0.42, -0.08]}>
              <cylinderGeometry args={[0.05, 0.04, 0.12, 10]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} />
            </mesh>
          </group>

          {/* Round Table 2 */}
          <group position={[1.6, 0, 0]}>
            <mesh position={[0, 0.36, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.05, 20]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.36, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Parasol Pole & Cone Shade */}
            <mesh position={[0, 1.25, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 2.05, 0]} castShadow>
              <coneGeometry args={[1.1, 0.45, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.7} />
            </mesh>
          </group>

          {/* Sidewalk Chalkboard Easel Menu Sign */}
          <group position={[-2.8, 0, 0.3]} rotation={[0, 0.3, 0]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[0.65, 0.8, 0.08]} />
              <meshStandardMaterial color="#3b1d11" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.4, 0.045]}>
              <planeGeometry args={[0.55, 0.68]} />
              <meshStandardMaterial color="#0f172a" roughness={0.95} />
            </mesh>
            <Html position={[0, 0.42, 0.06]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
              <div className="bg-slate-900/90 text-amber-200 border border-amber-500/60 rounded px-2 py-0.5 text-[8px] font-black select-none whitespace-nowrap text-center">
                ☕ TODAY'S SPECIAL
                <div className="text-white font-extrabold text-[9px]">PENTAKILL MATCHA $4.50</div>
              </div>
            </Html>
          </group>
        </group>
      </group>

      {/* Tier 2 Esports Plaza: fountain, shaded benches, and team billboard. */}
      <group position={[11.2, -0.45, 30.7]}>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[1.45, 1.65, 0.38, 24]} /><meshStandardMaterial color="#94a3b8" /></mesh>
        <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[1.27, 1.27, 0.05, 24]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.7} /></mesh>
        <mesh position={[0, 0.73, 0]}><cylinderGeometry args={[0.32, 0.45, 0.64, 12]} /><meshStandardMaterial color="#64748b" /></mesh>
        {[-2.3, 2.3].map(x => <group key={x} position={[x, 0, 0]}><mesh position={[0, 0.32, 0]}><boxGeometry args={[1.5, 0.12, 0.45]} /><meshStandardMaterial color="#78350f" /></mesh><mesh position={[0, 1.35, 0]}><cylinderGeometry args={[0.04, 0.04, 2, 8]} /><meshStandardMaterial color="#475569" /></mesh><mesh position={[0, 2.32, 0]}><coneGeometry args={[1.15, 0.38, 16]} /><meshStandardMaterial color={x < 0 ? '#06b6d4' : '#f472b6'} /></mesh></group>)}
        <group position={[0, 2.1, 2.3]}><mesh><boxGeometry args={[3.8, 1.8, 0.12]} /><meshStandardMaterial color="#0f172a" /></mesh><mesh position={[0, 0, 0.07]}><boxGeometry args={[3.55, 1.55, 0.02]} /><meshBasicMaterial color={empire.branding.primaryColor} /></mesh><Html position={[0, 0, 0.1]} center distanceFactor={15} style={{ pointerEvents: 'none' }}><div className="text-[9px] font-black text-white whitespace-nowrap">{empire.branding.name.toUpperCase()} · LIVE</div></Html></group>
      </group>
      </>}

      {/* ------------------------------------------------------------ */}
      {/* STORE 3: "CHAMPIONS PLAZA & ARENA" (Grand Esports Pavilion)  */}
      {/* ------------------------------------------------------------ */}
      {empire.districtTier >= 3 && <>
      <group position={[15.5, -0.45, 32.2]}>
        {/* Modern Brushed Steel & Dark Glass Building Body */}
        <mesh position={[0, 2.4, 0]} castShadow>
          <boxGeometry args={[9.5, 4.8, 5.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.55} roughness={0.3} />
        </mesh>

        {/* Grand Marquee Header Sign */}
        <group position={[0, 4.2, -2.78]}>
          <mesh castShadow>
            <boxGeometry args={[8.4, 0.85, 0.14]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.075]}>
            <boxGeometry args={[8.5, 0.9, 0.02]} />
            <meshBasicMaterial color={empire.branding.primaryColor} />
          </mesh>
          <Html position={[0, 0, 0.1]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
            <div className="flex flex-col items-center select-none whitespace-nowrap bg-slate-950/95 border-2 border-cyan-400 px-4 py-1 rounded-md shadow-2xl">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-black text-xs">🏆</span>
                <span className="text-white font-black text-xs tracking-wider">CHAMPIONS ARENA</span>
                <span className="bg-cyan-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded ml-1">
                  LIVE
                </span>
              </div>
              <span className="text-[8px] text-cyan-300 font-extrabold tracking-widest mt-0.5">
                DYNASTY ESPORTS PLAZA
              </span>
            </div>
          </Html>
        </group>

        {/* Massive Outdoor Jumbotron LED Screen (Live Tournament Match Broadcast) */}
        <group position={[0, 2.3, -2.76]} rotation={[-0.08, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[5.2, 2.8, 0.16]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Glowing Animated Screen Surface */}
          <mesh ref={jumbotronRef} position={[0, 0, 0.09]}>
            <planeGeometry args={[5.0, 2.6]} />
            <meshBasicMaterial color="#0369a1" transparent opacity={0.92} />
          </mesh>
          {/* Broadcast Scoreboard Graphics */}
          <group position={[0, 0, 0.1]}>
            {/* Top Match Bar */}
            <mesh position={[0, 1.05, 0]}>
              <planeGeometry args={[4.8, 0.35]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <Html position={[0, 1.05, 0.01]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
              <div className="text-[9px] font-black tracking-widest text-amber-400 select-none whitespace-nowrap">
                🔴 WORLD CHAMPIONSHIP FINALS • MATCH 5
              </div>
            </Html>
            {/* Scoreboard: Dynasty Cyan vs Rival Red */}
            <mesh position={[-1.2, 0.65, 0]}>
              <planeGeometry args={[1.8, 0.28]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[1.2, 0.65, 0]}>
              <planeGeometry args={[1.8, 0.28]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            {/* Center Broadcast Minimap */}
            <mesh position={[0, -0.35, 0]}>
              <planeGeometry args={[2.8, 1.4]} />
              <meshBasicMaterial color="#082f49" />
            </mesh>
          </group>
          {/* Screen Light Casting Onto the Plaza */}
          <pointLight position={[0, 0, 1.4]} color="#38bdf8" intensity={1.5} distance={8} />
        </group>

        {/* Tiered Circular Stone Water Fountain */}
        <group position={[-1.0, 0, -4.0]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[1.8, 2.0, 0.38, 24]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[1.65, 1.65, 0.05, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 0.45, 16]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} />
          </mesh>
        </group>

        {/* Modern Curved Teak Public Bench */}
        <group position={[2.6, 0, -4.0]} rotation={[0, -0.4, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.8, 0.1, 0.5]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.55, -0.22]} castShadow>
            <boxGeometry args={[1.8, 0.5, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          <mesh position={[-0.8, 0.12, 0]}>
            <boxGeometry args={[0.1, 0.25, 0.45]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.8, 0.12, 0]}>
            <boxGeometry args={[0.1, 0.25, 0.45]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      </group>
      </>}

      {/* HQ evolution: regional offices become a public-facing Dynasty Tower. */}
      {empire.facilityTier >= 2 && <group position={[-16, -0.45, 5]}>
        <mesh position={[0, 0.08, 0]} receiveShadow><boxGeometry args={[9.5, 0.16, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
        <mesh position={[0, 2.1, 3.8]} castShadow><boxGeometry args={[9.2, 4.1, 0.18]} /><meshStandardMaterial color="#e0f2fe" /></mesh>
        {[-4.5, 4.5].map(x => <mesh key={x} position={[x, 2.1, 0]} castShadow><boxGeometry args={[0.18, 4.1, 7.6]} /><meshStandardMaterial color="#cbd5e1" /></mesh>)}
        {[-3.2, -1.05, 1.05, 3.2].map(x => <group key={x} position={[x, 0, 1.1]}>
          <mesh position={[0, 0.48, 0]}><boxGeometry args={[1.5, 0.1, 0.75]} /><meshStandardMaterial color="#475569" /></mesh>
          <mesh position={[0, 0.88, -0.15]}><boxGeometry args={[0.68, 0.48, 0.04]} /><meshBasicMaterial color={empire.branding.primaryColor} /></mesh>
          <mesh position={[0, 0.21, 0.3]}><boxGeometry args={[0.46, 0.42, 0.42]} /><meshStandardMaterial color="#1e293b" /></mesh>
        </group>)}
        {empire.facilityTier >= 3 && <>
          {[1, 2, 3, 4, 5].map(floor => <group key={floor} position={[0, 4.1 + floor * 2.25, 0]}>
            <mesh position={[0, 1.05, 3.8]} castShadow><boxGeometry args={[8.8, 2.1, 0.16]} /><meshStandardMaterial color="#bae6fd" metalness={0.25} roughness={0.22} /></mesh>
            <mesh position={[0, 2.14, 0]}><boxGeometry args={[9.1, 0.14, 7.9]} /><meshStandardMaterial color={floor === 5 ? '#fbbf24' : floor % 2 ? empire.branding.primaryColor : '#334155'} /></mesh>
          </group>)}
          <mesh position={[0, 15.9, 0]} castShadow><boxGeometry args={[9.5, 0.3, 8.3]} /><meshStandardMaterial color="#f8fafc" metalness={0.35} /></mesh>
        </>}
      </group>}

      {/* ============================================================ */}
      {/* 9. LIVING SIMULATION NPC CROWD (STATE-DRIVEN BEHAVIORS)      */}
      {/* ============================================================ */}
      {/* NPC 1: Paparazzi / Fan walking along house front sidewalk & taking photos */}
      <AnimatedNpcFan
        id={0}
        role="photographer"
        basePos={[2.5, -0.35, 16.5]}
        jerseyColors={empire.branding}
        isTournamentUnderway={isTournamentUnderway}
        totalFans={totalFans}
      />

      {/* NPC 2: Crosser traveling between House driveway and Dynasty Mart */}
      <AnimatedNpcFan
        id={1}
        role="crosser"
        basePos={[-2.0, -0.35, 16.5]}
        jerseyColors={empire.branding}
        isTournamentUnderway={isTournamentUnderway}
        totalFans={totalFans}
      />

      {/* NPC 3: Seated Boba Cafe Patron 1 */}
      {empire.districtTier >= 2 && <AnimatedNpcFan
        id={2}
        role="boba_drinker"
        basePos={[1.6, -0.34, 29.0]}
        jerseyColors={empire.branding}
        isTournamentUnderway={isTournamentUnderway}
        totalFans={totalFans}
      />}

      {/* NPC 4: Seated Boba Cafe Patron 2 */}
      {empire.districtTier >= 2 && <AnimatedNpcFan
        id={3}
        role="boba_friend"
        basePos={[4.8, -0.34, 29.0]}
        jerseyColors={empire.branding}
        isTournamentUnderway={isTournamentUnderway}
        totalFans={totalFans}
      />}

      {/* NPC 5: Cheering Spectator at Champions Plaza watching Jumbotron */}
      {empire.districtTier >= 3 && <AnimatedNpcFan
        id={4}
        role="cheerer"
        basePos={[15.5, -0.4, 28.2]}
        jerseyColors={empire.branding}
        isTournamentUnderway={isTournamentUnderway}
        totalFans={totalFans}
      />}

      {/* NPC 6: Commercial Promenade Stroller */}
      <AnimatedNpcFan
        id={5}
        role="stroller"
        basePos={[-6.0, -0.35, 27.8]}
        jerseyColors={empire.branding}
        isTournamentUnderway={isTournamentUnderway}
        totalFans={totalFans}
      />

      {/* Additional fans for higher district tiers */}
      {empire.districtTier >= 3 && (
        <AnimatedNpcFan
          id={6}
          role="cheerer"
          basePos={[17.2, -0.4, 28.5]}
          jerseyColors={empire.branding}
          isTournamentUnderway={isTournamentUnderway}
          totalFans={totalFans}
        />
      )}
      {empire.districtTier >= 3 && (
        <AnimatedNpcFan
          id={7}
          role="stroller"
          basePos={[8.0, -0.35, 27.8]}
          jerseyColors={empire.branding}
          isTournamentUnderway={isTournamentUnderway}
          totalFans={totalFans}
        />
      )}
      <AnimatedNpcFan id={8} role="shopper" basePos={[-8.8, -0.4, 28.8]} jerseyColors={empire.branding} isTournamentUnderway={isTournamentUnderway} totalFans={totalFans} />
      {empire.districtTier >= 2 && <AnimatedNpcFan id={9} role="shopper" basePos={[3.7, -0.4, 28.8]} jerseyColors={empire.branding} isTournamentUnderway={isTournamentUnderway} totalFans={totalFans} />}
      {Array.from({ length: extraFanCount }, (_, index) => {
        const role: NpcRole = empire.districtTier >= 2 && index % 3 === 0 ? 'shopper' : index % 4 === 0 ? 'photographer' : 'stroller';
        return <AnimatedNpcFan key={`fan-density-${index}`} id={20 + index} role={role} basePos={[-14 + (index % 7) * 4.5, -0.35, role === 'photographer' ? 16.5 : 27.8]} jerseyColors={empire.branding} isTournamentUnderway={isTournamentUnderway} totalFans={totalFans} />;
      })}

      {/* Global branch boulevard: each owned branch has a visible specialist campus. */}
      <mesh position={[2, -0.51, 39.2]} receiveShadow><boxGeometry args={[41, 0.12, 2.2]} /><meshStandardMaterial color="#cbd5e1" roughness={0.78} /></mesh>
      {BRANCHES.map((definition, index) => {
        const branch = empire.branches?.find(item => item.id === definition.id);
        const x = -11.5 + index * 13.3;
        const height = branch ? 2.6 + branch.tier * 0.9 : 0;
        return <group key={definition.id} position={[x, -0.45, 44]}>
          <mesh position={[0, 0.04, 0]} receiveShadow><boxGeometry args={[9.5, 0.15, 7.8]} /><meshStandardMaterial color={branch ? '#94a3b8' : '#a3a3a3'} /></mesh>
          {branch ? <>
            <mesh position={[0, height / 2, 3.7]} castShadow><boxGeometry args={[9, height, 0.18]} /><meshStandardMaterial color="#dbeafe" /></mesh>
            {[-4.45, 4.45].map(side => <mesh key={side} position={[side, height / 2, 0]} castShadow><boxGeometry args={[0.16, height, 7.5]} /><meshStandardMaterial color="#e2e8f0" /></mesh>)}
            {[0, 1, 2].slice(0, branch.tier).map(level => <group key={level} position={[0, 0.5 + level * 0.9, 2.3]}>
              <mesh><boxGeometry args={[8.3, 0.08, 0.12]} /><meshBasicMaterial color={definition.color} /></mesh>
              <mesh position={[0, 0.3, 0]}><boxGeometry args={[7.7, 0.5, 0.07]} /><meshStandardMaterial color="#7dd3fc" transparent opacity={0.5} /></mesh>
            </group>)}
            {[-2.4, 0, 2.4].map(desk => <group key={desk} position={[desk, 0, 0.8]}>
              <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[1.15, 0.08, 0.7]} /><meshStandardMaterial color="#475569" /></mesh>
              <mesh position={[0, 0.76, -0.18]}><boxGeometry args={[0.7, 0.52, 0.06]} /><meshBasicMaterial color={definition.color} /></mesh>
            </group>)}
            <mesh position={[0, height + 0.16, 3.65]}><boxGeometry args={[9.2, 0.27, 0.35]} /><meshStandardMaterial color={definition.color} emissive={definition.color} emissiveIntensity={0.3} /></mesh>
            {branch.tier >= 2 && <mesh position={[0, height + 0.8, 2.8]}><cylinderGeometry args={[0.08, 0.08, 1.4, 10]} /><meshStandardMaterial color="#64748b" /></mesh>}
            <Html position={[0, height + 0.55, -2.2]} center distanceFactor={18} style={{ pointerEvents: 'none' }}><div className="rounded bg-slate-950/90 px-2 py-1 text-[10px] font-black text-white whitespace-nowrap border border-cyan-300/50">{definition.city} · T{branch.tier}</div></Html>
          </> : <>
            <mesh position={[0, 0.55, 0]}><boxGeometry args={[3.5, 1.1, 0.12]} /><meshStandardMaterial color="#fbbf24" /></mesh>
            <Html position={[0, 0.65, -0.15]} center distanceFactor={16} style={{ pointerEvents: 'none' }}><div className="rounded bg-slate-950/90 px-2 py-1 text-[9px] font-black text-amber-200 whitespace-nowrap">Future {definition.city}</div></Html>
          </>}
          {[-3.5, 3.5].map(side => <group key={side} position={[side, 0, -3.3]}>
            <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.09, 0.13, 1.1, 8]} /><meshStandardMaterial color="#92400e" /></mesh>
            <mesh position={[0, 1.2, 0]} castShadow><sphereGeometry args={[0.6, 10, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
          </group>)}
        </group>;
      })}

      {/* ============================================================ */}
      {/* 10. ANIMATED LIVING STREET TRAFFIC                           */}
      {/* ============================================================ */}
      {/* Traffic Car 1: Sleek Electric Sedan traveling East (+x, z = 23.5) */}
      <group ref={trafficCar1Ref} position={[-20, -0.4, 23.5]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[3.8, 0.44, 1.9]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[-0.2, 0.82, 0]} castShadow>
          <boxGeometry args={[2.1, 0.48, 1.55]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[1.91, 0.4, 0.6]}>
          <boxGeometry args={[0.04, 0.14, 0.38]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[1.91, 0.4, -0.6]}>
          <boxGeometry args={[0.04, 0.14, 0.38]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[-1.91, 0.4, 0]}>
          <boxGeometry args={[0.04, 0.1, 1.6]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
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
        <mesh position={[-0.3, 0.8, 0]} castShadow>
          <boxGeometry args={[4.2, 1.25, 2.1]} />
          <meshStandardMaterial color="#0891b2" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[1.7, 0.65, 0]} castShadow>
          <boxGeometry args={[1.2, 0.95, 2.05]} />
          <meshStandardMaterial color="#0e7490" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[1.8, 0.88, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.04, 0.55, 1.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <mesh position={[2.31, 0.45, 0.7]}>
          <boxGeometry args={[0.04, 0.16, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[2.31, 0.45, -0.7]}>
          <boxGeometry args={[0.04, 0.16, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-2.41, 0.55, 0.75]}>
          <boxGeometry args={[0.04, 0.4, 0.2]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        <mesh position={[-2.41, 0.55, -0.75]}>
          <boxGeometry args={[0.04, 0.4, 0.2]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
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
      {/* 11. STREET LAMPS ALONG THE COMMERCIAL SIDEWALK               */}
      {/* ============================================================ */}
      {[-16, 3, 22].map((lx) => (
        <group key={lx} position={[lx, -0.5, 27]}>
          <mesh position={[0, 2.6, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 5.2, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.4, 5.1, 0]}>
            <boxGeometry args={[0.9, 0.12, 0.25]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.7, 4.95, 0]}>
            <boxGeometry args={[0.3, 0.16, 0.22]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <pointLight position={[0.7, 4.8, 0]} color="#fde047" intensity={0.7} distance={8} />
        </group>
      ))}

      {/* ============================================================ */}
      {/* 12. LANDSCAPED PLANTERS WITH LUSH SHRUBS                     */}
      {/* ============================================================ */}
      {[
        [-1.2, 15.6],
        [5.8, 15.8],
        [8.2, 15.8],
        [-1.2, 8.5],
        [-1.2, 1.5],
        [20.5, 1.5],
        [20.5, 8.5],
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
