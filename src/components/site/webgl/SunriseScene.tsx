import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Flowing sunrise gradient with soft noise bands + pointer-reactive glow */
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform vec3 uSun;
  uniform vec3 uPeach;
  uniform vec3 uSky;
  uniform vec3 uBase;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    float flow = fbm(vec2(uv.x * 2.2 + t, uv.y * 2.6 - t * 0.6));
    float band = smoothstep(0.0, 1.0, uv.y + flow * 0.22 - uScroll * 0.15);

    vec3 col = mix(uPeach, uBase, band);
    col = mix(col, uSky, smoothstep(0.45, 1.0, uv.y + flow * 0.18));

    // rising sun bloom
    vec2 sunPos = vec2(0.5 + uPointer.x * 0.08, 0.16 + uPointer.y * 0.05 + uScroll * 0.25);
    float d = distance(vec2(uv.x, uv.y * 0.82), vec2(sunPos.x, sunPos.y * 0.82));
    float glow = exp(-d * 4.2) * (0.85 + 0.15 * sin(uTime * 0.8));
    col += uSun * glow * 0.55;

    // gentle horizontal light sweep
    float sweep = smoothstep(0.0, 0.6, sin(uv.x * 3.0 - uTime * 0.25)) * 0.04;
    col += sweep;

    // film grain
    float g = fract(sin(dot(uv * vec2(1024.0, 768.0) + uTime, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.022;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Plane({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const pointer = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSun: { value: new THREE.Color("#ffb347") },
      uPeach: { value: new THREE.Color("#ffd7bd") },
      uSky: { value: new THREE.Color("#cfe0f2") },
      uBase: { value: new THREE.Color("#fbf6f0") },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u["uTime"]!.value += delta;
    u["uScroll"]!.value += (scrollRef.current - u["uScroll"]!.value) * 0.06;
    pointer.current.lerp(state.pointer, 0.05);
    (u["uPointer"]!.value as THREE.Vector2).copy(pointer.current);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function SunriseScene({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Plane scrollRef={scrollRef} />
    </Canvas>
  );
}
