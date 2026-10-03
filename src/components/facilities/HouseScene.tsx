import { Suspense, useEffect, useRef } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Color, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { HOUSE_ROOMS, HouseRoom } from '../../core/engine/HouseLayout';
import { useHouseSimulationStore } from '../../core/house/useHouseSimulation';
import { Facility, FacilityId } from '../../core/types/facility.types';
import { ProPlayer } from '../../core/types/player.types';

type Facilities = Record<FacilityId, Facility>;

const C = {
  ground: '#142025', concrete: '#34434b', floor: '#26373f', wall: '#d6d2c5',
  trim: '#647984', wood: '#80614a', metal: '#202d35', screen: '#3bbbc9',
  cyan: '#54dce3', gold: '#e7b56a', glass: '#7db1b7',
};

function Box({ position, size, color, roughness = .8, metalness = 0, ...props }: {
  position: [number, number, number]; size: [number, number, number]; color: string;
  roughness?: number; metalness?: number; onClick?: (event: ThreeEvent<MouseEvent>) => void;
}) {
  return <mesh position={position} castShadow receiveShadow {...props}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  </mesh>;
}

function Rug({ x, z, w, d, color }: { x: number; z: number; w: number; d: number; color: string }) {
  return <Box position={[x, .095, z]} size={[w, .012, d]} color={color} roughness={1} />;
}

function Monitor({ x, z, purple = false }: { x: number; z: number; purple?: boolean }) {
  return <group position={[x, 0, z]}>
    <Box position={[0, .89, -.16]} size={[.09, .35, .08]} color={C.metal} metalness={.5} />
    <Box position={[0, 1.18, -.17]} size={[.9, .55, .09]} color="#0c151b" metalness={.3} />
    <Box position={[0, 1.18, -.115]} size={[.81, .46, .012]} color={purple ? '#7259a5' : '#1d7e90'} metalness={.15} />
    <mesh position={[0, 1.18, -.106]}><planeGeometry args={[.78, .43]} /><meshBasicMaterial color={purple ? '#b279ec' : C.cyan} transparent opacity={.12} /></mesh>
  </group>;
}

function GamingDesk({ x, z, purple = false }: { x: number; z: number; purple?: boolean }) {
  return <group>
    <Box position={[x, .59, z]} size={[1.36, .1, .74]} color={C.wood} />
    <Box position={[x-.56, .29, z]} size={[.08, .53, .62]} color={C.metal} metalness={.65} />
    <Box position={[x+.56, .29, z]} size={[.08, .53, .62]} color={C.metal} metalness={.65} />
    <Monitor x={x} z={z-.05} purple={purple} />
    <Box position={[x, .665, z+.23]} size={[.46, .018, .13]} color="#101a20" />
    <Box position={[x, .42, z+.69]} size={[.53, .14, .45]} color="#304550" />
    <Box position={[x, .72, z+.83]} size={[.53, .6, .12]} color="#263943" />
  </group>;
}

function Plant({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, .25, 0]} castShadow><cylinderGeometry args={[.2, .16, .5, 8]} /><meshStandardMaterial color="#97775d" /></mesh>
    <mesh position={[0, .82, 0]} castShadow><dodecahedronGeometry args={[.42, 0]} /><meshStandardMaterial color="#527d64" roughness={1} /></mesh>
    <mesh position={[-.15, 1.12, -.08]} castShadow><dodecahedronGeometry args={[.31, 0]} /><meshStandardMaterial color="#6e9a75" roughness={1} /></mesh>
  </group>;
}

function RoomContents({ room, level }: { room: HouseRoom; level: number }) {
  const { x, y: z, id } = room;
  if (id === 'scrim_lab') return <group>
    <Rug x={x+3} z={z+2.9} w={5.55} d={5.2} color="#314d56" />
    {[0, 1].flatMap(row => [0, 1, 2].map(col => <GamingDesk key={`${row}-${col}`} x={x+1.05+col*1.65} z={z+1.1+row*2.25} purple={level >= 5} />))}
    <Plant x={x+5.65} z={z+.6} />
  </group>;
  if (id === 'streaming_pod') return <group>
    <Rug x={x+3.1} z={z+2.8} w={5.7} d={5.1} color="#3b3450" />
    <Box position={[x+3.1, 1.25, z+.23]} size={[5.4, 2.5, .12]} color="#35354d" />
    {[0, 1, 2].map(i => <GamingDesk key={i} x={x+1.25+i*1.82} z={z+1.7} purple />)}
    {[x+1.2, x+5].map(px => <group key={px} position={[px, 0, z+3.5]}><Box position={[0,.95,0]} size={[.07,1.9,.07]} color="#56626e" metalness={.8} /><mesh position={[0,1.9,0]}><torusGeometry args={[.3,.055,8,24]} /><meshBasicMaterial color="#f7d9a4" /></mesh></group>)}
    <Box position={[x+3.2,.36,z+4.6]} size={[2.7,.72,.85]} color="#69536b" />
  </group>;
  if (id === 'analyst_room') return <group>
    <Rug x={x+3} z={z+3} w={5.55} d={5.5} color="#31454c" />
    <Box position={[x+3, 1.52, z+.25]} size={[4.5, 1.7, .1]} color="#1a303a" />
    <Box position={[x+3, 1.52, z+.32]} size={[4.2, 1.44, .012]} color="#275463" />
    <Box position={[x+3, .71, z+3]} size={[3, .16, 1.6]} color={C.wood} />
    {[x+1.85,x+4.15].map(px => <Box key={px} position={[px,.35,z+3]} size={[.12,.7,1.25]} color={C.metal} />)}
    {[x+2.1,x+3,x+3.9].map(px => <Box key={px} position={[px,.37,z+4.5]} size={[.57,.7,.58]} color="#526b79" />)}
    <Plant x={x+.8} z={z+5.4} />
  </group>;
  if (id === 'gym') return <group>
    <Rug x={x+1.5} z={z+3} w={2.7} d={5.6} color="#343f43" />
    {[0, 1].map(i => <group key={i} position={[x+1.5,0,z+1.7+i*2.5]}>
      <Box position={[0,.12,0]} size={[1.9,.16,1.55]} color="#1e2a32" />
      <Box position={[0,.88,-.55]} size={[1.8,.08,.08]} color="#a7b5b6" metalness={.8} />
      <Box position={[-.65,.53,-.55]} size={[.1,1.1,.1]} color="#9fb0ae" metalness={.7} />
      <Box position={[.65,.53,-.55]} size={[.1,1.1,.1]} color="#9fb0ae" metalness={.7} />
      <Box position={[0,.26,.2]} size={[.95,.16,.4]} color="#637983" />
    </group>)}
  </group>;
  return <group>
    <Rug x={x+1.3} z={z+3} w={2.25} d={5.6} color="#34484b" />
    {[0,1,2].map(i => <group key={i} position={[x+.58,0,z+1.25+i*1.6]}>
      <Box position={[0,.9,0]} size={[.95,1.8,.5]} color={C.wood} />
      <Box position={[0,1.48,.08]} size={[.77,.1,.44]} color={i === 1 ? '#6a7caa' : '#5f8a83'} />
      <Box position={[0,.81,.08]} size={[.77,.1,.44]} color="#dad6c7" />
    </group>)}
    <Box position={[x+1.83,.52,z+3.25]} size={[.72,1.04,1.75]} color="#536a6a" />
  </group>;
}

function Room({ room, facility, selected, onSelect }: { room: HouseRoom; facility: Facility; selected: boolean; onSelect: () => void }) {
  const unlocked = facility.isUnlocked;
  const cx = room.x+room.w/2, cz = room.y+room.d/2;
  const select = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); };
  return <group>
    <Box position={[cx,.015,cz]} size={[room.w,.13,room.d]} color={unlocked ? C.floor : '#3b4547'} onClick={select} />
    <mesh position={[cx,.095,cz]} rotation={[-Math.PI/2,0,0]} onClick={select}>
      <planeGeometry args={[room.w-.12,room.d-.12]} />
      <meshStandardMaterial color={new Color(room.accent).lerp(new Color('#2a363d'), unlocked ? .8 : .94)} roughness={.95} />
    </mesh>
    {selected && <mesh position={[cx,.1,cz]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[Math.min(room.w,room.d)*.45,Math.min(room.w,room.d)*.47,4]} /><meshBasicMaterial color={C.gold} transparent opacity={.65} /></mesh>}
    <group onClick={select}><RoomContents room={room} level={facility.level} /></group>
    <Html position={[cx, .21, room.y+room.d-.45]} center distanceFactor={15} style={{pointerEvents:'none'}}>
      <span className={`scene-room-label ${selected ? 'active' : ''}`}>{unlocked ? room.label : `LOCKED · ${room.label}`}</span>
    </Html>
  </group>;
}

const SKIN = ['#c69575','#875b44','#d4ab8e','#e3b99b','#aa7656','#c69a78'];
const HAIR = ['#1b242b','#29202a','#61506e','#724830','#25242a','#513b31'];

function Person({ player, x, z, moving, selected, onSelect }: { player: ProPlayer; x: number; z: number; moving: boolean; selected: boolean; onSelect: () => void }) {
  const ref = useRef<Group>(null);
  useFrame(({clock}) => {
    if (ref.current) ref.current.position.y = moving ? Math.sin(clock.elapsedTime*9+player.portraitIndex)*.055 : 0;
  });
  const i = player.portraitIndex % 6;
  return <group ref={ref} position={[x,0,z]} onClick={e=>{e.stopPropagation();onSelect();}}>
    {selected && <mesh position={[0,.035,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.34,.4,24]} /><meshBasicMaterial color={C.gold} /></mesh>}
    <mesh position={[0,.43,0]} castShadow><cylinderGeometry args={[.22,.27,.7,8]} /><meshStandardMaterial color={i%2 ? '#376377' : '#238e98'} roughness={.85} /></mesh>
    <mesh position={[0,.99,0]} castShadow><sphereGeometry args={[.2,12,10]} /><meshStandardMaterial color={SKIN[i]} roughness={.9} /></mesh>
    <mesh position={[0,1.11,-.045]} castShadow><sphereGeometry args={[.205,10,8,0,Math.PI*2,0,Math.PI*.52]} /><meshStandardMaterial color={HAIR[i]} roughness={1} /></mesh>
    {[-.13,.13].map((offset,j)=><mesh key={j} position={[offset,.13,.01]} castShadow><cylinderGeometry args={[.075,.08,.26,6]} /><meshStandardMaterial color="#24313a" /></mesh>)}
    <mesh position={[0,.99,0]}><torusGeometry args={[.22,.03,6,16,0,Math.PI]} /><meshStandardMaterial color="#17242c" /></mesh>
  </group>;
}

function People({ players, selectedPlayerId, onSelect, paused }: { players: ProPlayer[]; selectedPlayerId: string|null; onSelect: (id:string)=>void; paused:boolean }) {
  const agents = useHouseSimulationStore(s=>s.agents);
  const visibleAgents = useRef(agents);
  if (!paused) visibleAgents.current = agents;
  return <group>{visibleAgents.current.slice(0,6).map(agent=>{
    const player = players.find(p=>p.id===agent.id);
    if (!player) return null;
    return <Person key={agent.id} player={player} x={agent.x} z={agent.y} moving={!paused && agent.mode==='walking'} selected={selectedPlayerId===agent.id} onSelect={()=>onSelect(agent.id)} />;
  })}</group>;
}

function Building({ facilities, roomId, onSelect }: { facilities:Facilities; roomId:FacilityId; onSelect:(id:FacilityId)=>void }) {
  return <group>
    <Box position={[7,-.42,7]} size={[16,.8,16]} color={C.concrete} />
    <Box position={[7,-.02,7]} size={[14.4,.08,14.4]} color="#a49e8f" />
    {HOUSE_ROOMS.map(room=><Room key={room.id} room={room} facility={facilities[room.id]} selected={roomId===room.id} onSelect={()=>onSelect(room.id)} />)}
    {/* Rear perimeter and glazed windows; the two camera-facing sides stay open. */}
    <Box position={[7,1.5,.02]} size={[14.3,3,.18]} color={C.wall} />
    <Box position={[.02,1.5,7]} size={[.18,3,14.3]} color={C.wall} />
    {[2.1,5.2,9,12.1].map(x=><group key={x}>
      <Box position={[x,1.76,.14]} size={[2.15,1.65,.025]} color="#497c87" metalness={.25} roughness={.18} />
      <Box position={[x,1.76,.18]} size={[.055,1.7,.05]} color="#d8ded9" metalness={.4} />
    </group>)}
    <Box position={[6.9,.66,3.25]} size={[.11,1.3,6.25]} color="#a7a99f" />
    <Box position={[3.3,.65,6.83]} size={[6.2,1.3,.1]} color="#9ea69e" />
    <Box position={[10.5,.65,6.83]} size={[6.2,1.3,.1]} color="#9ea69e" />
    <Box position={[6.9,.55,10.65]} size={[.11,1.1,6.1]} color="#a7a99f" />
    <Box position={[10.7,.55,10.65]} size={[.11,1.1,6.1]} color="#a7a99f" />
    <Box position={[7,-.12,14.55]} size={[2.6,.15,1.25]} color="#b8b5aa" />
    <Box position={[7,.14,14.85]} size={[2.4,.14,.65]} color="#818a89" />
    <Plant x={-.72} z={2.3} /><Plant x={15} z={11.5} />
  </group>;
}

function CameraControls({ zoomStep, resetView }: { zoomStep:number; resetView:number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const {camera} = useThree();
  const lastZoom = useRef(zoomStep);
  const lastReset = useRef(resetView);
  useEffect(()=>{
    if (zoomStep===lastZoom.current) return;
    const scale = zoomStep > lastZoom.current ? .82 : 1.22;
    const target = controls.current?.target;
    if (target) {
      camera.position.sub(target).multiplyScalar(scale).add(target);
      controls.current?.update();
    }
    lastZoom.current=zoomStep;
  },[camera,zoomStep]);
  useEffect(()=>{
    if (resetView===lastReset.current) return;
    controls.current?.reset();
    lastReset.current=resetView;
  },[resetView]);
  return <OrbitControls ref={controls} target={[7,0,7]} enableRotate={false} enablePan enableZoom minDistance={17} maxDistance={48} mouseButtons={{LEFT:2,MIDDLE:1,RIGHT:2}} maxPolarAngle={Math.PI/2.4} />;
}

export function HouseScene({ facilities, roomId, players, selectedPlayerId, paused, zoomStep, resetView, onSelectRoom, onSelectPlayer }: {
  facilities:Facilities; roomId:FacilityId; players:ProPlayer[]; selectedPlayerId:string|null; paused:boolean;
  zoomStep:number; resetView:number; onSelectRoom:(id:FacilityId)=>void; onSelectPlayer:(id:string)=>void;
}) {
  return <div className="house-scene" aria-label="Interactive 3D esports house">
    <Canvas shadows dpr={[1,1.7]} camera={{position:[29,27,29],fov:42,near:.1,far:100}} gl={{antialias:true,powerPreference:'high-performance'}}>
      <color attach="background" args={[C.ground]} />
      <fog attach="fog" args={[C.ground,37,65]} />
      <ambientLight intensity={1.05} color="#c8dcdf" />
      <hemisphereLight args={['#deeff0','#3b4144',1.15]} />
      <directionalLight position={[9,21,14]} intensity={2.5} color="#fff0d9" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-bias={-.0003} />
      <pointLight position={[10,3,2]} color="#a780db" intensity={18} distance={12} decay={2} />
      <pointLight position={[3,3,3]} color="#54dce3" intensity={12} distance={10} decay={2} />
      <mesh position={[7,-.87,7]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]} /><meshStandardMaterial color={C.ground} roughness={1} /></mesh>
      <Suspense fallback={null}>
        <ContactShadows position={[7,-.84,7]} opacity={.45} scale={27} blur={2.8} far={4} resolution={256} frames={1} color="#03090b" />
        <Building facilities={facilities} roomId={roomId} onSelect={onSelectRoom} />
        <People players={players} selectedPlayerId={selectedPlayerId} onSelect={onSelectPlayer} paused={paused} />
      </Suspense>
      <CameraControls zoomStep={zoomStep} resetView={resetView} />
    </Canvas>
  </div>;
}
