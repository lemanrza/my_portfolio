import { motion } from "framer-motion"
import AnimatedText from "./AnimatedText"
type Props = {
    containerVariants: any
    rotateVariants: any
    letterVariants: any
    itemVariants: any
    fadeInRightVariants: any
    fadeInLeftVariants: any
    bounceVariants: any
}
const Projects = ({containerVariants, rotateVariants, letterVariants, itemVariants, fadeInRightVariants, fadeInLeftVariants, bounceVariants}: Props) => {
    return (
        <section id="projects" className="px-8 md:px-12 lg:px-20 py-32 md:py-48 lg:py-64">
            <motion.div
                className="max-w-6xl mx-auto space-y-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <motion.h2
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-12"
                    variants={rotateVariants}
                >
                    <AnimatedText text="My Projects" variants={letterVariants} />
                </motion.h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        "E-Commerce Platform — Fullstack Build",
                        "Real-Time Chat App with WebSockets",
                        "Portfolio Dashboard with Analytics",
                        "AI-Powered Recommendation Engine",
                        "Mobile-Responsive SaaS Tool",
                        "Blockchain Integration Demo",
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 p-8 backdrop-blur-lg shadow-lg"
                        >
                            <motion.div className="text-2xl md:text-3xl font-bold text-zinc-100" variants={fadeInRightVariants}>
                                {s}
                            </motion.div>
                            <motion.div className="text-zinc-400 mt-2 text-lg" variants={fadeInLeftVariants}>
                                React • Node.js • MongoDB • Tailwind • AWS
                            </motion.div>
                            <motion.p className="text-zinc-500 mt-4 text-md" variants={bounceVariants}>
                                A comprehensive project showcasing fullstack capabilities, including user authentication,
                                data visualization, and real-time updates.
                            </motion.p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>)
}

export default Projects