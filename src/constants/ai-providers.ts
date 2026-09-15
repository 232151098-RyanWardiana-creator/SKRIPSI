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
    name: "Lokal Laptop",
    models: [
      {
        id: "ag/gemini-3.8-flash-high",
        label: "Gemini 3.8 Flash (High) - Google",
        badge: "Gratis",
      },
      {
        id: "cbai/kimi-k2.6",
        label: "Kimi K2.6 (Analis Pedagogi) - Moonshot",
        badge: "Gratis",
      },
      {
        id: "cbai/glm-5.2",
        label: "GLM 5.2 (Kritikus Rumus) - Zhipu AI",
        badge: "Gratis",
      },
      {
        id: "cbai/minimax-m3",
        label: "MiniMax M3 (Penulis Konteks) - MiniMax",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.7-flash-high",
        label: "Gemini 3.7 Flash - Google",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.8-flash-low",
        label: "Gemini 3.8 Flash (Fast) - Google",
        badge: "Gratis",
      },
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
    ],
  },
  {
    id: "xkiro",
    name: "Direct Online",
    models: [
      {
        id: "qwen/qwen3.8-max:free",
        label: "Qwen 3.8 Max (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.7-max:free",
        label: "Qwen 3.7 Max (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.7-plus:free",
        label: "Qwen 3.7 Plus (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.6-plus:free",
        label: "Qwen 3.6 Plus (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-plus:free",
        label: "Qwen 3.5 Plus (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-flash:free",
        label: "Qwen 3.5 Flash (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-omni-plus:free",
        label: "Qwen 3.5 Omni Plus (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-omni-flash:free",
        label: "Qwen 3.5 Omni Flash (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-coder-plus:free",
        label: "Qwen 3 Coder Plus (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-max:free",
        label: "Qwen 3 Max (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen-plus-2025-07-28:free",
        label: "Qwen Plus Official (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-vl-plus:free",
        label: "Qwen 3 VL Plus (Free)",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-omni-flash:free",
        label: "Qwen 3 Omni Flash (Free)",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m3:free",
        label: "MiniMax M3 (Free)",
        badge: "Gratis",
      },
      {
        id: "sensenova/sensenova-6.8-flash-lite",
        label: "SenseNova 6.8 Flash Lite",
        badge: "Gratis",
      },
      {
        id: "sensenova/sensenova-6.7-flash-lite",
        label: "SenseNova 6.7 Flash Lite",
        badge: "Gratis",
      },
      {
        id: "mistralai/codestral-2508",
        label: "Codestral 2508",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-large-2512",
        label: "Mistral Large",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-medium-3.5",
        label: "Mistral Medium 3.5",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-small-2603",
        label: "Mistral Small 4",
        badge: "Gratis",
      },
      {
        id: "mistralai/devstral-medium",
        label: "Devstral Medium",
        badge: "Gratis",
      },
      {
        id: "mistralai/ministral-14b",
        label: "Ministral 14B",
        badge: "Gratis",
      },
      {
        id: "mistralai/ministral-8b",
        label: "Ministral 3 8B",
        badge: "Gratis",
      },
      {
        id: "mistralai/ministral-3b",
        label: "Ministral 3 3B",
        badge: "Gratis",
      },
    ],
  },
];
