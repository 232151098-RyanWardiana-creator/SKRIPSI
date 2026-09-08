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
    name: "9Router",
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
        id: "Free-AI",
        label: "Free AI Combos",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.7-flash",
        label: "Gemini 3.7 Flash",
        badge: "Gratis",
      },
      {
        id: "xkiro/z-ai/glm-5.3",
        label: "GLM 5.3",
        badge: "Gratis",
      },
      {
        id: "xkiro/deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        badge: "Gratis",
      },
      {
        id: "B.ai/qwen3.8-max",
        label: "Qwen 3.8 Max",
        badge: "Gratis",
      },
    ],
  },
  {
    id: "xkiro",
    name: "Xkiro",
    models: [
      {
        id: "deepseek/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        badge: "Gratis",
      },
      {
        id: "openai/gpt-5.3-codex-spark",
        label: "Codex 5.3 Spark",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-omni-plus:free",
        label: "Qwen3.5 Omni Plus",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m3:free",
        label: "MiniMax M3",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m2.7:free",
        label: "MiniMax M2.7",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-large-2512",
        label: "Mistral Large 3",
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
        id: "mistralai/codestral-2508",
        label: "Codestral",
        badge: "Gratis",
      },
      {
        id: "mistralai/devstral-medium",
        label: "Devstral 2",
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
      {
        id: "minimax/minimax-m2.5-highspeed:free",
        label: "MiniMax M2.5 Highspeed",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m2:free",
        label: "MiniMax M2",
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
      {
        id: "deepseek/deepseek-chat-v3.1",
        label: "DeepSeek V3.1",
        badge: "Gratis",
      },
      {
        id: "mistralai/ministral-14b",
        label: "Ministral 3 14B",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m2.1:free",
        label: "MiniMax M2.1",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m2.1-highspeed:free",
        label: "MiniMax M2.1 Highspeed",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.7-plus:free",
        label: "Qwen 3.7 Plus",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.6-plus:free",
        label: "Qwen 3.6 Plus",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-plus:free",
        label: "Qwen 3.5 Plus",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-397b-a17b:free",
        label: "Qwen 3.5 397B A17B",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-omni-flash:free",
        label: "Qwen 3.5 Omni Flash",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-max:free",
        label: "Qwen 3 Max",
        badge: "Gratis",
      },
      {
        id: "deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        badge: "Gratis",
      },
      {
        id: "deepseek/deepseek-v3.2",
        label: "DeepSeek V3.2",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen-plus-2025-07-28:free",
        label: "Qwen Plus 0728",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-vl-plus:free",
        label: "Qwen 3 VL Plus",
        badge: "Gratis",
      },
      {
        id: "sensenova/sensenova-6.8-flash-lite",
        label: "SenseNova 6.8 Flash-Lite",
        badge: "Gratis",
      },
      {
        id: "sensenova/sensenova-6.7-flash-lite",
        label: "SenseNova 6.7 Flash-Lite",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.8-max:free",
        label: "Qwen 3.8 Max",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.7-max:free",
        label: "Qwen 3.7 Max",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.6-max-preview:free",
        label: "Qwen 3.6 Max Preview",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.6-27b:free",
        label: "Qwen 3.6 27B",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-flash:free",
        label: "Qwen 3.5 Flash",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.6-35b-a3b:free",
        label: "Qwen 3.6 35B A3B",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-coder-plus:free",
        label: "Qwen 3 Coder Plus",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3-omni-flash:free",
        label: "Qwen 3 Omni Flash",
        badge: "Gratis",
      },
    ],
  },
];
