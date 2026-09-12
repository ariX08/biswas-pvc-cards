import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let path = req.nextUrl.searchParams.get("path") || "";
    const asDownload = req.nextUrl.searchParams.get("download") === "1";

    try {
      path = decodeURIComponent(path);
    } catch {
      /* keep */
    }

    if (!path) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }
    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from("order-documents")
      .download(path);

    if (error || !data) {
      const parts = path.split("/");
      const folder = parts.slice(0, -1).join("/");
      const { data: listed } = await supabase.storage
        .from("order-documents")
        .list(folder || "", { limit: 50 });

      return NextResponse.json(
        {
          error: error?.message || "File not found in storage",
          path,
          folder,
          folderFiles: listed?.map((f) => f.name) || [],
        },
        { status: 404 }
      );
    }

    const buf = Buffer.from(await data.arrayBuffer());
    const name = path.split("/").pop() || "document.pdf";
    const type = data.type || "application/pdf";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": String(buf.length),
        "Content-Disposition": asDownload
          ? `attachment; filename="${name}"`
          : `inline; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: any) {
    console.error("files GET", err);
    return NextResponse.json({ error: err?.message || "error" }, { status: 500 });
  }
}
