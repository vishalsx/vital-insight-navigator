
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const GEMINI_API_KEY = 'AIzaSyDw4VxnWXKWmRoydin_rm97gzov65G2Ncw';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export function useSymptomChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState({
    currentQuestion: 0,
    answers: [] as string[],
    userSymptoms: '',
    isComplete: false
  });
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

      let systemPrompt = '';
      
      // Determine what stage of conversation we're in
      if (conversationState.currentQuestion === 0) {
        // First interaction - store symptoms and ask first question
        setConversationState(prev => ({
          ...prev,
          userSymptoms: text,
          currentQuestion: 1
        }));
        
        systemPrompt = `You are a medical symptom analyzer. The user has described their symptoms: "${text}"

Please respond with empathy and ask ONLY the first question to understand their condition better. Ask about the location of their symptoms.

Keep your response conversational and ask only ONE question. Do not list multiple questions.`;

      } else if (conversationState.currentQuestion <= 6 && !conversationState.isComplete) {
        // Store the answer and ask next question
        const newAnswers = [...conversationState.answers, text];
        const nextQuestion = conversationState.currentQuestion + 1;
        
        setConversationState(prev => ({
          ...prev,
          answers: newAnswers,
          currentQuestion: nextQuestion
        }));

        const questions = [
          "the intensity/severity of the pain or discomfort on a scale of 1-10",
          "how long you've been experiencing these symptoms",
          "any other symptoms you're experiencing alongside the main symptom",
          "any recent triggers, stress, or changes in your routine",
          "if you've experienced similar symptoms before and how often",
          "any medications you're currently taking or recent changes to them"
        ];

        if (nextQuestion <= 6) {
          systemPrompt = `The user has been describing their symptoms. Their initial symptoms were: "${conversationState.userSymptoms}"

Their previous answers: ${newAnswers.join(', ')}

Now ask them about ${questions[nextQuestion - 2]}. Keep it conversational and ask only ONE question.`;
        } else {
          // Time to provide assessment
          setConversationState(prev => ({ ...prev, isComplete: true }));
          
          systemPrompt = `Based on the user's symptoms and answers, provide a comprehensive assessment:

Initial symptoms: "${conversationState.userSymptoms}"
Answers provided: ${newAnswers.join(', ')}

Please provide:
1. Possible conditions (mention these are preliminary assessments only)
2. Immediate precautions they should take
3. Recommended medical tests or specialist consultations
4. When to seek immediate medical attention

Always emphasize that this is not a medical diagnosis and they should consult with healthcare professionals for proper evaluation and treatment.`;
        }
      } else {
        // Conversation complete - general follow-up
        systemPrompt = `The symptom analysis conversation is complete. The user is asking: "${text}"

Respond helpfully while reminding them that for any new symptoms or concerns, they should consult with healthcare professionals. If they want to start a new symptom analysis, let them know they can describe new symptoms.`;
      }

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

      // Helper function to parse PDF files
      const parsePDFFile = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          extractedText += pageText + '\n';
        }
        
        return extractedText;
      };

      // Process each file with proper parsing
      const fileContents = await Promise.all(
        files.map(async (file) => {
          try {
            if (file.type === 'application/pdf') {
              // Parse PDF using PDF.js
              const extractedText = await parsePDFFile(file);
              return {
                name: file.name,
                content: extractedText,
                type: file.type,
                parsed: true
              };
            } else {
              // Handle other file types
              return new Promise<{name: string, content: string, type: string, parsed: boolean}>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    resolve({
                      name: file.name,
                      content: reader.result,
                      type: file.type,
                      parsed: false
                    });
                  } else {
                    reject(new Error('Failed to read file as text'));
                  }
                };
                reader.onerror = () => reject(reader.error);
                
                // Read as text for most document types, base64 for images
                if (file.type.startsWith('image/')) {
                  reader.readAsDataURL(file);
                } else {
                  reader.readAsText(file);
                }
              });
            }
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            return {
              name: file.name,
              content: `Error processing file: ${error.message}`,
              type: file.type,
              parsed: false
            };
          }
        })
      );

      // Create comprehensive prompt for CBC analysis
      const systemPrompt = `You are an expert medical document analyzer specializing in Complete Blood Count (CBC) reports. 

UPLOADED FILES:
${fileContents.map(file => `File: ${file.name}\nType: ${file.type}\nContent: ${file.content.substring(0, 2000)}${file.content.length > 2000 ? '...' : ''}`).join('\n\n')}

INSTRUCTIONS:
1. FIRST, determine if any of these documents are CBC (Complete Blood Count) reports
2. If CBC report found:
   - Extract ALL medical markers and their values
   - Analyze each marker against normal ranges
   - Identify any abnormal values and their clinical significance
   - Provide comprehensive analysis including:
     * DIAGNOSIS: Based on the CBC findings
     * POTENTIAL MEDICATION: Suggested treatments (mention these are preliminary suggestions)
     * PRECAUTIONS: Important precautions to take
     * LIFESTYLE CHANGES: Recommended lifestyle modifications
     * PREVENTION: Preventive measures for the future

3. If NOT a CBC report:
   - Explain what type of document it appears to be
   - Suggest they upload a CBC report for blood analysis
   - If it's another medical document, provide general guidance

4. ALWAYS emphasize:
   - These are preliminary assessments only
   - Must consult with healthcare professionals for proper diagnosis
   - Do not self-medicate based on this analysis

Please provide a detailed, structured response.`;

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
      console.log('Gemini file analysis response:', data);
      
      // Extract AI response from Gemini response
      let aiResponse = "I've processed your uploaded documents but encountered an issue with the analysis.";
      
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
        "I'm having trouble processing your uploaded documents. Please try uploading them again or describe your symptoms in text.",
        'ai'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationState({
      currentQuestion: 0,
      answers: [],
      userSymptoms: '',
      isComplete: false
    });
  };

  return {
    messages,
    isLoading,
    isConversationComplete: conversationState.isComplete,
    sendMessage,
    sendMessageWithFiles,
    resetConversation,
  };
}
