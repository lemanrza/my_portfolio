import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";

type Props = {
    containerVariants: any;
    scaleVariants: any;
    letterVariants: any;
    fadeInLeftVariants: any;
    fadeInRightVariants: any;
    bounceVariants: any;
    pulseVariants: any;
    itemVariants: any;
    rotateVariants: any;
};

const ContactMe = ({ containerVariants, scaleVariants, letterVariants, fadeInLeftVariants, fadeInRightVariants, bounceVariants, pulseVariants, itemVariants, rotateVariants }: Props) => {
    return (
        <section
            id="contact"
            className="px-8 md:px-12 lg:px-20 py-32 md:py-48 lg:py-64"
        >
            <motion.div
                className="max-w-5xl mx-auto space-y-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <motion.h2
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center"
                    variants={scaleVariants}
                >
                    <AnimatedText text="Get in Touch" variants={letterVariants} />
                </motion.h2>
                <motion.p
                    className="text-zinc-300 text-lg md:text-2xl max-w-4xl mx-auto text-center leading-relaxed"
                    variants={fadeInLeftVariants}
                >
                    I'm always open to new opportunities, collaborations, or just a friendly chat about tech. Reach out via email, social media, or fill out the form below. Let's build something amazing together!
                </motion.p>
                <motion.div className="space-y-8 max-w-3xl mx-auto" variants={itemVariants}>
                    <motion.div variants={rotateVariants} className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
                        <motion.a
                            href="mailto:leman@example.com"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-center transition-all"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                        >
                            Email Me
                        </motion.a>
                        <motion.a
                            href="https://twitter.com/leman_dev"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-center transition-all"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            Follow on X (Twitter)
                        </motion.a>
                        <motion.a
                            href="https://linkedin.com/in/leman-dev"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-center transition-all"
                            whileHover={{ scale: 1.1 }}
                        >
                            Connect on LinkedIn
                        </motion.a>
                    </motion.div>
                    <motion.div variants={bounceVariants} className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur">
                        <h3 className="text-2xl font-bold text-white mb-6">Contact Form (Coming Soon)</h3>
                        <form className="space-y-6">
                            <motion.input
                                type="text"
                                placeholder="Your Name"
                                className="w-full px-4 py-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                                variants={fadeInRightVariants}
                            />
                            <motion.input
                                type="email"
                                placeholder="Your Email"
                                className="w-full px-4 py-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                                variants={fadeInLeftVariants}
                            />
                            <motion.textarea
                                placeholder="Your Message"
                                rows={6}
                                className="w-full px-4 py-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                                variants={fadeInRightVariants}
                            />
                            <motion.button
                                type="submit"
                                className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all"
                                variants={pulseVariants}
                                whileHover={{ scale: 1.05 }}
                            >
                                Send Message
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>)
}

export default ContactMe