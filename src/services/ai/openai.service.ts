import OpenAI from 'openai';
import { 
	TextGenerationParams, 
	ImageGenerationParams, 
	VoiceGenerationParams,
	TextGenerationSchema,
	ImageGenerationSchema,
	VoiceGenerationSchema 
} from './types';

interface VisionAnalysisParams {
	imageUrl: string;
	prompt?: string;
	detail?: 'low' | 'high';
}
import { ServiceHandler, ServiceResponse, ServiceMetrics } from '../types';

export class OpenAIService {
	private client: OpenAI;
	private metrics: ServiceMetrics;

	constructor() {
		this.client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		this.metrics = {
			startTime: 0,
			endTime: 0,
		};
	}

	private startMetrics() {
		this.metrics.startTime = Date.now();
	}

	private endMetrics() {
		this.metrics.endTime = Date.now();
		this.metrics.processingTime = this.metrics.endTime - this.metrics.startTime;
	}

	public async generateText(params: TextGenerationParams): Promise<ServiceResponse<string>> {
		try {
			this.startMetrics();
			const completion = await this.client.chat.completions.create({
				messages: [{ role: 'user', content: params.prompt }],
				model: 'gpt-4-turbo-preview',
				max_tokens: params.maxTokens,
				temperature: params.temperature,
			});
			this.endMetrics();
			
			return {
				success: true,
				data: completion.choices[0]?.message?.content || '',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	public async generateImage(params: ImageGenerationParams): Promise<ServiceResponse<string>> {
		try {
			this.startMetrics();
			const response = await this.client.images.generate({
				prompt: params.prompt,
				model: "dall-e-3",
				size: params.size || "1024x1024",
				quality: params.quality || "standard",
				style: params.style || "vivid",
			});
			this.endMetrics();

			return {
				success: true,
				data: response.data[0]?.url || '',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	public async generateVoice(params: VoiceGenerationParams): Promise<ServiceResponse<ArrayBuffer>> {
		try {
			this.startMetrics();
			const response = await this.client.audio.speech.create({
				model: params.model || "tts-1",
				voice: params.voice,
				input: params.text,
			});
			this.endMetrics();

			const buffer = await response.arrayBuffer();
			return {
				success: true,
				data: buffer,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	public getMetrics(): ServiceMetrics {
		return this.metrics;
	}

	public async analyzeImage(params: VisionAnalysisParams): Promise<ServiceResponse<string>> {
		try {
			this.startMetrics();
			const completion = await this.client.chat.completions.create({
				model: "gpt-4-vision-preview",
				messages: [
					{
						role: "user",
						content: [
							{ type: "text", text: params.prompt || "Analyze this image in detail." },
							{
								type: "image_url",
								image_url: params.imageUrl,
							},
						],
					},
				],
				max_tokens: 500,
			});
			this.endMetrics();
			
			return {
				success: true,
				data: completion.choices[0]?.message?.content || '',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	public async analyzeVideoFrames(frames: string[]): Promise<ServiceResponse<string[]>> {
		try {
			this.startMetrics();
			const analyses = await Promise.all(
				frames.map(frame => 
					this.analyzeImage({
						imageUrl: frame,
						prompt: "Analyze this video frame, focusing on key actions, subjects, and composition."
					})
				)
			);
			this.endMetrics();
			
			return {
				success: true,
				data: analyses.map(analysis => analysis.data || '').filter(Boolean),
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}
}