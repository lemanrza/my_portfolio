import { type Variants, type Transition, motion } from "framer-motion";
import { useMemo } from "react";
function BentoSkills() {

    const SPRING: Transition = {
        type: "spring",
        stiffness: 180,
        damping: 20,
    };

    const item1: Variants = {
        hidden: { y: 14, opacity: 0 },
        show: (i: number = 0) => ({
            y: 0,
            opacity: 1,
            transition: { ...SPRING, delay: 0.05 * i },
        }),
    };

    const cards = useMemo(
        () => [
            { title: "Frontend polish", desc: "Micro-interactions, motion, accessibility, design systems.", icon: "✨" },
            { title: "Backend strength", desc: "API design, Node.js, PostgreSQL/MongoDB, caching layers.", icon: "🛠️" },
            { title: "Cloud & DevOps", desc: "AWS, Docker, CI/CD, secure, repeatable deploys.", icon: "☁️" },
            { title: "Quality mindset", desc: "Playwright, unit tests, observability, performance budgets.", icon: "✅" },
            { title: "Collaboration", desc: "Clear communication, docs, PR hygiene, agile rituals.", icon: "🤝" },
            { title: "Learning", desc: "I ship, measure, iterate. Always improving.", icon: "📈" },
        ],
        []
    );



    return (
        <motion.div className="relative z-10 mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
            {cards.map((c, i) => (
                <motion.article
                    key={i}
                    variants={item1}
                    custom={i}
                    whileHover={{ y: -3, rotateX: 1.5, rotateY: -1.5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group relative rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{c.icon}</span>
                        <h3 className="text-white text-lg font-semibold">{c.title}</h3>
                    </div>
                    <p className="mt-2 text-zinc-300 text-sm leading-relaxed">{c.desc}</p>
                </motion.article>
            ))}
        </motion.div>
    );
}
export default BentoSkills;