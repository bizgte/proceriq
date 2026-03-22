"use client"
import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// Camera is at [0, 1.5, 7] — so +Z faces camera, +Y is up, +X is right

function ChibiMesh({ catState }: { catState: string }) {
  const groupRef  = useRef<THREE.Group>(null!)
  const headRef   = useRef<THREE.Group>(null!)
  const armLRef   = useRef<THREE.Group>(null!)
  const tailRef   = useRef<THREE.Group>(null!)
  const eyeLRef   = useRef<THREE.Mesh>(null!)
  const eyeRRef   = useRef<THREE.Mesh>(null!)

  const { gl } = useThree()
  const mouse    = useRef(new THREE.Vector2())
  const targetRot = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current.x =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2
      mouse.current.y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [gl])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!groupRef.current || !headRef.current || !armLRef.current) return

    // Gentle bob
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.04

    // Body rotates toward mouse (Y axis = left/right, X axis = up/down)
    targetRot.current.y =  mouse.current.x * 0.5
    targetRot.current.x = -mouse.current.y * 0.15
    groupRef.current.rotation.y += (targetRot.current.y - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.x += (targetRot.current.x - groupRef.current.rotation.x) * 0.05

    // Head tilts a little extra toward mouse
    headRef.current.rotation.y += ( mouse.current.x * 0.22 - headRef.current.rotation.y) * 0.06
    headRef.current.rotation.z += (-mouse.current.x * 0.08 - headRef.current.rotation.z) * 0.06

    // Blink (every ~3.5s)
    const blinkPhase = t % 3.5
    const eyeScaleY = blinkPhase < 0.1 ? Math.max(0.05, Math.sin(blinkPhase * Math.PI / 0.1)) : 1
    if (eyeLRef.current) {
      eyeLRef.current.scale.y = eyeScaleY
      eyeRRef.current.scale.y = eyeScaleY
    }

    // Wave — left arm swings up
    if (catState === 'waving' && armLRef.current) {
      armLRef.current.rotation.z = Math.sin(t * 6) * 0.55 + 0.9
    } else if (armLRef.current) {
      armLRef.current.rotation.z += (0 - armLRef.current.rotation.z) * 0.1
    }

    // Ticklish — side shake
    if (catState === 'ticklish') {
      groupRef.current.position.x = Math.sin(t * 20) * 0.07
    } else {
      groupRef.current.position.x *= 0.85
    }

    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 2.2) * 0.35
    }
  })

  // ── Materials ──────────────────────────────────────────────────────────────
  const bodyMat  = new THREE.MeshStandardMaterial({ color: '#f5ede3', roughness: 0.88 })
  const eyeMat   = new THREE.MeshStandardMaterial({ color: '#1e1414', roughness: 0.2, metalness: 0.2 })
  const shineMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.0 })
  const noseMat  = new THREE.MeshStandardMaterial({ color: '#c47a88', roughness: 0.9 })
  const cheekMat = new THREE.MeshStandardMaterial({ color: '#f5a0b2', roughness: 0.95, transparent: true, opacity: 0.55 })
  const earMat   = new THREE.MeshStandardMaterial({ color: '#f0b8c5', roughness: 0.95 })
  const bellyMat = new THREE.MeshStandardMaterial({ color: '#fdf0ea', roughness: 0.95, transparent: true, opacity: 0.75 })

  return (
    <group ref={groupRef}>

      {/* ── BODY ── centered at origin, slightly wider than tall */}
      <mesh castShadow material={bodyMat} scale={[1.05, 0.95, 0.95]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>

      {/* Belly patch — front face */}
      <mesh material={bellyMat} position={[0, -0.08, 0.88]} scale={[0.58, 0.52, 0.12]}>
        <sphereGeometry args={[1, 24, 24]} />
      </mesh>

      {/* ── HEAD ── sits above body, face pointing toward +Z */}
      <group ref={headRef} position={[0, 1.55, 0]}>
        {/* Main head sphere — slightly larger than body */}
        <mesh castShadow material={bodyMat} scale={[1.53, 1.46, 1.50]}>
          <sphereGeometry args={[1, 32, 32]} />
        </mesh>

        {/* ── Ears ── top-left and top-right of head */}
        <mesh castShadow material={bodyMat} position={[-0.78, 1.05, 0]} rotation={[0, 0, -0.18]}>
          <coneGeometry args={[0.27, 0.58, 14]} />
        </mesh>
        <mesh material={earMat} position={[-0.74, 1.01, 0.04]} rotation={[0, 0, -0.18]} scale={[0.6, 0.85, 0.5]}>
          <coneGeometry args={[0.27, 0.58, 14]} />
        </mesh>
        <mesh castShadow material={bodyMat} position={[0.78, 1.05, 0]} rotation={[0, 0, 0.18]}>
          <coneGeometry args={[0.27, 0.58, 14]} />
        </mesh>
        <mesh material={earMat} position={[0.74, 1.01, 0.04]} rotation={[0, 0, 0.18]} scale={[0.6, 0.85, 0.5]}>
          <coneGeometry args={[0.27, 0.58, 14]} />
        </mesh>

        {/* ── Eyes ── on the front face (+Z hemisphere) */}
        <mesh ref={eyeLRef} castShadow material={eyeMat}
              position={[-0.38, 0.12, 1.48]} scale={[0.18, 0.18, 0.02]}>
          <sphereGeometry args={[1, 24, 24]} />
        </mesh>
        {/* Left eye shine */}
        <mesh material={shineMat} position={[-0.28, 0.22, 1.50]} scale={[0.065, 0.065, 0.05]}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>

        <mesh ref={eyeRRef} castShadow material={eyeMat}
              position={[0.38, 0.12, 1.48]} scale={[0.18, 0.18, 0.02]}>
          <sphereGeometry args={[1, 24, 24]} />
        </mesh>
        {/* Right eye shine */}
        <mesh material={shineMat} position={[0.48, 0.22, 1.50]} scale={[0.065, 0.065, 0.05]}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>

        {/* ── Cheeks ── rosy blush circles on front face */}
        <mesh material={cheekMat} position={[-0.60, -0.05, 1.32]} scale={[0.28, 0.20, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>
        <mesh material={cheekMat} position={[0.60, -0.05, 1.32]} scale={[0.28, 0.20, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>

        {/* ── Nose ── small pink dot below eyes */}
        <mesh material={noseMat} position={[0, -0.12, 1.50]} scale={[0.10, 0.07, 0.07]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>

        {/* ── Mouth ── tiny smile arc (two small spheres) */}
        <mesh material={noseMat} position={[-0.14, -0.26, 1.50]} scale={[0.06, 0.04, 0.04]} rotation={[0, 0, 0.5]}>
          <sphereGeometry args={[1, 10, 10]} />
        </mesh>
        <mesh material={noseMat} position={[0.14, -0.26, 1.50]} scale={[0.06, 0.04, 0.04]} rotation={[0, 0, -0.5]}>
          <sphereGeometry args={[1, 10, 10]} />
        </mesh>
      </group>

      {/* ── LEFT ARM (waveable) ── */}
      <group ref={armLRef} position={[-1.08, 0.05, 0]}>
        <mesh castShadow material={bodyMat} scale={[0.32, 0.28, 0.30]}>
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
      </group>

      {/* ── RIGHT ARM ── */}
      <group position={[1.08, 0.05, 0]}>
        <mesh castShadow material={bodyMat} scale={[0.32, 0.28, 0.30]}>
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
      </group>

      {/* ── TAIL ── behind the body (-Z) curling up */}
      <group ref={tailRef} position={[0.55, -0.30, -0.80]}>
        <mesh castShadow material={bodyMat}
              rotation={[0.5, 0.2, 0.8]}
              scale={[0.13, 0.60, 0.13]}>
          <capsuleGeometry args={[1, 1.0, 8, 16]} />
        </mesh>
        {/* Tail tip */}
        <mesh castShadow material={bodyMat}
              position={[0.28, 0.52, 0.18]}
              scale={[0.18, 0.18, 0.18]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>
      </group>

    </group>
  )
}

// ── Main exported component ────────────────────────────────────────────────
export default function ChibiCat3D({ size = 300 }: { size?: number }) {
  const [catState, setCatState] = useState<'idle' | 'waving' | 'ticklish'>('idle')
  const stateRef  = useRef('idle')
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  function trigger(s: 'waving' | 'ticklish') {
    if (stateRef.current !== 'idle') return
    stateRef.current = s
    setCatState(s)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      stateRef.current = 'idle'
      setCatState('idle')
    }, 2200)
  }

  return (
    <div style={{ width: size, height: size, cursor: 'pointer' }}
         onClick={() => trigger('waving')}
         title="Click me!">
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 6, 5]} intensity={1.3} castShadow
          shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#ffe0f0" />
        <pointLight position={[0, -2, 4]} intensity={0.25} color="#e0f0ff" />

        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.04} floatIntensity={0.18}>
            <ChibiMesh catState={catState} />
          </Float>
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
          minAzimuthAngle={-Math.PI / 2.5}
          maxAzimuthAngle={Math.PI / 2.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <div style={{
        textAlign: 'center', fontSize: '11px', color: '#9880b8',
        marginTop: '-8px', fontStyle: 'italic'
      }}>
        drag to rotate · click to wave
      </div>
    </div>
  )
}
