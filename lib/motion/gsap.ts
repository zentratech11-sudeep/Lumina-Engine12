"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once here; client components import gsap and ScrollTrigger from this module.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
