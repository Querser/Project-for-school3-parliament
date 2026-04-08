import { transliterate as translit } from "transliteration";

export function slugify(input: string): string {
  return translit(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function generateUniqueSlug(
  source: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(source) || "item";
  let candidate = base;
  let counter = 1;

  while (await exists(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
}
