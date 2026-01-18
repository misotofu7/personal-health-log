import { getLogsCollection } from "../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";

// GET - Fetch all logs (optionally filter by symptom)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symptom = searchParams.get("symptom");
    const limit = parseInt(searchParams.get("limit") || "100");

    const collection = await getLogsCollection();
    
    const query = symptom ? { symptom: { $regex: symptom, $options: "i" } } : {};
    
    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return Response.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return Response.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

// POST - Create a new log
export async function POST(request) {
  try {
    const body = await request.json();
    
    const collection = await getLogsCollection();

    // Use local date (not UTC) so "today" is correct for user's timezone
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const log = {
      id: uuidv4(),
      date: body.date || localDate,
      timestamp: body.timestamp || now.toISOString(),
      count: body.count || body.level || 2,
      level: body.level || body.count || 2,
      symptom: body.symptom || "Unknown",
      raw_text: body.raw_text || "",
      tags: body.tags || [],
      createdAt: new Date(),
    };

    await collection.insertOne(log);

    return Response.json({ success: true, log });
  } catch (error) {
    console.error("Error creating log:", error);
    return Response.json(
      { success: false, error: "Failed to create log" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a log by id
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { success: false, error: "Log ID required" },
        { status: 400 }
      );
    }

    const collection = await getLogsCollection();
    await collection.deleteOne({ id });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting log:", error);
    return Response.json(
      { success: false, error: "Failed to delete log" },
      { status: 500 }
    );
  }
}
