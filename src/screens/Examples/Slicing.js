import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useEffect, useMemo, useRef } from "react";
import THREE, {
  BackSide,
  DoubleSide,
  DynamicDrawUsage,
  Line3,
  Plane,
  Vector3,
  TorusKnotGeometry,
  BufferAttribute,
  FrontSide,
  BoxGeometry,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { MeshBVH } from "three-mesh-bvh";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { theme } from "../../themes/theme";
import { Box, Cube } from "./Cube";

export function SlicingPlane({ constant, transparent }) {
  return (
    <mesh position={[0, 0, constant]}>
      <planeBufferGeometry attach="geometry" args={[5, 5]} />

      {/* Purpose: edit plane */}
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

export const Slicing = ({ bg, plane, slicing = true }) => {
  // @ts-ignore
  const { constant, transparent, ShowModel } = useControls(plane, {
    transparent: true,
    ShowModel: false,
    constant: { value: 0, min: -1, max: 1, step: 0.001 },
  });

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
    const gltf = useLoader(GLTFLoader, "./testGLTF.gltf");

    const bvhMesh = useMemo(() => {
      // setup BVH Mesh
      // the number next to TorusKnotGeometry respond to the paramenter of the geometry
      const geometry = new TorusKnotGeometry(1, 0.2, 50, 50, 4, 3);
      // const geometry = mesh;

      return new MeshBVH(geometry, { maxLeafTris: 3 });
    }, []);

    useEffect(() => {
      if (bvhMesh && geomRef.current && lineSegRef.current) {
        if (geomRef.current) {
          const geo = geomRef.current;
          // @ts-ignore
          if (!geo.hasAttribute("position")) {
            const linePosAttr = new BufferAttribute(defaultArray, 3, false);
            linePosAttr.setUsage(DynamicDrawUsage);
            // @ts-ignore
            geo.setAttribute("position", linePosAttr);
          }
        }

        let index = 0;
        // @ts-ignore
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
        // @ts-ignore
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
            color={theme.palette.primary.light}
            linewidth={1}
            linecap={"round"}
            linejoin={"round"}
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
        <OrbitControls
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
        <color attach="background" args={[bg]} />

        {/* <Environment preset="sunset" background blur={0.5} /> */}
        <Lights />
      </Canvas>
    </>
  );
};
