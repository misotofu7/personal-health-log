import { getLogsCollection } from "../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import { checkCommunityTrends } from "../../../services/publicData";

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
          days_ago: {
            type: "number",
            description: "How many days ago the symptom occurred. 0 = today, 1 = yesterday, 2 = two days ago, etc. Default is 0 (today).",
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
  {
    type: "function",
    function: {
      name: "check_community_trends",
      description: "Check public community health trends from Reddit (UCSC/Santa Cruz). Use this when users ask about local health alerts, weather-related symptoms, wildfires, air quality, or community health issues. This helps provide context about environmental factors that might affect their symptoms.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Search keyword (e.g., 'heat', 'fire', 'air quality', 'covid', 'flu', 'smoke', 'wildfire', 'heatwave')",
          },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_weight",
      description: "Log weight for CHF (Congestive Heart Failure) monitoring. Use this when users mention their weight (e.g., 'Scale says 153', 'I weigh 153 lbs', '153'). This tool automatically compares to previous weight and triggers alerts if weight gain >= 3 lbs.",
      parameters: {
        type: "object",
        properties: {
          weight: {
            type: "number",
            description: "Current weight in pounds (e.g., 153)",
          },
          condition: {
            type: "string",
            description: "Medical condition if applicable (e.g., 'CHF', 'Heart Failure'). Default is empty.",
          },
        },
        required: ["weight"],
      },
    },
  },
];

// Execute tool calls
async function executeTool(toolName, args, userId) {
  const collection = await getLogsCollection();

  switch (toolName) {
    case "save_symptom_log": {
      if (!userId) {
        return { error: "User ID required" };
      }
      // Use local date, adjusted for days_ago if specified
      const now = new Date();
      const daysAgo = args.days_ago || 0;
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - daysAgo);
      const localDate = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      const log = {
        id: uuidv4(),
        userId, // Add user ID
        date: localDate,
        timestamp: targetDate.toISOString(),
        count: args.severity || 2,
        level: args.severity || 2,
        symptom: args.symptom,
        raw_text: args.raw_text || "",
        tags: args.tags || [],
        createdAt: new Date(),
      };
      await collection.insertOne(log);
      const timeStr = targetDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const dateLabel = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;
      return { 
        success: true, 
        message: `Logged: ${args.symptom} (severity ${args.severity}/4) for ${dateLabel} (${localDate})`, 
        log 
      };
    }

    case "query_logs": {
      if (!userId) {
        return { success: true, logs: [] }; // Return empty if not logged in
      }
      const daysBack = args.days_back || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const query = {
        userId, // Filter by user
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
      if (!userId) {
        return { success: true, analysis: "Please log in to see your health patterns." };
      }
      const logs = await collection
        .find({ userId }) // Filter by user
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

    case "log_weight": {
      const weight = args.weight;
      const condition = args.condition || "";
      
      if (!weight || weight <= 0) {
        return { error: "Valid weight required" };
      }

      if (!userId) {
        return { error: "User ID required" };
      }

      // Query previous weight logs
      const daysBack = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const query = {
        userId,
        createdAt: { $gte: startDate },
        $or: [
          { symptom: { $regex: /weight|fluid/i } },
          { tags: { $in: ["weight", "chf", "fluid-retention"] } },
          { weight: { $exists: true } }
        ]
      };

      const previousLogs = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      // Extract previous weight from logs (check weight field first, then parse from text)
      let previousWeight = null;
      for (const log of previousLogs) {
        // Check if log has weight field (from previous log_weight calls)
        if (log.weight) {
          previousWeight = log.weight;
          break;
        }
        // Otherwise try to extract from symptom or raw_text
        const weightMatch = log.symptom?.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg)/i) || 
                           log.raw_text?.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg)/i);
        if (weightMatch) {
          previousWeight = parseFloat(weightMatch[1]);
          break;
        }
      }

      // Calculate weight change
      const weightChange = previousWeight ? weight - previousWeight : 0;
      const weightGain = weightChange > 0 ? weightChange : 0;

      // Determine severity and action based on weight gain
      let severity = 1;
      let actionRequired = null;
      let alertMessage = null;

      if (weightGain >= 3) {
        severity = 4;
        actionRequired = "TAKE_LASIX";
        alertMessage = `⚠️ PROTOCOL ACTIVATED: Weight gain of ${weightGain.toFixed(1)} lbs detected. Action required: ${actionRequired}`;
      } else if (weightGain >= 2) {
        severity = 3;
        actionRequired = "MONITOR_CLOSELY";
        alertMessage = `Weight gain of ${weightGain.toFixed(1)} lbs. Monitor closely.`;
      } else if (weightGain >= 1) {
        severity = 2;
        alertMessage = `Weight gain of ${weightGain.toFixed(1)} lbs. Continue monitoring.`;
      }

      // Log the weight
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const log = {
        id: uuidv4(),
        userId,
        date: localDate,
        timestamp: now.toISOString(),
        count: severity,
        level: severity,
        symptom: condition ? `Weight (${condition})` : "Weight",
        raw_text: `Weight: ${weight} lbs${previousWeight ? ` (previous: ${previousWeight} lbs)` : ''}`,
        tags: ["weight", condition.toLowerCase()].filter(Boolean),
        weight: weight,
        previousWeight: previousWeight,
        weightChange: weightChange,
        actionRequired: actionRequired,
        createdAt: now,
      };

      await collection.insertOne(log);

      return {
        success: true,
        weight: weight,
        previousWeight: previousWeight,
        weightChange: weightChange,
        weightGain: weightGain,
        severity: severity,
        actionRequired: actionRequired,
        alertMessage: alertMessage,
        log: log
      };
    }

    case "log_weight": {
      const weight = args.weight;
      const condition = args.condition || "";
      
      if (!weight || weight <= 0) {
        return { error: "Valid weight required" };
      }

      if (!userId) {
        return { error: "User ID required" };
      }

      // Query previous weight logs
      const daysBack = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const query = {
        userId,
        createdAt: { $gte: startDate },
        $or: [
          { symptom: { $regex: /weight|fluid/i } },
          { tags: { $in: ["weight", "chf", "fluid-retention"] } },
          { weight: { $exists: true } }
        ]
      };

      const previousLogs = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      // Extract previous weight from logs (look for weight in symptom name, tags, or weight field)
      let previousWeight = null;
      for (const log of previousLogs) {
        // Check if log has weight field
        if (log.weight) {
          previousWeight = log.weight;
          break;
        }
        // Otherwise try to extract from symptom or raw_text
        const weightMatch = log.symptom?.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg)/i) || 
                           log.raw_text?.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg)/i);
        if (weightMatch) {
          previousWeight = parseFloat(weightMatch[1]);
          break;
        }
      }

      // Calculate weight change
      const weightChange = previousWeight ? weight - previousWeight : 0;
      const weightGain = weightChange > 0 ? weightChange : 0;

      // Determine severity and action based on weight gain (CHF protocol)
      let severity = 1;
      let actionRequired = null;
      let alertMessage = null;

      if (weightGain >= 3) {
        severity = 4;
        actionRequired = "TAKE_LASIX";
        alertMessage = `⚠️ PROTOCOL ACTIVATED: Weight gain of ${weightGain.toFixed(1)} lbs detected. Action required: ${actionRequired}`;
      } else if (weightGain >= 2) {
        severity = 3;
        actionRequired = "MONITOR_CLOSELY";
        alertMessage = `Weight gain of ${weightGain.toFixed(1)} lbs. Monitor closely.`;
      } else if (weightGain >= 1) {
        severity = 2;
        alertMessage = `Weight gain of ${weightGain.toFixed(1)} lbs. Continue monitoring.`;
      }

      // Log the weight
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const log = {
        id: uuidv4(),
        userId,
        date: localDate,
        timestamp: now.toISOString(),
        count: severity,
        level: severity,
        symptom: condition ? `Weight (${condition})` : "Weight",
        raw_text: `Weight: ${weight} lbs${previousWeight ? ` (previous: ${previousWeight} lbs)` : ''}`,
        tags: ["weight", condition.toLowerCase()].filter(Boolean),
        weight: weight,
        previousWeight: previousWeight,
        weightChange: weightChange,
        actionRequired: actionRequired,
        createdAt: now,
      };

      await collection.insertOne(log);

      return {
        success: true,
        weight: weight,
        previousWeight: previousWeight,
        weightChange: weightChange,
        weightGain: weightGain,
        severity: severity,
        actionRequired: actionRequired,
        alertMessage: alertMessage,
        log: log
      };
    }

    case "check_community_trends": {
      const keyword = args.keyword || "";
      if (!keyword) {
        return { error: "Keyword required" };
      }
      
      // Use real Reddit data (demoMode = false by default)
      // Only falls back to demo if Reddit is down
      const result = await checkCommunityTrends(keyword, false);
      
      // Check if it's demo data (demo URLs contain '/demo')
      const isDemoData = result.url?.includes('/demo');
      
      // Log what we found for debugging
      console.log(`[Community Trends] Keyword: "${keyword}", Found: ${result.found}, Source: ${result.source}, IsDemo: ${isDemoData}, URL: ${result.url}`);
      
      // CRITICAL: Don't return demo data - we don't want to show fake alerts
      if (isDemoData) {
        console.log(`[Community Trends] Skipping demo data for "${keyword}" - no real alerts found`);
        return {
          success: true,
          found: false,
          isDemo: true,
          message: `No current community alerts found for "${keyword}"`
        };
      }
      
      // Only return if it's a recent, relevant alert AND real data
      if (result.found && result.headline) {
        // Check if the headline is actually relevant (not a lecture, event, etc.)
        const headline = result.headline.toLowerCase();
        const isRelevant = !headline.includes('lecture') && 
                          !headline.includes('seminar') && 
                          !headline.includes('event') &&
                          !headline.includes('december') &&
                          !headline.includes('november') &&
                          !headline.includes('october');
        
        if (isRelevant) {
          return {
            success: true,
            found: true,
            source: result.source,
            headline: result.headline,
            url: result.url,
            context: result.context,
            timestamp: result.timestamp,
            isDemo: false,
            message: `Found current community alert: "${result.headline}" from ${result.source}`
          };
        }
      }
      
      // No relevant alerts found
      return {
        success: true,
        found: false,
        message: `No current community alerts found for "${keyword}"`
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

CRITICAL: You MUST respond ONLY in English. Never use any other language.

Your capabilities:
1. LOG symptoms when users describe how they feel (use save_symptom_log tool)
2. QUERY their symptom history (use query_logs tool)
3. ANALYZE patterns in their data (use analyze_patterns tool)
4. CHECK community health trends from Reddit when users ask about local alerts, weather, fires, air quality, or environmental factors (use check_community_trends tool)

IMPORTANT about community trends:
- ONLY use check_community_trends for CURRENT, ACTIVE health alerts (heat advisories, wildfire warnings, air quality alerts, etc.)
- DO NOT mention old events, lectures, seminars, research papers, or past dates
- If the community alert is not recent (within last 7 days) or not relevant to current health conditions, DO NOT mention it
- Only share community alerts if they are ACTIVE warnings that could affect the user's health RIGHT NOW
- If no relevant current alerts are found, simply don't mention community trends - don't say "no alerts found"

Guidelines:
- Be empathetic and supportive
- IMPORTANT: When users describe symptoms, LOG IMMEDIATELY. Don't ask clarifying questions. Use your best judgment for severity based on their words:
  - Words like "a bit", "slight", "minor" = severity 1
  - No intensity words = severity 2 (default)
  - Words like "really", "bad", "severe" = severity 3
  - Words like "unbearable", "worst ever", "can't function" = severity 4
- Extract context tags from what they mention (activity, food, time of day, etc.)
- IMPORTANT: If the user mentions a time reference (yesterday, 2 days ago, last week, etc.), set days_ago accordingly:
  - "yesterday" = days_ago: 1
  - "2 days ago" = days_ago: 2
  - "last week" = days_ago: 7
  - If no time mentioned, days_ago: 0 (today)
- After logging, briefly confirm what you logged in English only
- When users ask about patterns/triggers, query and analyze their data
- Give actionable insights based on their personal data
- Keep responses SHORT and conversational (1-2 sentences max for confirmations)
- ALWAYS respond in English. Never use Chinese, Spanish, or any other language.

You are NOT a doctor. Don't diagnose. Focus on tracking and pattern recognition.

---

SPECIAL PROTOCOL: Medical Guardian for CHF (Congestive Heart Failure) Patients

ROLE: You are an active Medical Guardian for CHF patients. ALWAYS check for weight patterns when users mention weight.

1. WEIGHT DETECTION:
   - When users mention weight (e.g., "Scale says 153", "I weigh 153", "153 lbs", "weighed myself"), use the log_weight tool
   - The tool automatically compares to previous weight and triggers alerts if needed
   - If user mentions CHF, heart failure, or fluid retention, include condition: "CHF" in the tool call

2. PROTOCOL CHECK (automatic via log_weight tool):
   - If weight gain >= 3 lbs: Severity 4, action_required: "TAKE_LASIX"
   - If weight gain 2-3 lbs: Severity 3, action_required: "MONITOR_CLOSELY"
   - If weight gain 1-2 lbs: Severity 2, continue monitoring
   - The tool returns alertMessage if protocol is activated

3. RESPONSE FORMAT:
   - If alertMessage is present, respond urgently with the alert
   - Example: "⚠️ PROTOCOL ACTIVATED: Weight gain of 3.0 lbs detected. Action required: TAKE_LASIX"
   - Always mention the weight change and previous weight for context

4. EXTERNAL CONTEXT INTEGRATION:
   - If check_community_trends returns data about "Heat", "Smoke", or "Pressure":
     * Link it to CHF symptoms: "The heatwave in Santa Cruz may be worsening your fluid retention"
     * Incorporate into severity assessment

NOTE: Use log_weight tool for ALL weight mentions. The tool handles CHF protocol automatically.`;

export async function POST(request) {
  try {
    // Frontend passes userId (Auth0) or localUserId (anonymous) in request body

    const { message, conversationHistory = [], userId: frontendUserId = null, localUserId = null } = await request.json();
    
    // Use Auth0 userId from frontend if logged in, otherwise use localUserId from browser
    const effectiveUserId = frontendUserId || localUserId || null;

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
        const toolResult = await executeTool(toolCall.function.name, args, effectiveUserId);
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
