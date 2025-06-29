
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, MicOff, Brain, RotateCcw } from "lucide-react";
import ChatMessage from "./ChatMessage";
import FileUpload from "./FileUpload";
import VoiceRecorder from "./VoiceRecorder";
import { useSymptomChat } from "@/hooks/useSymptomChat";

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: File[];
};

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isConversationComplete,
    sendMessage,
    sendMessageWithFiles,
    resetConversation
  } = useSymptomChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await sendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      await sendMessageWithFiles("I've uploaded some documents for analysis.", files);
      setShowFileUpload(false);
    }
  };

  const handleVoiceComplete = async (transcript: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript);
    }
    setIsRecording(false);
  };

  const handleResetConversation = () => {
    resetConversation();
    setMessage("");
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Welcome to Symptom Analyser</p>
            <p>Describe your symptoms, upload medical documents, or use voice input to get started</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-4 shadow-sm max-w-xs">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-500">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Complete Banner */}
        {isConversationComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Analysis Complete</span>
            </div>
            <p className="text-green-700 text-sm mb-3">
              Your symptom analysis is complete. You can start a new consultation if needed.
            </p>
            <Button 
              onClick={handleResetConversation}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Analysis
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}

      {/* Voice Recorder */}
      {isRecording && (
        <VoiceRecorder
          onComplete={handleVoiceComplete}
          onCancel={() => setIsRecording(false)}
        />
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFileUpload(true)}
            className="shrink-0"
            disabled={isConversationComplete}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRecording(!isRecording)}
            className={`shrink-0 ${isRecording ? 'bg-red-50 border-red-200' : ''}`}
            disabled={isConversationComplete}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <div className="flex-1 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConversationComplete 
                  ? "Analysis complete - start new session to continue" 
                  : "Describe your symptoms..."
              }
              className="flex-1"
              disabled={isLoading || isConversationComplete}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading || isConversationComplete}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
