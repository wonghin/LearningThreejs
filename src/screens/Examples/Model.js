import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useEffect, useMemo, useRef } from "react";
import {
  BackSide,
  DoubleSide,
  DynamicDrawUsage,
  Line3,
  Plane,
  Vector3,
  TorusKnotGeometry,
  BufferAttribute,
  FrontSide,
} from "three";
import { MeshBVH } from "three-mesh-bvh";
import { theme } from "../../themes/theme";
import { Cube } from "./Cube";

export const Model = ({ bg, plane }) => {
  // @ts-ignore
  //   const { constant, transparent } = useControls(plane, {
  //     transparent: true,
  //     constant: { value: 0, min: -1, max: 1, step: 0.01 },
  //   });

  const tempVector = new Vector3();
  const tempLine = new Line3();
  const tempVector1 = new Vector3();
  const tempVector2 = new Vector3();
  const tempVector3 = new Vector3();

  const defaultArray = new Float32Array(9999);
  const defaultPlane = new Plane();
  defaultPlane.normal.set(0, 0, -1);

  function TorusKnot({ constant }) {
    const torusKnotSettings = useMemo(() => {
      return [1, 0.2, 50, 50, 2, 3];
    }, []);

    const clippingPlane = useMemo(() => {
      const plane = new Plane();
      plane.normal.set(0, 0, -1);
      return plane;
    }, []);

    useEffect(() => {
      clippingPlane.constant = constant;
    }, [clippingPlane, constant]);

    return (
      <>
        {/* Outside of the TorusKnot is Hot Pink */}
        <mesh castShadow receiveShadow>
          <torusKnotBufferGeometry attach="geometry" args={torusKnotSettings} />
          <meshStandardMaterial
            attach="material"
            roughness={1}
            metalness={0.1}
            clippingPlanes={[clippingPlane]}
            clipShadows={true}
            color={"hotpink"}
          />
        </mesh>
        {/* Inside of the TorusKnot  is Dark Pink*/}
        <mesh>
          <torusKnotBufferGeometry attach="geometry" args={torusKnotSettings} />
          <meshStandardMaterial
            attach="material"
            roughness={1}
            metalness={0.1}
            clippingPlanes={[clippingPlane]}
            color={"#E75480"}
            side={BackSide}
          />
        </mesh>
      </>
    );
  }

  function Lights() {
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
  return (
    <>
      <Canvas
        shadows
        onCreated={(state) => (state.gl.localClippingEnabled = true)}
      >
        <TorusKnot constant={undefined} />

        {/* We also setup some controls, background color and lighing */}
        <OrbitControls />
        {/* <color attach="background" args={["lightblue"]} /> */}
        <color attach="background" args={[bg]} />

        {/* <Environment preset="sunset" background blur={0.5} /> */}
        <Lights />
      </Canvas>
    </>
  );
};
