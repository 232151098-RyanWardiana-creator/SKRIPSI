import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-auth";

/** Identitas siswa yang sedang login, dibaca dari cookie httpOnly. */
export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ siswa: null }, { status: 401 });
  return NextResponse.json({ siswa: session });
}
