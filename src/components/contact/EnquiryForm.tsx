"use client";

import { use, useState, type FormEvent, type ReactNode } from "react";
import { io } from "next/cache";
import { useMutation, useQuery } from "convex/react";
import { Check, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, isValidPhone } from "@/lib/utils";
import { getEnquiryLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

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

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.pickupLocation.trim()) {
    errors.pickupLocation = "Please enter a pickup location.";
  }

  if (!values.destination.trim()) {
    errors.destination = "Please enter a destination.";
  }

  if (!values.travelDate.trim()) {
    errors.travelDate = "Please choose a travel date.";
  } else if (Number.isNaN(Date.parse(values.travelDate))) {
    errors.travelDate = "Please enter a valid date.";
  }

  if (!values.passengers.trim()) {
    errors.passengers = "Please enter the number of passengers.";
  } else {
    const passengers = Number(values.passengers);
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 50) {
      errors.passengers = "Enter a number between 1 and 50.";
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
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EnquiryForm() {
  use(io());
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

    const nextErrors = validate(values);
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
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
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
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h3 className="font-heading text-xl font-semibold">
            Thank you{values.name.trim() ? `, ${values.name.trim().split(" ")[0]}` : ""}!
          </h3>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Your enquiry has been received. We&apos;ll get back to you shortly.
            For a faster reply, message us on WhatsApp.
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
            Chat on WhatsApp
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
            Send another enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
    >
      <div className="space-y-1">
        <h3 className="font-heading text-xl font-semibold">Send an enquiry</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your trip and we&apos;ll confirm availability and fares.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name}>
          <Input
            id="name"
            name="name"
            className="h-10"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            required
          />
        </Field>

        <Field id="phone" label="Phone" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="h-10"
            autoComplete="tel"
            placeholder="Your phone number"
            value={values.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            required
          />
        </Field>

        <Field
          id="pickupLocation"
          label="Pickup location"
          error={errors.pickupLocation}
        >
          <Input
            id="pickupLocation"
            name="pickupLocation"
            className="h-10"
            placeholder="e.g. Tirunelveli Junction"
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

        <Field id="destination" label="Destination" error={errors.destination}>
          <Input
            id="destination"
            name="destination"
            className="h-10"
            placeholder="e.g. Kanyakumari"
            value={values.destination}
            onChange={(event) => handleChange("destination", event.target.value)}
            aria-invalid={Boolean(errors.destination)}
            aria-describedby={
              errors.destination ? "destination-error" : undefined
            }
            required
          />
        </Field>

        <Field id="travelDate" label="Travel date" error={errors.travelDate}>
          <Input
            id="travelDate"
            name="travelDate"
            type="date"
            className="h-10"
            value={values.travelDate}
            onChange={(event) => handleChange("travelDate", event.target.value)}
            aria-invalid={Boolean(errors.travelDate)}
            aria-describedby={
              errors.travelDate ? "travelDate-error" : undefined
            }
            required
          />
        </Field>

        <Field id="passengers" label="Passengers" error={errors.passengers}>
          <Input
            id="passengers"
            name="passengers"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            className="h-10"
            placeholder="e.g. 4"
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

      <Field id="preferredCar" label="Preferred car (optional)">
        <Input
          id="preferredCar"
          name="preferredCar"
          className="h-10"
          placeholder="e.g. Innova, Sedan"
          value={values.preferredCar}
          onChange={(event) => handleChange("preferredCar", event.target.value)}
        />
      </Field>

      <Field id="message" label="Message (optional)">
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Anything else we should know?"
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
        />
      </Field>

      {submitError ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full"
        disabled={submitting}
      >
        {submitting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {submitting ? "Sending…" : "Send enquiry"}
      </Button>

      <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3">
        <p className="text-sm text-muted-foreground">
          Prefer WhatsApp? Send the same details in one tap.
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
          Enquire on WhatsApp
        </a>
      </div>
    </form>
  );
}
