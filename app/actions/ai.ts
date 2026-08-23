"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runAgentConversation } from "@/src/lib/ai/agent";
import { AIUserContext } from "@/src/lib/ai/tools";

export async function chatWithAI(
  messages: any[]
): Promise<{ content?: string; error?: string }> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return { error: "AI_API_KEY is not configured in the environment." };
  }

  try {
    const session = await getServerSession(authOptions);

    let userContext: AIUserContext | undefined;
    if (session?.user) {
      const u = session.user as any;
      userContext = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        profileId: u.profileId,
      };
    }

    return await runAgentConversation(messages, userContext);
  } catch (error: any) {
    console.error("Error in chatWithAI server action:", error);
    return { error: error.message || "Failed to communicate with AI Assistant." };
  }
}
