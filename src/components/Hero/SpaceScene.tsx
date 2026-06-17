import { Suspense, useEffect, useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { sceneObjects, LOAD_MODELS, dissolveConfig } from './sceneObjects';
import { Model, InstancedModel, ModelBoundary } from './Model';
import { Placeholder, PlaceholderInstanced } from './Placeholder';
import { RainInstancedModel, RainPlaceholder } from './Rain';
import WanderingCamera from './WanderingCamera';
import ExplosionParticles from './ExplosionParticles';
import Terrain from './Terrain';

/**
 * The hero scene: a composition of 4 S3 objects (2 unique + 2 instanced) that the
 * camera wanders through.
 *
 * Clicking the hero (toggles `exploded`):
 *  - the UNIQUE objects burst into a particle explosion (only their origins);
 *  - the INSTANCED objects (milpa, rain) switch to a green wireframe, hold for
 *    `holdMs`, fade to 0 over `fadeMs`, then unmount (freeing memory).
 * Clicking again resets everything to the initial textured render.
 *
 * Each model loads in its own Suspense + ModelBoundary so they stream in
 * independently and a single failed/placeholder URL never breaks the scene.
 */
export default function SpaceScene({ exploded }: { exploded: boolean }) {
  // Solo los objetos únicos siembran la explosión de partículas.
  const uniqueOrigins = useMemo(() => {
    const pts: Vector3[] = [];
    for (const obj of sceneObjects) {
      if (obj.kind === 'single' && obj.transform) {
        pts.push(new Vector3(...obj.transform.position));
      }
    }
    return pts;
  }, []);

  // Fase de los instanciados: vivos → disolviéndose (wireframe + fade) → fuera
  // (desmontados). Al reiniciar (exploded=false) vuelven a 'live'.
  const [phase, setPhase] = useState<'live' | 'dissolving' | 'gone'>('live');
  useEffect(() => {
    if (!exploded) {
      setPhase('live');
      return;
    }
    setPhase('dissolving');
    const id = window.setTimeout(
      () => setPhase('gone'),
      dissolveConfig.holdMs + dissolveConfig.fadeMs
    );
    return () => window.clearTimeout(id);
  }, [exploded]);

  return (
    <>
      <WanderingCamera />

      {/* Suelo generativo (persiste también durante la explosión). */}
      <Terrain />

      {sceneObjects.map((obj, i) => {
        // Objetos únicos: al explotar los reemplaza ExplosionParticles.
        if (obj.kind === 'single') {
          if (exploded || !obj.transform) return null;
          const placeholder = <Placeholder variant={i} transform={obj.transform} />;
          if (!LOAD_MODELS) return <group key={obj.name}>{placeholder}</group>;
          return (
            <ModelBoundary key={obj.name} fallback={placeholder}>
              <Suspense fallback={placeholder}>
                <Model name={obj.name} transform={obj.transform} />
              </Suspense>
            </ModelBoundary>
          );
        }

        // Objetos instanciados: se mantienen montados mientras se disuelven y se
        // desmontan al terminar el fade (phase 'gone') para liberar memoria.
        if (phase === 'gone' || !obj.instances) return null;
        const dissolving = exploded;
        const placeholder = obj.rain ? (
          <RainPlaceholder variant={i} params={obj.rain} dissolving={dissolving} />
        ) : (
          <PlaceholderInstanced variant={i} instances={obj.instances} />
        );
        if (!LOAD_MODELS) return <group key={obj.name}>{placeholder}</group>;
        return (
          <ModelBoundary key={obj.name} fallback={placeholder}>
            <Suspense fallback={placeholder}>
              {obj.rain ? (
                <RainInstancedModel name={obj.name} params={obj.rain} dissolving={dissolving} />
              ) : (
                <InstancedModel
                  name={obj.name}
                  instances={obj.instances}
                  dissolving={dissolving}
                />
              )}
            </Suspense>
          </ModelBoundary>
        );
      })}

      {exploded && <ExplosionParticles origins={uniqueOrigins} />}
    </>
  );
}
