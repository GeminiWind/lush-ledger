import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const validCurrencies = new Set(["VND", "USD", "EUR", "JPY"]);
const validLanguages = new Set(["en-US", "vi-VN", "fr-FR", "ja-JP"]);
const validThemes = new Set(["light", "dark", "system"]);

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      name: true,
      email: true,
      settings: {
        select: {
          currency: true,
          language: true,
          theme: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    settings: {
      name: user.name || "",
      email: user.email,
      currency: user.settings?.currency || "VND",
      language: user.settings?.language || "en-US",
      theme: user.settings?.theme || "light",
    },
  });
};

export const PATCH = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const currency = String(body.currency || "").trim().toUpperCase();
  const language = String(body.language || "").trim();
  const theme = String(body.theme || "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
  }

  if (!validCurrencies.has(currency)) {
    return NextResponse.json({ error: "Invalid currency." }, { status: 400 });
  }

  if (!validLanguages.has(language)) {
    return NextResponse.json({ error: "Invalid language." }, { status: 400 });
  }

  if (!validThemes.has(theme)) {
    return NextResponse.json({ error: "Invalid theme." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: {
      name,
      settings: {
        upsert: {
          create: {
            currency,
            language,
            theme,
          },
          update: {
            currency,
            language,
            theme,
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
};
