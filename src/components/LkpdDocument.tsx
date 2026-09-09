"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizePlainText } from "@/lib/lkpd-history";
import { sanitizeMathMarkdown } from "@/lib/lkpd-utils";

interface LkpdDocumentProps {
  content: string;
  level: string;
  topic: string;
  printId?: string;
  docTitle?: string;
  docBadge?: string;
}

function safeUrl(url: string): string {
  const value = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value) || value.startsWith("/") || value.startsWith("#")) return value;
  return "";
}

export function LkpdDocument({ content, level, topic, printId, docTitle, docBadge }: LkpdDocumentProps) {
  const paperRef = useRef<HTMLElement>(null);
  const safeTopic = normalizePlainText(topic);
  const safeLevel = normalizePlainText(level);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    const paper = paperRef.current;
    if (!paper || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const style = getComputedStyle(paper);
        const printableHeight = (paper.clientWidth / 210) * 257;
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const next = Math.max(1, Math.ceil((paper.scrollHeight - padding) / Math.max(printableHeight, 1)));
        setPages((current) => current === next ? current : next);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(paper);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [content]);
  return (
    <div className="lkpd-preview-container">
      <div className="lkpd-page-summary no-print">Estimasi: ±{pages} Halaman A4 · Format KaTeX & Markdown Standar</div>
      <section ref={paperRef} className="lkpd-paper" data-print-id={printId}>
        <header className="lkpd-document-header">
          <div>
            <span className="title">{docTitle || "LEMBAR KERJA PESERTA DIDIK (LKPD)"}</span>
            <div className="materi-badge">{docBadge || "Kurikulum Merdeka · Pembelajaran Berdiferensiasi (TaRL)"}</div>
          </div>
          <div className="subtitle">
            <strong>{safeTopic}</strong>
            <span>Tingkat Kognitif: Level {safeLevel}</span>
          </div>
        </header>
        <div className="lkpd-markdown">
          <ReactMarkdown
            skipHtml
            urlTransform={safeUrl}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
          >
            {sanitizeMathMarkdown(content)}
          </ReactMarkdown>
        </div>
      </section>
    </div>
  );
}

export const LKPDPreview = LkpdDocument;
