import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, useInView } from "framer-motion";
import AnimatedText from "./AnimatedText";
import CTA from "./CTA";
import AnimatedBackgroundLite from "./AnimatedBckgroundLite";
import ParticlesLite from "./ParticlesLite";
import BentoSkills from "./BentoSkills";

/* --------------------------- CSS KEYFRAMES (local) --------------------------- */
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

export default function About() {
    const [mx, setMx] = useState(50);
    const [my, setMy] = useState(50);
    const reduce = useReducedMotion();

    function onMouseMove(e: React.MouseEvent<HTMLElement>) {
        if ((onMouseMove as any).raf) cancelAnimationFrame((onMouseMove as any).raf);
        (onMouseMove as any).raf = requestAnimationFrame(() => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setMx(((e.clientX - rect.left) / rect.width) * 100);
            setMy(((e.clientY - rect.top) / rect.height) * 100);
        });
    }

    return (
        <section
            id="about"
            onMouseMove={onMouseMove}
            className="relative overflow-hidden py-28 md:py-40 lg:py-56"
            style={
                {
                    // spotlight coords (CSS variables)
                    // @ts-ignore
                    "--mx": `${mx}%`,
                    // @ts-ignore
                    "--my": `${my}%`,
                } as React.CSSProperties
            }
            aria-label="About Leman"
        >
            <Keyframes />
            <SectionProgress />
            <AnimatedBackgroundLite />
            {!reduce && <Spotlight />}
            <div className="relative mx-auto max-w-7xl px-6 md:px-10">
                <HeaderHero />
                <Counters />
                <MarqueeSkills />
                <BentoSkills />
                <CTA />
            </div>
            {!reduce && <ParticlesLite count={14} />}
        </section>
    );
}

/* ---------------------------- Progress Rail (cheap) ---------------------------- */
function SectionProgress() {
    const ref = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.4 });

    return (
        <div ref={ref} className="pointer-events-none absolute left-4 top-16 bottom-16 hidden md:block" aria-hidden>
            <div className="relative h-full w-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div style={{ scaleY, originY: 0 }} className="absolute left-0 top-0 h-full w-full bg-white/40" />
            </div>
        </div>
    );
}

/* ------------------------------- Spotlight (cheap) ------------------------------- */
function Spotlight() {
    // ✅ use 'transform' instead of 'translateZ'
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(380px 380px at var(--mx) var(--my), rgba(255,255,255,.10), transparent 60%)",
                mixBlendMode: "screen",
                transform: "translateZ(0)",
            }}
        />
    );
}

/* -------------------------------- HeaderHero -------------------------------- */
function HeaderHero() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.9", "end 0.3"] });
    const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        // ❌ removed 'translateZ' (not a valid style key); Framer handles transforms
        <motion.div ref={sectionRef} style={{ scale, y, opacity }} className="relative z-10 text-center space-y-8 will-change-transform">
            <SignatureUnderline />
            <h1 className="relative text-balance text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white">
                <AnimatedText variants={{}} text="Leman" />
                <br />
                <AnimatedText variants={{}} text="MERN stack Developer" />
            </h1>
            <motion.p
                className="mx-auto max-w-3xl text-pretty text-zinc-200 text-lg md:text-2xl leading-relaxed"
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
            >
                I craft robust, scalable apps that blend elegant interfaces with reliable back-ends. I obsess over performance,
                accessibility, and tiny delightful moments that make products feel magical.
            </motion.p>
        </motion.div>
    );
}

function SignatureUnderline() {
    return (
        <svg className="mx-auto mb-4 h-10 w-[22rem] md:w-[30rem]" viewBox="0 0 600 80" fill="none">
            <motion.path
                d="M10 40 C 120 75, 220 5, 330 40 S 520 70, 590 40"
                stroke="url(#g)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(168,85,247,1)" />
                    <stop offset="50%" stopColor="rgba(59,130,246,1)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,1)" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ---------------------------------- Counters ---------------------------------- */
function Counters() {
    const ref = useRef<HTMLDivElement | null>(null);
    const inView = useInView(ref, { once: true, amount: 0.4 });

    return (
        <div ref={ref} className="mt-10 grid grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
            {[
                { label: "Years", value: 4 },
                { label: "Projects", value: 26 },
                { label: "Coffees", value: 1024 },
            ].map((c, i) => (
                <CounterCard key={i} label={c.label} value={c.value} start={inView} />
            ))}
        </div>
    );
}

function CounterCard({ label, value, start }: { label: string; value: number; start: boolean }) {
    const spring = useSpring(start ? value : 0, { stiffness: 120, damping: 18 });
    if (start) spring.set(value);
    return (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-white">
            <div className="text-3xl font-extrabold tabular-nums">{Math.round((spring as any).get())}</div>
            <div className="mt-1 text-sm text-zinc-300">{label}</div>
        </motion.div>
    );
}

/* -------------------------------- MarqueeSkills -------------------------------- */
function MarqueeSkills() {
    const items = ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "GraphQL", "Tailwind", "AWS", "CI/CD"];

    return (
        <div className="relative z-10 mt-14 select-none">
            <div className="[mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] overflow-hidden">
                <motion.div
                    className="flex gap-10 py-3"
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                    style={{ transform: "translate3d(0,0,0)" }}
                    aria-label="skills marquee"
                >
                    {[...items, ...items].map((it, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm md:text-base text-white">
                            {it}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

/* -------------------------------- BentoSkills -------------------------------- */
<BentoSkills />

{/* ----------------------------- Particles (CSS) ------------------------------ */ }
<ParticlesLite />
