export function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[-15, -15, 15]} intensity={0.05} />
      <pointLight position={[5, 5, 15]} intensity={0.1} />
      <pointLight position={[-15, 5, 15]} intensity={0.2} />
      <pointLight position={[5, -5, 15]} intensity={0.15} />

      <spotLight
        position={[15, 15, 15]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}
