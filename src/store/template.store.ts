import { create } from 'zustand';
import { Template, TemplateState } from './template.types';

interface TemplateStore extends TemplateState {
	// Template Management
	addTemplate: (template: Template) => void;
	updateTemplate: (id: string, updates: Partial<Template>) => void;
	deleteTemplate: (id: string) => void;
	selectTemplate: (id: string | null) => void;
	
	// Template Operations
	duplicateTemplate: (id: string) => void;
	createVersionFromTemplate: (id: string) => void;
	
	// Loading State
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
	templates: [],
	selectedTemplate: null,
	isLoading: false,
	error: null,

	addTemplate: (template) => set((state) => ({
		templates: [...state.templates, template]
	})),

	updateTemplate: (id, updates) => set((state) => ({
		templates: state.templates.map(template =>
			template.id === id ? { ...template, ...updates } : template
		)
	})),

	deleteTemplate: (id) => set((state) => ({
		templates: state.templates.filter(template => template.id !== id)
	})),

	selectTemplate: (id) => set({
		selectedTemplate: id
	}),

	duplicateTemplate: (id) => set((state) => {
		const template = state.templates.find(t => t.id === id);
		if (!template) return state;

		const duplicate: Template = {
			...template,
			id: crypto.randomUUID(),
			name: `${template.name} (Copy)`,
			created: new Date(),
			updated: new Date(),
			parentId: template.id,
		};

		return {
			templates: [...state.templates, duplicate]
		};
	}),

	createVersionFromTemplate: (id) => set((state) => {
		const template = state.templates.find(t => t.id === id);
		if (!template) return state;

		const version = parseInt(template.version.split('.')[0]);
		const newVersion: Template = {
			...template,
			id: crypto.randomUUID(),
			version: `${version + 1}.0`,
			created: new Date(),
			updated: new Date(),
			parentId: template.id,
		};

		return {
			templates: [...state.templates, newVersion]
		};
	}),

	setLoading: (isLoading) => set({
		isLoading
	}),

	setError: (error) => set({
		error
	}),
}));