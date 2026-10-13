"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { LoaderCircle, Save } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  settingsToForm,
  validateSettings,
  type BusinessSettings,
  type SettingsValues,
} from "@/components/admin/settings/settings-types";

function SettingsForm() {
  return (
    <ErrorBoundary
      title="Couldn't load settings"
      description="There was a problem loading your business settings. Please try again."
    >
      <SettingsLoader />
    </ErrorBoundary>
  );
}

function SettingsLoader() {
  const settings = useQuery(api.settings.getBusinessSettings) as
    | BusinessSettings
    | null
    | undefined;

  if (settings === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return <SettingsFormBody initial={settings} />;
}

type SettingsFormBodyProps = {
  initial: BusinessSettings | null;
};

function SettingsFormBody({ initial }: SettingsFormBodyProps) {
  const updateSettings = useMutation(api.settings.updateBusinessSettings);
  const [values, setValues] = useState<SettingsValues>(() =>
    settingsToForm(initial),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof SettingsValues>(
    key: K,
    value: SettingsValues[K],
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
    const nextErrors = validateSettings(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        name: values.name.trim(),
        tagline: values.tagline.trim(),
        phone: values.phone.trim(),
        whatsapp: values.whatsapp.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        mapsUrl: values.mapsUrl.trim(),
        workingHours: values.workingHours.trim(),
        about: values.about.trim(),
        heroTitle: values.heroTitle.trim(),
        heroDescription: values.heroDescription.trim(),
        heroImage: values.heroImage.trim(),
        ctaText: values.ctaText.trim(),
      });
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <AdminPageHeader
        title="Business Settings"
        description="Update your contact details, working hours, and site content."
        action={
          <Button type="submit" disabled={saving}>
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Business info</CardTitle>
          <CardDescription>
            Contact details shown across the website.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="settings-name"
            label="Business name"
            required
            error={errors.name}
          >
            <Input
              id="settings-name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="AK Cabs"
              aria-invalid={Boolean(errors.name)}
              maxLength={120}
            />
          </FormField>
          <FormField id="settings-tagline" label="Tagline" error={errors.tagline}>
            <Input
              id="settings-tagline"
              value={values.tagline}
              onChange={(event) => setField("tagline", event.target.value)}
              placeholder="Your trusted travel partner"
              maxLength={200}
            />
          </FormField>
          <FormField id="settings-phone" label="Phone" error={errors.phone}>
            <Input
              id="settings-phone"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
              placeholder="9487556868"
              inputMode="tel"
              aria-invalid={Boolean(errors.phone)}
              maxLength={30}
            />
          </FormField>
          <FormField
            id="settings-whatsapp"
            label="WhatsApp number"
            error={errors.whatsapp}
          >
            <Input
              id="settings-whatsapp"
              value={values.whatsapp}
              onChange={(event) => setField("whatsapp", event.target.value)}
              placeholder="8610849962"
              inputMode="tel"
              aria-invalid={Boolean(errors.whatsapp)}
              maxLength={30}
            />
          </FormField>
          <FormField
            id="settings-email"
            label="Email"
            error={errors.email}
            className="sm:col-span-2"
          >
            <Input
              id="settings-email"
              type="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="hello@akcabs.in"
              aria-invalid={Boolean(errors.email)}
              maxLength={200}
            />
          </FormField>
          <FormField
            id="settings-address"
            label="Address"
            error={errors.address}
            className="sm:col-span-2"
          >
            <Textarea
              id="settings-address"
              value={values.address}
              onChange={(event) => setField("address", event.target.value)}
              placeholder="Tirunelveli, Tamil Nadu"
              rows={2}
              maxLength={300}
            />
          </FormField>
          <FormField
            id="settings-maps"
            label="Google Maps URL"
            error={errors.mapsUrl}
            hint="Link opened when customers tap your address."
            className="sm:col-span-2"
          >
            <Input
              id="settings-maps"
              value={values.mapsUrl}
              onChange={(event) => setField("mapsUrl", event.target.value)}
              placeholder="https://maps.google.com/..."
              aria-invalid={Boolean(errors.mapsUrl)}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Working hours</CardTitle>
          <CardDescription>
            When customers can reach you or book a ride.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            id="settings-hours"
            label="Working hours"
            error={errors.workingHours}
          >
            <Textarea
              id="settings-hours"
              value={values.workingHours}
              onChange={(event) => setField("workingHours", event.target.value)}
              placeholder="Mon – Sun, 6:00 AM – 11:00 PM"
              rows={2}
              maxLength={200}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            A short introduction shown on the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField id="settings-about" label="About" error={errors.about}>
            <Textarea
              id="settings-about"
              value={values.about}
              onChange={(event) => setField("about", event.target.value)}
              placeholder="Tell customers about AK Cabs."
              rows={4}
              maxLength={5000}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage hero</CardTitle>
          <CardDescription>
            The headline and image at the top of your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormField
            id="settings-hero-title"
            label="Hero title"
            error={errors.heroTitle}
          >
            <Input
              id="settings-hero-title"
              value={values.heroTitle}
              onChange={(event) => setField("heroTitle", event.target.value)}
              placeholder="Comfortable rides across Tirunelveli"
              maxLength={200}
            />
          </FormField>
          <FormField
            id="settings-hero-description"
            label="Hero description"
            error={errors.heroDescription}
          >
            <Textarea
              id="settings-hero-description"
              value={values.heroDescription}
              onChange={(event) =>
                setField("heroDescription", event.target.value)
              }
              placeholder="Book clean, well-maintained cars with friendly drivers."
              rows={3}
              maxLength={1000}
            />
          </FormField>
          <FormField
            id="settings-hero-image"
            label="Hero image"
            hint="Shown beside the headline. Leave empty to use the default."
          >
            <ImageUpload
              value={values.heroImage ? [values.heroImage] : []}
              onChange={(next) => setField("heroImage", next[0] ?? "")}
              max={1}
            />
          </FormField>
          <FormField
            id="settings-cta"
            label="Call-to-action text"
            error={errors.ctaText}
          >
            <Input
              id="settings-cta"
              value={values.ctaText}
              onChange={(event) => setField("ctaText", event.target.value)}
              placeholder="Book a cab"
              maxLength={60}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}

export { SettingsForm };
