import type { SVGProps } from "react";

export interface GeneratorLogoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function GeneratorLogo({
  size = 32,
  className,
  "aria-label": ariaLabel = "Logo Generator LKPD",
  ...props
}: GeneratorLogoProps) {
  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      fill="none"
      height={size}
      role="img"
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect fill="#1d4ed8" height="7" rx="3.5" width="34" x="15" y="4" />
      <path d="M20 11V16M44 11V16" stroke="#1d4ed8" strokeLinecap="round" strokeWidth="4" />
      <rect fill="#3b82f6" height="39" rx="6" width="54" x="5" y="15" />
      <path d="M5 27H59V48C59 51.314 56.314 54 53 54H11C7.686 54 5 51.314 5 48V27Z" fill="#1d4ed8" />
      <rect fill="#dbeafe" height="13" rx="2" width="22" x="10" y="20" />
      <rect fill="#93c5fd" height="7" rx="1.5" width="10" x="13" y="23" />
      <circle cx="27.5" cy="26.5" fill="#3b82f6" r="2.5" />
      <rect fill="#dbeafe" height="24" rx="3" width="17" x="37" y="20" />
      <circle cx="42" cy="25" fill="#1d4ed8" r="2" />
      <circle cx="49" cy="25" fill="#3b82f6" r="2" />
      <path d="M47 29L41.5 36H45L43 42L51 33.5H47.5L47 29Z" fill="#1d4ed8" />
      <path d="M12 39H29M12 43H29M12 47H25" stroke="#93c5fd" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M14 54V59H23V54M41 54V59H50V54" fill="#1d4ed8" />
      <path d="M10 59H24M40 59H54" stroke="#1d4ed8" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}
