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
  async generateQuiz(topic: string, count: number = 5, difficulty: string = 'Medium') {
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
}