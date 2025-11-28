import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.warn('GOOGLE_API_KEY not set. AI features will fail.');
    }
    this.client = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });
  }

  /**
   * Generates grading feedback for an essay or code submission.
   */
  async generateGradingFeedback(question: string, studentAnswer: string, maxMarks: number) {
    try {
      const model = 'gemini-3-pro-preview';
      const prompt = `
        You are a strict but fair teacher grading a student submission.
        
        Question: "${question}"
        Max Marks: ${maxMarks}
        
        Student Answer:
        """
        ${studentAnswer}
        """
        
        Analyze the answer for accuracy, completeness, and clarity.
        Return a JSON object with:
        - suggestedScore: number (out of ${maxMarks})
        - positiveFeedback: string (what they did well)
        - improvementAreas: string (constructive criticism)
      `;

      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedScore: { type: Type.NUMBER },
              positiveFeedback: { type: Type.STRING },
              improvementAreas: { type: Type.STRING },
            },
          },
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      this.logger.error('Error generating grading feedback', error);
      throw error;
    }
  }

  /**
   * Generates quiz questions based on a topic.
   */
  async generateQuizLegacy(topic: string, count: number = 5, difficulty: string = 'Medium') {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Generate ${count} multiple choice questions about "${topic}". Difficulty: ${difficulty}.`;

      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
              },
            },
          },
        },
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      this.logger.error('Error generating quiz', error);
      throw error;
    }
  }

  /**
   * Generates course lesson content.
   */
  async generateLessonContent(topic: string, audience: string) {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Write a comprehensive lesson module about "${topic}" tailored for ${audience}. Include headings, bullet points, and a summary.`;

      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
      });

      return { content: response.text };
    } catch (error) {
      this.logger.error('Error generating lesson content', error);
      throw error;
    }
  }

  async generateText(modelName: string, text: string, systemInstruction?: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: modelName,
      contents: { parts: [{ text }] },
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text || '';
  }

  async generateOutline(body: { topic: string; moduleCount?: number; audience?: string; objectives?: string; additionalContext?: string }): Promise<Array<{ title: string; description: string }>> {
    const {
      topic,
      moduleCount = 5,
      audience = 'beginner',
      objectives = '',
      additionalContext = '',
    } = body;
    const prompt = `Create a structured course outline with approximately ${moduleCount} modules about "${topic}".
Target Audience: ${audience}.
Learning Objectives: ${objectives}.
Additional Context/Requirements: ${additionalContext}.
Ensure the flow is logical and cumulative.
Return a JSON array of modules. For each module provide a 'title' and a brief content 'description'.`;
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  }

  async generateQuiz(body: { topic: string; quizCount?: number; audience?: string; quizDifficulty?: string }): Promise<any[]> {
    const { topic, quizCount = 5, audience = 'beginner', quizDifficulty = 'medium' } = body;
    const prompt = `Generate ${quizCount} quiz questions about ${topic} for ${audience}. Difficulty: ${quizDifficulty}.`;
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
            },
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  }

  async editImage(imageBase64: string, imageMimeType: string, prompt: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: imageMimeType } },
          { text: prompt },
        ],
      },
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts as any[]) {
      if (part.inlineData?.data) {
        return part.inlineData.data as string;
      }
    }
    // Fallback: return text message encoded as base64 image? Better return an error.
    throw new Error(response.text || 'No image generated');
  }

  async analyzeVideo(videoBase64: string, mimeType: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: videoBase64 } },
          { text: 'Analyze this video. Provide: 1) Summary, 2) Key learning points, 3) An Edit Decision List (EDL) with timestamps.' },
        ],
      },
    });
    return response.text || 'No analysis generated.';
  }

  async generateVideo(opts: { prompt?: string; imageBase64?: string; imageMimeType?: string; resolution?: '720p'|'1080p'; aspectRatio?: '16:9'|'9:16'|'1:1' }): Promise<string | null> {
    const { prompt = 'A stunning educational video', imageBase64, imageMimeType, resolution = '720p', aspectRatio = '16:9' } = opts || {};
    let operation = await this.client.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: imageBase64 ? { imageBytes: imageBase64, mimeType: imageMimeType! } : undefined,
      config: { numberOfVideos: 1, resolution, aspectRatio },
    });
    const maxPolls = 30;
    let polls = 0;
    while (!operation.done && polls < maxPolls) {
      await new Promise(r => setTimeout(r, 5000));
      operation = await this.client.operations.getVideosOperation({ operation });
      polls++;
    }
    const uri = (operation as any).response?.generatedVideos?.[0]?.video?.uri || null;
    return uri;
  }

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: 'Transcribe this audio exactly as spoken.' },
        ],
      },
    });
    return response.text || '';
  }

  async textToSpeech(text: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = (response.candidates?.[0]?.content?.parts?.[0] as any)?.inlineData?.data;
    if (!base64Audio) throw new Error('No audio generated');
    return base64Audio as string;
  }
}