import { motion } from "framer-motion";

const AnimatedText = ({ text, variants }: { text: string, variants: any }) => (
    <span className="inline-block">
        {text.split('').map((char, i) => (
            <motion.span key={i} custom={i} variants={variants} className="inline-block">
                {char === ' ' ? '\u00A0' : char}
            </motion.span>
        ))}
    </span>
);

export default AnimatedText