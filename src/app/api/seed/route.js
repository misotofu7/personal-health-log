import { getLogsCollection } from "../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";

/**
 * Seed Data API Route - DEMO ONLY
 * 
 * Usage:
 * POST /api/seed?demo=true          - Add seed data (safe, doesn't delete)
 * POST /api/seed?demo=true&clean=true - Delete all logs + add seed data (destructive)
 * 
 * This route is ONLY for hackathon demo purposes.
 * Requires explicit ?demo=true parameter to prevent accidental use.
 * Requires userId in request body (must be logged in via Auth0).
 */
export async function POST(request) {
  try {
    // Require explicit demo parameter
    const url = new URL(request.url);
    const demoParam = url.searchParams.get("demo");
    const cleanParam = url.searchParams.get("clean") === "true";

    if (demoParam !== "true") {
      return Response.json(
        { 
          success: false, 
          error: "This route requires ?demo=true parameter. This is a demo-only route." 
        },
        { status: 400 }
      );
    }

    // Get userId from request body (frontend must pass Auth0 userId)
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return Response.json(
        { success: false, error: "Authentication required. Please log in and provide userId." },
        { status: 401 }
      );
    }

    // Verify it's an Auth0 userId (starts with "auth0|")
    if (!userId.startsWith("auth0|")) {
      return Response.json(
        { success: false, error: "Invalid userId. Must be logged in via Auth0." },
        { status: 401 }
      );
    }
    const collection = await getLogsCollection();

    let deletedCount = 0;

    // Only delete if explicitly requested
    if (cleanParam) {
      const deleteResult = await collection.deleteMany({ userId });
      deletedCount = deleteResult.deletedCount;
      console.log(`🧹 Cleaned ${deletedCount} existing logs for user ${userId}`);
    }

    // Calculate dates - realistic CHF scenario over the past week
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date(now);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Format dates as YYYY-MM-DD (matching Calendar component format exactly)
    // The Calendar component uses formatDate from utils/date.jsx which does:
    // date.toISOString().split("T")[0]
    // But that can cause timezone issues. Instead, we'll use local date components
    // and ensure dates are created at midnight local time (like Calendar does)
    const formatDateForStorage = (date) => {
      // Create a new date at midnight local time (matching Calendar's getDaysInMonth)
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // Use local date components to avoid timezone shifts
      const year = localDate.getFullYear();
      const month = localDate.getMonth() + 1;
      const day = localDate.getDate();
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };
    
    // Also log the dates for debugging
    console.log("🌱 Seeding dates:", {
      sevenDaysAgo: formatDateForStorage(sevenDaysAgo),
      fiveDaysAgo: formatDateForStorage(fiveDaysAgo),
      fourDaysAgo: formatDateForStorage(fourDaysAgo),
      threeDaysAgo: formatDateForStorage(threeDaysAgo),
      twoDaysAgo: formatDateForStorage(twoDaysAgo),
      yesterday: formatDateForStorage(yesterday),
    });

    // Realistic CHF scenario seed data - builds up to protocol trigger
    const seedLogs = [
      // Log 1: 7 days ago - CHF diagnosis/awareness (establishes context)
      {
        id: uuidv4(),
        userId,
        date: formatDateForStorage(sevenDaysAgo),
        timestamp: sevenDaysAgo.toISOString(),
        count: 2,
        level: 2,
        symptom: "CHF Monitoring",
        raw_text: "Starting CHF weight monitoring protocol",
        tags: ["chf", "monitoring"],
        createdAt: sevenDaysAgo,
      },
      // Log 2: 5 days ago - Baseline weight check (149 lbs)
      {
        id: uuidv4(),
        userId,
        date: formatDateForStorage(fiveDaysAgo),
        timestamp: fiveDaysAgo.toISOString(),
        count: 2,
        level: 2,
        symptom: "Weight (CHF)",
        raw_text: "Weight: 149 lbs",
        tags: ["weight", "chf"],
        weight: 149,
        createdAt: fiveDaysAgo,
      },
      // Log 3: 4 days ago - CHF-related symptom (shortness of breath)
      {
        id: uuidv4(),
        userId,
        date: formatDateForStorage(fourDaysAgo),
        timestamp: fourDaysAgo.toISOString(),
        count: 2,
        level: 2,
        symptom: "Shortness of Breath",
        raw_text: "Mild shortness of breath after walking",
        tags: ["chf", "breathing"],
        createdAt: fourDaysAgo,
      },
      // Log 4: 3 days ago - Slight weight increase (149.5 lbs)
      {
        id: uuidv4(),
        userId,
        date: formatDateForStorage(threeDaysAgo),
        timestamp: threeDaysAgo.toISOString(),
        count: 2,
        level: 2,
        symptom: "Weight (CHF)",
        raw_text: "Weight: 149.5 lbs",
        tags: ["weight", "chf"],
        weight: 149.5,
        createdAt: threeDaysAgo,
      },
      // Log 5: 2 days ago - Fatigue symptom
      {
        id: uuidv4(),
        userId,
        date: formatDateForStorage(twoDaysAgo),
        timestamp: twoDaysAgo.toISOString(),
        count: 2,
        level: 2,
        symptom: "Fatigue",
        raw_text: "Feeling more tired than usual",
        tags: ["chf", "fatigue"],
        createdAt: twoDaysAgo,
      },
      // Log 6: Yesterday - Weight check (150 lbs) - still within normal range
      {
        id: uuidv4(),
        userId,
        date: formatDateForStorage(yesterday),
        timestamp: yesterday.toISOString(),
        count: 2,
        level: 2,
        symptom: "Weight (CHF)",
        raw_text: "Weight: 150 lbs",
        tags: ["weight", "chf"],
        weight: 150,
        createdAt: yesterday,
      },
    ];

    // Insert seed logs
    const insertResult = await collection.insertMany(seedLogs);
    console.log(`✅ Inserted ${insertResult.insertedCount} seed logs`);

    // Verify the logs were inserted correctly
    const verifyLogs = await collection.find({ userId, _id: { $in: Object.values(insertResult.insertedIds) } }).toArray();
    console.log("📋 Inserted log dates:", verifyLogs.map(l => ({ date: l.date, symptom: l.symptom })));

    return Response.json({
      success: true,
      message: "Seed data added successfully",
      deleted: deletedCount,
      inserted: seedLogs.length,
      seedData: {
        sevenDaysAgo: { date: formatDateForStorage(sevenDaysAgo), symptom: "CHF Monitoring" },
        fiveDaysAgo: { date: formatDateForStorage(fiveDaysAgo), weight: 149 },
        fourDaysAgo: { date: formatDateForStorage(fourDaysAgo), symptom: "Shortness of Breath" },
        threeDaysAgo: { date: formatDateForStorage(threeDaysAgo), weight: 149.5 },
        twoDaysAgo: { date: formatDateForStorage(twoDaysAgo), symptom: "Fatigue" },
        yesterday: { date: formatDateForStorage(yesterday), weight: 150 },
        note: "When you say 'I am 153 pounds', it will compare to yesterday's 150 lbs → 3 lbs gain → Triggers CHF protocol (TAKE_LASIX)",
      },
      note: cleanParam 
        ? "All existing logs were deleted before seeding."
        : "Existing logs were preserved. Only seed data was added.",
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to seed data" },
      { status: 500 }
    );
  }
}
