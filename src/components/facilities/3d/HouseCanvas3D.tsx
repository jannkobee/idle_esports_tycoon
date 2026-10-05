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
import { HouseFacilityWings3D } from './HouseFacilityWings3D';
import { HouseStaff3D } from './HouseStaff3D';
import { HouseSecondFloor3D } from './HouseSecondFloor3D';
import type { EmpireState } from '../../../core/store/useGameStore';
import { HOUSE_CAMERA_LIMITS, houseCameraView } from '../../../core/house/houseView';

interface HouseCanvas3DProps {
  facilities: Record<FacilityId, Facility>;
  roomId: FacilityId;
  agents: SimAgent[];
  players: ProPlayer[];
  selectedPlayerId: string | null;
  paused: boolean;
  zoomStep: number;
  resetView: number;
  showRoof: boolean;
  onSelectRoom: (id: FacilityId) => void;
  onSelectPlayer: (id: string) => void;
  empire: EmpireState;
  activeFloor?: 1 | 2;
}

const DEFAULT_CAMERA_POS = houseCameraView(1, 1).position;
const DEFAULT_TARGET = houseCameraView(1, 1).target;

function CameraRig({
  zoomStep,
  resetView,
  activeFloor = 1,
}: {
  zoomStep: number;
  resetView: number;
  activeFloor?: 1 | 2;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const lastZoom = useRef(zoomStep);
  const lastFloor = useRef(activeFloor);

  // Smooth camera elevation when switching floors
  useEffect(() => {
    if (activeFloor === lastFloor.current) return;
    const camYOffset = activeFloor === 2 ? 3.2 : -3.2;
    camera.position.y += camYOffset;
    if (controls.current) {
      controls.current.target.y += camYOffset;
      controls.current.update();
    }
    lastFloor.current = activeFloor;
  }, [camera, activeFloor]);

  // Handle zoom step adjustments from HUD buttons
  useEffect(() => {
    if (zoomStep === lastZoom.current) return;
    const factor = zoomStep > lastZoom.current ? 0.84 : 1.19;
    const target = controls.current?.target;
    if (target) {
      const distance = Math.max(HOUSE_CAMERA_LIMITS.minDistance, Math.min(HOUSE_CAMERA_LIMITS.maxDistance, camera.position.distanceTo(target) * factor));
      camera.position.sub(target).normalize().multiplyScalar(distance).add(target);
      controls.current?.update();
    }
    lastZoom.current = zoomStep;
  }, [camera, zoomStep]);

  // Manual camera: Reset is the only programmatic movement.
  useEffect(() => {
    const view = houseCameraView(size.width / size.height, lastFloor.current);
    camera.position.set(...view.position);
    if (controls.current) {
      controls.current.target.set(...view.target);
      controls.current.update();
    }
  }, [camera, resetView, size.width, size.height]);

  return (
    <OrbitControls
      ref={controls}
      target={DEFAULT_TARGET}
      enableRotate={true}
      enablePan={true}
      enableZoom={true}
      minDistance={HOUSE_CAMERA_LIMITS.minDistance}
      maxDistance={HOUSE_CAMERA_LIMITS.maxDistance}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2.02}
      screenSpacePanning
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
  showRoof,
  onSelectRoom,
  onSelectPlayer,
  empire,
  activeFloor = 1,
}) => {

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{
          position: DEFAULT_CAMERA_POS,
          fov: 42,
          near: 0.2,
          far: 240,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#38bdf8']} />
        <fog attach="fog" args={['#bae6fd', 80, 180]} />

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
        {/* Soft high-altitude clouds keep daylight vivid without a dark horizon. */}
        {[[-36, 24, -55, 11], [-5, 31, -72, 15], [33, 27, -48, 12], [55, 35, -80, 18]].map(([x, y, z, scale], index) => (
          <group key={index} position={[x, y, z]}>
            {[-0.7, 0, 0.75].map((offset, part) => <mesh key={part} position={[offset * scale, part % 2 ? 0.35 : 0, 0]}>
              <sphereGeometry args={[scale * (part === 1 ? 0.58 : 0.46), 16, 10]} />
              <meshBasicMaterial color="#f8fdff" transparent opacity={0.72} depthWrite={false} />
            </mesh>)}
          </group>
        ))}
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
          <HouseEnvironment3D empire={empire} showRoof={showRoof} />

          {/* Room Architectures, Distinct Floors, and Partition Walls */}
          <HouseRooms3D
            facilities={facilities}
            selectedRoomId={roomId}
            onSelectRoom={onSelectRoom}
            showRoof={showRoof && activeFloor === 1}
          />

          {/* Detailed 3D Furniture & Equipment Models */}
          <HouseFurniture3D facilities={facilities} showRoof={showRoof} />

          <HouseFacilityWings3D facilities={facilities} showRoof={showRoof && activeFloor === 1} onSelectRoom={onSelectRoom} />
          <HouseStaff3D facilities={facilities} paused={paused} branding={empire.branding} />

          {/* 2nd Floor (Upper Living Quarters, Penthouse Dorms, Luxury Restroom, Balcony) */}
          {activeFloor === 2 && (
            <HouseSecondFloor3D
              facilities={facilities}
              showRoof={showRoof}
              branding={empire.branding}
            />
          )}

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
        <CameraRig zoomStep={zoomStep} resetView={resetView} activeFloor={activeFloor} />
      </Canvas>
    </div>
  );
};
