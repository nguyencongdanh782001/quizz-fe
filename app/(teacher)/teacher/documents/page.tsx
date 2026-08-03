import { redirect } from "next/navigation";

export default function TeacherDocumentsPage() {
  redirect("/teacher/library?tab=documents");
}