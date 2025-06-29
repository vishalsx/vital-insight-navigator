
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";

const CHAT_SERVICE_URL = "http://localhost:5678/webhook/1305c6bb-cfeb-45ce-91ef-6d6754c60c4f/chat";

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
      console.log('Sending message to chat service:', text);

      const response = await fetch(CHAT_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Chat service response:', data);
      
      // Extract AI response from the service response
      let aiResponse = "I'm having trouble processing your request right now.";
      
      if (data.response) {
        aiResponse = data.response;
      } else if (data.message) {
        aiResponse = data.message;
      } else if (data.text) {
        aiResponse = data.text;
      } else if (typeof data === 'string') {
        aiResponse = data;
      }
      
      // Add AI response to messages
      addMessage(aiResponse, 'ai');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error.message}`,
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

      console.log('Sending files to chat service');

      const response = await fetch(CHAT_SERVICE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw file response:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Chat service file response:', data);
      
      // Extract AI response from the service response
      let aiResponse = "I've processed your files but couldn't provide a response.";
      
      if (data.response) {
        aiResponse = data.response;
      } else if (data.message) {
        aiResponse = data.message;
      } else if (data.text) {
        aiResponse = data.text;
      } else if (typeof data === 'string') {
        aiResponse = data;
      }
      
      // Add AI response
      addMessage(aiResponse, 'ai');
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Error",
        description: `Failed to process uploaded files: ${error.message}`,
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

  const resetConversation = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    isConversationComplete: false,
    sendMessage,
    sendMessageWithFiles,
    resetConversation,
  };
}
