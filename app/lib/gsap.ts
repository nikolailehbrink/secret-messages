import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
// Connected to https://gsap.com/community/forums/topic/35818-remix-app-and-gsap-ssr/
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { TextPlugin } from "gsap/dist/TextPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, TextPlugin);
gsap.defaults({ ease: "power4.inOut", duration: 1 });

export { gsap, useGSAP };
