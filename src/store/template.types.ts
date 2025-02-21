import { Block } from './types';
import { VideoFormatId } from '@/types/video.types';
import { z } from 'zod';

export const TemplateParameterSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(['text', 'number', 'color', 'select', 'media', 'style']),
	defaultValue: z.any(),
	options: z.array(z.string()).optional(),
	validation: z.object({
		required: z.boolean().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		pattern: z.string().optional(),
		styleStrength: z.number().min(0).max(1).optional(),
		preserveContent: z.boolean().optional(),
	}).optional(),
	stylePresets: z.array(z.object({
		name: z.string(),
		value: z.string(),
		preview: z.string().optional(),
	})).optional(),
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

export const TemplateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	category: z.string(),
	blocks: z.array(z.any()),
	parameters: z.array(TemplateParameterSchema),
	version: z.string(),
	inheritance: TemplateInheritanceSchema.optional(),
	versionHistory: z.array(TemplateVersionSchema),
	created: z.date(),
	updated: z.date(),
	thumbnail: z.string().optional(),
	videoFormat: z.custom<VideoFormatId>(),
	isPublished: z.boolean().default(false),
	tags: z.array(z.string()),
	isBase: z.boolean().optional(),
});

export type TemplateParameter = z.infer<typeof TemplateParameterSchema>;
export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;
export type TemplateInheritance = z.infer<typeof TemplateInheritanceSchema>;
export type Template = z.infer<typeof TemplateSchema>;

export interface TemplateState {
	templates: Template[];
	selectedTemplate: string | null;
	isLoading: boolean;
	error: string | null;
}