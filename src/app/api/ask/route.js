import { getLogsCollection } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-3-flash-preview"; // OpenRouter model ID - Latest Gemini 3

// Tool definitions (OpenAI format)
const tools = [
  {
    type: "function",
    function: {
      name: "save_symptom_log",
      description: "Save a new symptom log to the database. Use this when the user reports a symptom.",
      parameters: {
        type: "object",
        properties: {
          symptom: {
            type: "string",
            description: "The main symptom (e.g., 'Headache', 'Nausea', 'Fatigue')",
          },
          severity: {
            type: "number",
            description: "Severity from 1-4. 1=mild, 2=moderate, 3=severe, 4=unbearable",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Context tags (e.g., 'morning', 'after-eating', 'stress')",
          },
          raw_text: {
            type: "string",
            description: "The original text the user said",
          },
        },
        required: ["symptom", "severity", "raw_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_logs",
      description: "Query the user's symptom history. Use this to find patterns or answer questions about their health data.",
      parameters: {
        type: "object",
        properties: {
          symptom_filter: {
            type: "string",
            description: "Filter by symptom name (optional)",
          },
          days_back: {
            type: "number",
            description: "How many days of history to retrieve (default 30)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_patterns",
      description: "Analyze the user's symptom data to find patterns, triggers, and correlations.",
      parameters: {
        type: "object",
        properties: {
          focus: {
            type: "string",
            description: "What to focus analysis on (e.g., 'triggers', 'timing', 'severity_trends')",
          },
        },
      },
    },
  },
];

// Execute tool calls
async function executeTool(toolName, args) {
  const collection = await getLogsCollection();

  switch (toolName) {
    case "save_symptom_log": {
      // Use local date (not UTC) so "today" is correct for user's timezone
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const log = {
        id: uuidv4(),
        date: localDate,
        timestamp: now.toISOString(),
        count: args.severity || 2,
        level: args.severity || 2,
        symptom: args.symptom,
        raw_text: args.raw_text || "",
        tags: args.tags || [],
        createdAt: new Date(),
      };
      await collection.insertOne(log);
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return { 
        success: true, 
        message: `Logged: ${args.symptom} (severity ${args.severity}/4) at ${timeStr} on ${localDate}`, 
        log 
      };
    }

    case "query_logs": {
      const daysBack = args.days_back || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const query = {
        createdAt: { $gte: startDate },
      };
      if (args.symptom_filter) {
        query.symptom = { $regex: args.symptom_filter, $options: "i" };
      }

      const logs = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      return {
        success: true,
        count: logs.length,
        logs: logs.map((l) => {
          // Format timestamp in local time
          const logTime = new Date(l.timestamp);
          const timeStr = logTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          return {
            date: l.date,
            time: timeStr,
            symptom: l.symptom,
            severity: l.level,
            tags: l.tags,
            raw_text: l.raw_text,
          };
        }),
      };
    }

    case "analyze_patterns": {
      const logs = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(200)
        .toArray();

      if (logs.length === 0) {
        return { success: true, analysis: "No symptom data to analyze yet. Start logging symptoms first." };
      }

      const symptomCounts = {};
      const tagCounts = {};
      const severityBySymptom = {};
      const dayOfWeekCounts = {};

      logs.forEach((log) => {
        symptomCounts[log.symptom] = (symptomCounts[log.symptom] || 0) + 1;

        if (!severityBySymptom[log.symptom]) {
          severityBySymptom[log.symptom] = [];
        }
        severityBySymptom[log.symptom].push(log.level);

        (log.tags || []).forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        // Parse date components directly to get correct day of week
        const [year, month, day] = log.date.split("-").map(Number);
        // Create date at noon local time to avoid any timezone edge cases
        const date = new Date(year, month - 1, day, 12, 0, 0);
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
        dayOfWeekCounts[dayName] = (dayOfWeekCounts[dayName] || 0) + 1;
      });

      const avgSeverity = {};
      Object.entries(severityBySymptom).forEach(([symptom, severities]) => {
        avgSeverity[symptom] = (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1);
      });

      return {
        success: true,
        total_logs: logs.length,
        most_common_symptoms: Object.entries(symptomCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        common_tags: Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        average_severity: avgSeverity,
        worst_days: Object.entries(dayOfWeekCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3),
      };
    }

    default:
      return { error: "Unknown tool" };
  }
}

// Call OpenRouter API
async function callOpenRouter(messages, includeTools = true) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://biolog-health.vercel.app",
      "X-Title": "BioLog Health Tracker",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: includeTools ? tools : undefined,
      tool_choice: includeTools ? "auto" : undefined,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${error}`);
  }

  return response.json();
}

const SYSTEM_PROMPT = `You are a helpful health tracking assistant for people with chronic conditions.

Your capabilities:
1. LOG symptoms when users describe how they feel (use save_symptom_log tool)
2. QUERY their symptom history (use query_logs tool)
3. ANALYZE patterns in their data (use analyze_patterns tool)

Guidelines:
- Be empathetic and supportive
- When users describe symptoms, extract: symptom name, severity (1-4), and context tags
- Severity guide: 1=mild/slight, 2=moderate/noticeable, 3=severe/bad, 4=unbearable/worst ever
- When users ask about patterns/triggers, query and analyze their data
- Give actionable insights based on their personal data
- Keep responses concise but helpful

You are NOT a doctor. Don't diagnose. Focus on tracking and pattern recognition.`;

export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return Response.json(
        { success: false, error: "Message required" },
        { status: 400 }
      );
    }

    // Build messages array
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // First call
    const result = await callOpenRouter(messages);
    const choice = result.choices[0];
    let textResponse = "";
    let toolResults = [];

    // Check for tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCalls = choice.message.tool_calls;

      // Execute each tool
      for (const toolCall of toolCalls) {
        const args = JSON.parse(toolCall.function.arguments);
        const toolResult = await executeTool(toolCall.function.name, args);
        toolResults.push({
          tool: toolCall.function.name,
          args,
          result: toolResult,
        });
      }

      // Send tool results back
      const followUpMessages = [
        ...messages,
        choice.message,
        ...toolCalls.map((tc, i) => ({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(toolResults[i].result),
        })),
      ];

      const followUpResult = await callOpenRouter(followUpMessages, false);
      textResponse = followUpResult.choices[0].message.content || "I processed that, but didn't have anything to add. What would you like to know?";
    } else {
      textResponse = choice.message.content || "I'm not sure how to respond to that. Could you rephrase?";
    }

    return Response.json({
      success: true,
      response: textResponse,
      toolResults,
    });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
