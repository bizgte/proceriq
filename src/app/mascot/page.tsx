import dynamic from "next/dynamic"

const ChibiCat3D = dynamic(() => import("@/components/ChibiCat3D"), { ssr: false })

export default function MascotPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#1a1228",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px"
    }}>
      <h1 style={{ color: "#c9b1e8", fontFamily: "sans-serif", fontSize: "1.2rem" }}>
        Proceriq Mascot — 3D Preview
      </h1>
      <ChibiCat3D size={420} />
      <p style={{ color: "#7a6a8a", fontFamily: "sans-serif", fontSize: "0.8rem" }}>
        Drag to rotate · Click to wave · Mouse to look around
      </p>
    </div>
  )
}
