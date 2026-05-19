import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Sky } from "@react-three/drei";
import type { SimCustomer } from "../types/index";

type Props = {
  customers: SimCustomer[];
  simTime: number;
};

function Fence({
  position,
  length = 4,
  rotationY = 0,
}: {
  position: [number, number, number];
  length?: number;
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[0.25, 0.6, 0.95].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <boxGeometry args={[length, 0.08, 0.08]} />
          <meshStandardMaterial color="#d6b07b" />
        </mesh>
      ))}

      {[-length / 2 + 0.1, 0, length / 2 - 0.1].map((x, idx) => (
        <mesh key={idx} position={[x, 0.55, 0]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
      ))}
    </group>
  );
}

function Buffalo({
  position,
  label,
  mode = "queue",
}: {
  position: [number, number, number];
  label: string;
  mode?: "queue" | "service" | "done";
}) {
  const bodyColor =
    mode === "service" ? "#2f2f35" : mode === "done" ? "#4b5563" : "#1f1f1f";

  const accentColor =
    mode === "service" ? "#60a5fa" : mode === "done" ? "#a78bfa" : "#f8fafc";

  return (
    <group position={position}>
      {/* cuerpo */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.95, 0.5, 0.42]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* lomo */}
      <mesh position={[-0.05, 0.82, 0]}>
        <boxGeometry args={[0.45, 0.18, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* cabeza */}
      <mesh position={[0.58, 0.62, 0]}>
        <boxGeometry args={[0.34, 0.28, 0.24]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* hocico */}
      <mesh position={[0.75, 0.55, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.14]} />
        <meshStandardMaterial color="#7c5a3a" />
      </mesh>

      {/* orejas */}
      <mesh position={[0.56, 0.78, 0.16]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.1, 0.05, 0.06]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.56, 0.78, -0.16]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.1, 0.05, 0.06]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* cuernos */}
      <mesh position={[0.65, 0.83, 0.1]} rotation={[0.2, 0, 0.8]}>
        <coneGeometry args={[0.03, 0.16, 10]} />
        <meshStandardMaterial color="#d9c7a2" />
      </mesh>
      <mesh position={[0.65, 0.83, -0.1]} rotation={[-0.2, 0, -0.8]}>
        <coneGeometry args={[0.03, 0.16, 10]} />
        <meshStandardMaterial color="#d9c7a2" />
      </mesh>

      {/* patas */}
      {[
        [-0.28, 0.18, 0.13],
        [0.15, 0.18, 0.13],
        [-0.28, 0.18, -0.13],
        [0.15, 0.18, -0.13],
      ].map((leg, idx) => (
        <mesh key={idx} position={leg as [number, number, number]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 10]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}

      {/* cola */}
      <mesh position={[-0.52, 0.62, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.015, 0.02, 0.28, 8]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>

      {/* marca visual del estado */}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.07, 18, 18]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>

      <Text
        position={[0, 1.32, 0]}
        fontSize={0.16}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function MilkingStation() {
  return (
    <group position={[0, 0, 1.1]}>
      {/* base */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[2.8, 0.06, 2.4]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* estructura */}
      <Fence position={[0, 0, 1.15]} length={2.6} />
      <Fence position={[0, 0, -1.15]} length={2.6} />
      <Fence position={[-1.3, 0, 0]} length={2.3} rotationY={Math.PI / 2} />
      <Fence position={[1.3, 0, 0]} length={2.3} rotationY={Math.PI / 2} />

      {/* equipo simbólico */}
      <mesh position={[0.85, 0.4, 0.8]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 18]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.85, 0.76, 0.8]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

function SceneContent({ customers, simTime }: Props) {
  const queue = customers.filter(
    (c) => c.arrivalMin <= simTime && c.startMin > simTime
  );
  const inService = customers.find(
    (c) => c.startMin <= simTime && c.endMin > simTime
  );
  const processed = customers.filter((c) => c.endMin <= simTime);

  return (
    <>
      <Sky sunPosition={[10, 8, 5]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[8, 10, 6]} intensity={1.6} castShadow />
      <pointLight position={[-6, 5, 4]} intensity={0.4} />

      {/* piso general */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial color="#7c9b63" />
      </mesh>

      {/* zona de concreto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial color="#cfcfcf" />
      </mesh>

      {/* cola */}
      <mesh position={[-7, 0.02, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 3.2]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>

      {/* salida */}
      <mesh position={[7, 0.02, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 3.2]} />
        <meshStandardMaterial color="#d1fae5" />
      </mesh>

      {/* cercas */}
      <Fence position={[-7, 0, 2.2]} length={5.2} />
      <Fence position={[-7, 0, -0.6]} length={5.2} />
      <Fence position={[-9.6, 0, 0.8]} length={2.8} rotationY={Math.PI / 2} />
      <Fence position={[-4.4, 0, 0.8]} length={2.8} rotationY={Math.PI / 2} />

      <Fence position={[7, 0, 2.2]} length={5.2} />
      <Fence position={[7, 0, -0.6]} length={5.2} />
      <Fence position={[4.4, 0, 0.8]} length={2.8} rotationY={Math.PI / 2} />
      <Fence position={[9.6, 0, 0.8]} length={2.8} rotationY={Math.PI / 2} />

      <MilkingStation />

      <Text position={[-7, 0.2, 3.1]} fontSize={0.34} color="#1e3a8a">
        Fila de espera
      </Text>
      <Text position={[0, 0.2, 3.1]} fontSize={0.34} color="#1e3a8a">
        Puesto de ordeño
      </Text>
      <Text position={[7, 0.2, 3.1]} fontSize={0.34} color="#1e3a8a">
        Salida
      </Text>

      {queue.slice(0, 12).map((buffalo, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = -8.5 + col * 1.2;
        const z = 1.6 - row * 1.0;

        return (
          <Buffalo
            key={buffalo.id}
            position={[x, 0, z]}
            label={String(buffalo.id)}
            mode="queue"
          />
        );
      })}

      {inService && (
        <Buffalo
          position={[0, 0, 1.1]}
          label={String(inService.id)}
          mode="service"
        />
      )}

      {processed.slice(-8).map((buffalo, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = 5.7 + col * 1.1;
        const z = 1.5 - row * 1.0;

        return (
          <Buffalo
            key={buffalo.id}
            position={[x, 0, z]}
            label={String(buffalo.id)}
            mode="done"
          />
        );
      })}

      <Text position={[-7, 0.15, -2.4]} fontSize={0.26} color="#334155">
        En cola: {queue.length}
      </Text>

      <Text position={[0, 0.15, -2.4]} fontSize={0.26} color="#334155">
        {inService ? `Atendiendo búfala ${inService.id}` : "Servidor libre"}
      </Text>

      <Text position={[7, 0.15, -2.4]} fontSize={0.26} color="#334155">
        Ordeñadas: {processed.length}
      </Text>
    </>
  );
}

export default function SimulationScene({ customers, simTime }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "620px",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid #dbe2ea",
        background: "#f8fafc",
      }}
    >
      <Canvas camera={{ position: [0, 9, 14], fov: 42 }}>
        <SceneContent customers={customers} simTime={simTime} />
        <OrbitControls
          enablePan={false}
          minDistance={7}
          maxDistance={22}
          minPolarAngle={0.7}
          maxPolarAngle={1.35}
        />
      </Canvas>
    </div>
  );
}