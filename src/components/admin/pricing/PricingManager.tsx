"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PricingFormSheet } from "@/components/admin/pricing/PricingForm";
import {
  CATEGORY_LABELS,
  type PricingRecord,
} from "@/components/admin/pricing/pricing-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn, formatPrice } from "@/lib/utils";

function PricingManager() {
  return (
    <ErrorBoundary
      title="Couldn't load pricing"
      description="There was a problem loading your pricing plans. Please try again."
    >
      <PricingManagerContent />
    </ErrorBoundary>
  );
}

function PricingManagerContent() {
  const pricing = useQuery(api.pricing.getPricing, {}) as
    | PricingRecord[]
    | undefined;
  const deletePricing = useMutation(api.pricing.deletePricing);
  const updatePricing = useMutation(api.pricing.updatePricing);
  const reorderPricing = useMutation(api.pricing.reorderPricing);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PricingRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(record: PricingRecord) {
    setEditing(record);
    setFormOpen(true);
  }

  async function handleToggle(record: PricingRecord) {
    setBusyId(record._id);
    try {
      await updatePricing({
        id: record._id,
        active: !record.active,
      });
      toast.success(
        record.active ? "Hidden from website." : "Now active on website.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!pricing) {
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= pricing.length) {
      return;
    }
    const next = [...pricing];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setBusyId(moved._id);
    try {
      await reorderPricing({ ids: next.map((row) => row._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder pricing.",
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
      await deletePricing({ id: deleteTarget._id });
      toast.success("Pricing deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete pricing.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pricing"
        description="Manage fare cards, categories, and which plans are active."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add pricing
          </Button>
        }
      />

      {pricing === undefined ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : pricing.length === 0 ? (
        <EmptyState
          icon={<Tags className="size-6" />}
          title="No pricing yet"
          description="Add your first fare card to display it on the website."
          action={
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Add pricing
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {pricing.map((row, index) => {
            const busy = busyId === row._id;
            return (
              <li
                key={row._id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center",
                  busy && "opacity-70",
                )}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{row.title}</p>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[row.category]}
                    </Badge>
                    {!row.active ? (
                      <Badge variant="secondary">Inactive</Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.price === undefined
                      ? "Contact for price"
                      : formatPrice(row.price)}
                    {row.unit ? ` · ${row.unit}` : ""}
                  </p>
                  {row.description ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {row.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, -1)}
                      disabled={busy || index === 0}
                      aria-label={`Move ${row.title} up`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === pricing.length - 1}
                      aria-label={`Move ${row.title} down`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={row.active}
                      onCheckedChange={() => handleToggle(row)}
                      disabled={busy}
                      aria-label={`Toggle active state for ${row.title}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(row)}
                      aria-label={`Edit ${row.title}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(row)}
                      aria-label={`Delete ${row.title}`}
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

      <PricingFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete pricing"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed.`
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

export { PricingManager };
