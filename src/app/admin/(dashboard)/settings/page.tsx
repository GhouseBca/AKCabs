import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { getAdminSession } from "@/lib/auth";

export const instant = false;

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <SettingsForm token={session.token} />;
}
