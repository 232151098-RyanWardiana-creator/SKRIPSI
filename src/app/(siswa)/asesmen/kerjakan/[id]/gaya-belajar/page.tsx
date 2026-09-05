import { KuesionerGayaBelajar } from "@/components/forms/KuesionerGayaBelajar";

export default async function GayaBelajarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KuesionerGayaBelajar asesmenId={id} />;
}
