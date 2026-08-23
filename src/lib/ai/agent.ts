import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { allAITools, AIUserContext } from "./tools";

const getSystemPrompt = (userContext?: AIUserContext) => {
  const userInfo = userContext?.id
    ? `

##TodaysDate: ${new Date().toDateString()}

### Current Logged-In User Details:
- Name: ${userContext.name || "User"}
- Email: ${userContext.email || "N/A"}
- Role: ${userContext.role || "User"} (options: "farmer", "chc", "driver")
- User ID: ${userContext.id}
`
    : `
### Current User State:
- The user is currently not logged in (Guest).
`;

  return `
You are the Agriconnect Intelligent Agent — an expert AI assistant powered by LangChain and LangGraph for the Agriconnect platform.

${userInfo}

### Your Core Purpose:
You help farmers, Custom Hiring Centre (CHC) owners, drivers, and visitors by proactively invoking appropriate database tools to fetch real-time information, providing agronomic guidance, and directing them to platform features.

### Tools at Your Disposal:
1. **search_available_services**:
   - Call this whenever someone is looking for agricultural machinery or services (e.g. cultivation, rotavator, tractor, ploughing, seed sowing, spraying, harvester, trailer).
   - Use this to answer queries like "I am looking for cultivation services", "find tractor in Jaipur", "who provides harvesting near me?".
2. **get_chc_bookings**:
   - Call this when a CHC owner asks about bookings they received, today's bookings, pending jobs, or job status.
   - Use this for queries like "what the booking i received today", "show my pending bookings", "list all bookings this week".
3. **get_farmer_bookings**:
   - Call this when a farmer inquires about their personal service requests or booking statuses (e.g. "what is my booking status?", "did CHC accept my tractor booking?").
4. **get_driver_trips**:
   - Call this when a driver asks about assigned jobs, trip schedule, or upcoming trips (e.g. "what trips do I have today?").
5. **get_chc_equipments**:
   - Call this when querying equipment fleet, machinery availability, tractors/harvesters in a CHC.
6. **get_agricultural_advisory**:
   - Call this for crop management advice, soil preparation tips, fertilizer dosage, sowing techniques, and recommended implements.
7. **get_platform_routes_and_help**:
   - Call this when the user asks about how to navigate, register, book, pay, or use Agriconnect features.

### Guidelines for Responses:
- ALWAYS check and execute tools whenever real data from the database is relevant (such as searching services, checking today's bookings, viewing fleet, or checking booking statuses).
- Present data cleanly with Markdown formatting: use bold text, lists, bullet points, and tables when presenting multiple items.
- Include actionable links like \`/services\`, \`/dashboard/farmer/bookings\`, \`/dashboard/chc/bookings\`, \`/dashboard/driver/trips\` where applicable.
- If a user asks a general farming or advisory question (e.g. soil prep for wheat), provide the agronomic recommendation and highlight the specific machinery (e.g. Rotavator/Cultivator) they can book on Agriconnect.
- Always be polite, encouraging, professional, and clear.
`;
};

// Initialize OpenAI-compatible model pointing to Pollinations AI
function getModel() {
  const apiKey = process.env.AI_API_KEY || "dummy";
  return new ChatOpenAI({
    model: "openai",
    temperature: 0.2,
    apiKey: apiKey,
    configuration: {
      baseURL: "https://gen.pollinations.ai/v1",
    },
  });
}

// Build the LangGraph StateGraph agent
export function createAgriconnectAgent(userContext?: AIUserContext) {
  const model = getModel();
  const modelWithTools = model.bindTools(allAITools);
  const toolNode = new ToolNode(allAITools);

  const callModel = async (state: typeof MessagesAnnotation.State, config?: any) => {
    const messages = [...state.messages];

    // Ensure system prompt is present at the beginning
    const sysPrompt = getSystemPrompt(userContext);
    const hasSystem = messages.some((m) => m instanceof SystemMessage || (m as any)._getType?.() === "system");

    let messagesWithSys: BaseMessage[] = [];
    if (!hasSystem) {
      messagesWithSys = [new SystemMessage(sysPrompt), ...messages];
    } else {
      messagesWithSys = messages;
    }

    const response = await modelWithTools.invoke(messagesWithSys, {
      ...config,
      configurable: {
        ...config?.configurable,
        userContext,
      },
    });

    return { messages: [response] };
  };

  const shouldContinue = (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (
      lastMessage &&
      "tool_calls" in lastMessage &&
      Array.isArray((lastMessage as any).tool_calls) &&
      (lastMessage as any).tool_calls.length > 0
    ) {
      return "tools";
    }
    return END;
  };

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue, {
      tools: "tools",
      [END]: END,
    })
    .addEdge("tools", "agent");

  return workflow.compile();
}

/**
 * Execute a conversation turn through the LangGraph agent
 */
export async function runAgentConversation(
  messages: Array<{ role: string; content: string }>,
  userContext?: AIUserContext
): Promise<{ content?: string; error?: string }> {
  try {
    const agent = createAgriconnectAgent(userContext);

    // Convert raw input messages to LangChain BaseMessage instances
    const langChainMessages: BaseMessage[] = messages
      .filter((m) => m.role !== "system") // We inject the fresh system prompt
      .map((m) => {
        if (m.role === "assistant") {
          return new AIMessage(m.content);
        }
        return new HumanMessage(m.content);
      });

    if (langChainMessages.length === 0) {
      return { content: "Hello! How can I assist you on Agriconnect today?" };
    }

    const result = await agent.invoke(
      { messages: langChainMessages },
      {
        configurable: {
          userContext,
        },
      }
    );

    const finalMessages = result.messages;
    const lastMessage = finalMessages[finalMessages.length - 1];

    let content = "";
    if (typeof lastMessage.content === "string") {
      content = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      content = lastMessage.content
        .map((part: any) => (typeof part === "string" ? part : part.text || ""))
        .join("\n");
    }

    return { content: content || "I'm here to help! Please let me know what you need." };
  } catch (error: any) {
    console.error("Error executing LangGraph agent:", error);
    return { error: error.message || "Failed to process request with AI Agent." };
  }
}
