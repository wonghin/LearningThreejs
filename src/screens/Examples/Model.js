import { Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
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
  BufferGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import { MeshBVH } from "three-mesh-bvh";
import { theme } from "../../themes/theme";
import { Cube } from "./Cube";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Lights } from "../../settings/Light";

export const RobotModel = () => {
  const gltf = useLoader(GLTFLoader, "./testGLTF.gltf");
  return (
    <mesh position={[0, -2, 0]}>
      <primitive object={gltf.scene} />
      <Lights />
    </mesh>
  );
};

export const Model = ({ bg, plane }) => {
  // @ts-ignore
  //   const { constant, transparent } = useControls(plane, {
  //     transparent: true,
  //     constant: { value: 0, min: -1, max: 1, step: 0.01 },
  //   });

  const defaultPlane = new Plane();
  defaultPlane.normal.set(0, 0, -1);

  function TorusKnot({ constant }) {
    const torusKnotSettings = useMemo(() => {
      return [1, 0.2, 50, 50, 4, 3];
    }, []);

    const clippingPlane = useMemo(() => {
      const plane = new Plane();
      plane.normal.set(0, 0, -1);
      return plane;
    }, []);

    useEffect(() => {
      clippingPlane.constant = constant;
    }, [clippingPlane, constant]);

    const position = [0, 0, 0];

    return (
      <>
        {/* Outside of the TorusKnot is Hot Pink */}
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          position={position}
        >
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
        <mesh
          // @ts-ignore
          position={position}
        >
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

  return (
    <>
      <Canvas
        shadows
        onCreated={(state) => (state.gl.localClippingEnabled = true)}
      >
        {/* <TorusKnot constant={undefined} /> */}

        <OrbitControls />
        <color attach="background" args={[bg]} />

        <Lights />
        <Grid
          renderOrder={-1}
          position={[0, -1.85, 0]}
          infiniteGrid
          cellSize={0.6}
          cellThickness={0.6}
          sectionSize={3.3}
          sectionThickness={1.5}
          // @ts-ignore
          sectionColor={[0.5, 0.5, 10]}
          fadeDistance={30}
        />
      </Canvas>
    </>
  );
};
