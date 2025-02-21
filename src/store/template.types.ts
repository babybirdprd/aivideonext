import { Block } from './types';
import { z } from 'zod';

export const TemplateParameterSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(['text', 'number', 'color', 'select', 'media']),
	defaultValue: z.any(),
	options: z.array(z.string()).optional(),
});

export const TemplateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	thumbnail: z.string().optional(),
	blocks: z.array(z.any()),  // Block schema
	parameters: z.array(TemplateParameterSchema),
	version: z.string(),
	parentId: z.string().optional(),
	created: z.date(),
	updated: z.date(),
	tags: z.array(z.string()),
	category: z.string(),
});

export type TemplateParameter = z.infer<typeof TemplateParameterSchema>;
export type Template = z.infer<typeof TemplateSchema>;

export interface TemplateState {
	templates: Template[];
	selectedTemplate: string | null;
	isLoading: boolean;
	error: string | null;
}