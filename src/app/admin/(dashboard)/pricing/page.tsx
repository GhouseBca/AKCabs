import { redirect } from "next/navigation";
import { PricingManager } from "@/components/admin/pricing/PricingManager";
import { getAdminSession } from "@/lib/auth";

export const instant = false;

export default async function AdminPricingPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <PricingManager token={session.token} />;
}
