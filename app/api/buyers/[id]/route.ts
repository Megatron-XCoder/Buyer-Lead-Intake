import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buyerUpdateSchema } from "@/lib/validations/buyer";
import { buyerRateLimiter, checkRateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const canProceed = await checkRateLimit(buyerRateLimiter, session.user.id);
    if (!canProceed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = buyerUpdateSchema.parse(body);

    // Check if buyer exists and user can edit it
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingBuyer) {
      return NextResponse.json({ message: "Buyer not found" }, { status: 404 });
    }

    if (existingBuyer.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Concurrency control: check if the record was modified after the form was loaded
    const formUpdatedAt = new Date(validatedData.updatedAt);
    if (existingBuyer.updatedAt > formUpdatedAt) {
      return NextResponse.json(
        { message: "This record was modified by someone else. Please refresh and try again." },
        { status: 409 }
      );
    }

    // Create diff for history
    const changes: Record<string, { old: any; new: any }> = {};
    
    Object.entries(validatedData).forEach(([key, newValue]) => {
      if (key === "updatedAt" || key === "tags") return;
      
      const oldValue = (existingBuyer as any)[key];
      if (oldValue !== newValue) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Handle tags separately
    const oldTags = existingBuyer.tags || "";
    const newTags = validatedData.tags?.join(",") || "";
    if (oldTags !== newTags) {
      changes.tags = { old: oldTags, new: newTags };
    }

    // Convert tags array to string
    const tagsString = validatedData.tags?.join(",") || "";

    // Update buyer
    const updatedBuyer = await prisma.buyer.update({
      where: { id: resolvedParams.id },
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
        status: validatedData.status,
        notes: validatedData.notes || null,
        tags: tagsString,
      },
    });

    // Create history entry if there were changes
    if (Object.keys(changes).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: resolvedParams.id,
          changedBy: session.user.id,
          diff: JSON.stringify(changes),
        },
      });
    }

    return NextResponse.json(updatedBuyer);
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
    
    console.error("Error updating buyer:", error);
    return NextResponse.json(
      { message: "Failed to update buyer" },
      { status: 500 }
    );
  }
}