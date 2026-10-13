"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
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
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  carToForm,
  EMPTY_CAR_FORM,
  MAX_ADDITIONAL_IMAGES,
  MAX_FEATURES,
  validateCar,
  type CarFormValues,
  type CarRecord,
} from "@/components/admin/cars/car-types";
import { parseOptionalNumber } from "@/lib/utils";

type CarFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: CarRecord | null;
};

function CarFormSheet({ open, onOpenChange, car }: CarFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
        <CarFormBody
          key={`${car?._id ?? "new"}:${open ? "open" : "closed"}`}
          car={car}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

type CarFormBodyProps = {
  car: CarRecord | null;
  onClose: () => void;
};

function CarFormBody({ car, onClose }: CarFormBodyProps) {
  const createCar = useMutation(api.cars.createCar);
  const updateCar = useMutation(api.cars.updateCar);
  const [values, setValues] = useState<CarFormValues>(() =>
    car ? carToForm(car) : EMPTY_CAR_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof CarFormValues>(
    key: K,
    value: CarFormValues[K],
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

  function updateFeature(index: number, value: string) {
    setField(
      "features",
      values.features.map((feature, position) =>
        position === index ? value : feature,
      ),
    );
  }

  function addFeature() {
    setField("features", [...values.features, ""]);
  }

  function removeFeature(index: number) {
    setField(
      "features",
      values.features.filter((_, position) => position !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCar(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        model: values.model.trim(),
        year: parseOptionalNumber(values.year),
        image: values.image,
        additionalImages: values.additionalImages,
        seatingCapacity: Number(values.seatingCapacity),
        acAvailable: values.acAvailable,
        fuelType: values.fuelType.trim(),
        transmission: values.transmission.trim(),
        description: values.description.trim(),
        features: values.features
          .map((feature) => feature.trim())
          .filter((feature) => feature.length > 0),
        localRate: parseOptionalNumber(values.localRate),
        outstationRate: parseOptionalNumber(values.outstationRate),
        airportRate: parseOptionalNumber(values.airportRate),
        fullDayRate: parseOptionalNumber(values.fullDayRate),
        perKmRate: parseOptionalNumber(values.perKmRate),
        driverIncluded: values.driverIncluded,
        available: values.available,
      };

      if (car) {
        await updateCar({ id: car._id, ...payload });
        toast.success("Car updated.");
      } else {
        await createCar({ ...payload });
        toast.success("Car added.");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the car.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
      <SheetHeader className="border-b pr-12">
        <SheetTitle>{car ? "Edit car" : "Add car"}</SheetTitle>
        <SheetDescription>
          {car
            ? "Update the details shown for this vehicle."
            : "Add a new vehicle to your fleet."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-8 overflow-y-auto p-4">
        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Basic details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="car-name" label="Name" required error={errors.name}>
              <Input
                id="car-name"
                value={values.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Toyota Innova Crysta"
                aria-invalid={Boolean(errors.name)}
                maxLength={120}
              />
            </FormField>
            <FormField
              id="car-model"
              label="Model"
              required
              error={errors.model}
            >
              <Input
                id="car-model"
                value={values.model}
                onChange={(event) => setField("model", event.target.value)}
                placeholder="GX 7-Seater"
                aria-invalid={Boolean(errors.model)}
                maxLength={120}
              />
            </FormField>
            <FormField id="car-year" label="Year" error={errors.year}>
              <Input
                id="car-year"
                type="number"
                inputMode="numeric"
                value={values.year}
                onChange={(event) => setField("year", event.target.value)}
                placeholder="2022"
                aria-invalid={Boolean(errors.year)}
              />
            </FormField>
            <FormField
              id="car-seats"
              label="Seating capacity"
              required
              error={errors.seatingCapacity}
            >
              <Input
                id="car-seats"
                type="number"
                inputMode="numeric"
                min={1}
                value={values.seatingCapacity}
                onChange={(event) =>
                  setField("seatingCapacity", event.target.value)
                }
                aria-invalid={Boolean(errors.seatingCapacity)}
              />
            </FormField>
            <FormField
              id="car-description"
              label="Description"
              className="sm:col-span-2"
              error={errors.description}
            >
              <Textarea
                id="car-description"
                value={values.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                placeholder="A short description of this vehicle."
                rows={3}
                maxLength={2000}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">
            Vehicle details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="car-fuel"
              label="Fuel type"
              required
              error={errors.fuelType}
            >
              <Input
                id="car-fuel"
                value={values.fuelType}
                onChange={(event) => setField("fuelType", event.target.value)}
                placeholder="Petrol"
                aria-invalid={Boolean(errors.fuelType)}
                maxLength={60}
              />
            </FormField>
            <FormField
              id="car-transmission"
              label="Transmission"
              required
              error={errors.transmission}
            >
              <Input
                id="car-transmission"
                value={values.transmission}
                onChange={(event) =>
                  setField("transmission", event.target.value)
                }
                placeholder="Manual"
                aria-invalid={Boolean(errors.transmission)}
                maxLength={60}
              />
            </FormField>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ToggleRow
              label="Air conditioning"
              checked={values.acAvailable}
              onCheckedChange={(checked) => setField("acAvailable", checked)}
            />
            <ToggleRow
              label="Driver included"
              checked={values.driverIncluded}
              onCheckedChange={(checked) => setField("driverIncluded", checked)}
            />
            <ToggleRow
              label="Available for booking"
              checked={values.available}
              onCheckedChange={(checked) => setField("available", checked)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Photos</h3>
          <FormField
            id="car-image"
            label="Main image"
            required
            error={errors.image}
          >
            <ImageUpload
              value={values.image ? [values.image] : []}
              onChange={(next) => setField("image", next[0] ?? "")}
              max={1}
              error={errors.image}
            />
          </FormField>
          <FormField
            id="car-images"
            label="Additional images"
            hint={`Up to ${MAX_ADDITIONAL_IMAGES} extra photos.`}
            error={errors.additionalImages}
          >
            <ImageUpload
              value={values.additionalImages}
              onChange={(next) => setField("additionalImages", next)}
              max={MAX_ADDITIONAL_IMAGES}
            />
          </FormField>
        </section>

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Features</h3>
          <FormField
            id="car-features"
            label="Highlighted features"
            error={errors.features}
          >
            <div className="space-y-2">
              {values.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(event) =>
                      updateFeature(index, event.target.value)
                    }
                    placeholder="e.g. Bluetooth audio"
                    maxLength={120}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeFeature(index)}
                    aria-label="Remove feature"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {values.features.length < MAX_FEATURES ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                >
                  <Plus className="size-4" />
                  Add feature
                </Button>
              ) : null}
            </div>
          </FormField>
        </section>

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Rates</h3>
          <p className="text-xs text-muted-foreground">
            Leave a rate blank to show &ldquo;Contact for Price&rdquo;.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <RateField
              id="car-local-rate"
              label="Local rate (₹)"
              value={values.localRate}
              error={errors.localRate}
              onChange={(value) => setField("localRate", value)}
            />
            <RateField
              id="car-outstation-rate"
              label="Outstation rate (₹)"
              value={values.outstationRate}
              error={errors.outstationRate}
              onChange={(value) => setField("outstationRate", value)}
            />
            <RateField
              id="car-airport-rate"
              label="Airport rate (₹)"
              value={values.airportRate}
              error={errors.airportRate}
              onChange={(value) => setField("airportRate", value)}
            />
            <RateField
              id="car-fullday-rate"
              label="Full day rate (₹)"
              value={values.fullDayRate}
              error={errors.fullDayRate}
              onChange={(value) => setField("fullDayRate", value)}
            />
            <RateField
              id="car-perkm-rate"
              label="Per km rate (₹)"
              value={values.perKmRate}
              error={errors.perKmRate}
              onChange={(value) => setField("perKmRate", value)}
            />
          </div>
        </section>
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
          {car ? "Save changes" : "Add car"}
        </Button>
      </SheetFooter>
    </form>
  );
}

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ label, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
      <span className="font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

type RateFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function RateField({ id, label, value, error, onChange }: RateFieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Optional"
        aria-invalid={Boolean(error)}
      />
    </FormField>
  );
}

export { CarFormSheet };
export type { CarFormSheetProps };
