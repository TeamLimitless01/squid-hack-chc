"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Sparkles, Bot, User } from "lucide-react";
import { chatWithAI } from "@/app/actions/ai";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

export default function ChatAssistant() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0 && status !== "loading") {
      const userRole = (session?.user as any)?.role;
      const userName = session?.user?.name;

      let welcomeMsg = "Hello! I am the Agriconnect Intelligent AI Assistant. I can search live machinery services, check bookings, track trips, check fleet status, and provide expert farming advice. How can I help you today?";

      if (userName && userRole) {
        if (userRole === "farmer") {
          welcomeMsg = `Hello **${userName}**! 🌾 I am your Agriconnect Assistant. You can ask me to find cultivation & tractor services, check your booking statuses, or get crop advisory.`;
        } else if (userRole === "chc") {
          welcomeMsg = `Hello **${userName}**! 🚜 I am your CHC Command Assistant. Ask me to check today's received bookings, inspect pending requests, view equipment fleet, or check driver statuses.`;
        } else if (userRole === "driver") {
          welcomeMsg = `Hello **${userName}**! 🚛 I am your Driver Assistant. Ask me about your assigned trips today, pickup locations, or trip status updates.`;
        } else {
          welcomeMsg = `Hello **${userName}**! How can I assist you on Agriconnect today?`;
        }
      }

      setMessages([
        {
          role: "assistant",
          content: welcomeMsg,
        },
      ]);
    }
  }, [messages.length, session, status]);

  const getRoleSuggestions = () => {
    const role = (session?.user as any)?.role;
    if (role === "farmer") {
      return [
        "I am looking for cultivation services",
        "What is the status of my bookings?",
        "Find nearby tractor and rotavator services",
        "Best practices for wheat soil preparation",
      ];
    }
    if (role === "chc") {
      return [
        "What the booking I received today?",
        "Show pending booking requests",
        "What equipment is available in my fleet?",
        "How do I add a new agricultural service?",
      ];
    }
    if (role === "driver") {
      return [
        "What trips are assigned to me today?",
        "Show my upcoming trip schedule",
        "How do I mark a trip as arrived or completed?",
      ];
    }
    return [
      "I am looking for cultivation services",
      "How do I book a tractor on Agriconnect?",
      "What services are available on the platform?",
      "How can a CHC register and receive bookings?",
    ];
  };

  const callAI = async (currentMessages: any[]) => {
    setIsLoading(true);
    try {
      const res = await chatWithAI(currentMessages);

      if (res?.error) {
        setMessages([...currentMessages, { role: "assistant", content: `⚠️ **Error**: ${res.error}` }]);
      } else if (res?.content) {
        setMessages([...currentMessages, { role: "assistant", content: res.content }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into an issue connecting to the AI service. Please try again." },
      ]);
    }
    setIsLoading(false);
  };

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    e?.preventDefault();
    const textToSend = customInput !== undefined ? customInput : input;
    if (!textToSend.trim() || isLoading) return;

    const newMsgs = [...messages, { role: "user", content: textToSend.trim() }];
    setMessages(newMsgs);
    setInput("");

    await callAI(newMsgs);
  };

  return (
    <div className="flex-1 w-full bg-slate-50 flex flex-col overflow-hidden min-h-0">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Agriconnect AI Agent
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                LangGraph Powered
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time DB query tools • Live services • Instant booking insights • Crop advisory
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              } items-start gap-3`}
            >
              {m.role === "assistant" && (
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div
                className={`max-w-[85%] break-words overflow-hidden rounded-2xl px-5 py-4 text-sm ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-xs shadow-md"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-sm leading-relaxed"
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
                        target="_self"
                      />
                    ),
                    p: ({ node, ...props }) => <p {...props} className="mb-2.5 last:mb-0" />,
                    ul: ({ node, ...props }) => (
                      <ul {...props} className="list-disc pl-5 mb-2.5 space-y-1" />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol {...props} className="list-decimal pl-5 mb-2.5 space-y-1" />
                    ),
                    li: ({ node, ...props }) => <li {...props} className="leading-normal" />,
                    strong: ({ node, ...props }) => (
                      <strong {...props} className="font-bold text-slate-900" />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        {...props}
                        className="bg-slate-100 text-emerald-900 px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
                        <table {...props} className="w-full text-left border-collapse text-xs md:text-sm" />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead {...props} className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200" />
                    ),
                    th: ({ node, ...props }) => (
                      <th {...props} className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700" />
                    ),
                    td: ({ node, ...props }) => (
                      <td {...props} className="px-3 py-2 border-t border-slate-100 text-slate-700" />
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
              {m.role === "user" && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="max-w-4xl mx-auto flex justify-start items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-xs px-5 py-3.5 shadow-sm flex items-center gap-3 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="text-slate-500 font-medium">
                  Analyzing query & executing database tools...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {getRoleSuggestions().map((sugg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInput(sugg);
                  handleSend(undefined, sugg);
                }}
                disabled={isLoading}
                className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 transition active:scale-95 disabled:opacity-50"
              >
                {sugg}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => handleSend(e)} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything: 'Find cultivation services', 'What bookings received today', crop advice..."
              className="flex-1 rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition shadow-md flex items-center justify-center font-semibold active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
