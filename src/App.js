import { SimpleGrid } from "@mantine/core";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Display1 } from "./screens/displayArrangement/Display1";
import { Cube } from "./screens/Examples/Cube";
import { MyComponent } from "./screens/Examples/levaExample/levaGetStart";
import { RobotModel } from "./screens/Examples/Model";
import { Slicing } from "./screens/Examples/Slicing";
import "../src/screens/Examples/styles.css";

export default function App() {
  return (
    <>
      <Display1 />
      <Canvas>
        <RobotModel />
        <OrbitControls />
      </Canvas>
    </>
  );
}
