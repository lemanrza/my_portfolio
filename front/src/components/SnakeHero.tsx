import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactMe from "./ContactMe";
import Projects from "./Projects";
import About from "./About";


type TargetKind = "section" | "link";
type NavTarget = {
    key: string;
    label: string;
    icon: string; 
    kind: TargetKind;
    sectionId?: string; 
    href?: string;  
    x?: number;
    y?: number;
};

function SnakeHero({
    autoStart = false,
    onExit,
    targetsConfig = [],
}: {
    autoStart?: boolean;
    onExit?: () => void;
    targetsConfig?: NavTarget[];
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const dprRef = useRef(1);

    // Grid + timing
    const [cols, setCols] = useState(36);
    const [rows, setRows] = useState(24);
    const [cell, setCell] = useState(24);
    const [speedMs, setSpeedMs] = useState(120);
    const [running, setRunning] = useState(false);
    const [started, setStarted] = useState(autoStart);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [high, setHigh] = useState<number>(() => {
        if (typeof window === "undefined") return 0;
        return Number(localStorage.getItem("snake_high") || 0);
    });

    // Direction: start stationary; countdown sets default DOWN if user doesn't
    const dirRef = useRef<[number, number]>([0, 0]);
    const nextDirRef = useRef<[number, number]>([0, 0]);
    const selectingRef = useRef(false);

    // Snake + Targets
    const snakeRef = useRef<{ x: number; y: number }[]>([]);
    const [targets, setTargets] = useState<NavTarget[]>([]);

    // Reduced motion
    const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    useEffect(() => {
        if (prefersReduced) setSpeedMs((s) => Math.max(s, 160));
    }, [prefersReduced]);

    // Full-viewport canvas with HiDPI scaling
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            if (!wrapperRef.current || !canvasRef.current) return;
            const w = wrapperRef.current.clientWidth;
            const h = wrapperRef.current.clientHeight;

            const desiredCell = Math.max(
                16,
                Math.min(28, Math.floor(Math.min(w, h) / 28))
            );
            const c = Math.max(22, Math.floor(w / desiredCell));
            const r = Math.max(14, Math.floor(h / desiredCell));
            setCols(c);
            setRows(r);
            setCell(desiredCell);

            const canvas = canvasRef.current;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            dprRef.current = dpr;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        if (wrapperRef.current) ro.observe(wrapperRef.current);
        return () => ro.disconnect();
    }, []);

    // Always (re)center snake & targets whenever grid changes BEFORE starting
    useEffect(() => {
        if (!started) {
            centerPositions();
            draw();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cols, rows, started]);

    function centerPositions() {
        // Snake at top-center
        const midX = Math.floor(cols / 2);
        const s = [
            { x: midX, y: 1 },
            { x: midX - 1, y: 1 },
            { x: midX - 2, y: 1 },
        ];
        snakeRef.current = s;
        dirRef.current = [0, 0];
        nextDirRef.current = [0, 0];

        // Targets: two centered rows; avoid initial head column
        const defs: NavTarget[] = targetsConfig;
        setTargets(layoutTargetsGrid(defs));

    }

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const map: Record<string, [number, number]> = {
                arrowup: [0, -1],
                w: [0, -1],
                arrowdown: [0, 1],
                s: [0, 1],
                arrowleft: [-1, 0],
                a: [-1, 0],
                arrowright: [1, 0],
                d: [1, 0],
            };
            if (key in map) {
                const nd = map[key];
                const [dx, dy] = dirRef.current;
                if ((dx === 0 && dy === 0) || dx + nd[0] !== 0 || dy + nd[1] !== 0) {
                    nextDirRef.current = nd;
                    if (started && !running) {
                        dirRef.current = nd;
                        setRunning(true);
                        setCountdown(null);
                    }
                }
                e.preventDefault();
            } else if (key === "p") {
                if (started) setRunning((r) => !r), setCountdown(null);
                e.preventDefault();
            } else if (key === " ") {
                if (!started) startGame();
                else setRunning((r) => !r);
                e.preventDefault();
            } else if (key === "r") {
                restart();
            }
        };
        window.addEventListener("keydown", onKey, { passive: false });
        return () => window.removeEventListener("keydown", onKey);
    }, [started, running]);

    // Touch swipe
    useEffect(() => {
        let startX = 0,
            startY = 0,
            moved = false;
        const start = (e: TouchEvent) => {
            const t = e.changedTouches[0];
            startX = t.clientX;
            startY = t.clientY;
            moved = false;
        };
        const move = () => {
            moved = true;
        };
        const end = (e: TouchEvent) => {
            if (!moved) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            const nd: [number, number] =
                Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                        ? [1, 0]
                        : [-1, 0]
                    : dy > 0
                        ? [0, 1]
                        : [0, -1];
            const [cx, cy] = dirRef.current;
            if ((cx === 0 && cy === 0) || cx + nd[0] !== 0 || cy + nd[1] !== 0) {
                nextDirRef.current = nd;
                if (started && !running) {
                    dirRef.current = nd;
                    setRunning(true);
                    setCountdown(null);
                }
            }
        };
        const el = wrapperRef.current;
        if (!el) return;
        el.addEventListener("touchstart", start, { passive: true });
        el.addEventListener("touchmove", move, { passive: true });
        el.addEventListener("touchend", end, { passive: true });
        return () => {
            el.removeEventListener("touchstart", start);
            el.removeEventListener("touchmove", move);
            el.removeEventListener("touchend", end);
        };
    }, [started, running]);

    // Loop
    useEffect(() => {
        let raf = 0;
        let last = 0;
        let acc = 0;
        const tick = (t: number) => {
            raf = requestAnimationFrame(tick);
            const c = canvasRef.current;
            if (!c) return;

            // When not running, draw but do not accumulate time (prevents catch-up)
            if (!running) {
                const ctx = c.getContext("2d");
                if (ctx) ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
                draw();
                last = t;
                acc = 0;
                return;
            }

            const dt = t - last;
            last = t;
            acc += dt;
            while (acc >= speedMs) {
                step();
                acc -= speedMs;
            }
            const ctx = c.getContext("2d");
            if (ctx) ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
            draw();
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, speedMs, cols, rows, cell, targets]);

    // Countdown handler
    useEffect(() => {
        if (!started || countdown === null) return;
        if (countdown <= 0) {
            if (!running) {
                dirRef.current = [0, 1];
                nextDirRef.current = [0, 1];
                setRunning(true);
            }
            setCountdown(null);
            return;
        }
        const id = setTimeout(
            () => setCountdown((n) => (n == null ? null : n - 1)),
            1000
        );
        return () => clearTimeout(id);
    }, [started, countdown, running]);

    function startGame() {
        setStarted(true);
        setCountdown(3);
    }

    function layoutTargetsGrid(defs: NavTarget[]): NavTarget[] {
        const headX = Math.floor(cols / 2);
        const row1Y = Math.max(2, Math.min(rows - 3, Math.floor(rows * 0.68)));
        const row2Y = Math.max(2, Math.min(rows - 2, Math.floor(rows * 0.82)));
        const items = defs.slice(0, 6);
        const split = Math.ceil(items.length / 2);
        const row1 = items.slice(0, split);
        const row2 = items.slice(split);

        const placeRow = (list: NavTarget[], y: number) => {
            const usableCols = cols - 2; // 1-col margin each side
            const gap = usableCols / (list.length + 1);
            return list.map((d, i) => {
                let x = Math.round(1 + gap * (i + 1));
                if (Math.abs(x - headX) <= 1) x = Math.min(cols - 2, x + 2);
                return { ...d, x, y };
            });
        };

        return [...placeRow(row1, row1Y), ...placeRow(row2, row2Y)];
    }

    function restart() {
        setScore(0);
        setGameOver(false);
        setRunning(false);
        setStarted(false);
        setCountdown(null);
        centerPositions();
    }

    function step() {
        const snake = snakeRef.current;
        const [dx, dy] = (dirRef.current = nextDirRef.current);
        if (dx === 0 && dy === 0) return; // still stationary

        const head = snake[0];
        const headNext = { x: head.x + dx, y: head.y + dy };

        if (dy === -1 && headNext.y < 0) {
            setGameOver(true);
            setRunning(false);
            persistHigh();
            return;
        }

        headNext.x = (headNext.x + cols) % cols;
        headNext.y = Math.min(headNext.y, rows - 1);

        if (snake.some((s) => s.x === headNext.x && s.y === headNext.y)) {
            setGameOver(true);
            setRunning(false);
            persistHigh();
            return;
        }

        // Move
        snake.unshift(headNext);

        // Badge collision?
        const tIdx = targets.findIndex(
            (t) => t.x === headNext.x && t.y === headNext.y
        );
        if (tIdx >= 0 && !selectingRef.current) {
            selectingRef.current = true;
            setScore((s) => s + 10);
            handleTarget(targets[tIdx]);
            return;
        }

        // Normal move (no growth)
        snake.pop();
        snakeRef.current = snake;
    }

    function handleTarget(t: NavTarget) {
        setRunning(false);
        persistHigh();
        setTimeout(() => {
            if (t.kind === "section" && t.sectionId) {
                document
                    .getElementById(t.sectionId)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (t.kind === "link" && t.href) {
                window.open(t.href, "_blank", "noopener,noreferrer");
            }
            onExit?.();
        }, 140);
    }

    function persistHigh() {
        setHigh((h) => {
            const nh = Math.max(h, score);
            localStorage.setItem("snake_high", String(nh));
            return nh;
        });
    }

    function draw() {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const w = c.width / dprRef.current;
        const h = c.height / dprRef.current;

        // Background gradient
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#0a0a0a");
        g.addColorStop(1, "#0f172a");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = "#141826";
        ctx.lineWidth = 1;
        for (let i = 0; i <= cols; i++) {
            const x = Math.floor((i / cols) * w) + 0.5;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let j = 0; j <= rows; j++) {
            const y = Math.floor((j / rows) * h) + 0.5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        const cellW = w / cols;
        const cellH = h / rows;

        // Targets (badges)
        for (const t of targets) {
            if (t.x == null || t.y == null) continue;
            const cx = t.x * cellW + cellW / 2;
            const cy = t.y * cellH + cellH / 2;
            const bw = Math.max(cellW * 2, 64);
            const bh = Math.max(cellH * 1.1, 36);

            roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, Math.min(16, bh / 2));
            ctx.fillStyle = "rgba(99,102,241,0.28)";
            ctx.fill();
            ctx.strokeStyle = "rgba(99,102,241,0.6)";
            ctx.lineWidth = 2;
            ctx.stroke();

            const code = t.key.slice(0, 2).toUpperCase();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#e5e7eb";
            ctx.font = `${Math.floor(bh * 0.55)}px 'Segoe UI Emoji','Noto Color Emoji','Apple Color Emoji',system-ui,sans-serif`;
            ctx.fillText(
                t.icon,
                cx - bw * 0.22,
                cy + (navigator.platform.includes("Win") ? 1 : 0)
            );
            ctx.font = `${Math.floor(bh * 0.4)}px ui-sans-serif, system-ui`;
            ctx.fillText(code, cx + bw * 0.2, cy);
            ctx.font = `${Math.max(10, Math.floor(bh * 0.3))}px ui-sans-serif, system-ui`;
            ctx.fillStyle = "#a5b4fc";
            ctx.fillText(t.label, cx, cy + bh * 0.95);
        }

        // Snake
        const snake = snakeRef.current;
        for (let i = 0; i < snake.length; i++) {
            const s = snake[i];
            const x = s.x * cellW + 1;
            const y = s.y * cellH + 1;
            roundRect(
                ctx,
                x,
                y,
                cellW - 2,
                cellH - 2,
                Math.min(cellW, cellH) * 0.28
            );
            ctx.fillStyle = i === 0 ? "#60a5fa" : "#1f2937";
            if (i === 0) {
                ctx.shadowColor = "#60a5fa";
                ctx.shadowBlur = Math.min(cellW, cellH) * 0.6;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            if (i === 0) {
                ctx.fillStyle = "#e5e7eb";
                ctx.beginPath();
                ctx.arc(
                    x + cellW * 0.7,
                    y + cellH * 0.35,
                    Math.max(2, Math.min(cellW, cellH) * 0.07),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        // Overlays
        if (!started) {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.50)";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = `700 ${Math.floor(w * 0.07)}px ui-sans-serif, system-ui`;
            ctx.fillText("Ready to Play?", w / 2, h / 2 - w * 0.06);
            ctx.restore();
        } else if (countdown !== null) {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = `800 ${Math.floor(w * 0.12)}px ui-sans-serif, system-ui`;
            ctx.fillText(String(countdown), w / 2, h / 2);
            ctx.restore();
        } else if (gameOver) {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = `bold ${Math.floor(w * 0.06)}px ui-sans-serif, system-ui`;
            ctx.fillText("Oops!", w / 2, h / 2 - h * 0.04);
            ctx.font = `500 ${Math.floor(w * 0.028)}px ui-sans-serif, system-ui`;
            ctx.fillText("Press R to try again", w / 2, h / 2 + h * 0.02);
            ctx.restore();
        }
    }

    function roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    return (
        <div className="fixed inset-0 z-[60] w-full h-[100svh] overflow-hidden bg-black">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -inset-40 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_80%_120%,rgba(34,197,94,0.15),transparent_55%)]" />
            </div>

            <div ref={wrapperRef} className="absolute inset-0 grid place-items-center">
                <canvas ref={canvasRef} className="block w-full h-full" />
            </div>

            {/* HUD */}
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-4 left-4 right-4 flex items-center justify-between text-sm font-medium text-white/90"
            >
                <div className="flex items-center gap-2">
                    <Badge>Score: {score}</Badge>
                    <Badge variant="ghost">Best: {Math.max(high, score)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    {started && countdown === null && (
                        <TinyButton onClick={() => setRunning((r) => !r)}>
                            {running ? "Pause" : "Play"}
                        </TinyButton>
                    )}
                    <TinyButton onClick={() => restart()}>Restart</TinyButton>
                </div>
            </motion.div>

            {/* HTML Play button overlay */}
            {!started && (
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    onClick={startGame}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-5 rounded-2xl text-lg md:text-xl font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 shadow-2xl backdrop-blur"
                >
                    ▶ Play
                </motion.button>
            )}

            {/* Hint */}
            <div className="pointer-events-none select-none absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">
                {!started
                    ? "Space = Play • WASD/Arrows"
                    : countdown !== null
                        ? "Starting… (press an arrow (↑) to start now)"
                        : "Eat a badge to navigate ↓"}
            </div>
        </div>
    );
}

function TinyButton({
    onClick,
    children,
}: {
    onClick?: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur border border-white/10 text-white transition"
        >
            {children}
        </button>
    );
}

function Badge({
    children,
    variant = "solid",
}: {
    children: React.ReactNode;
    variant?: "solid" | "ghost";
}) {
    const base = "px-2 py-1 rounded-full border text-white/90";
    const cls =
        variant === "ghost"
            ? `${base} border-white/10 bg-white/5`
            : `${base} border-white/10 bg-white/15 backdrop-blur`;
    return <span className={cls}>{children}</span>;
}


export default function PortfolioIntro() {
    const [showGame, setShowGame] = useState(true);

    // lock page scroll while game overlay is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        if (showGame) document.body.style.overflow = "hidden";
        else document.body.style.overflow = prev;
        return () => {
            document.body.style.overflow = prev;
        };
    }, [showGame]);

    const handleExit = () => setShowGame(false);

    // Variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 },
        },
    };
    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 15 },
        },
    };
    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 },
        }),
    };
    const rotateVariants = {
        hidden: { rotate: -10, opacity: 0 },
        visible: {
            rotate: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 150, damping: 18 },
        },
    };
    const scaleVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 180, damping: 22 },
        },
    };
    const bounceVariants = {
        hidden: { y: -30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 10, mass: 0.5 },
        },
    };
    const fadeInLeftVariants = {
        hidden: { x: -100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
    };
    const fadeInRightVariants = {
        hidden: { x: 100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
    };
    const pulseVariants = {
        hidden: { scale: 1 },
        visible: {
            scale: [1, 1.05, 1],
            transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
        },
    };

    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    return (
        <main
            className="text-zinc-200"
            style={{
                background: `linear-gradient(to bottom, black, hsl(${(scrollY / 50) % 360}, 50%, 10%), black)`,
            }}
        >
            <AnimatePresence>
                {showGame && (
                    <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SnakeHero
                            autoStart={false}
                            onExit={handleExit}
                            targetsConfig={[
                                { key: "about", label: "About", icon: "👤", kind: "section", sectionId: "about" },
                                { key: "projects", label: "Projects", icon: "🛠️", kind: "section", sectionId: "projects" },
                                { key: "contact", label: "Contact", icon: "✉️", kind: "section", sectionId: "contact" },
                                { key: "github", label: "GitHub", icon: "🐱", kind: "link", href: "https://github.com/lemanrza" },
                                { key: "resume", label: "Resume", icon: "📄", kind: "link", href: "/resume.pdf" },
                            ]}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* About */}
            <About />

            {/* Projects */}
            <Projects
                containerVariants={containerVariants}
                rotateVariants={rotateVariants}
                letterVariants={letterVariants}
                itemVariants={itemVariants}
                fadeInRightVariants={fadeInRightVariants}
                fadeInLeftVariants={fadeInLeftVariants}
                bounceVariants={bounceVariants}
            />

            {/* Contact */}
            <ContactMe
                containerVariants={containerVariants}
                scaleVariants={scaleVariants}
                letterVariants={letterVariants}
                fadeInLeftVariants={fadeInLeftVariants}
                fadeInRightVariants={fadeInRightVariants}
                bounceVariants={bounceVariants}
                pulseVariants={pulseVariants}
                itemVariants={itemVariants}
                rotateVariants={rotateVariants}
            />
        </main>
    );
}
