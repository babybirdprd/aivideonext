import { OpenAI } from 'openai';
import { ServiceResponse, ServiceMetrics } from '../types';

export interface StyleTransferParams {
	sourceUrl: string;
	style: string;
	strength?: number; // 0-1, controls how strongly to apply the style
	preserveContent?: boolean; // whether to prioritize content preservation
}

export interface StyleTransferResult {
	resultUrl: string;
	style: string;
	processingStats: {
		duration: number;
		modelUsed: string;
		success: boolean;
	};
}

export class StyleTransferService {
	private client: OpenAI;
	private metrics: ServiceMetrics;

	constructor() {
		this.client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		this.metrics = {
			startTime: 0,
			endTime: 0,
			processingTime: 0,
		};
	}

	private startMetrics() {
		this.metrics.startTime = Date.now();
	}

	private endMetrics() {
		this.metrics.endTime = Date.now();
		this.metrics.processingTime = this.metrics.endTime - this.metrics.startTime;
	}

	private buildStylePrompt(params: StyleTransferParams): string {
		const preserveContent = params.preserveContent ? 'while maintaining the original content and composition' : '';
		const strength = params.strength ? `with ${Math.round(params.strength * 100)}% style intensity` : '';
		
		return `Transform this image in the style of ${params.style} ${strength} ${preserveContent}. 
						Maintain high quality and ensure smooth style integration.`;
	}

	public async transferStyle(params: StyleTransferParams): Promise<ServiceResponse<StyleTransferResult>> {
		try {
			this.startMetrics();
			
			const response = await this.client.images.edit({
				image: await fetch(params.sourceUrl).then(r => r.blob()),
				prompt: this.buildStylePrompt(params),
				model: "dall-e-3",
				size: "1024x1024",
				quality: "hd",
			});

			this.endMetrics();

			return {
				success: true,
				data: {
					resultUrl: response.data[0]?.url || params.sourceUrl,
					style: params.style,
					processingStats: {
						duration: this.metrics.processingTime,
						modelUsed: 'dall-e-3',
						success: true,
					},
				},
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
}