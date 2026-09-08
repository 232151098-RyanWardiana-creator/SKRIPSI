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
    ],
  },
  {
    id: "xkiro",
    name: "Xkiro",
    models: [
      {
        id: "xkiro/z-ai/glm-5.3",
        label: "GLM 5.3 Free",
        badge: "Gratis",
      },
      {
        id: "xkiro/deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        badge: "Gratis",
      },
    ],
  },
  {
    id: "bai",
    name: "B.ai",
    models: [
      {
        id: "B.ai/gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        badge: "Gratis",
      },
      {
        id: "B.ai/qwen3.8-max",
        label: "Qwen 3.8 Max",
        badge: "Gratis",
      },
      {
        id: "B.ai/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        badge: "Gratis",
      },
    ],
  },
];
