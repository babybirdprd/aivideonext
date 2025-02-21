import { create } from 'zustand';
import { Template, TemplateState, TemplateVersion, TemplateInheritance } from './template.types';
import { VideoFormatId } from '@/types/video.types';

interface TemplateStore extends TemplateState {
	// Template Management
	addTemplate: (template: Template) => void;
	updateTemplate: (id: string, updates: Partial<Template>) => void;
	deleteTemplate: (id: string) => void;
	selectTemplate: (id: string | null) => void;

	// Filtering
	filterFormat: VideoFormatId | null;
	filterPublished: boolean | null;
	setFilterFormat: (format: VideoFormatId | null) => void;
	setFilterPublished: (published: boolean | null) => void;
	getFilteredTemplates: () => Template[];
	getTemplatesByFormat: (format: VideoFormatId) => Template[];
	
	// Template Operations
	duplicateTemplate: (id: string) => void;
	createVersionFromTemplate: (id: string, changes: TemplateVersion['changes']) => void;
	
	// Inheritance Operations
	inheritFromTemplate: (childId: string, parentId: string) => void;
	updateInheritance: (id: string, inheritance: TemplateInheritance) => void;
	resolveInheritedValues: (template: Template) => Template;
	
	// Version Control
	getVersionHistory: (id: string) => TemplateVersion[];
	revertToVersion: (id: string, version: string) => void;
	
	// Loading State
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
	templates: [],
	selectedTemplate: null,
	isLoading: false,
	error: null,
	filterFormat: null,
	filterPublished: null,

	addTemplate: (template) => set((state) => ({
		templates: [...state.templates, template]
	})),

	updateTemplate: (id, updates) => set((state) => ({
		templates: state.templates.map(template =>
			template.id === id ? { ...template, ...updates, updated: new Date() } : template
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
			inheritance: template.inheritance ? {
				...template.inheritance,
				parentId: template.id
			} : undefined,
			versionHistory: []
		};

		return {
			templates: [...state.templates, duplicate]
		};
	}),

	createVersionFromTemplate: (id, changes) => set((state) => {
		const template = state.templates.find(t => t.id === id);
		if (!template) return state;

		const version = parseInt(template.version.split('.')[0]);
		const newVersion = `${version + 1}.0`;
		
		const versionEntry: TemplateVersion = {
			version: newVersion,
			changes,
			timestamp: new Date()
		};

		return {
			templates: state.templates.map(t => 
				t.id === id ? {
					...t,
					version: newVersion,
					versionHistory: [...t.versionHistory, versionEntry],
					updated: new Date()
				} : t
			)
		};
	}),

	inheritFromTemplate: (childId, parentId) => set((state) => {
		const child = state.templates.find(t => t.id === childId);
		const parent = state.templates.find(t => t.id === parentId);
		if (!child || !parent) return state;

		const inheritance: TemplateInheritance = {
			parentId,
			overrides: [],
			inherited: ['blocks', 'parameters']
		};

		return {
			templates: state.templates.map(t =>
				t.id === childId ? {
					...t,
					inheritance,
					updated: new Date()
				} : t
			)
		};
	}),

	updateInheritance: (id, inheritance) => set((state) => ({
		templates: state.templates.map(t =>
			t.id === id ? {
				...t,
				inheritance,
				updated: new Date()
			} : t
		)
	})),

	resolveInheritedValues: (template) => {
		if (!template.inheritance) return template;

		const { templates } = get();
		const parent = templates.find(t => t.id === template.inheritance?.parentId);
		if (!parent) return template;

		const resolvedTemplate = { ...template };
		template.inheritance.inherited.forEach(key => {
			resolvedTemplate[key] = parent[key];
		});

		template.inheritance.overrides.forEach(override => {
			const path = override.path.split('.');
			let current = resolvedTemplate;
			for (let i = 0; i < path.length - 1; i++) {
				current = current[path[i]];
			}
			current[path[path.length - 1]] = override.value;
		});

		return resolvedTemplate;
	},

	getVersionHistory: (id) => {
		const template = get().templates.find(t => t.id === id);
		return template?.versionHistory || [];
	},

	revertToVersion: (id, version) => set((state) => {
		const template = state.templates.find(t => t.id === id);
		if (!template) return state;

		const targetVersion = template.versionHistory.find(v => v.version === version);
		if (!targetVersion) return state;

		// Create new version entry for the revert
		const revertVersion: TemplateVersion = {
			version: `${parseInt(template.version.split('.')[0]) + 1}.0`,
			changes: [{
				type: 'modified',
				path: '/',
				description: `Reverted to version ${version}`
			}],
			timestamp: new Date()
		};

		return {
			templates: state.templates.map(t =>
				t.id === id ? {
					...t,
					version: revertVersion.version,
					versionHistory: [...t.versionHistory, revertVersion],
					updated: new Date()
				} : t
			)
		};
	}),

	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),

	// Filtering methods
	setFilterFormat: (format) => set({ filterFormat: format }),
	setFilterPublished: (published) => set({ filterPublished: published }),

	getFilteredTemplates: () => {
		const { templates, filterFormat, filterPublished } = get();
		
		return templates.filter(template => {
			if (filterFormat && template.videoFormat !== filterFormat) return false;
			if (filterPublished !== null && template.isPublished !== filterPublished) return false;
			return true;
		});
	},

	getTemplatesByFormat: (format) => {
		const { templates } = get();
		return templates.filter(template => template.videoFormat === format);
	},
}));