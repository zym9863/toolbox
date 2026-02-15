import type { ComponentType } from "react";

export type Locale = "zh" | "en";

export interface LocaleText {
  zh: string;
  en: string;
}

export interface ToolDefinition {
  slug: string;
  category: string;
  name: LocaleText;
  description: LocaleText;
  icon: string;
  component: () => Promise<{ default: ComponentType }>;
}

export interface CategoryDefinition {
  slug: string;
  name: LocaleText;
  icon: string;
}
