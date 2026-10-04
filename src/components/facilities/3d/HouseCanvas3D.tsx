import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Facility, FacilityId } from '../../../core/types/facility.types';
import { ProPlayer } from '../../../core/types/player.types';
import { SimAgent } from '../../../core/house/simulation';
import { HouseEnvironment3D } from './HouseEnvironment3D';
import { HouseRooms3D } from './HouseRooms3D';
import { HouseFurniture3D } from './HouseFurniture3D';
import { HouseCharacters3D } from './HouseCharacters3D';
import type { EmpireState } from '../../../core/store/useGameStore';

interface HouseCanvas3DProps {
  facilities: Record<FacilityId, Facility>;
  roomId: FacilityId;
  agents: SimAgent[];
  players: ProPlayer[];
  selectedPlayerId: string | null;
  paused: boolean;
  zoomStep: number;
  resetView: number;
  onSelectRoom: (id: FacilityId) => void;
  onSelectPlayer: (id: string) => void;
  empire: EmpireState;
}

const DEFAULT_CAMERA_POS: [number, number, number] = [27, 28, 27];
const DEFAULT_TARGET: [number, number, number] = [7, 0, 7];

function CameraRig({
  zoomStep,
  resetView,
}: {
  zoomStep: number;
  resetView: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const lastZoom = useRef(zoomStep);
  const lastReset = useRef(resetView);

  // Handle zoom step adjustments from HUD buttons
  useEffect(() => {
    if (zoomStep === lastZoom.current) return;
    const factor = zoomStep > lastZoom.current ? 0.84 : 1.19;
    const target = controls.current?.target;
    if (target) {
      camera.position.sub(target).multiplyScalar(factor).add(target);
      controls.current?.update();
    }
    lastZoom.current = zoomStep;
  }, [camera, zoomStep]);

  // Handle reset camera view from HUD button
  useEffect(() => {
    if (resetView === lastReset.current) return;
    camera.position.set(...DEFAULT_CAMERA_POS);
    if (controls.current) {
      controls.current.target.set(...DEFAULT_TARGET);
      controls.current.update();
    }
    lastReset.current = resetView;
  }, [camera, resetView]);

  return (
    <OrbitControls
      ref={controls}
      target={DEFAULT_TARGET}
      enableRotate={true}
      enablePan={true}
      enableZoom={true}
      minDistance={16}
      maxDistance={46}
      minPolarAngle={Math.PI / 4.2}
      maxPolarAngle={Math.PI / 2.3}
      dampingFactor={0.08}
    />
  );
}

export const HouseCanvas3D: React.FC<HouseCanvas3DProps> = ({
  facilities,
  roomId,
  agents,
  players,
  selectedPlayerId,
  paused,
  zoomStep,
  resetView,
  onSelectRoom,
  onSelectPlayer,
  empire,
}) => {

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{
          position: DEFAULT_CAMERA_POS,
          fov: 34,
          near: 0.2,
          far: 240,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#38bdf8']} />
        <fog attach="fog" args={['#bae6fd', 110, 240]} />

        {/* Ambient & Key Lighting */}
        <ambientLight
          intensity={1.12}
          color="#e0f2fe"
        />
        <hemisphereLight
          args={[
            '#e0f2fe', '#15803d', 0.95,
          ]}
        />
        <directionalLight
          position={[12, 26, 16]}
          intensity={2.65}
          color="#fffbeb"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-16}
          shadow-camera-right={16}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-bias={-0.0003}
        />

        <Suspense fallback={null}>
          {/* Soft Ground Contact Shadows */}
          <ContactShadows
            position={[7, -0.48, 7]}
            opacity={0.55}
            scale={32}
            blur={2.5}
            far={6}
            resolution={512}
            frames={1}
            color="#020617"
          />

          {/* Exterior Landscape, Street, and Parked Sports Car */}
          <HouseEnvironment3D empire={empire} />

          {/* Room Architectures, Distinct Floors, and Partition Walls */}
          <HouseRooms3D
            facilities={facilities}
            selectedRoomId={roomId}
            onSelectRoom={onSelectRoom}
          />

          {/* Detailed 3D Furniture & Equipment Models */}
          <HouseFurniture3D facilities={facilities} />

          {/* Realistic 3D Characters & Procedural Movement */}
          <HouseCharacters3D
            agents={agents}
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onSelectPlayer}
            paused={paused}
            jerseyColors={empire.branding}
          />
        </Suspense>

        {/* Mobile Camera Rig with Touch Orbit / Pan / Pinch-Zoom */}
        <CameraRig zoomStep={zoomStep} resetView={resetView} />
      </Canvas>
    </div>
  );
};
