import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { GalleryItem } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection<GalleryItem>("gallery").find({}, { projection: { } }).sort({ _id: -1 }).toArray();
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}
