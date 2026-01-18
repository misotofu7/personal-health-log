import { getLogsCollection } from "../../../lib/mongodb";

// GET - Debug endpoint to see what's in the database
export async function GET() {
  try {
    const collection = await getLogsCollection();
    const logs = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray();
    
    return Response.json({ 
      success: true, 
      count: logs.length,
      logs 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Clear all logs without userId (old anonymous data)
export async function DELETE() {
  try {
    const collection = await getLogsCollection();
    // Delete all logs that don't have a userId (old anonymous data)
    const result = await collection.deleteMany({ userId: { $exists: false } });
    
    return Response.json({ 
      success: true, 
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} anonymous logs`
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
