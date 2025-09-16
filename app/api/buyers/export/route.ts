import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stringify } from "csv-stringify/sync";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const status = searchParams.get("status") || "";
    const timeline = searchParams.get("timeline") || "";

    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    const buyers = await prisma.buyer.findMany({
      where,
      include: { owner: true },
      orderBy: { updatedAt: "desc" },
    });

    // Convert to CSV format
    const csvData = buyers.map((buyer) => ({
      fullName: buyer.fullName,
      email: buyer.email || "",
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || "",
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || "",
      budgetMax: buyer.budgetMax || "",
      timeline: buyer.timeline,
      source: buyer.source,
      status: buyer.status,
      notes: buyer.notes || "",
      tags: buyer.tags || "",
      owner: buyer.owner.name || buyer.owner.email,
      createdAt: buyer.createdAt.toISOString(),
      updatedAt: buyer.updatedAt.toISOString(),
    }));

    const csv = stringify(csvData, {
      header: true,
      columns: [
        { key: "fullName", header: "Full Name" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        { key: "city", header: "City" },
        { key: "propertyType", header: "Property Type" },
        { key: "bhk", header: "BHK" },
        { key: "purpose", header: "Purpose" },
        { key: "budgetMin", header: "Budget Min" },
        { key: "budgetMax", header: "Budget Max" },
        { key: "timeline", header: "Timeline" },
        { key: "source", header: "Source" },
        { key: "status", header: "Status" },
        { key: "notes", header: "Notes" },
        { key: "tags", header: "Tags" },
        { key: "owner", header: "Owner" },
        { key: "createdAt", header: "Created At" },
        { key: "updatedAt", header: "Updated At" },
      ],
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="buyer-leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting buyers:", error);
    return NextResponse.json(
      { message: "Failed to export buyers" },
      { status: 500 }
    );
  }
}