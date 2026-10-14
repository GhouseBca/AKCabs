"use client";

import { use, useState, type FormEvent, type ReactNode } from "react";
import { io } from "next/cache";
import { useMutation, useQuery } from "convex/react";
import { Check, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, type TranslateVars } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn, isValidPhone } from "@/lib/utils";
import { getEnquiryLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

type TranslateFn = (key: TranslationKey, vars?: TranslateVars) => string;

type FormValues = {
  name: string;
  phone: string;
  pickupLocation: string;
  destination: string;
  travelDate: string;
  passengers: string;
  preferredCar: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  name: "",
  phone: "",
  pickupLocation: "",
  destination: "",
  travelDate: "",
  passengers: "",
  preferredCar: "",
  message: "",
};

const FIELD_ORDER: Array<keyof FormValues> = [
  "name",
  "phone",
  "pickupLocation",
  "destination",
  "travelDate",
  "passengers",
];

function validate(values: FormValues, t: TranslateFn): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = t("contact.form.errorName");
  }

  if (!values.phone.trim()) {
    errors.phone = t("contact.form.errorPhone");
  } else if (!isValidPhone(values.phone)) {
    errors.phone = t("contact.form.errorPhoneInvalid");
  }

  if (!values.pickupLocation.trim()) {
    errors.pickupLocation = t("contact.form.errorPickup");
  }

  if (!values.destination.trim()) {
    errors.destination = t("contact.form.errorDestination");
  }

  if (!values.travelDate.trim()) {
    errors.travelDate = t("contact.form.errorDate");
  } else if (Number.isNaN(Date.parse(values.travelDate))) {
    errors.travelDate = t("contact.form.errorDateInvalid");
  }

  if (!values.passengers.trim()) {
    errors.passengers = t("contact.form.errorPassengers");
  } else {
    const passengers = Number(values.passengers);
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 50) {
      errors.passengers = t("contact.form.errorPassengersRange");
    }
  }

  return errors;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-relaxed font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EnquiryForm() {
  use(io());
  const { t } = useLanguage();
  const settings = useQuery(api.settings.getBusinessSettings);
  const createEnquiry = useMutation(api.enquiries.createEnquiry);

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setSubmitError(null);
    setErrors((previous) =>
      previous[field] ? { ...previous, [field]: undefined } : previous,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstError) {
        document.getElementById(firstError)?.focus();
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await createEnquiry({
        name: values.name.trim(),
        phone: values.phone.trim(),
        pickupLocation: values.pickupLocation.trim(),
        destination: values.destination.trim(),
        travelDate: values.travelDate.trim(),
        passengers: Number(values.passengers),
        preferredCar: values.preferredCar.trim(),
        message: values.message.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("contact.form.error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappLink = getEnquiryLink(
    {
      name: values.name,
      phone: values.phone,
      pickupLocation: values.pickupLocation,
      destination: values.destination,
      travelDate: values.travelDate,
      passengers: values.passengers,
      preferredCar: values.preferredCar,
      message: values.message,
    },
    settings,
  );

  if (submitted) {
    return (
      <div className="card-static flex flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h3 className="font-heading text-xl font-semibold">
            {values.name.trim()
              ? t("contact.form.thanksName", {
                  name: values.name.trim().split(" ")[0],
                })
              : t("contact.form.thanks")}
          </h3>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {t("contact.form.successDescription")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "h-11 flex-1")}
          >
            <MessageCircle aria-hidden="true" />
            {t("contact.form.chatWhatsApp")}
          </a>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 flex-1"
            onClick={() => {
              setValues(INITIAL_VALUES);
              setErrors({});
              setSubmitError(null);
              setSubmitted(false);
            }}
          >
            {t("contact.form.sendAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="card-static reveal flex flex-col gap-5 p-5 sm:p-6"
    >
      <div className="space-y-1">
        <h3 className="font-heading text-xl font-semibold">
          {t("contact.form.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("contact.form.description")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label={t("contact.form.name")} error={errors.name}>
          <Input
            id="name"
            name="name"
            className="h-11 px-3"
            autoComplete="name"
            placeholder={t("contact.form.namePlaceholder")}
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            required
          />
        </Field>

        <Field id="phone" label={t("contact.form.phone")} error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="h-11 px-3"
            autoComplete="tel"
            placeholder={t("contact.form.phonePlaceholder")}
            value={values.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            required
          />
        </Field>

        <Field
          id="pickupLocation"
          label={t("contact.form.pickup")}
          error={errors.pickupLocation}
        >
          <Input
            id="pickupLocation"
            name="pickupLocation"
            className="h-11 px-3"
            placeholder={t("contact.form.pickupPlaceholder")}
            value={values.pickupLocation}
            onChange={(event) =>
              handleChange("pickupLocation", event.target.value)
            }
            aria-invalid={Boolean(errors.pickupLocation)}
            aria-describedby={
              errors.pickupLocation ? "pickupLocation-error" : undefined
            }
            required
          />
        </Field>

        <Field
          id="destination"
          label={t("contact.form.destination")}
          error={errors.destination}
        >
          <Input
            id="destination"
            name="destination"
            className="h-11 px-3"
            placeholder={t("contact.form.destinationPlaceholder")}
            value={values.destination}
            onChange={(event) => handleChange("destination", event.target.value)}
            aria-invalid={Boolean(errors.destination)}
            aria-describedby={
              errors.destination ? "destination-error" : undefined
            }
            required
          />
        </Field>

        <Field
          id="travelDate"
          label={t("contact.form.travelDate")}
          error={errors.travelDate}
        >
          <Input
            id="travelDate"
            name="travelDate"
            type="date"
            className="h-11 px-3"
            value={values.travelDate}
            onChange={(event) => handleChange("travelDate", event.target.value)}
            aria-invalid={Boolean(errors.travelDate)}
            aria-describedby={
              errors.travelDate ? "travelDate-error" : undefined
            }
            required
          />
        </Field>

        <Field
          id="passengers"
          label={t("contact.form.passengers")}
          error={errors.passengers}
        >
          <Input
            id="passengers"
            name="passengers"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            className="h-11 px-3"
            placeholder={t("contact.form.passengersPlaceholder")}
            value={values.passengers}
            onChange={(event) => handleChange("passengers", event.target.value)}
            aria-invalid={Boolean(errors.passengers)}
            aria-describedby={
              errors.passengers ? "passengers-error" : undefined
            }
            required
          />
        </Field>
      </div>

      <Field id="preferredCar" label={t("contact.form.preferredCar")}>
        <Input
          id="preferredCar"
          name="preferredCar"
          className="h-11 px-3"
          placeholder={t("contact.form.preferredCarPlaceholder")}
          value={values.preferredCar}
          onChange={(event) => handleChange("preferredCar", event.target.value)}
        />
      </Field>

      <Field id="message" label={t("contact.form.message")}>
        <Textarea
          id="message"
          name="message"
          rows={4}
          className="px-3"
          placeholder={t("contact.form.messagePlaceholder")}
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
        />
      </Field>

      {submitError ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full gap-2 rounded-xl shadow-sm shadow-brand/20 transition-shadow hover:shadow-md hover:shadow-brand/25"
        disabled={submitting}
      >
        {submitting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {submitting ? t("contact.form.sending") : t("contact.form.submit")}
      </Button>

      <div className="flex flex-col gap-2 rounded-xl border border-brand/15 bg-brand/5 p-4">
        <p className="text-sm text-muted-foreground">
          {t("contact.form.preferWhatsApp")}
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 w-full",
          )}
        >
          <MessageCircle aria-hidden="true" />
          {t("contact.form.enquireWhatsApp")}
        </a>
      </div>
    </form>
  );
}
