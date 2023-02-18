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

export const Slicing = ({ bg, plane, slicing = true }) => {
  // @ts-ignore
  const { constant, transparent, ShowModel } = useControls(plane, {
    transparent: true,
    ShowModel: true,
    constant: { value: 0, min: -1, max: 1, step: 0.01 },
  });

  const tempVector = new Vector3();
  const tempLine = new Line3();
  const tempVector1 = new Vector3();
  const tempVector2 = new Vector3();
  const tempVector3 = new Vector3();

  const defaultArray = new Float32Array(9999);
  const defaultPlane = new Plane();
  defaultPlane.normal.set(0, 0, -1);

  function SlicingPlane({ constant, transparent }) {
    return (
      <mesh position={[0, 0, constant]}>
        <planeBufferGeometry attach="geometry" args={[5, 5]} />
        <meshStandardMaterial
          attach="material"
          roughness={1}
          metalness={0}
          side={DoubleSide}
          color={transparent ? "#f5f5f5" : "#212121"}
          opacity={transparent ? 0.5 : 1}
          transparent={transparent}
        />
      </mesh>
    );
  }

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

  function TorusKnotSlice({ constant }) {
    const lineSegRef = useRef();
    const geomRef = useRef();

    const bvhMesh = useMemo(() => {
      // setup BVH Mesh
      // the number next to TorusKnotGeometry respond to the paramenter of the geometry
      const geometry = new TorusKnotGeometry(1, 0.2, 50, 50, 2, 3);
      return new MeshBVH(geometry, { maxLeafTris: 3 });
    }, []);

    useEffect(() => {
      if (bvhMesh && geomRef.current && lineSegRef.current) {
        if (geomRef.current) {
          const geo = geomRef.current;
          if (!geo.hasAttribute("position")) {
            const linePosAttr = new BufferAttribute(defaultArray, 3, false);
            linePosAttr.setUsage(DynamicDrawUsage);
            geo.setAttribute("position", linePosAttr);
          }
        }

        let index = 0;
        const posAttr = geomRef.current.attributes.position;

        defaultPlane.constant = constant;

        // code re-used and adjusted from https://gkjohnson.github.io/three-mesh-bvh/example/bundle/clippedEdges.html
        bvhMesh.shapecast({
          intersectsBounds: (box) => {
            return defaultPlane.intersectsBox(box);
          },

          intersectsTriangle: (tri) => {
            // check each triangle edge to see if it intersects with the clippingPlane. If so then
            // add it to the list of segments.
            let count = 0;
            tempLine.start.copy(tri.a);
            tempLine.end.copy(tri.b);
            if (defaultPlane.intersectLine(tempLine, tempVector)) {
              posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
              index++;
              count++;
            }

            tempLine.start.copy(tri.b);
            tempLine.end.copy(tri.c);
            if (defaultPlane.intersectLine(tempLine, tempVector)) {
              posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
              count++;
              index++;
            }

            tempLine.start.copy(tri.c);
            tempLine.end.copy(tri.a);
            if (defaultPlane.intersectLine(tempLine, tempVector)) {
              posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
              count++;
              index++;
            }

            // if (count === 3) {
            //   tempVector1.fromBufferAttribute(posAttr, index - 3);
            //   tempVector2.fromBufferAttribute(posAttr, index - 2);
            //   tempVector3.fromBufferAttribute(posAttr, index - 1);
            //   // If the last point is a duplicate intersection
            //   if (
            //     tempVector3.equals(tempVector1) ||
            //     tempVector3.equals(tempVector2)
            //   ) {
            //     count--;
            //     index--;
            //   } else if (tempVector1.equals(tempVector2)) {
            //     // If the last point is not a duplicate intersection
            //     // Set the penultimate point as a distinct point and delete the last point
            //     posAttr.setXYZ(index - 2, tempVector3);
            //     count--;
            //     index--;
            //   }
            // }

            // If we only intersected with one or three sides then just remove it. This could be handled
            // more gracefully.
            if (count !== 2) {
              index -= count;
            }
          },
        });

        // set the draw range to only the new segments and offset the lines so they don't intersect with the geometry
        geomRef.current.setDrawRange(0, index);
        posAttr.needsUpdate = true;
      }
    }, [constant, bvhMesh, defaultArray, defaultPlane]);

    return (
      <>
        <lineSegments
          ref={lineSegRef}
          frustumCulled={false}
          matrixAutoUpdate={false}
          renderOrder={3}
        >
          <bufferGeometry ref={geomRef} attach="geometry" />
          <lineBasicMaterial
            attach="material"
            // neon yellow
            color={theme.palette.primary.light}
            linewidth={1}
            linecap={"round"}
            linejoin={"round"}
            // battle the xxx
            polygonOffset={true}
            polygonOffsetFactor={-1.0}
            polygonOffsetUnits={4.0}
            depthTest={false}
          />
        </lineSegments>
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
        {slicing && (
          <>
            <TorusKnotSlice constant={constant} />
            <SlicingPlane constant={constant} transparent={transparent} />
          </>
        )}
        {ShowModel && <TorusKnot constant={slicing ? constant : undefined} />}

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
