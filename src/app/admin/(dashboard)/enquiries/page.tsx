import { redirect } from "next/navigation";
import { EnquiryManager } from "@/components/admin/enquiries/EnquiryManager";
import { getAdminSession } from "@/lib/auth";

export const instant = false;

export default async function AdminEnquiriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <EnquiryManager token={session.token} />;
}
