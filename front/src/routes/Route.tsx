import About from "../components/About";
import Intro from "../pages/Intro";
import Projects from "../pages/Projects";

const ROUTES = [
    {
        path: "/",
        element: <Intro />,
    },
    {
        path: "/about",
        element: <About />,
    },
    {
        path: "/projects",
        element: <Projects />,
    },
];
export default ROUTES;