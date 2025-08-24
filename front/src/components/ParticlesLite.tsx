import { useMemo } from "react";

function ParticlesLite({ count = 14 }: { count?: number }) {
    const dots = useMemo(
        () =>
            Array.from({ length: count }).map((_) => ({
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
                            // CSS variables:
                            // @ts-ignore
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
export default ParticlesLite;