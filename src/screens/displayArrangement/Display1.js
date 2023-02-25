import { Button, SimpleGrid } from "@mantine/core";
import React from "react";
import { Model } from "../Examples/Model";
import { Slicing } from "../Examples/Slicing";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";

export const Display1 = () => {
  const { param1, param2 } = useControls("123", {
    param1: true,
    param2: false,
  });
  return (
    <>
      <SimpleGrid cols={2} h={window.innerHeight} spacing={0}>
        <Model bg={"black"} plane={undefined} />
        <Slicing bg={"black"} plane={"plane"} />
      </SimpleGrid>
      {/* <ClippingPlaneExample /> */}
    </>
  );
};
