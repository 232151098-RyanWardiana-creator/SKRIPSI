export interface AIModelOption {
  id: string;
  label: string;
  subtitle?: string;
  brand?: string;
  badge?: "Gratis" | "Combos" | "Pro" | "Lokal";
}

export interface AIProviderOption {
  id: string;
  name: string;
  models: AIModelOption[];
}

export const AI_PROVIDERS: AIProviderOption[] = [
  {
    id: "9router",
    name: "9Router Lokal (Laptop)",
    models: [
      {
        id: "ag/gemini-3.8-flash-high",
        label: "Gemini 3.8 Flash (High)",
        subtitle: "Google DeepMind · Penalaran Terstruktur & Cepat",
        brand: "google",
        badge: "Gratis",
      },
      {
        id: "cbai/kimi-k2.6",
        label: "Kimi K2.6",
        subtitle: "Moonshot AI · Analis Pedagogi TaRL",
        brand: "moonshot",
        badge: "Gratis",
      },
      {
        id: "cbai/glm-5.2",
        label: "GLM 5.2",
        subtitle: "Zhipu AI · Matematika & Kritikus Rumus",
        brand: "zhipu",
        badge: "Gratis",
      },
      {
        id: "cbai/minimax-m3",
        label: "MiniMax M3",
        subtitle: "MiniMax · Konteks Cerita Nyata Realistis",
        brand: "minimax",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.7-flash-high",
        label: "Gemini 3.7 Flash",
        subtitle: "Google DeepMind · Model Multimodal Ringan",
        brand: "google",
        badge: "Gratis",
      },
      {
        id: "ag/gemini-3.8-flash-low",
        label: "Gemini 3.8 Flash (Fast)",
        subtitle: "Google DeepMind · Latensi Terendah",
        brand: "google",
        badge: "Gratis",
      },
      {
        id: "INTELLIGENCE-SKRIPSI",
        label: "INTELLIGENCE SKRIPSI",
        subtitle: "9Router Combo · Spesialis Akademik FKIP UNSIL",
        brand: "router",
        badge: "Combos",
      },
      {
        id: "MAX-QUALITY-CORE",
        label: "MAX QUALITY CORE",
        subtitle: "9Router Combo · Multi-Engine Failover Tertinggi",
        brand: "router",
        badge: "Combos",
      },
      {
        id: "ULTRA-SPEED-CHAT",
        label: "ULTRA SPEED CHAT",
        subtitle: "9Router Combo · Ultra Cepat Tanpa Antrean",
        brand: "router",
        badge: "Combos",
      },
    ],
  },
  {
    id: "xkiro",
    name: "Direct Cloud (Online)",
    models: [
      {
        id: "qwen/qwen3.8-max:free",
        label: "Qwen 3.8 Max",
        subtitle: "Alibaba Cloud · Penalaran Matematika Kompleks",
        brand: "qwen",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.7-max:free",
        label: "Qwen 3.7 Max",
        subtitle: "Alibaba Cloud · Logika Runtut Terarah",
        brand: "qwen",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.7-plus:free",
        label: "Qwen 3.7 Plus",
        subtitle: "Alibaba Cloud · Keseimbangan Kualitas & Kecepatan",
        brand: "qwen",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.6-plus:free",
        label: "Qwen 3.6 Plus",
        subtitle: "Alibaba Cloud · Generasi Teks Ramah Cetak",
        brand: "qwen",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-plus:free",
        label: "Qwen 3.5 Plus",
        subtitle: "Alibaba Cloud · Efisien & Akurat",
        brand: "qwen",
        badge: "Gratis",
      },
      {
        id: "qwen/qwen3.5-flash:free",
        label: "Qwen 3.5 Flash",
        subtitle: "Alibaba Cloud · Eksekusi Kilat",
        brand: "qwen",
        badge: "Gratis",
      },
      {
        id: "minimax/minimax-m3:free",
        label: "MiniMax M3 (Cloud)",
        subtitle: "MiniMax · Konteks Cerita Luas",
        brand: "minimax",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-large-2512",
        label: "Mistral Large",
        subtitle: "Mistral AI · Presisi Logika Tinggi",
        brand: "mistral",
        badge: "Gratis",
      },
      {
        id: "mistralai/codestral-2508",
        label: "Codestral 2508",
        subtitle: "Mistral AI · Logika Algoritmik",
        brand: "mistral",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-medium-3.5",
        label: "Mistral Medium 3.5",
        subtitle: "Mistral AI · Cepat & Terstruktur",
        brand: "mistral",
        badge: "Gratis",
      },
      {
        id: "mistralai/mistral-small-2603",
        label: "Mistral Small 4",
        subtitle: "Mistral AI · Ringan & Hemat",
        brand: "mistral",
        badge: "Gratis",
      },
    ],
  },
];
