import { SimpleGrid } from "@mantine/core";
import React from "react";
import { Model } from "../Examples/Model";
import { Slicing } from "../Examples/Slicing";

export const Display1 = () => {
  return (
    <SimpleGrid cols={2} h={window.innerHeight}>
      <Model bg={"white"} plane={undefined} />
      <Slicing bg={"black"} plane={"plane"} />

      {/* <Slicing bg={"white"} plane={"plane2"} onlyModel={true} /> */}
    </SimpleGrid>
  );
};
