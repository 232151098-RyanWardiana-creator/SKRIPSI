"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AI_PROVIDERS, type AIProviderOption } from "@/constants/ai-providers";
import { cn } from "@/lib/utils";

interface ModalGenerateAIProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: {
    provider: string;
    model: string;
  }) => Promise<void>;
  loading: boolean;
  materi: string;
  jumlah?: number;
  indikator?: string;
  tingkat?: string;
  targetInfo?: string;
  actionText?: string;
  currentProviderId?: string;
  currentModelId?: string;
}

export function ModalGenerateAI({
  isOpen,
  onClose,
  onGenerate,
  loading,
  materi,
  jumlah,
  indikator,
  tingkat,
  targetInfo,
  actionText = "Mulai Generate",
  currentProviderId,
  currentModelId,
}: ModalGenerateAIProps) {
  const [selectedProviderId, setSelectedProviderId] = useState(
    currentProviderId || "9router"
  );
  const currentProvider =
    AI_PROVIDERS.find((p) => p.id === selectedProviderId) || AI_PROVIDERS[0];

  const [selectedModelId, setSelectedModelId] = useState<string>(
    currentModelId || currentProvider.models[0]?.id || "INTELLIGENCE-SKRIPSI"
  );

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[28px] border border-white/80 bg-white p-6 sm:p-7 shadow-2xl">
        {/* Header Centered */}
        <div className="relative flex items-center justify-center border-b border-slate-100 pb-3.5">
          <h2 className="text-lg font-black text-slate-900 tracking-tight text-center">
            Pilih Provider & Model AI
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            type="button"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          {/* Provider Selector Tabs (9Router & Xkiro) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
              Pilih Provider AI
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80">
              {AI_PROVIDERS.map((provider) => {
                const isSelected = selectedProviderId === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider)}
                    className={cn(
                      "flex items-center justify-center py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/20 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    )}
                  >
                    <span>{provider.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selector based on provider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                Pilihan Model ({currentProvider.name})
              </label>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {currentProvider.models.length} Model
              </span>
            </div>

            <div className="grid gap-1.5 max-h-56 overflow-y-auto pr-1.5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
              {currentProvider.models.map((m) => {
                const isSelected = selectedModelId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModelId(m.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/70 ring-1 ring-[#2563EB]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-all",
                          isSelected
                            ? "bg-[#2563EB] text-white"
                            : "border border-slate-300 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {m.label}
                      </span>
                    </div>

                    {m.badge && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase shrink-0",
                          m.badge === "Combos"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {m.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary of Generation Parameters */}
          <div className="flex flex-wrap items-center justify-between rounded-xl bg-slate-100/90 px-3.5 py-2.5 text-xs text-slate-600 border border-slate-200/80">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Topik Materi:</span>
              <span className="font-bold text-slate-900">{materi || "Matematika"}</span>
            </div>
            {indikator && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Indikator:</span>
                <span className="font-bold text-slate-900">{indikator === "SEMUA" ? "Rata (IK-01–05)" : indikator}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Target:</span>
              <span className="font-bold text-[#2563EB]">
                {targetInfo || `${jumlah || 3} Butir • ${tingkat || "sedang"}`}
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
            className="px-6"
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
