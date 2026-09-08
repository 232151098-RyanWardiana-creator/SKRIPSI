export interface AIModelOption {
  id: string;
  label: string;
  badge?: "Gratis" | "Combos";
}

export interface AIProviderOption {
  id: string;
  name: string;
  models: AIModelOption[];
}

export const AI_PROVIDERS: AIProviderOption[] = [
  {
    id: "9router",
    name: "9Router (Lokal Laptop)",
    models: [
      {
        id: "INTELLIGENCE-SKRIPSI",
        label: "INTELLIGENCE SKRIPSI",
        badge: "Combos",
      },
      {
        id: "MAX-QUALITY-CORE",
        label: "MAX QUALITY CORE",
        badge: "Combos",
      },
      {
        id: "ULTRA-SPEED-CHAT",
        label: "ULTRA SPEED CHAT",
        badge: "Combos",
      },
      {
        id: "ag/gemini-3.8-flash-high",
        label: "Gemini 3.8 Flash (High)",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.8-flash-low",
        label: "Gemini 3.8 Flash (Fast)",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.7-flash-high",
        label: "Gemini 3.7 Flash",
        badge: "Gratis",
      },
      {
        id: "B.ai/glm-5.3-flash",
        label: "GLM 5.3 Flash (1M Context)",
        badge: "Gratis",
      },
      {
        id: "B.ai/qwen3.8-flash",
        label: "Qwen 3.8 Flash",
        badge: "Gratis",
      },
      {
        id: "xkiro/deepseek/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        badge: "Gratis",
      },
      {
        id: "xkiro/qwen/qwen3.7-max:free",
        label: "Qwen 3.7 Max (Free)",
        badge: "Gratis",
      },
      {
        id: "xkiro/minimax/minimax-m3:free",
        label: "MiniMax M3 (Free)",
        badge: "Gratis",
      },
    ],
  },
  {
    id: "xkiro",
    name: "Xkiro (Direct Online)",
    models: [
      {
        id: "deepseek/deepseek-v3.2",
        label: "DeepSeek V3.2",
        badge: "Gratis",
      },
      {
        id: "deepseek/deepseek-chat-v3.1",
        label: "DeepSeek V3.1",
        badge: "Gratis",
      },
      {
        id: "deepseek/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        badge: "Gratis",
      },
      {
        id: "deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        badge: "Gratis",
      },
      {
        id: "mistralai/ministral-3b",
        label: "Ministral 3 3B",
        badge: "Gratis",
      },
      {
        id: "mistralai/ministral-8b",
        label: "Ministral 3 8B",
        badge: "Gratis",
      },
      {
        id: "deepseek/deepseek-chat-v3.1",
        label: "DeepSeek V3.1",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m2.7-highspeed:free",
        label: "MiniMax M2.7 Highspeed",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m2.5:free",
        label: "MiniMax M2.5",
        badge: "Gratis",
      },
    ],
  },
];
