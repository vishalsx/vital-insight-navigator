
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";

const GEMINI_API_KEY = 'AIzaSyDw4VxnWXKWmRoydin_rm97gzov65G2Ncw';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
      console.log('Sending message to Gemini:', text);

      const systemPrompt = `You are a medical symptom analyzer. Your task is to:
1. Ask 5-8 relevant questions about the user's symptoms to gather more information
2. After getting answers, provide a preliminary assessment including:
   - Possible conditions
   - Recommended precautions
   - Suggested medical tests or consultations
3. Always remind users to consult with healthcare professionals for proper diagnosis

Current user message: ${text}

Please respond in a conversational, helpful manner.`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini response:', data);
      
      // Extract AI response from Gemini response
      let aiResponse = "I'm having trouble processing your request right now.";
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        aiResponse = data.candidates[0].content.parts[0].text;
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
      console.log('Processing files with Gemini');

      // For now, we'll process the text message and inform about file limitations
      const systemPrompt = `You are a medical symptom analyzer. The user has uploaded ${files.length} file(s) and provided this message: "${text}". 

Please acknowledge the file upload and explain that while you can see they've uploaded medical documents, you'll need them to describe the contents or key findings from those documents in text for you to provide the most accurate symptom analysis.

Your task is to:
1. Ask 5-8 relevant questions about their symptoms to gather more information
2. After getting answers, provide a preliminary assessment including:
   - Possible conditions
   - Recommended precautions
   - Suggested medical tests or consultations
3. Always remind users to consult with healthcare professionals for proper diagnosis

Please respond in a conversational, helpful manner.`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini file response:', data);
      
      // Extract AI response from Gemini response
      let aiResponse = "I've acknowledged your file upload but need more information to help you properly.";
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        aiResponse = data.candidates[0].content.parts[0].text;
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
