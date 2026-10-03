import type { SVGProps } from "react";

export type AIBrand =
  | "google"
  | "gemini"
  | "moonshot"
  | "kimi"
  | "zhipu"
  | "glm"
  | "minimax"
  | "anthropic"
  | "claude"
  | "openai"
  | "chatgpt"
  | "deepseek"
  | "qwen"
  | "mistral"
  | "sensenova"
  | "router";

interface AILogoProps extends SVGProps<SVGSVGElement> {
  brand?: string;
  size?: number | string;
}

export function AILogo({ brand = "router", size = 20, className, ...props }: AILogoProps) {
  const b = brand.toLowerCase();

  // 1. Google / Gemini
  if (b.includes("gemini") || b.includes("google")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
          fill="url(#geminiGradient)"
        />
        <defs>
          <linearGradient id="geminiGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4285F4" />
            <stop offset="0.4" stopColor="#9B72CB" />
            <stop offset="0.75" stopColor="#D96570" />
            <stop offset="1" stopColor="#1EA362" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 2. Kimi / Moonshot
  if (b.includes("kimi") || b.includes("moonshot")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#0F172A" />
        <path
          d="M12 4.5L13.8 9.8L19.5 10.2L15.1 13.8L16.5 19.5L12 16.2L7.5 19.5L8.9 13.8L4.5 10.2L10.2 9.8L12 4.5Z"
          fill="url(#kimiGradient)"
        />
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
        <defs>
          <linearGradient id="kimiGradient" x1="4.5" y1="4.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 3. Zhipu / GLM
  if (b.includes("glm") || b.includes("zhipu")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#1E293B" />
        <path
          d="M12 5L18 8.5V15.5L12 19L6 15.5V8.5L12 5Z"
          stroke="#06B6D4"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 5V19M6 8.5L18 15.5M6 15.5L18 8.5" stroke="#38BDF8" strokeWidth="1.2" opacity="0.7" />
        <circle cx="12" cy="12" r="2.2" fill="#22D3EE" />
      </svg>
    );
  }

  // 4. MiniMax
  if (b.includes("minimax")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#EF4444" />
        <path
          d="M6 16V8L9.5 13.5L12 9.5L14.5 13.5L18 8V16"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 5. Claude / Anthropic
  if (b.includes("claude") || b.includes("anthropic")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#D97757" />
        <path
          d="M12 4V20M4 12H20M6.3 6.3L17.7 17.7M6.3 17.7L17.7 6.3"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 6. OpenAI / ChatGPT
  if (b.includes("openai") || b.includes("gpt")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#10A37F" />
        <circle cx="12" cy="12" r="5" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
      </svg>
    );
  }

  // 7. DeepSeek
  if (b.includes("deepseek")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#1E88E5" />
        <path
          d="M6 14C8 10 12 7 17 8C19 8.5 20 10 19 12C17.5 15 13 17 8 16L6 14Z"
          fill="#FFFFFF"
        />
        <circle cx="14" cy="10.5" r="1.2" fill="#1E88E5" />
      </svg>
    );
  }

  // 8. Qwen / Alibaba
  if (b.includes("qwen") || b.includes("alibaba")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#6366F1" />
        <path
          d="M12 4L18.5 8V16L12 20L5.5 16V8L12 4Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <path d="M12 8L15.5 10.5V14.5L12 16.5L8.5 14.5V10.5L12 8Z" fill="#4F46E5" />
      </svg>
    );
  }

  // 9. Mistral
  if (b.includes("mistral") || b.includes("codestral")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#FF7000" />
        <rect x="6" y="7" width="3" height="10" fill="#FFFFFF" />
        <rect x="9" y="10" width="3" height="7" fill="#FFFFFF" opacity="0.8" />
        <rect x="12" y="7" width="3" height="10" fill="#FFFFFF" />
        <rect x="15" y="10" width="3" height="7" fill="#FFFFFF" opacity="0.8" />
      </svg>
    );
  }

  // 10. Router / Combos / Default
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="24" height="24" rx="6" fill="#1E1B4B" />
      <path
        d="M12 4L14.5 9.5H19.5L15.5 13L17 18.5L12 15.2L7 18.5L8.5 13L4.5 9.5H9.5L12 4Z"
        fill="#38BDF8"
      />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  );
}
