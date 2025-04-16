import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three'
import { Vector3, Mesh } from 'three';

// Componente de partícula
const Particle = ({ position, color }: { position: Vector3; color: number }) => {
  const meshRef = useRef<Mesh>();
  const velocity = useMemo(() => new Vector3(
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05
  ), []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.add(velocity);
      velocity.y -= 0.0005;
      meshRef.current.scale.multiplyScalar(0.99);
    }
  });

  return (
    <mesh ref={meshRef as React.MutableRefObject<Mesh>} position={position}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Sistema de partículas
const ParticleSystem = ({ headPosition, color = 0xffaa00 }: { headPosition: Vector3; color?: number }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 300 }, (_, i) => ({
      id: i,
      position: new Vector3(
        headPosition.x + (Math.random() - 0.5) * 3,
        headPosition.y + 1 + (Math.random() - 0.5) * 2,
        headPosition.z + (Math.random() - 0.5) * 3
      ),
      color
    }));
  }, [headPosition, color]);

  return (
    <group>
      {particles.map((p) => (
        <Particle 
          key={p.id} 
          position={p.position} 
          color={p.color} 
        />
      ))}
    </group>
  );
};

interface GuitarModelProps {
  exploded?: boolean;
}

const GuitarModel = ({ exploded = false }: GuitarModelProps) => {
  const group = useRef<any>();
  const { nodes, materials } = useGLTF('/models/guitarraBoy.gltf');
  const headPosition = new Vector3(0, 0, 0);
  const materialsList = useMemo(() => Object.keys(materials), [materials]);
  
  const rotationSpring = useSpring({
    rotation: [0, Math.PI * 2, 0] as unknown as Vector3,
    config: { duration: 20000 },
    loop: !exploded
  });

  const frameCount = useRef(0);

  useFrame((state) => {
    if (!group.current || exploded) return;
    
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;

    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 0.05;
  });

  useEffect(() => {
    if (group.current) {
      console.log(group)
      group.current.scale.set(1.2, 1.2, 1.2);
      group.current.position.y = 0;
    }
  }, [group]);

  const handleClick = () => {
    const headMesh = nodes.guitarraBoy2?.children[0] as Mesh;
    if (headMesh) {
      headMesh.getWorldPosition(headPosition);
    }
  };

  const childMeshes = useMemo(() => {
    return nodes.guitarraBoy2?.children.map((child : any, index : number) => {
      const isHead = index === 0;
      if (isHead && exploded) return null;
      return (
        <mesh 
          key={index} 
          geometry={(child as Mesh).geometry} 
          material={materials[materialsList[index % materialsList.length]]}
          castShadow receiveShadow
        />
      );
    }) || [];
  }, [nodes, materials, materialsList, exploded]);

  // console.log(rotationSpring.rotation)
  return (
    <animated.group 
      ref={group} 
      rotation={rotationSpring.rotation}
      onClick={handleClick}
    >
      {childMeshes}
      {exploded && <ParticleSystem headPosition={headPosition} />}
    </animated.group>
  );
};

// Pre-carga del modelo GLTF
useGLTF.preload('/models/guitarraBoy.gltf');

export default GuitarModel;