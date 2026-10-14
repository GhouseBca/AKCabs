import { connection } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { api } from "../../../../convex/_generated/api";
import { BellRing, Car, CarFront, Inbox, IndianRupee, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ErrorState } from "@/components/ui/error-state";
import { authedConvexClient } from "@/lib/auth";

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
  reviews: {
    total: number;
    pending: number;
    approved: number;
    hidden: number;
  };
};

export default async function AdminDashboardPage() {
  await connection();

  const { accessToken } = await withAuth({ ensureSignedIn: true });

  let stats: DashboardStats | null = null;
  try {
    const client = await authedConvexClient(accessToken);
    stats = (await client.query(
      api.enquiries.getDashboardStats,
      {},
    )) as DashboardStats;
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
          <StatCard
            label="Pending reviews"
            value={stats.reviews.pending}
            icon={Star}
            tone="amber"
            hint={`${stats.reviews.total} ${stats.reviews.total === 1 ? "review" : "reviews"} in total`}
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
