import { redirect } from "next/navigation";
import { CarsManager } from "@/components/admin/cars/CarsManager";
import { getAdminSession } from "@/lib/auth";

export const instant = false;

export default async function AdminCarsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <CarsManager token={session.token} />;
}
