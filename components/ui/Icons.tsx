import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export function SoundOnIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}

export function SoundOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronIcon({ direction = "right", ...props }: IconProps & { direction?: "left" | "right" }) {
  return (
    <svg {...base} {...props}>
      <path d={direction === "right" ? "M9.5 5l7 7-7 7" : "M14.5 5l-7 7 7 7"} />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 8.5h13l-1 11h-11z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 5.5v13l10-6.5z" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8.5 5.5v13M15.5 5.5v13" />
    </svg>
  );
}

export function StarIcon({ filled, ...props }: IconProps & { filled: boolean }) {
  return (
    <svg {...base} strokeWidth={1.2} fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z" />
    </svg>
  );
}
