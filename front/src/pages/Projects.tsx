import React, { useMemo, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useSpring, type Variants, type Transition } from "framer-motion";

/* ============================= Demo data ============================= */
type Project = {
  title: string;
  desc: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  image?: string; // optional screenshot
};

const PROJECTS: Project[] = [
  {
    title: "E-Commerce Platform",
    desc: "Full-stack shop with auth, cart, checkout, and an admin panel.",
    tags: ["Full-stack", "React", "Node", "MongoDB"],
    liveUrl: "https://example.com/store",
    githubUrl: "https://github.com/you/store",
  },
  {
    title: "Realtime Chat",
    desc: "WebSockets, presence, typing indicators, and message reactions.",
    tags: ["Realtime", "Next.js", "Socket.IO", "Redis"],
    liveUrl: "https://example.com/chat",
    githubUrl: "https://github.com/you/chat",
  },
  {
    title: "Analytics Dashboard",
    desc: "Metrics, charts, and role-based access with delightful UX.",
    tags: ["Frontend", "React", "D3", "Tailwind"],
    liveUrl: "https://example.com/analytics",
    githubUrl: "https://github.com/you/analytics",
  },
  {
    title: "AI Recommender",
    desc: "Content-based suggestions, vector search, and A/B testing.",
    tags: ["AI", "Node", "Python"],
    liveUrl: "https://example.com/recommend",
    githubUrl: "https://github.com/you/recommend",
  },
  {
    title: "SaaS Billing",
    desc: "Subscriptions, webhooks, and usage-based metering.",
    tags: ["Full-stack", "Next.js", "Stripe"],
    liveUrl: "https://example.com/saas",
    githubUrl: "https://github.com/you/saas-billing",
  },
  {
    title: "Web3 Wallet Demo",
    desc: "Connect wallet, sign txns, and on-chain reads.",
    tags: ["Web3", "React", "Ethers"],
    liveUrl: "https://example.com/wallet",
    githubUrl: "https://github.com/you/wallet-demo",
  },
];

/* ============================= Page ============================= */
export default function ProjectsPage() {
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const reduce = useReducedMotion();
  const [activeTag, setActiveTag] = useState<string>("All");

  const tags = useMemo(() => {
    const set = new Set<string>(["All"]);
    PROJECTS.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, []);

  const filtered = activeTag === "All" ? PROJECTS : PROJECTS.filter(p => p.tags.includes(activeTag));

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if ((onMouseMove as any).raf) cancelAnimationFrame((onMouseMove as any).raf);
    (onMouseMove as any).raf = requestAnimationFrame(() => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMx(x);
      setMy(y);
    });
  }

  return (
    <main
      onMouseMove={onMouseMove}
      className="relative min-h-[100svh] overflow-x-clip bg-black text-white"
      style={
        {
          // spotlight coords for bg
          // @ts-ignore
          "--mx": `${mx}%`,
          // @ts-ignore
          "--my": `${my}%`,
        } as React.CSSProperties
      }
    >
      <Keyframes />
      <Background />
      {!reduce && <Spotlight />}
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32">
        <Hero />
        <FilterBar tags={tags} active={activeTag} onChange={setActiveTag} />
        <ProjectsGrid projects={filtered} />
        <CTASection />
      </div>
      {!reduce && <ParticlesLite count={16} />}
    </main>
  );
}

/* ============================= Hero ============================= */
function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 30%"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [24, 0]), { stiffness: 140, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);

  return (
    <motion.header ref={ref} style={{ y, opacity }} className="mb-10 md:mb-14 text-center will-change-transform">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight">
        <FlyingTitle text="My" progress={scrollYProgress} />
        <span className="mx-2" />
        <FlyingTitle text="Projects" progress={scrollYProgress} />
      </h1>
      <motion.p
        className="mx-auto mt-5 max-w-2xl text-zinc-300 text-lg md:text-xl"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
      >
        Scroll to explore. Each card tilts, shines, and reveals details as you move and scroll.
      </motion.p>
    </motion.header>
  );
}

function FlyingTitle({ text, progress }: { text: string; progress: any }) {
  const letters = useMemo(() => text.split(""), [text]);
  return (
    <span className="inline-block">
      {letters.map((ch, i) => {
        const seed = ((i * 1687) % 7) - 3; // -3..3
        const fromX = seed * 50;
        const fromY = (seed % 3) * -40;
        const rotate = useTransform(progress, [0, 1], [18 * seed, 0]);
        const x = useTransform(progress, [0, 1], [fromX, 0]);
        const y = useTransform(progress, [0, 1], [fromY, 0]);
        const opacity = useTransform(progress, [0, 0.15, 1], [0, 0.6, 1]);

        return (
          <motion.span key={i} style={{ x, y, rotate, opacity }} className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        );
      })}
    </span>
  );
}

/* ============================= Filters ============================= */
function FilterBar({ tags, active, onChange }: { tags: string[]; active: string; onChange: (t: string) => void }) {
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const item: Variants = {
    hidden: { y: 8, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.25 } },
  };

  return (
    <motion.div className="mb-10 flex flex-wrap justify-center gap-3" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
      {tags.map(t => (
        <motion.button
          key={t}
          variants={item}
          onClick={() => onChange(t)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            active === t ? "bg-white/20 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}
        >
          {t}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ============================= Grid ============================= */
const SPRING: Transition = { type: "spring", stiffness: 180, damping: 20 };

function ProjectsGrid({ projects }: { projects: Project[] }) {
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } } };
  const item: Variants = {
    hidden: { y: 18, opacity: 0 },
    show: { y: 0, opacity: 1, transition: SPRING },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
    >
      {projects.map((p, i) => (
        <motion.div key={p.title + i} variants={item}>
          <ProjectCard project={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rx = (py - 0.5) * -6;
    const ry = (px - 0.5) * 6;
    setTilt({ rx, ry });
  }
  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "tween", duration: 0.16 }}
      style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm will-change-transform"
    >
      {/* soft glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* hero/screenshot window */}
      <div className="relative overflow-hidden rounded-xl border border-white/10">
        <div className="absolute left-3 top-3 flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <div
          className="h-40 w-full bg-gradient-to-br from-indigo-600/30 via-sky-500/20 to-emerald-500/20"
          style={{ backgroundBlendMode: "screen" }}
        />
        {/* shine sweep */}
        <motion.div
          aria-hidden
          initial={{ x: "-120%" }}
          whileHover={{ x: "120%" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      <h3 className="mt-4 text-xl font-bold">{project.title}</h3>
      <p className="mt-1 text-sm text-zinc-300">{project.desc}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {project.tags.map(t => (
          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {project.liveUrl && (
          <MotionLink href={project.liveUrl} label="Live" icon="↗" />
        )}
        {project.githubUrl && (
          <MotionLink href={project.githubUrl} label="GitHub">
            <GithubIcon />
          </MotionLink>
        )}
      </div>
    </motion.article>
  );
}

function MotionLink({
  href,
  label,
  icon,
  children,
}: {
  href: string;
  label: string;
  icon?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm"
    >
      {children ?? <span className="text-base leading-none">{icon}</span>}
      <span>{label}</span>
    </motion.a>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.07-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.86 2.82 1.33 3.5 1.01.11-.78.42-1.33.76-1.63-2.66-.3-5.46-1.33-5.46-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.51.12-3.15 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.64.24 2.85.12 3.15.77.84 1.23 1.9 1.23 3.22 0 4.61-2.8 5.61-5.47 5.91.43.37.81 1.1.81 2.22 0 1.6-.01 2.88-.01 3.27 0 .32.22.69.83.57A12 12 0 0 0 12 .5z" />
    </svg>
  );
}

/* ============================= Background ============================= */
function Background() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]), { stiffness: 80, damping: 20 });

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <motion.div style={{ y }} className="absolute inset-[-10%] opacity-70" aria-hidden>
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(45% 55% at 20% 20%, rgba(59,130,246,.28) 0%, transparent 60%)," +
              "radial-gradient(45% 55% at 80% 18%, rgba(168,85,247,.28) 0%, transparent 62%)," +
              "radial-gradient(55% 60% at 50% 80%, rgba(16,185,129,.22) 0%, transparent 68%)",
          }}
        />
      </motion.div>
      {/* soft grid */}
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden>
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>
    </div>
  );
}

function Spotlight() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: "radial-gradient(380px 380px at var(--mx) var(--my), rgba(255,255,255,.08), transparent 60%)",
        mixBlendMode: "screen",
        transform: "translateZ(0)",
      }}
    />
  );
}

/* ============================= CTA ============================= */
function CTASection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 60%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.section ref={ref} style={{ scale, opacity }} className="mt-16 md:mt-24 text-center will-change-transform">
      <h4 className="text-2xl md:text-3xl font-semibold">Want the full story?</h4>
      <p className="mt-2 text-zinc-300">I love building performant, delightful products. Let’s make something great.</p>
      <motion.a
        href="mailto:you@example.com"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-white hover:bg-white/20"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        ✉️ Contact Me
      </motion.a>
    </motion.section>
  );
}

/* ============================= Particles (CSS) ============================= */
function ParticlesLite({ count = 16 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        sway: (Math.random() * 2 - 1) * 12,
        dur: 7 + Math.random() * 6,
        size: 2 + Math.floor(Math.random() * 2),
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className="particle absolute rounded-full bg-white/80"
          style={
            {
              top: `${d.top}%`,
              left: `${d.left}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              // @ts-ignore CSS vars
              "--sx": `${d.sway}px`,
              // @ts-ignore
              "--dur": `${d.dur}s`,
              filter: "drop-shadow(0 0 4px rgba(255,255,255,.7))",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ============================= Keyframes ============================= */
const Keyframes = () => (
  <style>{`
    @keyframes particleFloat {
      0%   { transform: translate3d(var(--sx,0), 0, 0); opacity: .6; }
      50%  { transform: translate3d(calc(var(--sx,0) * -1), -10px, 0); opacity: 1; }
      100% { transform: translate3d(var(--sx,0), 0, 0); opacity: .6; }
    }
    .particle { animation: particleFloat var(--dur,8s) ease-in-out infinite; will-change: transform, opacity; }
  `}</style>
);

/* ============================= tiny utils ============================= */
function useState<T>(initial: T) {
  return React.useState<T>(initial);
}
