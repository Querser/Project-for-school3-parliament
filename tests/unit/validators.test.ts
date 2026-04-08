import { describe, expect, it } from "vitest";

import { documentSchema } from "@/lib/validators/documents";
import { memberSchema } from "@/lib/validators/members";
import { newsSchema } from "@/lib/validators/news";

describe("validators", () => {
  it("validates news payload", () => {
    const result = newsSchema.safeParse({
      title: "Заголовок новости",
      slug: "",
      summary: "Краткое описание новости",
      content: "Полный текст новости, содержащий больше двадцати символов.",
      status: "PUBLISHED",
      publishedAt: "2026-04-01",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid document payload", () => {
    const result = documentSchema.safeParse({
      title: "Doc",
      description: "Коротко",
      category: "",
      publishedAt: "bad-date",
    });

    expect(result.success).toBe(false);
  });

  it("validates member payload", () => {
    const result = memberSchema.safeParse({
      fullName: "Иван Петров",
      slug: "",
      roleType: "DEPUTY",
      positionTitle: "Депутат",
      shortBio: "Отвечает за коммуникацию с учениками.",
      ministryId: "",
      displayOrder: 1,
    });

    expect(result.success).toBe(true);
  });
});
