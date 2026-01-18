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

// DELETE - Clear all logs (for testing)
export async function DELETE() {
  try {
    const collection = await getLogsCollection();
    const result = await collection.deleteMany({});
    
    return Response.json({ 
      success: true, 
      deleted: result.deletedCount 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
