
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/4944170f-cdbf-4b36-8cfe-60175c8e869b";

type ConversationHistory = {
  role: 'user' | 'bot';
  content: string;
}[];

export function useSymptomChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory>([]);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
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

  const updateConversationHistory = (userMessage: string, botResponse: string) => {
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'bot', content: botResponse }
    ]);
  };

  const sendMessage = async (text: string) => {
    // Don't allow new messages after conversation is complete
    if (isConversationComplete) {
      toast({
        title: "Conversation Complete",
        description: "The symptom analysis is complete. Start a new session for additional questions.",
        variant: "default",
      });
      return;
    }

    // Add user message
    addMessage(text, 'user');
    setIsLoading(true);

    try {
      // Prepare payload with conversation history
      const payload = {
        sessionId,
        message: text,
        history: conversationHistory
      };

      console.log('Sending payload to n8n:', payload);

      // Call n8n webhook with conversation history
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
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
      
      console.log('N8N Response:', data);
      
      // Handle the new response format with isFinal flag
      let aiResponse = "I'm having trouble processing your request right now.";
      let isFinalResponse = false;
      
      // Check for the new response format
      if (data.message && typeof data.isFinal === 'boolean') {
        aiResponse = data.message;
        isFinalResponse = data.isFinal;
      }
      // Fallback to old format for backward compatibility
      else if (Array.isArray(data) && data.length > 0 && data[0].output) {
        aiResponse = data[0].output;
      } else if (data.output) {
        aiResponse = data.output;
      } else if (data.response || data.text) {
        aiResponse = data.response || data.text;
      }
      
      // Add AI response to messages
      addMessage(aiResponse, 'ai');
      
      // Update conversation history
      updateConversationHistory(text, aiResponse);
      
      // Check if this is the final response
      if (isFinalResponse) {
        setIsConversationComplete(true);
        console.log('Conversation completed with final response');
      }
      
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
    // Don't allow file uploads after conversation is complete
    if (isConversationComplete) {
      toast({
        title: "Conversation Complete", 
        description: "The symptom analysis is complete. Start a new session for additional questions.",
        variant: "default",
      });
      return;
    }

    // Add user message with files
    addMessage(text, 'user', files);
    setIsLoading(true);

    try {
      // Prepare form data for file upload to n8n
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('message', text);
      formData.append('history', JSON.stringify(conversationHistory));
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      console.log('Sending file payload to n8n with session:', sessionId);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
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
      
      console.log('N8N File Response:', data);
      
      // Handle the response format for file uploads
      let aiResponse = "I've processed your files but couldn't provide a response.";
      let isFinalResponse = false;
      
      // Check for the new response format
      if (data.message && typeof data.isFinal === 'boolean') {
        aiResponse = data.message;
        isFinalResponse = data.isFinal;
      }
      // Fallback to old format for backward compatibility
      else if (Array.isArray(data) && data.length > 0 && data[0].output) {
        aiResponse = data[0].output;
      } else if (data.output) {
        aiResponse = data.output;
      } else if (data.response || data.text) {
        aiResponse = data.response || data.text;
      }
      
      // Add AI response
      addMessage(aiResponse, 'ai');
      
      // Update conversation history
      updateConversationHistory(text, aiResponse);
      
      // Check if this is the final response
      if (isFinalResponse) {
        setIsConversationComplete(true);
        console.log('Conversation completed with final response from file upload');
      }
      
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
    setConversationHistory([]);
    setIsConversationComplete(false);
  };

  return {
    messages,
    isLoading,
    isConversationComplete,
    sendMessage,
    sendMessageWithFiles,
    resetConversation,
  };
}
