"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { StarInput } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, type TranslateVars } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";
import { api } from "../../../convex/_generated/api";

type TranslateFn = (key: TranslationKey, vars?: TranslateVars) => string;

const NAME_MAX = 80;
const COMMENT_MAX = 500;
const LOCATION_MAX = 80;

type FormValues = {
  name: string;
  rating: number;
  comment: string;
  location: string;
  company: string;
};

type FormErrors = Partial<
  Record<"name" | "rating" | "comment" | "location", string>
>;

const INITIAL_VALUES: FormValues = {
  name: "",
  rating: 0,
  comment: "",
  location: "",
  company: "",
};

const FIELD_ORDER: Array<keyof FormErrors> = ["name", "rating", "comment"];

function validate(values: FormValues, t: TranslateFn): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = t("reviews.form.errorName");
  } else if (values.name.trim().length > NAME_MAX) {
    errors.name = t("reviews.form.errorNameMax", { max: NAME_MAX });
  }

  if (values.rating < 1 || values.rating > 5) {
    errors.rating = t("reviews.form.errorRating");
  }

  if (!values.comment.trim()) {
    errors.comment = t("reviews.form.errorComment");
  } else if (values.comment.trim().length > COMMENT_MAX) {
    errors.comment = t("reviews.form.errorCommentMax", { max: COMMENT_MAX });
  }

  if (values.location.trim().length > LOCATION_MAX) {
    errors.location = t("reviews.form.errorLocationMax", { max: LOCATION_MAX });
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

export function ReviewForm() {
  const { t } = useLanguage();
  const createReview = useMutation(api.reviews.createReview);

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleTextChange(
    field: "name" | "comment" | "location",
    value: string,
  ) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) =>
      previous[field] ? { ...previous, [field]: undefined } : previous,
    );
  }

  function handleRatingChange(rating: number) {
    setValues((previous) => ({ ...previous, rating }));
    setErrors((previous) =>
      previous.rating ? { ...previous, rating: undefined } : previous,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Honeypot: real users never see or fill this, so silently accept bots.
    if (values.company.trim().length > 0) {
      setValues(INITIAL_VALUES);
      setErrors({});
      toast.success(t("reviews.form.success"));
      return;
    }

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
    try {
      await createReview({
        name: values.name.trim(),
        rating: values.rating,
        comment: values.comment.trim(),
        location: values.location.trim(),
      });
      toast.success(t("reviews.form.success"));
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("reviews.form.error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="card-static reveal flex flex-col gap-5 p-5 sm:p-6"
    >
      <div className="space-y-1">
        <h3 className="font-heading text-xl font-semibold">
          {t("reviews.form.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("reviews.form.description")}
        </p>
      </div>

      <Field id="name" label={t("reviews.form.name")} error={errors.name}>
        <Input
          id="name"
          name="name"
          className="h-11 px-3"
          autoComplete="name"
          maxLength={NAME_MAX}
          placeholder={t("reviews.form.namePlaceholder")}
          value={values.name}
          onChange={(event) => handleTextChange("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rating">{t("reviews.form.rating")}</Label>
        <StarInput
          id="rating"
          value={values.rating}
          onChange={handleRatingChange}
          invalid={Boolean(errors.rating)}
          describedBy={errors.rating ? "rating-error" : undefined}
        />
        {errors.rating ? (
          <p
            id="rating-error"
            role="alert"
            className="text-xs leading-relaxed font-medium text-destructive"
          >
            {errors.rating}
          </p>
        ) : null}
      </div>

      <Field id="comment" label={t("reviews.form.comment")} error={errors.comment}>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          className="px-3"
          maxLength={COMMENT_MAX}
          placeholder={t("reviews.form.commentPlaceholder")}
          value={values.comment}
          onChange={(event) => handleTextChange("comment", event.target.value)}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={errors.comment ? "comment-error" : undefined}
          required
        />
      </Field>

      <Field
        id="location"
        label={t("reviews.form.location")}
        error={errors.location}
      >
        <Input
          id="location"
          name="location"
          className="h-11 px-3"
          maxLength={LOCATION_MAX}
          placeholder={t("reviews.form.locationPlaceholder")}
          value={values.location}
          onChange={(event) => handleTextChange("location", event.target.value)}
          aria-invalid={Boolean(errors.location)}
          aria-describedby={
            errors.location ? "location-error" : undefined
          }
        />
      </Field>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company (leave this field blank)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              company: event.target.value,
            }))
          }
        />
      </div>

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
        {submitting ? t("reviews.form.submitting") : t("reviews.form.submit")}
      </Button>
    </form>
  );
}
