
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/4944170f-cdbf-4b36-8cfe-60175c8e869b";

export function useSymptomChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = (text: string, sender: 'user' | 'ai', attachments?: File[]) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender,
      timestamp: new Date(),
      attachments,
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (text: string) => {
    // Add user message
    addMessage(text, 'user');
    setIsLoading(true);

    try {
      // Call n8n webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          type: 'symptom_analysis'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Add AI response - handle different possible response formats
      const aiResponse = data.response || data.message || data.text || "I've analyzed your symptoms but couldn't provide a response.";
      addMessage(aiResponse, 'ai');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      addMessage(
        "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        'ai'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageWithFiles = async (text: string, files: File[]) => {
    // Add user message with files
    addMessage(text, 'user', files);
    setIsLoading(true);

    try {
      // Prepare form data for file upload to n8n
      const formData = new FormData();
      formData.append('message', text);
      formData.append('type', 'symptom_analysis_with_files');
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process files');
      }

      const data = await response.json();
      
      // Add AI response - handle different possible response formats
      const aiResponse = data.response || data.message || data.text || "I've processed your files but couldn't provide a response.";
      addMessage(aiResponse, 'ai');
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Error",
        description: "Failed to process uploaded files. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      addMessage(
        "I'm having trouble processing your uploaded files. Please try uploading them again or describe your symptoms in text.",
        'ai'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    sendMessageWithFiles,
  };
}
