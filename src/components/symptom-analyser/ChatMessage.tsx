
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, User, FileText } from "lucide-react";
import { Message } from "./ChatInterface";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary">
          <AvatarFallback>
            <Brain className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-1' : ''}`}>
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-primary text-white'
              : 'bg-white border shadow-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isUser ? 'bg-primary-foreground/10' : 'bg-gray-50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs truncate">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 bg-gray-200">
          <AvatarFallback>
            <User className="h-4 w-4 text-gray-600" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
