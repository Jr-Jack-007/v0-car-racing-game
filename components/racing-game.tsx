"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, Environment } from "@react-three/drei"
import * as THREE from "three"

type GameState = "menu" | "countdown" | "playing" | "gameover"

interface TrafficCar {
  id: number
  position: THREE.Vector3
  lane: number
  speed: number
  color: string
  type: "sports" | "suv" | "sedan" | "truck"
}

interface GameData {
  score: number
  speed: number
  distance: number
  time: number
  bestScore: number
  nitro: number
}

// Realistic car colors
const CAR_COLORS = [
  "#FFD700", // Gold/Yellow
  "#1E90FF", // Dodger Blue
  "#FF4500", // Orange Red
  "#32CD32", // Lime Green
  "#FF1493", // Deep Pink
  "#00CED1", // Dark Turquoise
  "#FF6347", // Tomato
  "#9400D3", // Dark Violet
]

// Sports Car Component - realistic low-poly sports car
function SportsCar({ color, isPlayer = false }: { color: string; isPlayer?: boolean }) {
  return (
    <group>
      {/* Main body - sleek sports car shape */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.9, 0.4, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      
      {/* Front hood - sloped */}
      <mesh position={[0, 0.45, 1.5]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.85, 0.15, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      
      {/* Cabin/cockpit */}
      <mesh position={[0, 0.65, -0.3]} castShadow>
        <boxGeometry args={[1.6, 0.35, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Front windshield */}
      <mesh position={[0, 0.72, 0.65]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#88ccff" metalness={0.95} roughness={0.05} transparent opacity={0.6} />
      </mesh>
      
      {/* Rear windshield */}
      <mesh position={[0, 0.72, -1.1]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.5, 0.4, 0.05]} />
        <meshStandardMaterial color="#88ccff" metalness={0.95} roughness={0.05} transparent opacity={0.6} />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[0.82, 0.65, -0.3]}>
        <boxGeometry args={[0.05, 0.3, 1.4]} />
        <meshStandardMaterial color="#88ccff" metalness={0.95} roughness={0.05} transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.82, 0.65, -0.3]}>
        <boxGeometry args={[0.05, 0.3, 1.4]} />
        <meshStandardMaterial color="#88ccff" metalness={0.95} roughness={0.05} transparent opacity={0.5} />
      </mesh>
      
      {/* Front bumper */}
      <mesh position={[0, 0.2, 2.1]} castShadow>
        <boxGeometry args={[1.9, 0.25, 0.15]} />
        <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* Front grille */}
      <mesh position={[0, 0.32, 2.12]}>
        <boxGeometry args={[1.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      {/* Rear bumper */}
      <mesh position={[0, 0.2, -2.1]} castShadow>
        <boxGeometry args={[1.9, 0.25, 0.15]} />
        <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* Rear diffuser */}
      <mesh position={[0, 0.12, -2.15]}>
        <boxGeometry args={[1.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Spoiler */}
      <mesh position={[0, 0.95, -1.7]} castShadow>
        <boxGeometry args={[1.7, 0.06, 0.35]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Spoiler supports */}
      <mesh position={[-0.55, 0.82, -1.7]} castShadow>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color="#333333" metalness={0.6} />
      </mesh>
      <mesh position={[0.55, 0.82, -1.7]} castShadow>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color="#333333" metalness={0.6} />
      </mesh>
      
      {/* Wheels with rims */}
      {[[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]].map(([x, z], i) => (
        <group key={i} position={[x, 0.28, z]}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.25, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.26, 8]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Headlights */}
      <mesh position={[-0.65, 0.38, 2.1]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial color="#ffffee" emissive={isPlayer ? "#ffffaa" : "#000000"} emissiveIntensity={isPlayer ? 2 : 0} />
      </mesh>
      <mesh position={[0.65, 0.38, 2.1]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial color="#ffffee" emissive={isPlayer ? "#ffffaa" : "#000000"} emissiveIntensity={isPlayer ? 2 : 0} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-0.65, 0.38, -2.1]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.65, 0.38, -2.1]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Exhaust pipes */}
      <mesh position={[-0.4, 0.15, -2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 12]} />
        <meshStandardMaterial color="#444444" metalness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.15, -2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 12]} />
        <meshStandardMaterial color="#444444" metalness={0.9} />
      </mesh>
      
      {/* Side mirrors */}
      <mesh position={[-0.95, 0.6, 0.5]}>
        <boxGeometry args={[0.15, 0.08, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.95, 0.6, 0.5]}>
        <boxGeometry args={[0.15, 0.08, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  )
}

// Player Car Component with screen shake
function PlayerCar({ position, shake, nitroActive }: { position: [number, number, number]; shake: number; nitroActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = position[0] + (Math.random() - 0.5) * shake * 0.1
      groupRef.current.position.y = position[1] + (Math.random() - 0.5) * shake * 0.05
      groupRef.current.position.z = position[2]
    }
  })

  return (
    <group ref={groupRef}>
      <SportsCar color="#ff3300" isPlayer />
      {/* Nitro flames */}
      {nitroActive && (
        <>
          <mesh position={[-0.4, 0.15, -2.4]}>
            <coneGeometry args={[0.08, 0.6, 8]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.4, 0.15, -2.4]}>
            <coneGeometry args={[0.08, 0.6, 8]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
          </mesh>
          <pointLight position={[0, 0.2, -2.5]} color="#ff4400" intensity={2} distance={5} />
        </>
      )}
    </group>
  )
}

// Traffic Car Component
function TrafficCarMesh({ car, roadOffset }: { car: TrafficCar; roadOffset: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(car.position.x, car.position.y, car.position.z - roadOffset)
    }
  })

  return (
    <group ref={groupRef}>
      <SportsCar color={car.color} />
    </group>
  )
}

// Highway Road with realistic textures
function Highway({ roadOffset }: { roadOffset: number }) {
  const roadRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (roadRef.current) {
      roadRef.current.position.z = -(roadOffset % 100)
    }
  })
  
  const segments = useMemo(() => {
    const segs = []
    for (let i = -2; i < 8; i++) {
      segs.push(
        <mesh key={`road-${i}`} position={[0, 0.01, i * 50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[24, 50]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>
      )
    }
    return segs
  }, [])
  
  return <group ref={roadRef}>{segments}</group>
}

// Lane markings - white dashed lines
function LaneMarkings({ roadOffset }: { roadOffset: number }) {
  const markingsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (markingsRef.current) {
      markingsRef.current.position.z = -(roadOffset % 12)
    }
  })

  const markings = useMemo(() => {
    const marks = []
    for (let i = -5; i < 30; i++) {
      // Center double yellow line
      marks.push(
        <mesh key={`yellow-left-${i}`} position={[-0.15, 0.02, i * 12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 4]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.2} />
        </mesh>
      )
      marks.push(
        <mesh key={`yellow-right-${i}`} position={[0.15, 0.02, i * 12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 4]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.2} />
        </mesh>
      )
      // Lane dividers
      for (const x of [-4, 4, -8, 8]) {
        marks.push(
          <mesh key={`white-${x}-${i}`} position={[x, 0.02, i * 12]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        )
      }
    }
    return marks
  }, [])

  return <group ref={markingsRef}>{markings}</group>
}

// Metal guardrails
function Guardrails({ roadOffset }: { roadOffset: number }) {
  const railsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (railsRef.current) {
      railsRef.current.position.z = -(roadOffset % 40)
    }
  })

  const rails = useMemo(() => {
    const items = []
    for (let i = -2; i < 15; i++) {
      // Left guardrail
      items.push(
        <group key={`left-rail-${i}`} position={[-11.5, 0, i * 40]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 38]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Posts */}
          {[-15, -5, 5, 15].map((z, j) => (
            <mesh key={`post-${j}`} position={[0, 0.3, z]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.1]} />
              <meshStandardMaterial color="#666666" metalness={0.7} />
            </mesh>
          ))}
        </group>
      )
      // Right guardrail
      items.push(
        <group key={`right-rail-${i}`} position={[11.5, 0, i * 40]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 38]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
          {[-15, -5, 5, 15].map((z, j) => (
            <mesh key={`post-${j}`} position={[0, 0.3, z]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.1]} />
              <meshStandardMaterial color="#666666" metalness={0.7} />
            </mesh>
          ))}
        </group>
      )
    }
    return items
  }, [])

  return <group ref={railsRef}>{rails}</group>
}

// Realistic trees
function Trees({ roadOffset }: { roadOffset: number }) {
  const treesRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (treesRef.current) {
      treesRef.current.position.z = -(roadOffset % 80)
    }
  })

  const trees = useMemo(() => {
    const items = []
    const random = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
      return x - Math.floor(x)
    }
    
    for (let i = -2; i < 12; i++) {
      for (let j = 0; j < 6; j++) {
        const side = j < 3 ? -1 : 1
        const offsetX = (random(i * 10 + j) * 15 + 15) * side
        const offsetZ = random(i * 20 + j + 100) * 30
        const scale = 0.8 + random(i * 30 + j) * 0.6
        
        items.push(
          <group key={`tree-${i}-${j}`} position={[offsetX, 0, i * 80 + offsetZ]} scale={scale}>
            {/* Trunk */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.45, 4, 8]} />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>
            {/* Foliage layers */}
            <mesh position={[0, 5, 0]} castShadow>
              <coneGeometry args={[2.5, 4, 8]} />
              <meshStandardMaterial color="#2e7d32" roughness={0.8} />
            </mesh>
            <mesh position={[0, 6.5, 0]} castShadow>
              <coneGeometry args={[2, 3, 8]} />
              <meshStandardMaterial color="#388e3c" roughness={0.8} />
            </mesh>
            <mesh position={[0, 7.8, 0]} castShadow>
              <coneGeometry args={[1.3, 2.5, 8]} />
              <meshStandardMaterial color="#43a047" roughness={0.8} />
            </mesh>
          </group>
        )
      }
    }
    return items
  }, [])

  return <group ref={treesRef}>{trees}</group>
}

// Mountains in background
function Mountains() {
  return (
    <group position={[0, -5, 400]}>
      {/* Snow-capped mountains */}
      <mesh position={[-120, 30, 0]}>
        <coneGeometry args={[60, 80, 4]} />
        <meshStandardMaterial color="#5d6d7e" />
      </mesh>
      <mesh position={[-120, 55, 0]}>
        <coneGeometry args={[25, 25, 4]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      
      <mesh position={[0, 40, 0]}>
        <coneGeometry args={[80, 100, 4]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[0, 70, 0]}>
        <coneGeometry args={[35, 35, 4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <mesh position={[130, 25, 0]}>
        <coneGeometry args={[55, 70, 4]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[130, 48, 0]}>
        <coneGeometry args={[22, 22, 4]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      
      <mesh position={[-60, 18, 50]}>
        <coneGeometry args={[40, 50, 4]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      
      <mesh position={[70, 15, 50]}>
        <coneGeometry args={[35, 45, 4]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  )
}

// Ground/grass
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 200]} receiveShadow>
      <planeGeometry args={[600, 800]} />
      <meshStandardMaterial color="#4a7c3f" />
    </mesh>
  )
}

// Camera follow
function CameraController({ playerX, speed }: { playerX: number; speed: number }) {
  const { camera } = useThree()
  const targetY = useRef(5)
  const targetZ = useRef(-12)

  useFrame(() => {
    // Dynamic camera based on speed
    targetY.current = THREE.MathUtils.lerp(targetY.current, 4 + speed * 0.003, 0.02)
    targetZ.current = THREE.MathUtils.lerp(targetZ.current, -10 - speed * 0.008, 0.02)
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerX * 0.4, 0.08)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY.current, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, 0.05)
    camera.lookAt(playerX * 0.6, 1.5, 30)
  })

  return null
}

// Main game scene
function GameScene({
  gameData,
  setGameData,
  playerX,
  setPlayerX,
  trafficCars,
  setTrafficCars,
  setGameState,
  keys,
  shake,
  setShake,
  nitroActive,
  setNitroActive,
}: {
  gameData: GameData
  setGameData: React.Dispatch<React.SetStateAction<GameData>>
  playerX: number
  setPlayerX: React.Dispatch<React.SetStateAction<number>>
  trafficCars: TrafficCar[]
  setTrafficCars: React.Dispatch<React.SetStateAction<TrafficCar[]>>
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  keys: React.MutableRefObject<Set<string>>
  shake: number
  setShake: React.Dispatch<React.SetStateAction<number>>
  nitroActive: boolean
  setNitroActive: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const roadOffsetRef = useRef(0)
  const [roadOffset, setRoadOffset] = useState(0)
  const carIdRef = useRef(0)
  const lastSpawnRef = useRef(0)

  useFrame((_, delta) => {
    // Handle player movement
    const moveSpeed = 10 + gameData.speed * 0.01
    if (keys.current.has("arrowleft") || keys.current.has("a")) {
      setPlayerX((x) => Math.max(-9, x - moveSpeed * delta))
    }
    if (keys.current.has("arrowright") || keys.current.has("d")) {
      setPlayerX((x) => Math.min(9, x + moveSpeed * delta))
    }

    // Nitro boost
    let currentSpeed = gameData.speed
    const usingNitro = (keys.current.has(" ") || keys.current.has("shift")) && gameData.nitro > 0
    setNitroActive(usingNitro)
    
    if (usingNitro) {
      currentSpeed *= 1.6
      setGameData((prev) => ({ ...prev, nitro: Math.max(0, prev.nitro - delta * 25) }))
    } else {
      setGameData((prev) => ({ ...prev, nitro: Math.min(100, prev.nitro + delta * 8) }))
    }

    // Update road offset
    roadOffsetRef.current += currentSpeed * delta * 0.5
    setRoadOffset(roadOffsetRef.current)

    // Update game data
    setGameData((prev) => ({
      ...prev,
      distance: prev.distance + currentSpeed * delta * 0.01,
      score: prev.score + Math.floor(currentSpeed * delta * 0.8),
      time: prev.time + delta,
      speed: Math.min(320, prev.speed + delta * 1.5),
    }))

    // Spawn traffic cars
    lastSpawnRef.current += delta
    const spawnRate = Math.max(0.8, 2 - gameData.speed * 0.004)
    if (lastSpawnRef.current > spawnRate) {
      lastSpawnRef.current = 0
      const lanes = [-8, -4, 4, 8]
      const lane = lanes[Math.floor(Math.random() * lanes.length)]
      const newCar: TrafficCar = {
        id: carIdRef.current++,
        position: new THREE.Vector3(lane, 0, roadOffsetRef.current + 180),
        lane: lanes.indexOf(lane),
        speed: 40 + Math.random() * 30,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        type: "sports",
      }
      setTrafficCars((prev) => [...prev, newCar])
    }

    // Update traffic cars and check collisions
    setTrafficCars((prev) => {
      const updated = prev
        .map((car) => ({
          ...car,
          position: new THREE.Vector3(car.position.x, car.position.y, car.position.z - car.speed * delta),
        }))
        .filter((car) => car.position.z > roadOffsetRef.current - 30)

      // Collision detection
      for (const car of updated) {
        const relativeZ = car.position.z - roadOffsetRef.current
        if (relativeZ > -4 && relativeZ < 4) {
          if (Math.abs(car.position.x - playerX) < 2) {
            setShake(15)
            setTimeout(() => {
              const best = Math.max(gameData.score, gameData.bestScore)
              localStorage.setItem("racingBestScore", best.toString())
              setGameData((prev) => ({ ...prev, bestScore: best }))
              setGameState("gameover")
            }, 400)
          }
        }
      }

      return updated
    })

    // Reduce shake
    if (shake > 0) {
      setShake((s) => Math.max(0, s - delta * 25))
    }
  })

  return (
    <>
      <CameraController playerX={playerX} speed={gameData.speed} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight args={["#87ceeb", "#4a7c3f", 0.4]} />
      
      {/* Environment */}
      <Sky sunPosition={[100, 50, 100]} turbidity={8} rayleigh={0.5} />
      <fog attach="fog" args={["#c9daf8", 100, 500]} />

      <Ground />
      <Mountains />
      <Highway roadOffset={roadOffset} />
      <LaneMarkings roadOffset={roadOffset} />
      <Guardrails roadOffset={roadOffset} />
      <Trees roadOffset={roadOffset} />

      <PlayerCar position={[playerX, 0, 0]} shake={shake} nitroActive={nitroActive} />

      {trafficCars.map((car) => (
        <TrafficCarMesh key={car.id} car={car} roadOffset={roadOffset} />
      ))}
    </>
  )
}

// Countdown overlay
function CountdownOverlay({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
      <div 
        className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
        style={{
          textShadow: "0 0 60px rgba(255,100,0,0.8), 0 0 120px rgba(255,50,0,0.4)",
          animation: "pulse 0.5s ease-in-out"
        }}
      >
        {count === 0 ? "GO!" : count}
      </div>
    </div>
  )
}

// Realistic speedometer HUD
function SpeedometerHUD({ speed, nitro }: { speed: number; nitro: number }) {
  const speedAngle = (speed / 320) * 240 - 120
  
  return (
    <div className="absolute bottom-6 right-6 w-44 h-44">
      {/* Speedometer dial */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Outer ring */}
        <circle cx="100" cy="100" r="95" fill="rgba(0,0,0,0.85)" stroke="#333" strokeWidth="3" />
        
        {/* Speed arc background */}
        <circle 
          cx="100" 
          cy="100" 
          r="75" 
          fill="none" 
          stroke="#222" 
          strokeWidth="12" 
          strokeDasharray="314 157"
          transform="rotate(150 100 100)"
        />
        
        {/* Speed arc colored */}
        <circle 
          cx="100" 
          cy="100" 
          r="75" 
          fill="none" 
          stroke="url(#speedGrad)" 
          strokeWidth="12" 
          strokeDasharray={`${(speed / 320) * 314} 471`}
          transform="rotate(150 100 100)"
          strokeLinecap="round"
        />
        
        <defs>
          <linearGradient id="speedGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        
        {/* Tick marks */}
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((tick, i) => {
          const angle = ((tick / 320) * 240 - 120) * (Math.PI / 180)
          const x1 = 100 + 62 * Math.cos(angle)
          const y1 = 100 + 62 * Math.sin(angle)
          const x2 = 100 + 72 * Math.cos(angle)
          const y2 = 100 + 72 * Math.sin(angle)
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="2" />
              <text 
                x={100 + 52 * Math.cos(angle)} 
                y={100 + 52 * Math.sin(angle)} 
                fill="#888" 
                fontSize="10" 
                textAnchor="middle" 
                dominantBaseline="middle"
              >
                {tick}
              </text>
            </g>
          )
        })}
        
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 55 * Math.cos(speedAngle * Math.PI / 180)}
          y2={100 + 55 * Math.sin(speedAngle * Math.PI / 180)}
          stroke="#ff3333"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="8" fill="#ff3333" />
        <circle cx="100" cy="100" r="4" fill="#111" />
        
        {/* Speed text */}
        <text x="100" y="140" fill="white" fontSize="28" fontWeight="bold" textAnchor="middle">
          {Math.floor(speed)}
        </text>
        <text x="100" y="158" fill="#0ea5e9" fontSize="12" textAnchor="middle">
          KM/H
        </text>
      </svg>
    </div>
  )
}

// Stats HUD
function StatsHUD({ gameData }: { gameData: GameData }) {
  return (
    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-xl p-4 border border-white/10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold">
            S
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Score</div>
            <div className="text-xl font-bold text-white tabular-nums">{gameData.score.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Distance</div>
            <div className="text-xl font-bold text-white tabular-nums">{gameData.distance.toFixed(1)} km</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-sm font-bold">
            T
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Time</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {Math.floor(gameData.time / 60)}:{(Math.floor(gameData.time) % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Nitro bar
function NitroBar({ nitro }: { nitro: number }) {
  return (
    <div className="absolute bottom-6 left-6 w-16 h-40 bg-black/70 backdrop-blur-md rounded-2xl p-2 border border-white/10">
      <div className="relative w-full h-full bg-gray-800 rounded-xl overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 via-yellow-500 to-cyan-400 transition-all duration-150"
          style={{ height: `${nitro}%` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">N2O</span>
          <span className="text-lg font-bold text-white drop-shadow-lg">{Math.floor(nitro)}%</span>
        </div>
      </div>
    </div>
  )
}

// Minimap
function Minimap({ playerX, trafficCars, roadOffset }: { playerX: number; trafficCars: TrafficCar[]; roadOffset: number }) {
  return (
    <div className="absolute top-4 right-4 w-28 h-44 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden p-2">
      <div className="relative w-full h-full bg-gray-900 rounded-lg">
        {/* Road */}
        <div className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-gray-700" />
        {/* Lane dividers */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-yellow-500/70" />
        {/* Player */}
        <div
          className="absolute w-3 h-4 bg-red-500 rounded-sm bottom-6 border border-white/50"
          style={{ left: `calc(50% + ${playerX * 2}px - 6px)` }}
        />
        {/* Traffic */}
        {trafficCars.slice(0, 8).map((car) => {
          const relZ = car.position.z - roadOffset
          if (relZ < 0 || relZ > 180) return null
          return (
            <div
              key={car.id}
              className="absolute w-2 h-3 rounded-sm"
              style={{
                backgroundColor: car.color,
                left: `calc(50% + ${car.position.x * 2}px - 4px)`,
                bottom: `${(relZ / 180) * 75 + 15}%`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// Menu screen
function MenuScreen({ onStart, bestScore }: { onStart: () => void; bestScore: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-black">
      <div className="text-center">
        <h1 
          className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4"
          style={{ textShadow: "0 0 80px rgba(255,100,0,0.5)" }}
        >
          TURBO RACER
        </h1>
        <p className="text-2xl text-cyan-400 mb-10 tracking-[0.3em] font-light">3D HIGHWAY EDITION</p>

        {bestScore > 0 && (
          <div className="mb-10 bg-black/40 backdrop-blur-sm rounded-xl px-8 py-4 inline-block border border-yellow-500/30">
            <span className="text-sm uppercase tracking-wider text-gray-400">Best Score: </span>
            <span className="text-3xl font-bold text-yellow-400">{bestScore.toLocaleString()}</span>
          </div>
        )}

        <div>
          <button
            onClick={onStart}
            className="px-16 py-5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-3xl font-black rounded-2xl hover:from-red-500 hover:to-orange-400 transition-all duration-300 shadow-[0_0_50px_rgba(255,100,0,0.6)] hover:shadow-[0_0_80px_rgba(255,100,0,0.8)] hover:scale-105 active:scale-95"
          >
            PLAY
          </button>
        </div>

        <div className="mt-14 text-gray-400 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-sm">Arrow Keys</kbd>
            <span>or</span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-sm">WASD</kbd>
            <span>to steer</span>
          </p>
          <p className="flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-sm">SPACE</kbd>
            <span>or</span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-sm">SHIFT</kbd>
            <span>for Nitro Boost</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Game over screen
function GameOverScreen({ gameData, onRestart }: { gameData: GameData; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <h2 
        className="text-6xl font-black text-red-500 mb-10"
        style={{ textShadow: "0 0 40px rgba(255,0,0,0.6)" }}
      >
        GAME OVER
      </h2>

      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-8 mb-10 border border-cyan-500/30 shadow-2xl">
        <div className="grid grid-cols-2 gap-8 text-center">
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Final Score</div>
            <div className="text-4xl font-black text-white">{gameData.score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Best Score</div>
            <div className="text-4xl font-black text-yellow-400">{gameData.bestScore.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Top Speed</div>
            <div className="text-4xl font-black text-white">{Math.floor(gameData.speed)}<span className="text-lg ml-1">km/h</span></div>
          </div>
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Distance</div>
            <div className="text-4xl font-black text-white">{gameData.distance.toFixed(1)}<span className="text-lg ml-1">km</span></div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Time</div>
            <div className="text-4xl font-black text-white">
              {Math.floor(gameData.time / 60)}:{(Math.floor(gameData.time) % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-2xl font-bold rounded-xl hover:from-green-500 hover:to-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(0,255,100,0.5)] hover:shadow-[0_0_50px_rgba(0,255,100,0.7)] hover:scale-105 active:scale-95"
      >
        PLAY AGAIN
      </button>
    </div>
  )
}

// Main component
export default function RacingGame() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [countdown, setCountdown] = useState(3)
  const [playerX, setPlayerX] = useState(0)
  const [trafficCars, setTrafficCars] = useState<TrafficCar[]>([])
  const [shake, setShake] = useState(0)
  const [nitroActive, setNitroActive] = useState(false)
  const [gameData, setGameData] = useState<GameData>({
    score: 0,
    speed: 80,
    distance: 0,
    time: 0,
    bestScore: 0,
    nitro: 100,
  })

  const keysRef = useRef<Set<string>>(new Set())

  // Load best score
  useEffect(() => {
    const saved = localStorage.getItem("racingBestScore")
    if (saved) {
      setGameData((prev) => ({ ...prev, bestScore: parseInt(saved) }))
    }
  }, [])

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      if (e.key === " ") e.preventDefault()
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const startGame = useCallback(() => {
    setGameState("countdown")
    setCountdown(3)

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          setGameState("playing")
          return 0
        }
        return c - 1
      })
    }, 1000)
  }, [])

  const restartGame = useCallback(() => {
    setPlayerX(0)
    setTrafficCars([])
    setShake(0)
    setNitroActive(false)
    setGameData((prev) => ({
      score: 0,
      speed: 80,
      distance: 0,
      time: 0,
      bestScore: prev.bestScore,
      nitro: 100,
    }))
    startGame()
  }, [startGame])

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden select-none">
      <Canvas shadows camera={{ position: [0, 5, -12], fov: 70 }}>
        {gameState === "playing" ? (
          <GameScene
            gameData={gameData}
            setGameData={setGameData}
            playerX={playerX}
            setPlayerX={setPlayerX}
            trafficCars={trafficCars}
            setTrafficCars={setTrafficCars}
            setGameState={setGameState}
            keys={keysRef}
            shake={shake}
            setShake={setShake}
            nitroActive={nitroActive}
            setNitroActive={setNitroActive}
          />
        ) : (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 50, 25]} intensity={1} />
            <Sky sunPosition={[100, 50, 100]} />
          </>
        )}
      </Canvas>

      {gameState === "menu" && <MenuScreen onStart={startGame} bestScore={gameData.bestScore} />}

      {gameState === "countdown" && <CountdownOverlay count={countdown} />}

      {gameState === "playing" && (
        <>
          <StatsHUD gameData={gameData} />
          <SpeedometerHUD speed={gameData.speed} nitro={gameData.nitro} />
          <NitroBar nitro={gameData.nitro} />
          <Minimap playerX={playerX} trafficCars={trafficCars} roadOffset={gameData.distance * 100} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm bg-black/50 px-4 py-2 rounded-full">
            Arrow Keys / WASD to steer | SPACE / SHIFT for Nitro
          </div>
        </>
      )}

      {gameState === "gameover" && <GameOverScreen gameData={gameData} onRestart={restartGame} />}
    </div>
  )
}
