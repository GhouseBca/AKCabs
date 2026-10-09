import { redirect } from "next/navigation";
import { ServiceManager } from "@/components/admin/services/ServiceManager";
import { getAdminSession } from "@/lib/auth";

export const instant = false;

export default async function AdminServicesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <ServiceManager token={session.token} />;
}
