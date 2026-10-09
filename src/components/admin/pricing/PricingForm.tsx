"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  EMPTY_PRICING_FORM,
  PRICING_CATEGORIES,
  pricingToForm,
  validatePricing,
  type PricingCategory,
  type PricingFormValues,
  type PricingRecord,
} from "@/components/admin/pricing/pricing-types";
import { parseOptionalNumber } from "@/lib/utils";

type PricingFormSheetProps = {
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PricingRecord | null;
};

function PricingFormSheet({
  token,
  open,
  onOpenChange,
  record,
}: PricingFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <PricingFormBody
          key={`${record?._id ?? "new"}:${open ? "open" : "closed"}`}
          token={token}
          record={record}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

type PricingFormBodyProps = {
  token: string;
  record: PricingRecord | null;
  onClose: () => void;
};

function PricingFormBody({ token, record, onClose }: PricingFormBodyProps) {
  const createPricing = useMutation(api.pricing.createPricing);
  const updatePricing = useMutation(api.pricing.updatePricing);
  const [values, setValues] = useState<PricingFormValues>(() =>
    record ? pricingToForm(record) : EMPTY_PRICING_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof PricingFormValues>(
    key: K,
    value: PricingFormValues[K],
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
    const nextErrors = validatePricing(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        category: values.category,
        description: values.description.trim(),
        price: parseOptionalNumber(values.price),
        unit: values.unit.trim(),
        notes: values.notes.trim(),
        active: values.active,
      };

      if (record) {
        await updatePricing({ token, id: record._id, ...payload });
        toast.success("Pricing updated.");
      } else {
        await createPricing({ token, ...payload });
        toast.success("Pricing added.");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save pricing.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
      <SheetHeader className="border-b pr-12">
        <SheetTitle>{record ? "Edit pricing" : "Add pricing"}</SheetTitle>
        <SheetDescription>
          {record
            ? "Update this fare card shown on the website."
            : "Create a new fare card for a trip type."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <FormField
          id="pricing-title"
          label="Title"
          required
          error={errors.title}
        >
          <Input
            id="pricing-title"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="Local city ride"
            aria-invalid={Boolean(errors.title)}
            maxLength={120}
          />
        </FormField>

        <FormField
          id="pricing-category"
          label="Category"
          required
          error={errors.category}
        >
          <Select
            value={values.category}
            onValueChange={(value) =>
              setField("category", value as PricingCategory)
            }
          >
            <SelectTrigger
              id="pricing-category"
              className="w-full"
              aria-invalid={Boolean(errors.category)}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {PRICING_CATEGORIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="pricing-price" label="Price (₹)" error={errors.price}>
            <Input
              id="pricing-price"
              type="number"
              inputMode="numeric"
              min={0}
              value={values.price}
              onChange={(event) => setField("price", event.target.value)}
              placeholder="Optional"
              aria-invalid={Boolean(errors.price)}
            />
          </FormField>
          <FormField
            id="pricing-unit"
            label="Unit"
            required
            error={errors.unit}
          >
            <Input
              id="pricing-unit"
              value={values.unit}
              onChange={(event) => setField("unit", event.target.value)}
              placeholder="per km / per day"
              aria-invalid={Boolean(errors.unit)}
              maxLength={60}
            />
          </FormField>
        </div>

        <FormField
          id="pricing-description"
          label="Description"
          error={errors.description}
        >
          <Textarea
            id="pricing-description"
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="What this plan includes."
            rows={3}
            maxLength={2000}
          />
        </FormField>

        <FormField id="pricing-notes" label="Notes" error={errors.notes}>
          <Textarea
            id="pricing-notes"
            value={values.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Any extra conditions or notes."
            rows={2}
            maxLength={1000}
          />
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
          {record ? "Save changes" : "Add pricing"}
        </Button>
      </SheetFooter>
    </form>
  );
}

export { PricingFormSheet };
export type { PricingFormSheetProps };
