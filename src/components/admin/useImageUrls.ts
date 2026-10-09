"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const HTTP_URL = /^https?:\/\//i;

/**
 * Resolves a list of image references (Convex storage ids or full URLs) into
 * displayable URLs using the public `getImageUrls` query.
 */
function useImageUrls(ids: string[]) {
  const storageIds = ids.filter((id) => id.length > 0 && !HTTP_URL.test(id));
  const urls = useQuery(api.cars.getImageUrls, { storageIds });

  const resolve = (id: string): string | null => {
    if (!id) {
      return null;
    }
    if (HTTP_URL.test(id)) {
      return id;
    }
    return urls?.[id] ?? null;
  };

  const loading = storageIds.length > 0 && urls === undefined;

  return { resolve, loading };
}

export { useImageUrls };
