import React, { useRef, useEffect, useMemo } from 'react';
// Import Group from three
import { Group, Vector3, Mesh } from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';


// --- Componente Particle (sin cambios) ---
const Particle = ({ position, color }: { position: Vector3; color: number }) => {
  const meshRef = useRef<Mesh>();
  const velocity = useMemo(() => new Vector3(
    (Math.random() - 0.5) * 0.215,
    (Math.random() - 0.5) * 0.215,
    (Math.random() - 0.5) * 0.215
  ), []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.add(velocity);
      velocity.y -= 0.0005; // Gravity
      // Optional: Fade out or shrink particles
      // meshRef.current.material.opacity *= 0.98;
      // meshRef.current.material.transparent = true;
      meshRef.current.scale.multiplyScalar(0.985); // Shrink
      if (meshRef.current.scale.x < 0.01) {
        // Optional: Remove very small particles (might need state management)
      }
    }
  });

  return (
    <mesh ref={meshRef as React.MutableRefObject<Mesh>} position={position.clone()}>
      <sphereGeometry args={[0.05, 8, 8]} /> {/* Slightly larger particles? */}
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// --- Sistema de partículas (sin cambios, pero ajustaremos la posición inicial) ---
const ParticleSystem = ({ originPosition, color = 0x8b1707 }: { originPosition: Vector3; color?: number }) => {
  const particles = useMemo(() => {
    console.log("Creating particles around:", originPosition);
    return Array.from({ length: 300 }, (_, i) => ({
      id: i,
      // Start particles AT the origin position, Particle component handles movement
      position: originPosition.clone().add(
        new Vector3(
          (Math.random() - 0.5) * 0.1, // Smaller initial spread
          ((Math.random() - 0.5) * 0.1) + 2.5,
          (Math.random() - 0.5) * 0.1
        )
      ),
      color
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Rerun only if originPosition identity changes (though it shouldn't often with useRef)

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
  onExplodeComplete?: () => void; // Optional callback
}

const GuitarModel = ({ exploded = false }: GuitarModelProps) => {
  // Use Group type hint for better intellisense
  const group = useRef<Group>(null);

  // --- Cargar el nuevo modelo (SIN ruta Draco) ---
  const { nodes, materials } = useGLTF('/models/guitarraBoy3.gltf');

  // --- Referencia para la posición de la explosión ---
  // Usamos useRef para que el Vector3 persista entre renders
  const explosionOrigin = useRef(new Vector3(0, 10, 0)); // Default position

  // --- Animación de rotación (sin cambios) ---
  const rotationSpring = useSpring({
    rotation: [0, Math.PI * 2, 0] as unknown as Vector3,
    config: { duration: 20000 },
    loop: !exploded, // Stop looping when exploded
    // Optional: Reset rotation when not exploded
    // reset: !exploded,
    // from: { rotation: [0, 0, 0] },
  });

  // --- Animación de flotación (sin cambios) ---
  const frameCount = useRef(0);
  useFrame((state) => {
    if (!group.current || exploded) return; // Stop floating when exploded

    frameCount.current++;
    // Update floating less frequently for performance? (Optional)
    // if (frameCount.current % 2 !== 0) return;

    // Use delta for smoother animation regardless of frame rate
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  // --- Configuración inicial del grupo (Escala, Posición) ---
  useEffect(() => {
    if (group.current) {
      group.current.scale.set(0.5, 0.5, 0.5);
      // Initial Y position is handled by the floating animation now
      // group.current.position.y = 0;
      group.current.position.z = 0;
      group.current.position.x = 0;
    }
  }, []); // Run only once on mount


  // --- Lógica para obtener la posición de explosión ---
  // Hacemos esto en un useEffect que dependa de `nodes` para asegurar que el nodo existe
  useEffect(() => {
    // Usaremos el nodo principal 'guitarraBoy2' como origen
    const targetNode = nodes.guitarraBoy2 as Mesh;
    if (targetNode && group.current) {
        // Es importante obtener la posición MUNDIAL DESPUÉS de que el grupo padre
        // haya sido posicionado/escalado, aunque aquí la posición inicial es 0,0,0
        // Creamos un vector temporal para el cálculo
        const worldPos = new Vector3();
        targetNode.getWorldPosition(worldPos);

        // Ajustamos la posición relativa al centro del nodo si es necesario
        // O simplemente usamos la posición del nodo (que es su origen)
        // Podrías querer ajustar la Y para que la explosión parezca venir del centro
        // worldPos.y += 0.8; // Ejemplo de ajuste vertical

        explosionOrigin.current.copy(worldPos);
        console.log("Explosion origin set to:", explosionOrigin.current);
    } else {
        console.warn("guitarraBoy2 node not found for setting explosion origin.");
        // Fallback a la posición del grupo si el nodo no se encuentra
        group.current?.getWorldPosition(explosionOrigin.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]); // Depende de que los nodos se carguen

  // --- Función de clic (No es necesaria si la explosión se controla por props) ---
  // const handleClick = () => {
  //   // La lógica de la explosión ahora se controla con la prop `exploded`
  //   // Podrías usar esto para *activar* la explosión si lo deseas
  //   console.log("Clicked! Explosion origin:", explosionOrigin.current);
  // };


  // --- Renderizado Adaptado ---
  // `nodes` ahora contiene directamente las referencias a los objetos
  // que necesitamos renderizar (guitarraBoy2, Glasses-front, etc.)
  // `useGLTF` ya les ha aplicado sus transformaciones y materiales (si existen)

  // Extraemos los nombres de los nodos para claridad (¡cuidado con los guiones!)
  const guitarBodyNode = nodes.guitarraBoy2;
  const glassesFrontNode = nodes['Glasses-front']; // Usar corchetes para nombres con '-'
  const glassesLeftTempleNode = nodes['Glasses_temple-Left_part'];
  const glassesRightTempleNode = nodes['Glasses_temple-Right_part']; // Nombre del NODO, no de la malla

  console.log("Available nodes:", nodes);
  console.log("Available materials:", materials);

  return (
    // Aplicamos la animación de rotación al grupo contenedor
    <animated.group
      ref={group}
      rotation={rotationSpring.rotation as any} // Cast a 'any' si TypeScript se queja
      // onClick={handleClick} // Opcional: Re-habilitar si necesitas el clic
      dispose={null} // Buena práctica al renderizar nodos de useGLTF directamente
    >
      {/* Renderizar el modelo SÓLO si NO está explotado */}
      {!exploded && (
        <>
          {/* Usamos <primitive object={...} /> para renderizar los nodos */}
          {/* Three.js/Drei se encargan de la geometría, material, posición, etc. */}
          {guitarBodyNode && <primitive object={guitarBodyNode} />}
          {glassesFrontNode && <primitive object={glassesFrontNode} />}
          {glassesLeftTempleNode && <primitive object={glassesLeftTempleNode} />}
          {glassesRightTempleNode && <primitive object={glassesRightTempleNode} />}
        </>
      )}

      {/* Renderizar el sistema de partículas SÓLO si ESTÁ explotado */}
      {/* Pasamos la posición de origen calculada */}
      {exploded && <ParticleSystem originPosition={explosionOrigin.current} />}

    </animated.group>
  );
};

// --- Pre-carga del modelo (SIN ruta Draco) ---
useGLTF.preload('/models/guitarraBoy3.gltf');

export default GuitarModel;