import { AssessmentRunner } from "@/components/forms/AssessmentRunner";

export default async function KerjakanAsesmenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssessmentRunner asesmenId={id} kuesionerAktif />;
}
