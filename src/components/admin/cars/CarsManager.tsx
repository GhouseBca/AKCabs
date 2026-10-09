"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  CarFront,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CarFormSheet } from "@/components/admin/cars/CarForm";
import {
  type CarRecord,
} from "@/components/admin/cars/car-types";
import { useImageUrls } from "@/components/admin/useImageUrls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn, formatPrice } from "@/lib/utils";

type CarsManagerProps = {
  token: string;
};

function CarsManager({ token }: CarsManagerProps) {
  return (
    <ErrorBoundary
      title="Couldn't load cars"
      description="There was a problem loading your fleet. Please try again."
    >
      <CarsManagerContent token={token} />
    </ErrorBoundary>
  );
}

function CarsManagerContent({ token }: CarsManagerProps) {
  const cars = useQuery(api.cars.getCars, { token }) as
    | CarRecord[]
    | undefined;
  const deleteCar = useMutation(api.cars.deleteCar);
  const toggleCarAvailability = useMutation(api.cars.toggleCarAvailability);
  const reorderCars = useMutation(api.cars.reorderCars);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CarRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { resolve } = useImageUrls((cars ?? []).map((car) => car.image));

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(car: CarRecord) {
    setEditing(car);
    setFormOpen(true);
  }

  async function handleToggle(car: CarRecord) {
    setBusyId(car._id);
    try {
      await toggleCarAvailability({
        token,
        id: car._id,
        available: !car.available,
      });
      toast.success(
        car.available ? "Marked as unavailable." : "Marked as available.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update availability.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!cars) {
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= cars.length) {
      return;
    }
    const next = [...cars];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setBusyId(moved._id);
    try {
      await reorderCars({ token, ids: next.map((car) => car._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder cars.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    try {
      await deleteCar({ token, id: deleteTarget._id });
      toast.success("Car deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the car.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Cars"
        description="Add, edit, reorder, and toggle availability for your fleet."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add car
          </Button>
        }
      />

      {cars === undefined ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <EmptyState
          icon={<CarFront className="size-6" />}
          title="No cars yet"
          description="Add your first vehicle to start showing it on the website."
          action={
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Add car
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {cars.map((car, index) => {
            const busy = busyId === car._id;
            return (
              <li
                key={car._id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center",
                  busy && "opacity-70",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {(() => {
                      const src = resolve(car.image);
                      return src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={car.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <CarFront className="size-6 text-muted-foreground" />
                      );
                    })()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{car.name}</p>
                      <Badge
                        variant={car.available ? "default" : "secondary"}
                      >
                        {car.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {car.model}
                      {car.year ? ` · ${car.year}` : ""} · {car.seatingCapacity}{" "}
                      seats · {car.fuelType} · {car.transmission}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Local: {formatPrice(car.localRate)} · Per km:{" "}
                      {formatPrice(car.perKmRate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, -1)}
                      disabled={busy || index === 0}
                      aria-label={`Move ${car.name} up`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === cars.length - 1}
                      aria-label={`Move ${car.name} down`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={car.available}
                      onCheckedChange={() => handleToggle(car)}
                      disabled={busy}
                      aria-label={`Toggle availability for ${car.name}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(car)}
                      aria-label={`Edit ${car.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(car)}
                      aria-label={`Delete ${car.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CarFormSheet
        token={token}
        open={formOpen}
        onOpenChange={setFormOpen}
        car={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete car"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be permanently removed from your fleet.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export { CarsManager };
export type { CarsManagerProps };
