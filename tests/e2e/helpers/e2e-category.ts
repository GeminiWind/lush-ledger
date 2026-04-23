import fs from "node:fs/promises";
import path from "node:path";

type E2ECategory = {
  name: string;
};

const categoryPath = path.resolve(process.cwd(), "playwright/.e2e/category.json");

export const writeE2ECategory = async (category: E2ECategory) => {
  await fs.mkdir(path.dirname(categoryPath), { recursive: true });
  await fs.writeFile(categoryPath, JSON.stringify(category), "utf8");
};

export const readE2ECategory = async (): Promise<E2ECategory> => {
  const raw = await fs.readFile(categoryPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<E2ECategory>;
  return {
    name: parsed.name ?? "",
  };
};
