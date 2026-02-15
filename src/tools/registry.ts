import type { ToolDefinition } from "./types";

export const tools: ToolDefinition[] = [
  // Tools will be added here by subsequent tasks
];

export function getToolsByCategory(category: string): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function getTool(category: string, slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.category === category && t.slug === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.name.zh.toLowerCase().includes(q) ||
      t.name.en.toLowerCase().includes(q) ||
      t.description.zh.toLowerCase().includes(q) ||
      t.description.en.toLowerCase().includes(q),
  );
}
