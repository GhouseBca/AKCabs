import { redirect } from "next/navigation";
import { anyApi } from "convex/server";
import { BellRing, Car, CarFront, Inbox, IndianRupee } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ErrorState } from "@/components/ui/error-state";
import { convexClient, getAdminSession } from "@/lib/auth";

export const instant = false;

type DashboardStats = {
  cars: { total: number; available: number };
  pricing: { total: number; active: number };
  enquiries: {
    total: number;
    new: number;
    contacted: number;
    completed: number;
    cancelled: number;
  };
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  let stats: DashboardStats | null = null;
  try {
    stats = (await convexClient().query(anyApi.enquiries.getDashboardStats, {
      token: session.token,
    })) as DashboardStats;
  } catch {
    stats = null;
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="A quick snapshot of your fleet, enquiries, and pricing."
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total cars"
            value={stats.cars.total}
            icon={CarFront}
            hint="Vehicles in your fleet"
          />
          <StatCard
            label="Available cars"
            value={stats.cars.available}
            icon={Car}
            tone="emerald"
            hint={`${stats.cars.total - stats.cars.available} currently unavailable`}
          />
          <StatCard
            label="Total enquiries"
            value={stats.enquiries.total}
            icon={Inbox}
            tone="sky"
            hint="All-time customer enquiries"
          />
          <StatCard
            label="New enquiries"
            value={stats.enquiries.new}
            icon={BellRing}
            tone="amber"
            hint="Waiting for a follow-up"
          />
          <StatCard
            label="Active pricing"
            value={stats.pricing.active}
            icon={IndianRupee}
            hint={`${stats.pricing.total} pricing ${stats.pricing.total === 1 ? "entry" : "entries"} in total`}
          />
        </div>
      ) : (
        <ErrorState
          title="Couldn't load your dashboard"
          description="We were unable to fetch the latest stats. Please refresh the page to try again."
        />
      )}
    </div>
  );
}
