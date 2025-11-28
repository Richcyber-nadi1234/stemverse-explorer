import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  async chat(@Body() body: { text: string; fast?: boolean; systemInstruction?: string }) {
    const { text, fast, systemInstruction } = body || {};
    if (!text) throw new BadRequestException('text is required');
    const modelName = fast ? 'gemini-flash-lite-latest' : 'gemini-3-pro-preview';
    const result = await this.ai.generateText(modelName, text, systemInstruction);
    return { text: result };
  }

  @Post('outline')
  async outline(@Body() body: { topic: string; moduleCount?: number; audience?: string; objectives?: string; additionalContext?: string }) {
    if (!body?.topic) throw new BadRequestException('topic is required');
    const data = await this.ai.generateOutline(body);
    return { outline: data };
  }

  @Post('quiz')
  async quiz(@Body() body: { topic: string; quizCount?: number; audience?: string; quizDifficulty?: string }) {
    if (!body?.topic) throw new BadRequestException('topic is required');
    const data = await this.ai.generateQuiz(body);
    return { quiz: data };
  }

  @Post('grade')
  async grade(@Body() body: { question: string; submission: string; maxMarks: number }) {
    const { question, submission, maxMarks } = body || {};
    if (!question || !submission || !maxMarks) throw new BadRequestException('question, submission and maxMarks are required');
    const result = await this.ai.generateGradingFeedback(question, submission, maxMarks);
    return result;
  }

  @Post('image-edit')
  async imageEdit(@Body() body: { imageBase64: string; imageMimeType: string; prompt: string }) {
    const { imageBase64, imageMimeType, prompt } = body || {};
    if (!imageBase64 || !imageMimeType || !prompt) throw new BadRequestException('imageBase64, imageMimeType and prompt are required');
    const edited = await this.ai.editImage(imageBase64, imageMimeType, prompt);
    return { imageBase64: edited };
  }

  @Post('video-analysis')
  async videoAnalysis(@Body() body: { videoBase64: string; mimeType: string }) {
    const { videoBase64, mimeType } = body || {};
    if (!videoBase64 || !mimeType) throw new BadRequestException('videoBase64 and mimeType are required');
    const text = await this.ai.analyzeVideo(videoBase64, mimeType);
    return { text };
  }

  @Post('video')
  async generateVideo(@Body() body: { prompt?: string; imageBase64?: string; imageMimeType?: string; resolution?: '720p'|'1080p'; aspectRatio?: '16:9'|'9:16'|'1:1' }) {
    const result = await this.ai.generateVideo(body);
    return { uri: result };
  }

  @Post('transcribe')
  async transcribe(@Body() body: { audioBase64: string; mimeType: string }) {
    const { audioBase64, mimeType } = body || {};
    if (!audioBase64 || !mimeType) throw new BadRequestException('audioBase64 and mimeType are required');
    const text = await this.ai.transcribeAudio(audioBase64, mimeType);
    return { text };
  }

  @Post('tts')
  async tts(@Body() body: { text: string }) {
    const { text } = body || {};
    if (!text) throw new BadRequestException('text is required');
    const audioBase64 = await this.ai.textToSpeech(text);
    return { audioBase64 };
  }
}