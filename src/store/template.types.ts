import { Block } from './types';
import { VideoFormat } from '@/types/video-format.types';
import { z } from 'zod';

export const TemplateValidationSchema = z.object({
	isValid: z.boolean(),
	errors: z.array(z.object({
		field: z.string(),
		message: z.string()
	}))
});

export const TemplateParameterSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(['text', 'number', 'color', 'select', 'media', 'style']),
	defaultValue: z.string().optional(),
	validation: z.object({
		required: z.boolean().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		pattern: z.string().optional(),
		styleStrength: z.number().min(0).max(1).optional(),
		preserveContent: z.boolean().optional(),
		stylePresets: z.array(z.object({
			name: z.string(),
			value: z.string()
		})).optional()
	}).optional(),
	stylePresets: z.array(z.object({
		name: z.string(),
		value: z.string()
	})).optional()
});

export const TemplateVersionSchema = z.object({
	version: z.string(),
	changes: z.array(z.object({
		type: z.enum(['added', 'modified', 'removed']),
		path: z.string(),
		description: z.string(),
	})),
	timestamp: z.date(),
});

export const TemplateInheritanceSchema = z.object({
	parentId: z.string(),
	overrides: z.array(z.object({
		path: z.string(),
		value: z.any(),
	})),
	inherited: z.array(z.string()),
});

export const BlockSchema = z.object({
	id: z.string(),
	type: z.string(),
	content: z.any(),
	duration: z.number(),
	position: z.object({
		start: z.number(),
		end: z.number()
	})
});

export const TemplateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	videoFormat: z.string(),
	formatSettings: z.object({
		fps: z.number().optional(),
		bitrate: z.string().optional(),
		maxDuration: z.number().optional()
	}).optional(),
	category: z.string(),
	blocks: z.array(BlockSchema),
	parameters: z.array(TemplateParameterSchema),
	version: z.string(),
	versionHistory: z.array(TemplateVersionSchema),
	inheritance: TemplateInheritanceSchema.optional(),
	created: z.date(),
	updated: z.date(),
	isPublished: z.boolean(),
	thumbnail: z.string().optional(),
	tags: z.array(z.string())
});

export type TemplateValidation = z.infer<typeof TemplateValidationSchema>;
export type TemplateParameter = z.infer<typeof TemplateParameterSchema>;
export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;
export type TemplateInheritance = z.infer<typeof TemplateInheritanceSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Block = z.infer<typeof BlockSchema>;

export interface TemplateState {
	templates: Template[];
	selectedTemplate: string | null;
	isLoading: boolean;
	error: string | null;
}