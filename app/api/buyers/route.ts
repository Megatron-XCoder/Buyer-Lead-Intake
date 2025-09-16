import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buyerFormSchema } from "@/lib/validations/buyer";
import { buyerRateLimiter, checkRateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findFirst({
      where: { id: session.user.id }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || "demo@example.com",
          name: session.user.name || "Demo User"
        }
      });
    }

    // Rate limiting
    const canProceed = await checkRateLimit(buyerRateLimiter, session.user.id);
    if (!canProceed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = buyerFormSchema.parse(body);

    // Convert tags array to string
    const tagsString = validatedData.tags?.join(",") || "";

    const buyer = await prisma.buyer.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email || null,
        phone: validatedData.phone,
        city: validatedData.city,
        propertyType: validatedData.propertyType,
        bhk: validatedData.bhk || null,
        purpose: validatedData.purpose,
        budgetMin: validatedData.budgetMin || null,
        budgetMax: validatedData.budgetMax || null,
        timeline: validatedData.timeline,
        source: validatedData.source,
        status: validatedData.status || 'NEW',
        notes: validatedData.notes || null,
        tags: tagsString,
        ownerId: session.user.id,
      },
    });

    // Create initial history entry
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: session.user.id,
        diff: JSON.stringify({ action: "created" }),
      },
    });

    return NextResponse.json(buyer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { message: "A lead with this phone number or email already exists" },
          { status: 400 }
        );
      }
    }
    
    console.error("Error creating buyer:", error);
    return NextResponse.json(
      { message: "Failed to create buyer" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;
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

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        include: { owner: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.buyer.count({ where }),
    ]);

    return NextResponse.json({
      buyers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json(
      { message: "Failed to fetch buyers" },
      { status: 500 }
    );
  }
}