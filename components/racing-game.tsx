"use client"

// 3D Racing Game - Turbo Racer
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

type GameState = "menu" | "countdown" | "playing" | "gameover"

interface TrafficCar {
  id: number
  position: THREE.Vector3
  lane: number
  speed: number
  color: string
}

interface GameData {
  score: number
  speed: number
  distance: number
  time: number
  bestScore: number
  nitro: number
}

// Colors for traffic cars
const CAR_COLORS = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff", "#ff8800", "#8800ff"]

// Custom Sky Component (replacing drei)
function CustomSky() {
  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
    </mesh>
  )
}

// Player Car Component
function PlayerCar({ position, shake }: { position: [number, number, number]; shake: number }) {
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
      {/* Car body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color="#ff3300" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.8, -0.3]} castShadow>
        <boxGeometry args={[1.4, 0.4, 2]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.85, 0.8]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.3, 0.35, 0.1]} />
        <meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.85, -1.2]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.3, 0.35, 0.1]} />
        <meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Front wheels */}
      <mesh position={[-0.9, 0.2, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.9, 0.2, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Rear wheels */}
      <mesh position={[-0.9, 0.2, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.9, 0.2, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.6, 0.4, 2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.6, 0.4, 2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={2} />
      </mesh>
      {/* Taillights */}
      <mesh position={[-0.6, 0.4, -2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.6, 0.4, -2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
      {/* Spoiler */}
      <mesh position={[0, 0.9, -1.8]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.4]} />
        <meshStandardMaterial color="#ff3300" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.6, 0.75, -1.8]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.6, 0.75, -1.8]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
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
      {/* Car body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.6, 0.45, 3.5]} />
        <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <boxGeometry args={[1.3, 0.35, 1.8]} />
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.8, 0.2, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.8, 0.2, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-0.8, 0.2, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.8, 0.2, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  )
}

// Road segment component
function RoadSegment({ zPosition, roadOffset }: { zPosition: number; roadOffset: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const adjustedZ = ((zPosition - roadOffset) % 200 + 200) % 200 - 100

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = adjustedZ
    }
  })

  return (
    <group>
      {/* Asphalt */}
      <mesh ref={meshRef} position={[0, 0, adjustedZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 50]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// Lane markings
function LaneMarkings({ roadOffset }: { roadOffset: number }) {
  const markingsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (markingsRef.current) {
      markingsRef.current.position.z = -(roadOffset % 10)
    }
  })

  const markings = useMemo(() => {
    const marks = []
    for (let i = -10; i < 15; i++) {
      // Center yellow line
      marks.push(
        <mesh key={`center-${i}`} position={[0, 0.01, i * 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 4]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
        </mesh>
      )
      // Left lane markings
      marks.push(
        <mesh key={`left-${i}`} position={[-3.5, 0.01, i * 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )
      // Right lane markings
      marks.push(
        <mesh key={`right-${i}`} position={[3.5, 0.01, i * 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )
    }
    return marks
  }, [])

  return <group ref={markingsRef}>{markings}</group>
}

// Road barriers
function RoadBarriers({ roadOffset }: { roadOffset: number }) {
  const barriersRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (barriersRef.current) {
      barriersRef.current.position.z = -(roadOffset % 20)
    }
  })

  const barriers = useMemo(() => {
    const bars = []
    for (let i = -5; i < 10; i++) {
      // Left barrier
      bars.push(
        <mesh key={`left-barrier-${i}`} position={[-9, 0.3, i * 20]} castShadow>
          <boxGeometry args={[0.5, 0.6, 15]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
      )
      // Left barrier white stripe
      bars.push(
        <mesh key={`left-stripe-${i}`} position={[-9, 0.3, i * 20 + 5]}>
          <boxGeometry args={[0.52, 0.2, 5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )
      // Right barrier
      bars.push(
        <mesh key={`right-barrier-${i}`} position={[9, 0.3, i * 20]} castShadow>
          <boxGeometry args={[0.5, 0.6, 15]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
      )
      // Right barrier white stripe
      bars.push(
        <mesh key={`right-stripe-${i}`} position={[9, 0.3, i * 20 + 5]}>
          <boxGeometry args={[0.52, 0.2, 5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )
    }
    return bars
  }, [])

  return <group ref={barriersRef}>{barriers}</group>
}

// Trees and scenery
function Scenery({ roadOffset }: { roadOffset: number }) {
  const sceneryRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (sceneryRef.current) {
      sceneryRef.current.position.z = -(roadOffset % 60)
    }
  })

  const trees = useMemo(() => {
    const items = []
    for (let i = -3; i < 8; i++) {
      const leftX = -15 - Math.random() * 10
      const rightX = 15 + Math.random() * 10
      // Left trees
      items.push(
        <group key={`left-tree-${i}`} position={[leftX, 0, i * 30]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
          <mesh position={[0, 4, 0]} castShadow>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#228833" />
          </mesh>
        </group>
      )
      // Right trees
      items.push(
        <group key={`right-tree-${i}`} position={[rightX, 0, i * 30 + 15]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
          <mesh position={[0, 4, 0]} castShadow>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#228833" />
          </mesh>
        </group>
      )
    }
    return items
  }, [])

  return <group ref={sceneryRef}>{trees}</group>
}

// Mountains in background
function Mountains() {
  return (
    <group position={[0, 0, 200]}>
      <mesh position={[-80, 15, 0]}>
        <coneGeometry args={[40, 50, 4]} />
        <meshStandardMaterial color="#667788" />
      </mesh>
      <mesh position={[0, 20, 0]}>
        <coneGeometry args={[50, 60, 4]} />
        <meshStandardMaterial color="#556677" />
      </mesh>
      <mesh position={[80, 12, 0]}>
        <coneGeometry args={[35, 40, 4]} />
        <meshStandardMaterial color="#778899" />
      </mesh>
      <mesh position={[-40, 10, 30]}>
        <coneGeometry args={[30, 35, 4]} />
        <meshStandardMaterial color="#6688aa" />
      </mesh>
      <mesh position={[50, 8, 30]}>
        <coneGeometry args={[25, 30, 4]} />
        <meshStandardMaterial color="#7799bb" />
      </mesh>
    </group>
  )
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#3d5c3d" />
    </mesh>
  )
}

// Camera controller
function CameraController({ playerX }: { playerX: number }) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerX * 0.3, 0.05)
    camera.position.y = 5
    camera.position.z = -10
    camera.lookAt(playerX * 0.5, 1, 20)
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
}) {
  const roadOffsetRef = useRef(0)
  const [roadOffset, setRoadOffset] = useState(0)
  const carIdRef = useRef(0)
  const lastSpawnRef = useRef(0)

  useFrame((_, delta) => {
    // Handle player movement
    const moveSpeed = 8
    if (keys.current.has("arrowleft") || keys.current.has("a")) {
      setPlayerX((x) => Math.max(-7, x - moveSpeed * delta))
    }
    if (keys.current.has("arrowright") || keys.current.has("d")) {
      setPlayerX((x) => Math.min(7, x + moveSpeed * delta))
    }

    // Nitro boost
    let currentSpeed = gameData.speed
    if ((keys.current.has(" ") || keys.current.has("shift")) && gameData.nitro > 0) {
      currentSpeed *= 1.5
      setGameData((prev) => ({ ...prev, nitro: Math.max(0, prev.nitro - delta * 20) }))
    } else {
      setGameData((prev) => ({ ...prev, nitro: Math.min(100, prev.nitro + delta * 5) }))
    }

    // Update road offset (simulate forward movement)
    roadOffsetRef.current += currentSpeed * delta * 0.5
    setRoadOffset(roadOffsetRef.current)

    // Update game data
    setGameData((prev) => ({
      ...prev,
      distance: prev.distance + currentSpeed * delta * 0.1,
      score: prev.score + Math.floor(currentSpeed * delta * 0.5),
      time: prev.time + delta,
      speed: Math.min(300, prev.speed + delta * 2), // Speed gradually increases
    }))

    // Spawn traffic cars
    lastSpawnRef.current += delta
    if (lastSpawnRef.current > 1.5 - gameData.speed * 0.003) {
      lastSpawnRef.current = 0
      const lane = Math.floor(Math.random() * 4) - 2
      const newCar: TrafficCar = {
        id: carIdRef.current++,
        position: new THREE.Vector3(lane * 3.5, 0, roadOffsetRef.current + 150),
        lane,
        speed: 30 + Math.random() * 20,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
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
        .filter((car) => car.position.z > roadOffsetRef.current - 50)

      // Collision detection
      for (const car of updated) {
        const relativeZ = car.position.z - roadOffsetRef.current
        if (relativeZ > -5 && relativeZ < 5) {
          if (Math.abs(car.position.x - playerX) < 1.8) {
            // Collision!
            setShake(10)
            setTimeout(() => {
              const best = Math.max(gameData.score, gameData.bestScore)
              localStorage.setItem("racingBestScore", best.toString())
              setGameData((prev) => ({ ...prev, bestScore: best }))
              setGameState("gameover")
            }, 500)
          }
        }
      }

      return updated
    })

    // Reduce shake
    if (shake > 0) {
      setShake((s) => Math.max(0, s - delta * 20))
    }
  })

  return (
    <>
      <CameraController playerX={playerX} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 50, 25]} intensity={1.2} castShadow shadow-mapSize={1024} />
      <hemisphereLight args={["#87CEEB", "#3d5c3d", 0.5]} />
      <CustomSky />
      <fog attach="fog" args={["#87ceeb", 50, 300]} />

      <Ground />
      <Mountains />

      {/* Road segments */}
      {[-100, -50, 0, 50, 100].map((z) => (
        <RoadSegment key={z} zPosition={z} roadOffset={roadOffset} />
      ))}

      <LaneMarkings roadOffset={roadOffset} />
      <RoadBarriers roadOffset={roadOffset} />
      <Scenery roadOffset={roadOffset} />

      <PlayerCar position={[playerX, 0, 0]} shake={shake} />

      {trafficCars.map((car) => (
        <TrafficCarMesh key={car.id} car={car} roadOffset={roadOffset} />
      ))}
    </>
  )
}

// Countdown overlay
function CountdownOverlay({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
      <div className="text-9xl font-bold text-white animate-pulse drop-shadow-[0_0_30px_rgba(255,100,0,0.8)]">
        {count === 0 ? "GO!" : count}
      </div>
    </div>
  )
}

// HUD Component
function HUD({ gameData }: { gameData: GameData }) {
  const speedAngle = (gameData.speed / 300) * 270 - 135

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 mx-auto max-w-4xl border border-cyan-500/30">
        <div className="flex items-center justify-between gap-8">
          {/* Speedometer */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Speedometer background arc */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" strokeDasharray="212 71" transform="rotate(135 50 50)" />
              {/* Speed indicator arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#speedGradient)"
                strokeWidth="8"
                strokeDasharray={`${(gameData.speed / 300) * 212} 283`}
                transform="rotate(135 50 50)"
                className="transition-all duration-100"
              />
              <defs>
                <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ff88" />
                  <stop offset="50%" stopColor="#ffff00" />
                  <stop offset="100%" stopColor="#ff3300" />
                </linearGradient>
              </defs>
              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={50 + 30 * Math.cos((speedAngle * Math.PI) / 180)}
                y2={50 + 30 * Math.sin((speedAngle * Math.PI) / 180)}
                stroke="#ff3300"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="4" fill="#ff3300" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{Math.floor(gameData.speed)}</span>
              <span className="text-xs text-cyan-400">KM/H</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Score</div>
              <div className="text-2xl font-bold text-white tabular-nums">{gameData.score.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Distance</div>
              <div className="text-2xl font-bold text-white tabular-nums">{gameData.distance.toFixed(1)} km</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Time</div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {Math.floor(gameData.time / 60)}:{(Math.floor(gameData.time) % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Nitro bar */}
          <div className="w-24">
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1 text-center">Nitro</div>
            <div className="h-20 bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 to-yellow-400 transition-all duration-100"
                style={{ height: `${gameData.nitro}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">{Math.floor(gameData.nitro)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls hint */}
        <div className="mt-3 text-center text-xs text-gray-400">
          Arrow Keys / WASD to steer | SPACE / SHIFT for Nitro Boost
        </div>
      </div>
    </div>
  )
}

// Minimap
function Minimap({ playerX, trafficCars, roadOffset }: { playerX: number; trafficCars: TrafficCar[]; roadOffset: number }) {
  return (
    <div className="absolute top-4 right-4 w-24 h-40 bg-black/70 backdrop-blur-sm rounded-lg border border-cyan-500/30 overflow-hidden">
      <div className="absolute inset-2 bg-gray-800 rounded">
        {/* Road */}
        <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gray-600" />
        {/* Lane markings */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-yellow-500/50" />
        {/* Player */}
        <div
          className="absolute w-2 h-3 bg-red-500 rounded-sm bottom-4 transition-all duration-100"
          style={{ left: `calc(50% + ${playerX * 1.5}px - 4px)` }}
        />
        {/* Traffic */}
        {trafficCars.slice(0, 10).map((car) => {
          const relZ = car.position.z - roadOffset
          if (relZ < 0 || relZ > 150) return null
          return (
            <div
              key={car.id}
              className="absolute w-2 h-2 bg-blue-400 rounded-sm"
              style={{
                left: `calc(50% + ${car.position.x * 1.5}px - 4px)`,
                bottom: `${(relZ / 150) * 80 + 20}%`,
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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="text-center">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-2 drop-shadow-[0_0_30px_rgba(255,100,0,0.5)]">
          TURBO RACER
        </h1>
        <p className="text-xl text-cyan-400 mb-8 tracking-widest">3D EDITION</p>

        {bestScore > 0 && (
          <div className="mb-8 text-yellow-400">
            <span className="text-sm uppercase tracking-wider">Best Score: </span>
            <span className="text-2xl font-bold">{bestScore.toLocaleString()}</span>
          </div>
        )}

        <button
          onClick={onStart}
          className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white text-2xl font-bold rounded-lg hover:from-red-500 hover:to-orange-400 transition-all duration-300 shadow-[0_0_30px_rgba(255,100,0,0.5)] hover:shadow-[0_0_50px_rgba(255,100,0,0.7)] hover:scale-105"
        >
          PLAY
        </button>

        <div className="mt-12 text-gray-400 text-sm">
          <p className="mb-2">Use Arrow Keys or WASD to steer</p>
          <p>SPACE or SHIFT for Nitro Boost</p>
        </div>
      </div>
    </div>
  )
}

// Game over screen
function GameOverScreen({ gameData, onRestart }: { gameData: GameData; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
      <h2 className="text-5xl font-black text-red-500 mb-8 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">GAME OVER</h2>

      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 mb-8 border border-cyan-500/30">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider">Final Score</div>
            <div className="text-3xl font-bold text-white">{gameData.score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider">Best Score</div>
            <div className="text-3xl font-bold text-yellow-400">{gameData.bestScore.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider">Max Speed</div>
            <div className="text-3xl font-bold text-white">{Math.floor(gameData.speed)} km/h</div>
          </div>
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider">Distance</div>
            <div className="text-3xl font-bold text-white">{gameData.distance.toFixed(1)} km</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-cyan-400 uppercase tracking-wider">Time Survived</div>
            <div className="text-3xl font-bold text-white">
              {Math.floor(gameData.time / 60)}:{(Math.floor(gameData.time) % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xl font-bold rounded-lg hover:from-green-500 hover:to-emerald-400 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,100,0.4)] hover:shadow-[0_0_40px_rgba(0,255,100,0.6)] hover:scale-105"
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
  const [gameData, setGameData] = useState<GameData>({
    score: 0,
    speed: 60,
    distance: 0,
    time: 0,
    bestScore: 0,
    nitro: 100,
  })

  const keysRef = useRef<Set<string>>(new Set())

  // Load best score from localStorage
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
    setGameData((prev) => ({
      score: 0,
      speed: 60,
      distance: 0,
      time: 0,
      bestScore: prev.bestScore,
      nitro: 100,
    }))
    startGame()
  }, [startGame])

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 75 }}>
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
          />
        ) : (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 50, 25]} intensity={1} />
            <CustomSky />
          </>
        )}
      </Canvas>

      {gameState === "menu" && <MenuScreen onStart={startGame} bestScore={gameData.bestScore} />}

      {gameState === "countdown" && <CountdownOverlay count={countdown} />}

      {gameState === "playing" && (
        <>
          <HUD gameData={gameData} />
          <Minimap playerX={playerX} trafficCars={trafficCars} roadOffset={gameData.distance * 10} />
        </>
      )}

      {gameState === "gameover" && <GameOverScreen gameData={gameData} onRestart={restartGame} />}
    </div>
  )
}
