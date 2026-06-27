import { redirect } from "next/navigation";

export default function AdminExamsIndexPage() {
  redirect("/admin/exams/practice-sets");
}
