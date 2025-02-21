import { z } from "zod";

export interface RenderProgress {
	segment: number;
	totalSegments: number;
	segmentProgress: number;
	totalProgress: number;
}

// Effect Types
export const EffectTypeSchema = z.enum([
	'blur', 'brightness', 'contrast', 'saturation',
	'overlay', 'zoom', 'pan', 'rotate', 'fade',
	'style-transfer'
]);

export const EffectSchema = z.object({
	type: EffectTypeSchema,
	intensity: z.number().min(0).max(1),
	startTime: z.number(),
	duration: z.number(),
	params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
	properties: z.object({
		style: z.string().optional(),
		preserveContent: z.boolean().optional(),
		styledTexture: z.any().optional(), // HTMLImageElement can't be validated by zod
		intensity: z.number().min(0).max(1).optional()
	}).optional()
});

// Transition Types
export const TransitionTypeSchema = z.enum([
	'fade', 'dissolve', 'wipe', 'slide', 'zoom',
	'push', 'crossfade', 'swipe'
]);

export const TransitionDirectionSchema = z.enum([
	'left', 'right', 'up', 'down', 'center'
]);

export const TransitionSchema = z.object({
	type: TransitionTypeSchema,
	direction: TransitionDirectionSchema,
	duration: z.number(),
	smoothness: z.number().min(0).max(1)
});

export const VideoProcessingSchema = z.object({
	input: z.string(),
	output: z.string(),
	format: z.enum(['mp4', 'webm', 'mov']).optional(),
	resolution: z.enum(['720p', '1080p', '4k']).optional(),
	fps: z.number().min(24).max(60).optional(),
	quality: z.number().min(1).max(100).optional(),
	effects: z.array(EffectSchema).optional(),
	transition: TransitionSchema.optional()
});

export const AudioProcessingSchema = z.object({
	input: z.string(),
	output: z.string(),
	format: z.enum(['mp3', 'wav', 'aac']).optional(),
	bitrate: z.string().optional(),
	sampleRate: z.number().optional(),
});

export const VideoFormatPresetSchema = z.object({
	format: z.enum(['mp4', 'webm', 'mov', 'gif']),
	codec: z.enum(['h264', 'h265', 'vp9', 'av1']).optional(),
	quality: z.enum(['low', 'medium', 'high', 'ultra']),
	bitrateRange: z.object({
		min: z.number(),
		max: z.number()
	}),
	audioCodec: z.enum(['aac', 'opus', 'mp3']).optional(),
	audioBitrate: z.string().optional()
});

export const QualityPresetSchema = z.object({
	name: z.enum(['web', 'mobile', 'hd', '4k']),
	resolution: z.object({
		width: z.number(),
		height: z.number()
	}),
	fps: z.number(),
	videoBitrate: z.string(),
	audioBitrate: z.string(),
	twoPass: z.boolean()
});

export const RenderSettingsSchema = z.object({
	parallelProcessing: z.boolean().optional(),
	hardwareAcceleration: z.boolean().optional(),
	priorityLevel: z.enum(['low', 'medium', 'high']).optional(),
	format: VideoFormatPresetSchema.optional(),
	qualityPreset: QualityPresetSchema.optional(),
	twoPassEncoding: z.boolean().optional(),
	audioNormalization: z.boolean().optional(),
	denoising: z.boolean().optional()
});

// Type exports
export type EffectType = z.infer<typeof EffectTypeSchema>;
export type Effect = z.infer<typeof EffectSchema>;
export type TransitionType = z.infer<typeof TransitionTypeSchema>;
export type TransitionDirection = z.infer<typeof TransitionDirectionSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type VideoProcessingParams = z.infer<typeof VideoProcessingSchema>;
export type AudioProcessingParams = z.infer<typeof AudioProcessingSchema>;
export type RenderSettings = z.infer<typeof RenderSettingsSchema>;
export type VideoFormatPreset = z.infer<typeof VideoFormatPresetSchema>;
export type QualityPreset = z.infer<typeof QualityPresetSchema>;