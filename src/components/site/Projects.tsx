import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Reveal } from "./Reveal";
import { TextReveal } from "./motion-primitives";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";

const projects = [
  { name: "Solstice Identity", tag: "Brand system", image: project1 },
  { name: "Northlight Web", tag: "Website", image: project2 },
  { name: "Dawn Motion", tag: "Motion", image: project3 },
  { name: "Meridian House", tag: "Art direction", image: project4 },
  { name: "First Light Goods", tag: "Packaging", image: project5 },
  { name: "Ember Forms", tag: "3D & CGI", image: project6 },
];

const GAP = 3.6;
const PLANE_W = 2.6;
const PLANE_H = 3.4;
const TOTAL = projects.length * GAP;
/* how steep the diagonal ("cross") line gets at full scroll speed */
const MAX_TILT = 0.32;

type Scroll = { target: number; current: number; vel: number; dir: number };

function Card({ texture, index, scroll }: { texture: THREE.Texture; index: number; scroll: Scroll }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    let x = index * GAP + scroll.current;
    x = ((((x + TOTAL / 2) % TOTAL) + TOTAL) % TOTAL) - TOTAL / 2;
    m.position.x = x;

    // counter-rotate each card slightly so the line tilts but images stay readable
    m.rotation.z = -scroll.dir * MAX_TILT * 0.55;
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, -scroll.vel * 0.35, 0.12);
    m.position.z = THREE.MathUtils.lerp(m.position.z, -Math.abs(scroll.vel) * 1.4, 0.12);

    const edge = 1 - Math.min(1, Math.abs(x) / (TOTAL / 2));
    m.scale.setScalar(0.8 + edge * 0.2);
    (m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, edge * 2.6);
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[PLANE_W, PLANE_H, 1, 1]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function Gallery({ scroll }: { scroll: Scroll }) {
  const textures = useLoader(
    THREE.TextureLoader,
    projects.map((p) => p.image),
  );
  const group = useRef<THREE.Group>(null);

  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });
  }, [textures]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    // smooth the scroll position
    const prev = scroll.current;
    scroll.current = THREE.MathUtils.damp(scroll.current, scroll.target, 5, d);
    const moved = scroll.current - prev;
    scroll.vel = THREE.MathUtils.clamp(moved / d / 12, -1, 1);

    // direction eases toward the sign of movement: down => line crosses downward,
    // up => line crosses upward. Settles back to level when scrolling stops.
    const wanted = Math.abs(scroll.vel) < 0.02 ? 0 : Math.sign(-scroll.vel);
    scroll.dir = THREE.MathUtils.damp(scroll.dir, wanted, 4, d);

    const g = group.current;
    if (!g) return;
    g.rotation.z = scroll.dir * MAX_TILT;
    g.position.y = -scroll.dir * 0.4;
  });

  return (
    <group ref={group}>
      {textures.map((t, i) => (
        <Card key={i} texture={t} index={i} scroll={scroll} />
      ))}
    </group>
  );
}

export function Projects() {
  const scroll = useRef<Scroll>({ target: 0, current: 0, vel: 0, dir: 0 }).current;
  const [active, setActive] = useState(0);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      scroll.target -= (y - last) * 0.014;
      last = y;
      const idx =
        ((Math.round(-scroll.target / GAP) % projects.length) + projects.length) % projects.length;
      setActive(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scroll]);

  const current = projects[active] ?? projects[0]!;

  return (
    <section id="projects" className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Projects</p>
          </Reveal>
          <Reveal>
            <TextReveal
              text="Scroll to cross the line."
              className="mt-3 max-w-2xl text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.05]"
            />
          </Reveal>
        </div>

        <div className="relative mt-6 h-[62vh] w-full">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <Gallery scroll={scroll} />
            </Suspense>
          </Canvas>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-baseline justify-between gap-6 border-t border-border pt-4">
            <h3 className="text-lg">{current.name}</h3>
            <p className="text-sm text-muted-foreground">{current.tag}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
