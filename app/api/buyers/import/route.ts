import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buyerApiSchema } from "@/lib/validations/buyer";
import { importRateLimiter, checkRateLimit } from "@/lib/rate-limiter";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { City, PropertyType, BHK, Purpose, Timeline, Source, Status } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting for imports
    const canProceed = await checkRateLimit(importRateLimiter, session.user.id);
    if (!canProceed) {
      return NextResponse.json(
        { message: "Too many import requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const csvText = await file.text();
    
    let records;
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      return NextResponse.json({ message: "Invalid CSV format" }, { status: 400 });
    }

    if (records.length > 200) {
      return NextResponse.json(
        { message: "CSV file cannot contain more than 200 rows" },
        { status: 400 }
      );
    }

    const failedRows: { row: number; error: string; data: any }[] = [];
    const validData: any[] = [];

    // Validate each row
    records.forEach((record: any, index: number) => {
      try {
        // Convert CSV strings to appropriate types
        const processedRecord = {
          fullName: record.fullName || record["Full Name"] || "",
          email: record.email || record["Email"] || "",
          phone: record.phone || record["Phone"] || "",
          city: record.city || record["City"] || "",
          propertyType: record.propertyType || record["Property Type"] || "",
          bhk: record.bhk || record["BHK"] || "",
          purpose: record.purpose || record["Purpose"] || "",
          budgetMin: record.budgetMin || record["Budget Min"] ? 
            parseInt(record.budgetMin || record["Budget Min"]) : undefined,
          budgetMax: record.budgetMax || record["Budget Max"] ? 
            parseInt(record.budgetMax || record["Budget Max"]) : undefined,
          timeline: record.timeline || record["Timeline"] || "",
          source: record.source || record["Source"] || "",
          status: record.status || record["Status"] || "NEW",
          notes: record.notes || record["Notes"] || "",
          tags: record.tags || record["Tags"] ? 
            (record.tags || record["Tags"]).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        };

        // Validate enum values
        if (processedRecord.city && !Object.values(City).includes(processedRecord.city as City)) {
          throw new Error(`Invalid city: ${processedRecord.city}`);
        }
        if (processedRecord.propertyType && !Object.values(PropertyType).includes(processedRecord.propertyType as PropertyType)) {
          throw new Error(`Invalid property type: ${processedRecord.propertyType}`);
        }
        if (processedRecord.bhk && !Object.values(BHK).includes(processedRecord.bhk as BHK)) {
          throw new Error(`Invalid BHK: ${processedRecord.bhk}`);
        }
        if (processedRecord.purpose && !Object.values(Purpose).includes(processedRecord.purpose as Purpose)) {
          throw new Error(`Invalid purpose: ${processedRecord.purpose}`);
        }
        if (processedRecord.timeline && !Object.values(Timeline).includes(processedRecord.timeline as Timeline)) {
          throw new Error(`Invalid timeline: ${processedRecord.timeline}`);
        }
        if (processedRecord.source && !Object.values(Source).includes(processedRecord.source as Source)) {
          throw new Error(`Invalid source: ${processedRecord.source}`);
        }
        if (processedRecord.status && !Object.values(Status).includes(processedRecord.status as Status)) {
          throw new Error(`Invalid status: ${processedRecord.status}`);
        }

        // Validate with Zod schema
        const validatedData = buyerApiSchema.parse(processedRecord);
        validData.push({
          ...validatedData,
          tags: validatedData.tags?.join(",") || "",
          ownerId: session.user.id,
        });
      } catch (error) {
        failedRows.push({
          row: index + 2, // +2 because CSV rows start at 1 and we skip header
          error: error instanceof z.ZodError 
            ? error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
            : error instanceof Error ? error.message : "Unknown error",
          data: record,
        });
      }
    });

    // If there are failed rows, return them without saving anything
    if (failedRows.length > 0) {
      return NextResponse.json({
        success: false,
        totalRows: records.length,
        successCount: 0,
        failedRows,
      });
    }

    // All rows are valid, save them in a transaction
    let successCount = 0;
    try {
      await prisma.$transaction(async (tx) => {
        for (const data of validData) {
          try {
            const buyer = await tx.buyer.create({ data });
            
            // Create initial history entry
            await tx.buyerHistory.create({
              data: {
                buyerId: buyer.id,
                changedBy: session.user.id,
                diff: JSON.stringify({ action: "imported_from_csv" }),
              },
            });
            
            successCount++;
          } catch (error) {
            // If unique constraint fails, add to failed rows
            if (error instanceof Error && error.message.includes("Unique constraint")) {
              failedRows.push({
                row: validData.indexOf(data) + 2,
                error: "Phone number or email already exists",
                data,
              });
            } else {
              throw error;
            }
          }
        }
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      return NextResponse.json(
        { message: "Failed to import data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalRows: records.length,
      successCount,
      failedRows,
    });
  } catch (error) {
    console.error("Error importing buyers:", error);
    return NextResponse.json(
      { message: "Failed to import buyers" },
      { status: 500 }
    );
  }
}