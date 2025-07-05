
import ChatInterface from "@/components/symptom-analyser/ChatInterface";
import ChatHeader from "@/components/symptom-analyser/ChatHeader";

export default function SymptomAnalyser() {
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <ChatHeader />
      <ChatInterface />
    </div>
  );
}
