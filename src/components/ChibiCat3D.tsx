"use client"
import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Procedural 3D chibi cat (no .glb needed — pure Three.js geometry) ────────
function ChibiMesh({ catState }: { catState: string }) {
  const groupRef   = useRef<THREE.Group>(null!)
  const headRef    = useRef<THREE.Group>(null!)
  const armLRef    = useRef<THREE.Group>(null!)
  const tailRef    = useRef<THREE.Group>(null!)
  const eyeLRef    = useRef<THREE.Mesh>(null!)
  const eyeRRef    = useRef<THREE.Mesh>(null!)

  const { camera, gl } = useThree()
  const mouse = useRef(new THREE.Vector2())
  const targetRot = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
      mouse.current.y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [gl])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!groupRef.current || !headRef.current || !armLRef.current) return

    // Gentle bob
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.03

    // Body follows mouse softly (Y rotation)
    targetRot.current.y = mouse.current.x * 0.6
    targetRot.current.x = -mouse.current.y * 0.2
    groupRef.current.rotation.y += (targetRot.current.y - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.x += (targetRot.current.x - groupRef.current.rotation.x) * 0.05

    // Head tilts toward mouse a little more
    headRef.current.rotation.y += (mouse.current.x * 0.25 - headRef.current.rotation.y) * 0.06
    headRef.current.rotation.z += (-mouse.current.x * 0.08 - headRef.current.rotation.z) * 0.06

    // Eyes scale for blink (every ~3s)
    const blinkCycle = Math.floor(t / 3.2) % 3 === 0 ? Math.sin((t % 3.2) * 30) : 1
    const eyeY = Math.max(0.05, blinkCycle)
    if (eyeLRef.current) { eyeLRef.current.scale.y = eyeY; eyeRRef.current.scale.y = eyeY }

    // Wave state — arm swings
    if (catState === 'waving' && armLRef.current) {
      armLRef.current.rotation.z = Math.sin(t * 6) * 0.6 + 0.8
    } else if (armLRef.current) {
      armLRef.current.rotation.z += (0 - armLRef.current.rotation.z) * 0.08
    }

    // Ticklish — body shakes
    if (catState === 'ticklish') {
      groupRef.current.position.x = Math.sin(t * 18) * 0.06
    } else {
      groupRef.current.position.x += (0 - groupRef.current.position.x) * 0.1
    }

    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2) * 0.25
    }
  })

  // Materials
  const bodyMat  = new THREE.MeshStandardMaterial({ color: '#f7ede4', roughness: 0.9 })
  const eyeMat   = new THREE.MeshStandardMaterial({ color: '#2a1e1e', roughness: 0.2, metalness: 0.15 })
  const shineMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.0 })
  const noseMat  = new THREE.MeshStandardMaterial({ color: '#c47a88', roughness: 0.9 })
  const cheekMat = new THREE.MeshStandardMaterial({ color: '#f5a0b0', roughness: 0.95,
                                                     transparent: true, opacity: 0.6 })
  const earMat   = new THREE.MeshStandardMaterial({ color: '#f0bfc8', roughness: 0.95 })

  return (
    <group ref={groupRef}>
      {/* ── Body ── */}
      <mesh castShadow receiveShadow material={bodyMat}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      <mesh castShadow material={bodyMat} scale={[0.62, 0.1, 0.55]} position={[0, -0.05, 0.92]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>

      {/* ── Head ── */}
      <group ref={headRef} position={[0, 0, 1.55]}>
        <mesh castShadow material={bodyMat} scale={[1.22, 1.15, 1.18]}>
          <sphereGeometry args={[1, 32, 32]} />
        </mesh>
        {/* Ears */}
        <mesh material={bodyMat} position={[-0.68, 0, 0.92]} rotation={[0, -0.2, -0.15]}>
          <coneGeometry args={[0.28, 0.58, 16]} />
        </mesh>
        <mesh material={earMat} position={[-0.65, -0.06, 0.9]} rotation={[0, -0.2, -0.15]} scale={[0.6, 0.9, 0.6]}>
          <coneGeometry args={[0.28, 0.58, 16]} />
        </mesh>
        <mesh material={bodyMat} position={[0.68, 0, 0.92]} rotation={[0, 0.2, 0.15]}>
          <coneGeometry args={[0.28, 0.58, 16]} />
        </mesh>
        <mesh material={earMat} position={[0.65, -0.06, 0.9]} rotation={[0, 0.2, 0.15]} scale={[0.6, 0.9, 0.6]}>
          <coneGeometry args={[0.28, 0.58, 16]} />
        </mesh>
        {/* Eyes */}
        <mesh ref={eyeLRef} castShadow material={eyeMat} position={[-0.4, -1.05, 0.22]} scale={[0.18, 0.22, 0.08]}>
          <sphereGeometry args={[1, 24, 24]} />
        </mesh>
        <mesh castShadow material={shineMat} position={[-0.32, -1.12, 0.28]} scale={[0.06, 0.06, 0.04]}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>
        <mesh ref={eyeRRef} castShadow material={eyeMat} position={[0.4, -1.05, 0.22]} scale={[0.18, 0.22, 0.08]}>
          <sphereGeometry args={[1, 24, 24]} />
        </mesh>
        <mesh castShadow material={shineMat} position={[0.48, -1.12, 0.28]} scale={[0.06, 0.06, 0.04]}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>
        {/* Cheeks */}
        <mesh material={cheekMat} position={[-0.6, -1.0, 0.08]} scale={[0.27, 0.06, 0.20]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>
        <mesh material={cheekMat} position={[0.6, -1.0, 0.08]} scale={[0.27, 0.06, 0.20]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>
        {/* Nose */}
        <mesh material={noseMat} position={[0, -1.16, 0.05]} scale={[0.1, 0.065, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>
      </group>

      {/* ── Left arm (waveable) ── */}
      <group ref={armLRef} position={[-1.05, 0, 0.15]}>
        <mesh castShadow material={bodyMat} scale={[0.30, 0.26, 0.42]}>
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
        {[-0.1, 0, 0.1].map((ox, i) => (
          <mesh key={i} material={earMat} position={[ox, -0.32, -0.22]} scale={[0.07, 0.05, 0.07]}>
            <sphereGeometry args={[1, 10, 10]} />
          </mesh>
        ))}
      </group>

      {/* ── Right arm ── */}
      <group position={[1.05, 0, 0.15]}>
        <mesh castShadow material={bodyMat} scale={[0.30, 0.26, 0.42]}>
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
        {[-0.1, 0, 0.1].map((ox, i) => (
          <mesh key={i} material={earMat} position={[ox, -0.32, -0.22]} scale={[0.07, 0.05, 0.07]}>
            <sphereGeometry args={[1, 10, 10]} />
          </mesh>
        ))}
      </group>

      {/* ── Legs ── */}
      {[-0.52, 0.52].map((x, i) => (
        <group key={i} position={[x, 0, -0.88]}>
          <mesh castShadow material={bodyMat} scale={[0.40, 0.36, 0.30]}>
            <sphereGeometry args={[1, 20, 20]} />
          </mesh>
          {[-0.12, 0, 0.12].map((ox, j) => (
            <mesh key={j} material={earMat} position={[ox, -0.42, -0.12]} scale={[0.08, 0.06, 0.07]}>
              <sphereGeometry args={[1, 10, 10]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Tail ── */}
      <group ref={tailRef} position={[0.7, 0, -0.55]} style={{ transformOrigin: '0 0 0' }}>
        <mesh castShadow material={bodyMat}
              position={[0.4, 0, 0.3]}
              rotation={[0, 0, Math.PI / 4]}
              scale={[0.12, 0.55, 0.12]}>
          <capsuleGeometry args={[1, 1.2, 8, 16]} />
        </mesh>
      </group>
    </group>
  )
}

// ── Main exported component ──────────────────────────────────────────────────
export default function ChibiCat3D({ size = 300 }: { size?: number }) {
  const [catState, setCatState] = useState<'idle' | 'waving' | 'ticklish'>('idle')
  const stateRef = useRef('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function trigger(s: 'waving' | 'ticklish') {
    if (stateRef.current !== 'idle') return
    stateRef.current = s
    setCatState(s)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      stateRef.current = 'idle'
      setCatState('idle')
    }, 2000)
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
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 6, 5]} intensity={1.2} castShadow
          shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-3, 3, 2]} intensity={0.4} color="#ffe0f0" />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
            <ChibiMesh catState={catState} />
          </Float>
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={0.4}
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
