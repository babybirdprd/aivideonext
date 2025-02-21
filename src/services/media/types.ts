import { z } from "zod";

export const VideoProcessingSchema = z.object({
	input: z.string(),
	output: z.string(),
	format: z.enum(['mp4', 'webm', 'mov']).optional(),
	resolution: z.enum(['720p', '1080p', '4k']).optional(),
	fps: z.number().min(24).max(60).optional(),
	quality: z.number().min(1).max(100).optional(),
});

export const AudioProcessingSchema = z.object({
	input: z.string(),
	output: z.string(),
	format: z.enum(['mp3', 'wav', 'aac']).optional(),
	bitrate: z.string().optional(),
	sampleRate: z.number().optional(),
});

export const RenderSettingsSchema = z.object({
	parallelProcessing: z.boolean().optional(),
	hardwareAcceleration: z.boolean().optional(),
	priorityLevel: z.enum(['low', 'medium', 'high']).optional(),
});

export type VideoProcessingParams = z.infer<typeof VideoProcessingSchema>;
export type AudioProcessingParams = z.infer<typeof AudioProcessingSchema>;
export type RenderSettings = z.infer<typeof RenderSettingsSchema>;