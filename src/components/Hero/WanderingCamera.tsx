import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';

/**
 * Drives the default camera continuously along a smooth closed loop (Catmull-Rom),
 * always looking toward the scene centre — a slow cinematic "wander" through the
 * space instead of orbiting. No user controls.
 */
export default function WanderingCamera({ speed = 0.02 }: { speed?: number }) {
  const camera = useThree((s) => s.camera);
  const t = useRef(0);

  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(7, 2, 7),
          new Vector3(0, 4.5, 9),
          new Vector3(-7, 2.5, 7),
          new Vector3(-9, 3.5, 0),
          new Vector3(-7, 2, -7),
          new Vector3(0, 5, -9),
          new Vector3(7, 2.5, -7),
          new Vector3(9, 3, 0),
        ],
        true, // closed loop
        'catmullrom',
        0.5
      ),
    []
  );

  const center = useMemo(() => new Vector3(0, 0.8, 0), []);
  const lookTarget = useRef(new Vector3(0, 0.8, 0));

  useFrame((_, delta) => {
    // Advance along the loop (clamp delta so tab-refocus doesn't jump).
    t.current = (t.current + Math.min(delta, 0.1) * speed) % 1;
    curve.getPointAt(t.current, camera.position);
    // Ease the look target toward centre for a soft, floaty feel.
    lookTarget.current.lerp(center, 0.05);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
