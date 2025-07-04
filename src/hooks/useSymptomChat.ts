
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/symptom-analyser/ChatInterface";
import { extractTextFromPDF } from "@/utils/pdfParser";

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

        if (nextQuestion <= 6) {
          // Build conversation history for context
          const conversationHistory = [
            `Initial symptoms: "${conversationState.userSymptoms}"`,
            ...newAnswers.map((answer, index) => `Question ${index + 1} answer: ${answer}`)
          ].join('\n');

          systemPrompt = `You are a medical symptom analyzer conducting a structured interview. Based on the conversation so far, ask the most appropriate next question to better understand the patient's condition.

Conversation history:
${conversationHistory}

Guidelines for the next question:
- Ask only ONE specific question
- Keep it conversational and empathetic
- Focus on gathering medically relevant information
- Consider common areas like: severity/intensity, duration, associated symptoms, triggers, medical history, medications, or other relevant factors
- Choose the most logical next question based on what you already know
- Avoid repeating information already gathered

Ask your next question now:`;
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

      // Process each file with proper parsing
      const fileContents = await Promise.all(
        files.map(async (file) => {
          try {
            if (file.type === 'application/pdf') {
              // Parse PDF using the utility function
              console.log('Processing PDF file:', file.name);
              const extractedText = await extractTextFromPDF(file);
              console.log('PDF extraction successful for', file.name, '- extracted text length:', extractedText.length);
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

      // Create comprehensive prompt for medical document analysis
      const systemPrompt = `You are a helpful medical document analysis assistant. A user has uploaded medical documents and wants you to analyze them.

Please analyze the uploaded medical documents and provide insights in a conversational manner. Look for:

- Patient information and demographics
- Medical history and current conditions  
- Test results, lab values, and vital signs
- Medications and treatments
- Doctor's notes and recommendations
- Any concerning findings or abnormal values

Provide your analysis in a clear, conversational format that includes:
1. A summary of what type of document(s) were uploaded
2. Key medical findings from the documents
3. Any notable test results or values
4. Recommendations for follow-up care if appropriate
5. Important points the patient should discuss with their healthcare provider

Always remind the user that this analysis is for informational purposes only and they should consult with their healthcare provider for medical advice.

If you cannot extract meaningful medical information from the documents, explain what you found instead and suggest the user try uploading clearer documents or describe their symptoms directly.

UPLOADED FILES:
${fileContents.map(file => `File: ${file.name}\nType: ${file.type}\nContent: ${file.content.substring(0, 3000)}${file.content.length > 3000 ? '...' : ''}`).join('\n\n')}`;

      console.log('Sending request to Gemini with extracted file contents:', fileContents.map(f => ({ name: f.name, type: f.type, contentLength: f.content.length })));
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
