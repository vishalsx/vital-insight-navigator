
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";

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
      // Call AI service
      const response = await fetch('/api/symptom-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Add AI response
      addMessage(data.response, 'ai');
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
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('message', text);
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch('/api/symptom-analysis-with-files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process files');
      }

      const data = await response.json();
      
      // Add AI response
      addMessage(data.response, 'ai');
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
