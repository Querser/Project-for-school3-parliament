import { describe, expect, it } from "vitest";

import { publicInitiativeSubmitSchema } from "@/lib/validators/initiatives";

describe("publicInitiativeSubmitSchema", () => {
  it("accepts valid payload when consent is checked", () => {
    const result = publicInitiativeSubmitSchema.safeParse({
      title: "Идея",
      description: "Нужно добавить дополнительные места для групповой работы.",
      submitterClass: "9А",
      submitterName: "Иван Петров",
      submitterContact: "@ivan_petrov",
      personalDataConsent: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects payload when consent is not checked", () => {
    const result = publicInitiativeSubmitSchema.safeParse({
      title: "Идея",
      description: "Нужно добавить дополнительные места для групповой работы.",
      submitterClass: "9А",
      submitterName: "Иван Петров",
      submitterContact: "@ivan_petrov",
      personalDataConsent: false,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.message).toBe("Подтвердите согласие на обработку персональных данных");
  });
});
