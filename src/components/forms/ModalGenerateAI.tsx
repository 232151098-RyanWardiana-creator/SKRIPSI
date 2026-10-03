"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Check, Loader2, Sparkles, Cpu, Globe } from "lucide-react";
import { AI_PROVIDERS, type AIProviderOption } from "@/constants/ai-providers";
import { AILogo } from "@/components/ui/AILogo";
import { cn } from "@/lib/utils";

interface ModalGenerateAIProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (selected: { provider: string; model: string }) => Promise<void> | void;
  currentProviderId?: string;
  currentModelId?: string;
  loading?: boolean;
  actionText?: string;
  materi?: string;
  indikator?: string;
  tingkat?: string;
  jumlah?: number;
  targetInfo?: string;
}

export function ModalGenerateAI({
  isOpen,
  onClose,
  onGenerate,
  currentProviderId,
  currentModelId,
  loading = false,
  actionText = "Mulai Generate LKPD",
  materi,
  indikator,
  tingkat,
  jumlah,
  targetInfo,
}: ModalGenerateAIProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>("9router");
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  const currentProvider =
    AI_PROVIDERS.find((p) => p.id === selectedProviderId) || AI_PROVIDERS[0];

  useEffect(() => {
    if (isOpen) {
      const pId = currentProviderId || "9router";
      const prov = AI_PROVIDERS.find((p) => p.id === pId) || AI_PROVIDERS[0];
      setSelectedProviderId(pId);
      const mId =
        currentModelId && prov.models.some((m) => m.id === currentModelId)
          ? currentModelId
          : prov.models[0]?.id || "";
      setSelectedModelId(mId);
    }
  }, [isOpen, currentProviderId, currentModelId]);

  if (!isOpen) return null;

  const handleProviderSelect = (provider: AIProviderOption) => {
    setSelectedProviderId(provider.id);
    if (provider.models.length > 0) {
      setSelectedModelId(provider.models[0].id);
    }
  };

  const handleStart = async () => {
    await onGenerate({
      provider: selectedProviderId,
      model: selectedModelId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Pilih Engine & Model AI
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Pilih model dengan kapabilitas terbaik untuk diferensiasi LKPD matematika
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            type="button"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          {/* Provider Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                Jalur Akses AI
              </label>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Gateway
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              {AI_PROVIDERS.map((provider) => {
                const isSelected = selectedProviderId === provider.id;
                const isLocal = provider.id === "9router";
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    {isLocal ? (
                      <Cpu className={cn("h-3.5 w-3.5", isSelected ? "text-blue-600" : "text-slate-400")} />
                    ) : (
                      <Globe className={cn("h-3.5 w-3.5", isSelected ? "text-indigo-600" : "text-slate-400")} />
                    )}
                    <span>{provider.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selector based on provider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Pilihan Model ({currentProvider.models.length} Model Aktif)
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Format Resmi Chat UI
              </span>
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto pr-1 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
              {currentProvider.models.map((m) => {
                const isSelected = selectedModelId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModelId(m.id)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Logo Brand Container */}
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 border border-slate-100 shadow-xs">
                        <AILogo brand={m.brand || m.label} size={22} />
                      </div>

                      {/* Name & Subtitle */}
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900 leading-tight">
                            {m.label}
                          </span>
                          {m.badge && (
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wide",
                                m.badge === "Combos"
                                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              )}
                            >
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {m.subtitle || "AI Generation Engine"}
                        </p>
                      </div>
                    </div>

                    {/* Radio Check Indicator */}
                    <div
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] transition-all",
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "border border-slate-300 text-transparent"
                      )}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary of Generation Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-xs border border-slate-200/80">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[9px] block">Materi Pokok:</span>
              <span className="font-extrabold text-slate-900 truncate block">{materi || "Rasio (Perbandingan)"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[9px] block">Target Indikator:</span>
              <span className="font-extrabold text-slate-900 truncate block">
                {indikator === "SEMUA" || !indikator ? "IK-01 s/d IK-05" : indikator}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 font-bold uppercase text-[9px] block">Diferensiasi:</span>
              <span className="font-extrabold text-blue-700 truncate block">
                {targetInfo || `${jumlah || 4} Aktivitas • 3 Tier TaRL`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3.5">
          <Button variant="ghost" disabled={loading} onClick={onClose} type="button">
            Batal
          </Button>
          <Button
            disabled={loading}
            onClick={handleStart}
            className="px-6 shadow-md shadow-blue-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Memproses...
              </>
            ) : (
              actionText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
