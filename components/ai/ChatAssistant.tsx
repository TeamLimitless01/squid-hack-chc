"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { chatWithAI } from "@/app/actions/ai";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

const SYSTEM_PROMPT = `
You are the Agriconnect AI Guide, a helpful and highly knowledgeable assistant for the Agriconnect platform. 
Your goal is to help users navigate the platform, understand how it works, and answer their questions about features.

### About Agriconnect
Agriconnect bridges the gap between farmers and Custom Hiring Centres (CHCs), empowering the agricultural community with seamless access to machinery and jobs.
- **Farmers** can book agricultural services (tractors, harvesters) from local CHCs.
- **CHCs** can manage their fleet, list services, and dispatch drivers.
- **Drivers** receive job assignments, track their trips, and get paid.

### Key Routes & Pages
- **Homepage**: \`/\` - Landing page explaining the platform.
- **Farmer Dashboard**: \`/dashboard/farmer\` - Overview for farmers.
- **Farmer Bookings**: \`/dashboard/farmer/bookings\` - Where farmers can see past bookings or request new ones.
- **Farmer Profile**: \`/dashboard/farmer/profile\` - Update personal and land details.
- **CHC Dashboard**: \`/dashboard/chc\` - Command center for CHCs to manage fleet and jobs.
- **CHC Services**: \`/dashboard/chc/services\` - Add new machinery and services.
- **CHC Drivers**: \`/dashboard/chc/drivers\` - Manage employed drivers.
- **Driver Dashboard**: \`/dashboard/driver\` - Drivers see their assigned trips here.
- **Driver Trips**: \`/dashboard/driver/trips\` - Active and completed jobs for the driver.
- **Login**: \`/login\`
- **Register**: \`/register\` (options for Farmer or CHC)

### How things work
- **Booking a Service**: A farmer logs in, goes to Bookings, browses available services from CHCs, and requests one for a specific date and area (acres).
- **Fulfilling a Job**: The CHC sees the requested booking, assigns a driver and a vehicle to it, and updates the status to ASSIGNED.
- **Trip Lifecycle**: The Driver starts the trip, arrives, works, and completes it.
- **Invoicing**: Once completed, the final price is calculated (Area * Price per acre) + Base Driver Pay.

If the user asks how to do something, explain the flow and tell them exactly which route/URL to go to.
Do not hallucinate tools or functions. You do not have database access. You are a conversational guide.
Always be polite, concise, and helpful. Use emojis occasionally.
`;

export default function ChatAssistant() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && status !== "loading") {
      const userStr = session?.user
        ? `\n\n### Current User Context\nYou are currently talking to ${(session.user as any).name || 'a user'}, who is logged in with the role of ${(session.user as any).role || 'user'}. Greet them by name and tailor your answers for their role.`
        : `\n\n### Current User Context\nThe user is not logged in. Encourage them to log in or register if they ask about booking or managing services.`;

      setMessages([
        { role: "system", content: SYSTEM_PROMPT + userStr },
        {
          role: "assistant", content: session?.user?.name
            ? `Hello ${(session.user as any).name}! I'm the Agriconnect Guide. I see you're logged in as a ${(session.user as any).role}. How can I help you today?`
            : "Hello! I'm the Agriconnect Guide. I know everything about how the platform works and where to find features. Ask me anything!"
        }
      ]);
    }
  }, [messages.length, session, status]);

  const callAI = async (currentMessages: any[]) => {
    setIsLoading(true);
    try {
      const res = await chatWithAI(currentMessages);

      if (res.error) {
        setMessages([...currentMessages, { role: "assistant", content: `Error: ${res.error}` }]);
      } else if (res.content) {
        setMessages([...currentMessages, { role: "assistant", content: res.content }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into an error processing that request." }]);
    }
    setIsLoading(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMsgs = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMsgs);
    setInput("");

    await callAI(newMsgs);
  };

  return (
    <div className="flex-1 w-full bg-slate-50 flex flex-col overflow-hidden min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.filter(m => m.role !== 'system').map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mb-1">
                  <span className="text-brand-600 font-bold text-xs">AI</span>
                </div>
              )}
              <div className={`max-w-[80%] break-words overflow-hidden rounded-2xl px-5 py-3 text-sm ${m.role === 'user' ? 'bg-brand-600 text-white rounded-br-sm shadow-md' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm leading-relaxed'}`}>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" />,
                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 mb-2 space-y-1" />,
                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 mb-2 space-y-1" />,
                    li: ({ node, ...props }) => <li {...props} className="" />,
                    strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-slate-900" />,
                    code: ({ node, ...props }) => <code {...props} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono" />
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="max-w-3xl mx-auto mt-6 flex justify-start">
            <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0 w-full">
        <div className="max-w-3xl mx-auto">
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {["How do I book a tractor?", "Where can I view my trips?", "How does pricing work?", "I need to update my profile."].map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(sugg)}
                  className="text-xs font-medium bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-full border border-brand-200 transition"
                >
                  {sugg}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Agriconnect routes, features, or how-to's..."
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-brand-600 text-white px-5 py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition shadow-md flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
