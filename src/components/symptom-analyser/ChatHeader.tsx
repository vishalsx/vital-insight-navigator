
import { Brain, FileText, Mic } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="bg-white border-b p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Symptom Analyser</h1>
          <p className="text-gray-600">Describe your symptoms and get AI-powered insights</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Upload documents</span>
        </div>
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          <span>Voice input</span>
        </div>
      </div>
    </div>
  );
}
