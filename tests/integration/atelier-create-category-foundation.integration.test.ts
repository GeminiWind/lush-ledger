import { describe, expect, it } from "vitest";
import { parseCreateCategoryError } from "@/features/atelier/services";

describe("atelier create category FE foundation", () => {
  it("parses field-level errors from create-category response", async () => {
    const response = new Response(
      JSON.stringify({
        error: "Category name already exists.",
        errors: {
          name: "Category name already exists.",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );

    const parsed = await parseCreateCategoryError(response, "Could not create category.");

    expect(parsed.status).toBe(400);
    expect(parsed.message).toBe("Category name already exists.");
    expect(parsed.fieldErrors.name).toBe("Category name already exists.");
  });

  it("falls back when response body is not valid JSON", async () => {
    const response = new Response("failed", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    const parsed = await parseCreateCategoryError(response, "Could not create category.");

    expect(parsed.status).toBe(500);
    expect(parsed.message).toBe("Could not create category.");
    expect(parsed.fieldErrors).toEqual({});
  });
});
