
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MedicalReport, SOAPNote } from "../types";

// Using Gemini 3 Flash for near-instant responses
const MODEL_TRANSCRIPTION = 'gemini-3-flash-preview';
const MODEL_REASONING = 'gemini-3-flash-preview'; 
const MODEL_FAST = 'gemini-3-flash-preview';

export class GeminiService {
  private extractJson(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleaned = match[1].trim();
      }
    }
    return cleaned;
  }

  async analyzeConversation(transcription: string): Promise<MedicalReport> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    try {
      // Set thinkingBudget to 0 for maximum speed
      const response = await ai.models.generateContent({
        model: MODEL_REASONING,
        contents: `Analyze this clinical conversation and provide a JSON report.
        
        Conversation:
        ${transcription}
        
        Strict Constraints for Speed & Formatting:
        - summaryHeading: 1 line title.
        - detailedSummary: Max 5 sentences.
        - soap: Concise medical language for S, O, A, P.
        - keyInsights: Exactly 5 high-yield points.
        - evaluation: Brief performance score.
        - questionAnswers: Extract 6-8 key Q&A pairs such that the total text of this section is exactly 10-15 lines. Keep answers short and direct.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for speed
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patientId: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              summaryHeading: { type: Type.STRING },
              detailedSummary: { type: Type.STRING },
              soap: {
                type: Type.OBJECT,
                properties: {
                  subjective: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  assessment: { type: Type.STRING },
                  plan: { type: Type.STRING },
                },
                required: ["subjective", "objective", "assessment", "plan"]
              },
              keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
              questionAnswers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  }
                }
              },
              evaluation: {
                type: Type.OBJECT,
                properties: {
                  empathyScore: { type: Type.NUMBER },
                  professionalismScore: { type: Type.NUMBER },
                  clinicalAccuracyScore: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            required: ["summaryHeading", "detailedSummary", "soap", "keyInsights", "questionAnswers", "evaluation"]
          }
        }
      });

      const cleanedJson = this.extractJson(response.text || "{}");
      const report = JSON.parse(cleanedJson) as MedicalReport;
      report.fullTranscript = transcription;
      return report;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  async processAudioFile(base64Data: string, mimeType: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TRANSCRIPTION,
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: "Quickly transcribe this interaction. Use 'STUDENT:' and 'PATIENT:'." }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || "No transcription generated.";
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }

  async getQuickAdvice(query: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Brief medical assistant advice for student: ${query}`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "";
  }
}

export const geminiService = new GeminiService();
