import { Suspense, useMemo } from 'react';
import { Vector3 } from 'three';
import { sceneObjects, LOAD_MODELS } from './sceneObjects';
import { Model, InstancedModel, ModelBoundary } from './Model';
import { Placeholder, PlaceholderInstanced } from './Placeholder';
import WanderingCamera from './WanderingCamera';
import ExplosionParticles from './ExplosionParticles';

/**
 * The hero scene: a composition of 4 S3 objects (2 unique + 2 instanced) that the
 * camera wanders through. Clicking the hero (toggles `exploded`) swaps the models
 * for a particle burst from every object position.
 *
 * Each model loads in its own Suspense + ModelBoundary so they stream in
 * independently and a single failed/placeholder URL never breaks the scene.
 */
export default function SpaceScene({ exploded }: { exploded: boolean }) {
  // Collect every object position to seed the explosion.
  const origins = useMemo(() => {
    const pts: Vector3[] = [];
    for (const obj of sceneObjects) {
      if (obj.kind === 'single' && obj.transform) {
        pts.push(new Vector3(...obj.transform.position));
      } else if (obj.kind === 'instanced' && obj.instances) {
        obj.instances.forEach((t) => pts.push(new Vector3(...t.position)));
      }
    }
    return pts;
  }, []);

  return (
    <>
      <WanderingCamera />

      {!exploded &&
        sceneObjects.map((obj, i) => {
          // Generative placeholder for this slot (also the load/error fallback).
          const placeholder =
            obj.kind === 'instanced' && obj.instances ? (
              <PlaceholderInstanced variant={i} instances={obj.instances} />
            ) : obj.transform ? (
              <Placeholder variant={i} transform={obj.transform} />
            ) : null;

          // Models off → show the generative placeholder directly.
          if (!LOAD_MODELS) return <group key={obj.name}>{placeholder}</group>;

          // Models on → load real asset, falling back to the placeholder while it
          // streams in (Suspense) or if it fails (ModelBoundary).
          return (
            <ModelBoundary key={obj.name} fallback={placeholder}>
              <Suspense fallback={placeholder}>
                {obj.kind === 'single' && obj.transform ? (
                  <Model name={obj.name} transform={obj.transform} />
                ) : obj.instances ? (
                  <InstancedModel name={obj.name} instances={obj.instances} />
                ) : null}
              </Suspense>
            </ModelBoundary>
          );
        })}

      {exploded && <ExplosionParticles origins={origins} />}
    </>
  );
}
