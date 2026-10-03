import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group } from 'three';
import { ProPlayer } from '../../../core/types/player.types';
import { SimAgent } from '../../../core/house/simulation';
import { Crosshair, Radio, Dumbbell, BookOpen, Coffee } from 'lucide-react';

interface HouseCharacters3DProps {
  agents: SimAgent[];
  players: ProPlayer[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  paused: boolean;
}

const SKIN_COLORS = [
  '#f5c5a3', // 0 Kai
  '#8d5524', // 1 Amara
  '#ffd1b3', // 2 Yuna
  '#e0ac69', // 3 Evan
  '#c68642', // 4 Arjun
  '#fcd5b8', // 5 Sofia
];

const HAIR_COLORS = [
  '#111827', // 0 Spiky black
  '#1c1917', // 1 Dark espresso curls
  '#7c3aed', // 2 Vivid purple bob
  '#9a3412', // 3 Auburn wavy curls
  '#1e293b', // 4 Wavy black
  '#5c3d2e', // 5 Chestnut brown
];

const ACTIVITY_ICONS = {
  practice: Crosshair,
  stream: Radio,
  exercise: Dumbbell,
  review: BookOpen,
  break: Coffee,
};

function CharacterModel({
  agent,
  player,
  selected,
  onSelect,
  paused,
}: {
  agent: SimAgent;
  player: ProPlayer;
  selected: boolean;
  onSelect: () => void;
  paused: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  const idx = player.portraitIndex % 6;
  const skin = SKIN_COLORS[idx];
  const hair = HAIR_COLORS[idx];

  const targetRotation =
    agent.facing === 'ne'
      ? Math.PI * 0.75
      : agent.facing === 'nw'
      ? Math.PI * 1.25
      : agent.facing === 'se'
      ? Math.PI * 0.25
      : -Math.PI * 0.25;

  useFrame(({ clock }) => {
    if (!rootRef.current) return;

    rootRef.current.rotation.y +=
      (targetRotation - rootRef.current.rotation.y) * 0.25;

    const t = clock.elapsedTime * 8 + idx;

    if (agent.mode === 'walking' && !paused) {
      rootRef.current.position.y = Math.abs(Math.sin(t * 1.5)) * 0.05;

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t) * 0.6;
        rightLegRef.current.rotation.x = -Math.sin(t) * 0.6;
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t) * 0.5;
        rightArmRef.current.rotation.x = Math.sin(t) * 0.5;
      }
      return;
    }

    if (agent.pose === 'run' && !paused) {
      rootRef.current.position.y = 0.24 + Math.abs(Math.sin(t * 2)) * 0.06;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * 1.6) * 0.8;
        rightLegRef.current.rotation.x = -Math.sin(t * 1.6) * 0.8;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * 1.6) * 0.8;
        rightArmRef.current.rotation.x = Math.sin(t * 1.6) * 0.8;
      }
      return;
    }

    if (agent.pose === 'lift' && !paused) {
      rootRef.current.position.y = 0.48;
      rootRef.current.rotation.x = Math.PI / 2;
      if (leftArmRef.current && rightArmRef.current) {
        const pressProgress = (Math.sin(t * 0.5) + 1) * 0.5;
        leftArmRef.current.position.z = -0.15 + pressProgress * 0.22;
        rightArmRef.current.position.z = -0.15 + pressProgress * 0.22;
      }
      return;
    }

    if (agent.pose === 'bike' && !paused) {
      rootRef.current.position.y = 0.55;
      rootRef.current.rotation.x = 0.25;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * 1.2) * 0.5;
        rightLegRef.current.rotation.x = -Math.sin(t * 1.2) * 0.5;
      }
      return;
    }

    if (agent.pose === 'sit') {
      rootRef.current.position.y = 0.22;
      rootRef.current.rotation.x = 0;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.PI / 2;
        rightLegRef.current.rotation.x = Math.PI / 2;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.8;
        rightArmRef.current.rotation.x = -0.8;
        if (!paused) {
          leftArmRef.current.rotation.z = Math.sin(t * 2) * 0.08;
          rightArmRef.current.rotation.z = -Math.cos(t * 2) * 0.08;
        }
      }
      if (headRef.current && !paused) {
        headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      }
      return;
    }

    if (agent.pose === 'lounge') {
      rootRef.current.position.y = 0.2;
      rootRef.current.rotation.x = -0.15;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.PI / 2.2;
        rightLegRef.current.rotation.x = Math.PI / 2.2;
      }
      return;
    }

    rootRef.current.position.y = 0;
    rootRef.current.rotation.x = 0;
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = 0;
      rightLegRef.current.rotation.x = 0;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = 0;
      rightArmRef.current.rotation.x = 0;
    }
  });

  const ActivityIcon = ACTIVITY_ICONS[agent.activity] ?? Coffee;

  return (
    <group position={[agent.x, 0, agent.y]}>
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 24]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}

      <Html
        position={[0, 1.48, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex flex-col items-center gap-1 select-none pointer-events-auto cursor-pointer" onClick={onSelect}>
          {agent.speechBubble && (
            <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/50 shadow-lg whitespace-nowrap animate-bounce">
              💬 {agent.speechBubble.text}
            </div>
          )}

          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-md text-[10px] font-extrabold tracking-wide border transition-all ${
              selected
                ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 shadow-amber-500/30'
                : 'bg-slate-950/80 text-slate-200 border-slate-700/80'
            }`}
          >
            <ActivityIcon size={11} className={selected ? 'text-slate-950' : 'text-cyan-400'} />
            <span>{player.handle}</span>
          </div>
        </div>
      </Html>

      <group
        ref={rootRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.34, 0.42, 0.22]} />
          <meshStandardMaterial color="#1a2d54" roughness={0.7} />
        </mesh>

        <mesh position={[0, 0.74, 0]}>
          <boxGeometry args={[0.36, 0.06, 0.24]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.65, 0.115]}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        <group ref={headRef} position={[0, 0.94, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 16, 14]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>

          <mesh position={[-0.06, 0.02, 0.16]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.06, 0.02, 0.16]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {idx === 0 && (
            <group position={[0, 0.1, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.19, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={hair} roughness={0.9} />
              </mesh>
              {[-0.08, 0, 0.08].map((sx, i) => (
                <mesh key={i} position={[sx, 0.16, 0.05]} rotation={[-0.3, 0, sx * 2]}>
                  <coneGeometry args={[0.05, 0.12, 4]} />
                  <meshStandardMaterial color={hair} />
                </mesh>
              ))}
            </group>
          )}

          {idx === 1 && (
            <group position={[0, 0.1, -0.02]}>
              <mesh castShadow>
                <sphereGeometry args={[0.22, 12, 10]} />
                <meshStandardMaterial color={hair} roughness={0.95} />
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.16, 10, 8]} />
                <meshStandardMaterial color={hair} roughness={0.95} />
              </mesh>
            </group>
          )}

          {idx === 2 && (
            <group position={[0, 0.08, -0.02]}>
              <mesh castShadow>
                <sphereGeometry args={[0.205, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
                <meshStandardMaterial color={hair} roughness={0.6} />
              </mesh>
              <mesh position={[-0.05, 0.02, 0.15]} rotation={[0.2, 0, -0.3]}>
                <boxGeometry args={[0.18, 0.12, 0.06]} />
                <meshStandardMaterial color={hair} roughness={0.6} />
              </mesh>
            </group>
          )}

          {idx === 3 && (
            <group position={[0, 0.1, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                <meshStandardMaterial color={hair} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.08, 0.18]}>
                <boxGeometry args={[0.24, 0.04, 0.02]} />
                <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          )}

          {idx === 4 && (
            <group position={[0, 0.1, -0.02]}>
              <mesh castShadow>
                <sphereGeometry args={[0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={hair} roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.1, 0.12]}>
                <sphereGeometry args={[0.1, 8, 8, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.4]} />
                <meshStandardMaterial color="#2d3748" roughness={0.9} />
              </mesh>
            </group>
          )}

          {idx === 5 && (
            <group position={[0, 0.1, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.195, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={hair} roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.14, -0.18]}>
                <torusGeometry args={[0.04, 0.015, 8, 12]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
              <mesh position={[0, 0.02, -0.24]} rotation={[0.4, 0, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.02, 0.28, 8]} />
                <meshStandardMaterial color={hair} roughness={0.7} />
              </mesh>
            </group>
          )}

          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.1, 0]}>
              <torusGeometry args={[0.19, 0.025, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[-0.19, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[-0.212, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.025, 0.035, 12]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[0.19, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0.212, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <ringGeometry args={[0.025, 0.035, 12]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[-0.18, -0.06, 0.09]} rotation={[0.5, 0.3, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 6]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
          </group>
        </group>

        <group ref={leftArmRef} position={[-0.22, 0.72, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.32, 8]} />
            <meshStandardMaterial color="#1a2d54" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.22, 0.72, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.32, 8]} />
            <meshStandardMaterial color="#1a2d54" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.1, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.36, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.36, 0.04]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.1, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.36, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.36, 0.04]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export const HouseCharacters3D: React.FC<HouseCharacters3DProps> = ({
  agents,
  players,
  selectedPlayerId,
  onSelectPlayer,
  paused,
}) => {
  return (
    <group position={[0, 0, 0]}>
      {agents.map((agent) => {
        const player = players.find((p) => p.id === agent.id);
        if (!player) return null;

        return (
          <CharacterModel
            key={agent.id}
            agent={agent}
            player={player}
            selected={selectedPlayerId === agent.id}
            onSelect={() => onSelectPlayer(agent.id)}
            paused={paused}
          />
        );
      })}
    </group>
  );
};
