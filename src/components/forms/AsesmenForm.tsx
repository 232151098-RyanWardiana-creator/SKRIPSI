import { SoalBuilder, type AsesmenDraft } from "./SoalBuilder";

interface AsesmenFormProps { onDraftChange?: (draft: AsesmenDraft) => void }
export function AsesmenForm({ onDraftChange }: AsesmenFormProps) {
  return <SoalBuilder onDraftChange={onDraftChange} />;
}
