"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useImageUrls } from "@/components/admin/useImageUrls";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

type ImageUploadProps = {
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  disabled?: boolean;
  error?: string;
};

function ImageUpload({
  value,
  onChange,
  max = 1,
  disabled = false,
  error,
}: ImageUploadProps) {
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resolve } = useImageUrls(value);

  const full = value.length >= max;
  const inputId = `image-upload-${max === 1 ? "single" : "multi"}`;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const room = max - value.length;
    const selected = Array.from(files).slice(0, room);
    if (selected.length < files.length) {
      toast.error(
        `You can add up to ${max} image${max === 1 ? "" : "s"}.`,
      );
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of selected) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          toast.error(`${file.name} is larger than 8 MB.`);
          continue;
        }

        const uploadUrl = await generateUploadUrl({});
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}.`);
        }
        const json = (await response.json()) as { storageId?: string };
        if (!json.storageId) {
          throw new Error(`Failed to upload ${file.name}.`);
        }
        uploaded.push(json.storageId);
      }
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }

    if (uploaded.length > 0) {
      onChange([...value, ...uploaded]);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, position) => position !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {value.map((id, index) => {
          const src = resolve(id);
          return (
            <div
              key={`${id}-${index}`}
              className="group relative size-24 overflow-hidden rounded-lg border bg-muted"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`Upload ${index + 1}`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <LoaderCircle className="size-5 animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled || uploading}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background disabled:opacity-50"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}

        {!full ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className={cn(
              "flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive" : "border-input",
            )}
          >
            {uploading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            <span>{uploading ? "Uploading" : "Add"}</span>
          </button>
        ) : null}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { ImageUpload };
export type { ImageUploadProps };
