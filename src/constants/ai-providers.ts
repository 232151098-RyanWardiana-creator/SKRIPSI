export interface AIModelOption {
  id: string;
  label: string;
  badge?: "Gratis" | "Combos" | "Pro";
  description?: string;
}

export interface AIProviderOption {
  id: string;
  name: string;
  description: string;
  models: AIModelOption[];
}

export const AI_PROVIDERS: AIProviderOption[] = [
  {
    id: "9router",
    name: "9Router",
    description: "Router AI lokal di laptop dengan rute gratis dan combos pintar.",
    models: [
      {
        id: "INTELLIGENCE-SKRIPSI",
        label: "INTELLIGENCE SKRIPSI",
        badge: "Combos",
        description: "Model gabungan pintar khusus tugas akademis dan skripsi.",
      },
      {
        id: "MAX-QUALITY-CORE",
        label: "MAX QUALITY CORE",
        badge: "Combos",
        description: "Kualitas penalaran logika matematika tingkat tinggi.",
      },
      {
        id: "Free-AI",
        label: "Free AI Combos",
        badge: "Gratis",
        description: "Rute model gratis tanpa batas kuota berbayar.",
      },
      {
        id: "ag/gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        badge: "Gratis",
        description: "Generasi cepat, penalaran soal kontekstual responsif.",
      },
      {
        id: "ag/gemini-3.7-flash",
        label: "Gemini 3.7 Flash",
        badge: "Gratis",
        description: "Keseimbangan akurasi rumus dan kecepatan tinggi.",
      },
    ],
  },
  {
    id: "xkiro",
    name: "Xkiro",
    description: "Penyedia model terbuka berkecepatan tinggi dengan node gratis.",
    models: [
      {
        id: "xkiro/z-ai/glm-5.3",
        label: "GLM 5.3 Free",
        badge: "Gratis",
        description: "Penalaran matematika komprehensif tanpa kuota.",
      },
      {
        id: "xkiro/deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        badge: "Gratis",
        description: "Spesialis logika perhitungan dan pemecahan masalah.",
      },
    ],
  },
  {
    id: "bai",
    name: "B.ai",
    description: "Gateway multi-model dengan performa penalaran matematis tajam.",
    models: [
      {
        id: "B.ai/gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        badge: "Gratis",
        description: "Cepat dan akurat untuk butir asesmen pilihan ganda.",
      },
      {
        id: "B.ai/qwen3.8-max",
        label: "Qwen 3.8 Max",
        badge: "Gratis",
        description: "Model besar dengan penalaran kurikulum mendalam.",
      },
      {
        id: "B.ai/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        badge: "Gratis",
        description: "Respons kilat untuk pemodelan soal matematika kontekstual.",
      },
    ],
  },
  {
    id: "custom",
    name: "Custom API Key",
    description: "Gunakan API key sendiri (Groq, OpenRouter, Gemini, OpenAI, dll).",
    models: [],
  },
];
