import { Link } from "react-router-dom";
import MagneticButton from "./MagneticButton";

export default function CTA() {
  return (
    <div className="relative z-10 mt-14 flex justify-center">
      <Link to="/projects" aria-label="Explore my work">
        <MagneticButton>
          <span className="mr-2">Explore my work</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="inline-block">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </MagneticButton>
      </Link>
    </div>
  );
}
