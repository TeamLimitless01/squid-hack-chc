import ChatAssistant from "@/components/ai/ChatAssistant";
import Navbar from "@/components/navbar/Navbar";

export const metadata = {
  title: "Agriconnect AI Assistant",
  description: "Learn about the Agriconnect platform, routes, and features with our AI Assistant.",
};

export default function AgriconnectAIPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f8f3]">
      <Navbar />
      <main className="flex-1 flex flex-col pt-[72px] w-full min-h-0">
        <ChatAssistant />
      </main>
    </div>
  );
}
