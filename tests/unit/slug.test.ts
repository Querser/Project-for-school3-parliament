import { describe, expect, it } from "vitest";

import { generateUniqueSlug, slugify } from "@/lib/utils/slug";

describe("slug utilities", () => {
  it("creates latin slug from russian text", () => {
    expect(slugify("Школьный парламент 2026")).toBe("shkolnyy-parlament-2026");
  });

  it("generates unique slug", async () => {
    const existing = new Set(["news-item", "news-item-2"]);

    const slug = await generateUniqueSlug("News Item", async (value) => existing.has(value));
    expect(slug).toBe("news-item-3");
  });
});
