import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { Project } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection<Project>("projects").find({}, { projection: { } }).sort({ _id: -1 }).toArray();
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();
    const doc: Project = {
      title: body.title,
      description: body.description,
      tech: Array.isArray(body.tech) ? body.tech : [],
      liveUrl: body.liveUrl || undefined,
      repoUrl: body.repoUrl || undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection<Project>("projects").insertOne(doc);
    return NextResponse.json({ ...doc, _id: String(result.insertedId) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
