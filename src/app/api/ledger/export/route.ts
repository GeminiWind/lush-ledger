import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  buildLedgerExportFileName,
  getLedgerExportRows,
  LedgerExportValidationError,
  parseLedgerExportQuery,
  serializeLedgerExportCsv,
} from "@/lib/ledger-export";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const query = parseLedgerExportQuery(request.nextUrl.searchParams);
    const rows = await getLedgerExportRows(session.sub, query);
    const csv = serializeLedgerExportCsv(rows);
    const fileName = buildLedgerExportFileName();

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    if (error instanceof LedgerExportValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not export transactions. Please try again." }, { status: 500 });
  }
};
