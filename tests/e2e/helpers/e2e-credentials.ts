import fs from "node:fs/promises";
import path from "node:path";

type E2ECredentials = {
  email: string;
  password: string;
};

const credentialsPath = path.resolve(process.cwd(), "playwright/.e2e/credentials.json");

export const writeE2ECredentials = async (credentials: E2ECredentials) => {
  await fs.mkdir(path.dirname(credentialsPath), { recursive: true });
  await fs.writeFile(credentialsPath, JSON.stringify(credentials), "utf8");
};

export const readE2ECredentials = async (): Promise<E2ECredentials> => {
  const raw = await fs.readFile(credentialsPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<E2ECredentials>;
  return {
    email: parsed.email ?? "",
    password: parsed.password ?? "",
  };
};
