import { z } from "zod";

export const ReplicateModelSchema = z.object({
	version: z.string(),
	input: z.record(z.any()),
	output: z.any(),
	error: z.string().nullable(),
	status: z.enum(['starting', 'processing', 'succeeded', 'failed']),
	urls: z.object({
		get: z.string(),
		cancel: z.string()
	})
});

export const ReplicateInputSchema = z.object({
	modelVersion: z.string(),
	input: z.record(z.any())
});

export type ReplicateModel = z.infer<typeof ReplicateModelSchema>;
export type ReplicateInput = z.infer<typeof ReplicateInputSchema>;

// Common model versions
export const REPLICATE_MODELS = {
	stableDiffusion: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
	imageToVideo: 'stability-ai/stable-video-diffusion:3d5b40c5b7ded2086a836d34c2783aa0c87e325946488859bc7b8f22d1851883',
	videoUpscale: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b'
} as const;