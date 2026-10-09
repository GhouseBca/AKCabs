"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ServiceFormSheet } from "@/components/admin/services/ServiceForm";
import { type ServiceRecord } from "@/components/admin/services/service-types";
import { getServiceIcon } from "@/lib/service-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ServiceManagerProps = {
  token: string;
};

function ServiceManager({ token }: ServiceManagerProps) {
  return (
    <ErrorBoundary
      title="Couldn't load services"
      description="There was a problem loading your services. Please try again."
    >
      <ServiceManagerContent token={token} />
    </ErrorBoundary>
  );
}

function ServiceManagerContent({ token }: ServiceManagerProps) {
  const services = useQuery(api.services.getAllServices, { token }) as
    | ServiceRecord[]
    | undefined;
  const deleteService = useMutation(api.services.deleteService);
  const updateService = useMutation(api.services.updateService);
  const reorderServices = useMutation(api.services.reorderServices);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(service: ServiceRecord) {
    setEditing(service);
    setFormOpen(true);
  }

  async function handleToggle(service: ServiceRecord) {
    setBusyId(service._id);
    try {
      await updateService({
        token,
        id: service._id,
        active: !service.active,
      });
      toast.success(
        service.active ? "Hidden from website." : "Now active on website.",
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
    if (!services) {
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= services.length) {
      return;
    }
    const next = [...services];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setBusyId(moved._id);
    try {
      await reorderServices({ token, ids: next.map((row) => row._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder services.",
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
      await deleteService({ token, id: deleteTarget._id });
      toast.success("Service deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the service.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Services"
        description="Manage the services displayed on your public site."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add service
          </Button>
        }
      />

      {services === undefined ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="No services yet"
          description="Add your first service to display it on the website."
          action={
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Add service
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service, index) => {
            const busy = busyId === service._id;
            const Icon = getServiceIcon(service.icon);
            return (
              <li
                key={service._id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center",
                  busy && "opacity-70",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{service.title}</p>
                      {!service.active ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {service.description || "No description"}
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
                      aria-label={`Move ${service.title} up`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === services.length - 1}
                      aria-label={`Move ${service.title} down`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={service.active}
                      onCheckedChange={() => handleToggle(service)}
                      disabled={busy}
                      aria-label={`Toggle active state for ${service.title}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(service)}
                      aria-label={`Edit ${service.title}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(service)}
                      aria-label={`Delete ${service.title}`}
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

      <ServiceFormSheet
        token={token}
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete service"
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

export { ServiceManager };
export type { ServiceManagerProps };
