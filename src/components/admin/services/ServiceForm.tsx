"use client";

import { createElement, useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { SERVICE_ICONS, getServiceIcon } from "@/lib/service-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormField } from "@/components/admin/FormField";
import {
  EMPTY_SERVICE_FORM,
  MAX_SERVICE_DESCRIPTION,
  MAX_SERVICE_TITLE,
  serviceToForm,
  validateService,
  type ServiceFormValues,
  type ServiceRecord,
} from "@/components/admin/services/service-types";
import { cn } from "@/lib/utils";

type ServiceFormSheetProps = {
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRecord | null;
};

function ServiceFormSheet({
  token,
  open,
  onOpenChange,
  service,
}: ServiceFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <ServiceFormBody
          key={`${service?._id ?? "new"}:${open ? "open" : "closed"}`}
          token={token}
          service={service}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

type ServiceFormBodyProps = {
  token: string;
  service: ServiceRecord | null;
  onClose: () => void;
};

function ServiceFormBody({ token, service, onClose }: ServiceFormBodyProps) {
  const createService = useMutation(api.services.createService);
  const updateService = useMutation(api.services.updateService);
  const [values, setValues] = useState<ServiceFormValues>(() =>
    service ? serviceToForm(service) : EMPTY_SERVICE_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) {
        return previous;
      }
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateService(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        icon: values.icon.trim(),
        active: values.active,
      };

      if (service) {
        await updateService({ token, id: service._id, ...payload });
        toast.success("Service updated.");
      } else {
        await createService({ token, ...payload });
        toast.success("Service added.");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the service.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
      <SheetHeader className="border-b pr-12">
        <SheetTitle>{service ? "Edit service" : "Add service"}</SheetTitle>
        <SheetDescription>
          {service
            ? "Update how this service appears on your website."
            : "Add a new service to your public site."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <FormField
          id="service-title"
          label="Title"
          required
          error={errors.title}
        >
          <Input
            id="service-title"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="Airport transfers"
            aria-invalid={Boolean(errors.title)}
            maxLength={MAX_SERVICE_TITLE}
          />
        </FormField>

        <FormField
          id="service-description"
          label="Description"
          error={errors.description}
        >
          <Textarea
            id="service-description"
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="A short description of this service."
            rows={3}
            maxLength={MAX_SERVICE_DESCRIPTION}
          />
        </FormField>

        <FormField id="service-icon" label="Icon" error={errors.icon}>
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {createElement(getServiceIcon(values.icon), {
                className: "size-5",
                "aria-hidden": true,
              })}
            </span>
            <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-6">
              {Object.entries(SERVICE_ICONS).map(([key, Icon]) => {
                const selected = values.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setField("icon", key)}
                    aria-pressed={selected}
                    aria-label={key}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] capitalize transition",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span className="w-full truncate text-center">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </FormField>

        <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span className="font-medium">Active on website</span>
          <Switch
            checked={values.active}
            onCheckedChange={(checked) => setField("active", checked)}
          />
        </label>
      </div>

      <SheetFooter className="flex-row justify-end gap-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {service ? "Save changes" : "Add service"}
        </Button>
      </SheetFooter>
    </form>
  );
}

export { ServiceFormSheet };
export type { ServiceFormSheetProps };
