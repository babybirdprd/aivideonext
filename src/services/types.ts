import { z } from "zod";

export interface ServiceHandler<T extends z.ZodType, R = any> {
	execute: (params: z.infer<T>) => Promise<R>;
	validate: (params: unknown) => z.infer<T>;
}

export interface ServiceResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface CostMetrics {
	tokens?: number;
	processingTime?: number;
	estimatedCost?: number;
}

export interface ServiceMetrics extends CostMetrics {
	startTime: number;
	endTime: number;
}

export type AIServiceAction = 'analyzeTrends' | 'enhanceAsset' | 'generateText' | 'generateImage' | 'generateVoice';

export interface AIServiceRequest {
    action: AIServiceAction;
    params: unknown;
}

export interface AIServiceConfig {
    apiKey: string;
    modelVersion?: string;
    temperature?: number;
    maxRetries?: number;
}

export interface AIProcessingMetrics extends ServiceMetrics {
    modelName: string;
    tokensUsed?: number;
    promptTokens?: number;
    completionTokens?: number;
}

export interface AIServiceError {
    code: string;
    message: string;
    details?: unknown;
}