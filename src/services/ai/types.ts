import { z } from "zod";

export const TextGenerationSchema = z.object({
	prompt: z.string(),
	maxTokens: z.number().optional(),
	temperature: z.number().min(0).max(2).optional(),
});

export const ImageGenerationSchema = z.object({
	prompt: z.string(),
	size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
	quality: z.enum(['standard', 'hd']).optional(),
	style: z.enum(['vivid', 'natural']).optional(),
});

export const VoiceGenerationSchema = z.object({
	text: z.string(),
	voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']),
	model: z.enum(['tts-1', 'tts-1-hd']).optional(),
});

export type TextGenerationParams = z.infer<typeof TextGenerationSchema>;
export type ImageGenerationParams = z.infer<typeof ImageGenerationSchema>;
export type VoiceGenerationParams = z.infer<typeof VoiceGenerationSchema>;

export const TrendAnalysisSchema = z.object({
	topic: z.string(),
	platform: z.enum(['youtube', 'tiktok', 'instagram']),
	timeframe: z.enum(['day', 'week', 'month']).optional(),
	limit: z.number().min(1).max(50).optional(),
});

export const TrendResultSchema = z.object({
	keywords: z.array(z.string()),
	topics: z.array(z.object({
		title: z.string(),
		score: z.number(),
		engagement: z.number(),
	})),
	recommendations: z.array(z.string()),
	metadata: z.object({
		platform: z.enum(['youtube', 'tiktok', 'instagram']),
		timestamp: z.string(),
		confidence: z.number(),
	}),
});

export type TrendAnalysisParams = z.infer<typeof TrendAnalysisSchema>;
export type TrendResult = z.infer<typeof TrendResultSchema>;

export const AssetEnhancementSchema = z.object({
	assetUrl: z.string().url(),
	assetType: z.enum(['image', 'video', 'audio']),
	enhancements: z.array(z.enum([
		'upscale',
		'denoise',
		'colorCorrection',
		'stabilization',
		'styleTransfer',
		'backgroundRemoval'
	])),
	targetQuality: z.enum(['standard', 'high', 'ultra']).optional(),
	stylePreset: z.string().optional(),
});

export const EnhancementResultSchema = z.object({
	enhancedUrl: z.string().url(),
	processedEnhancements: z.array(z.string()),
	quality: z.object({
		resolution: z.string(),
		bitrate: z.number().optional(),
		format: z.string(),
	}),
	processingStats: z.object({
		duration: z.number(),
		modelUsed: z.string(),
		success: z.boolean(),
	}),
});

export const StyleTransferSchema = z.object({
	sourceUrl: z.string().url(),
	style: z.string(),
	strength: z.number().min(0).max(1).optional(),
	preserveContent: z.boolean().optional(),
});

export const StyleTransferResultSchema = z.object({
	resultUrl: z.string().url(),
	style: z.string(),
	processingStats: z.object({
		duration: z.number(),
		modelUsed: z.string(),
		success: z.boolean(),
	}),
});

export type AssetEnhancementParams = z.infer<typeof AssetEnhancementSchema>;
export type EnhancementResult = z.infer<typeof EnhancementResultSchema>;
export type StyleTransferParams = z.infer<typeof StyleTransferSchema>;
export type StyleTransferResult = z.infer<typeof StyleTransferResultSchema>;