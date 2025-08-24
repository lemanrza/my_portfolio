import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import { useRef } from "react";
function AnimatedBackgroundLite() {
    const ref = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useSpring(useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]), { stiffness: 80, damping: 20 });

    return (
        <div ref={ref} className="pointer-events-none absolute inset-0">
            <motion.div
                style={{ y, translateZ: 0 }}
                className="absolute inset-[-8%] opacity-70"
                aria-hidden
            >
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
        </div>
    );
}
export default AnimatedBackgroundLite;