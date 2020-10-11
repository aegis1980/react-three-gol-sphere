import * as React from "react";
import * as THREE from "three";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import Controls from "./Controls";
import SpherisedCube from "./SpherisedCube";

const Sphere = ({ props, divisions, boardStatus }) => {
  const ref = useRef();
  let sphere = new SpherisedCube(1, divisions);
  sphere.updateBoardStatus(boardStatus);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(time / 5);
    ref.current.rotation.y = Math.sin(time / 3);
    ref.current.rotation.z = Math.sin(time / 2);
  });

  return (
    <mesh {...props} ref={ref} geometry={sphere}>
      <meshPhongMaterial attach="material" vertexColors={THREE.FaceColors} />
    </mesh>
  );
};

const SphericalBoardVis = ({ divisions, boardStatus }) => {
  return (
    <Canvas camera={{ position: [0, 0, 2] }}>
      <Controls />
      <ambientLight />
      <pointLight position={[150, 150, 150]} intensity={0.55} />

      <Sphere divisions={divisions} boardStatus={boardStatus} />
    </Canvas>
  );
};

export default SphericalBoardVis;
