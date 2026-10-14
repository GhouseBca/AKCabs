"use client";

import { useLanguage, type TranslateVars } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";

type TProps = {
  k: TranslationKey;
  vars?: TranslateVars;
};

function T({ k, vars }: TProps) {
  const { t } = useLanguage();
  return <>{t(k, vars)}</>;
}

export { T };
export type { TProps };
