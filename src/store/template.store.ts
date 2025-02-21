import { create } from 'zustand';
import { Template, TemplateState, TemplateVersion, TemplateInheritance, TemplateValidation } from './template.types';
import { VideoFormatId } from '@/types/video.types';
import { getVideoFormat } from '@/types/video-format.types';

interface TemplateStore extends TemplateState {
	// Template Management
	addTemplate: (template: Template) => void;
	updateTemplate: (id: string, updates: Partial<Template>) => void;
	deleteTemplate: (id: string) => void;
	selectTemplate: (id: string | null) => void;
	validateTemplate: (template: Template) => TemplateValidation;
	validateFormatSettings: (template: Template) => TemplateValidation;
	updateFormatSettings: (id: string, settings: Template['formatSettings']) => void;

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

	validateTemplate: (template) => {
		const errors = [];
		const videoFormat = getVideoFormat(template.videoFormat);

		if (!videoFormat) {
			errors.push({
				field: 'videoFormat',
				message: 'Invalid video format selected'
			});
			return { isValid: false, errors };
		}

		// Validate format settings
		const formatValidation = get().validateFormatSettings(template);
		if (!formatValidation.isValid) {
			errors.push(...formatValidation.errors);
		}

		// Validate blocks duration
		const totalDuration = template.blocks.reduce((sum, block) => 
			sum + block.duration, 0);
		
		if (videoFormat.recommendedSettings?.maxDuration && 
				totalDuration > videoFormat.recommendedSettings.maxDuration) {
			errors.push({
				field: 'duration',
				message: `Total duration exceeds platform limit of ${videoFormat.recommendedSettings.maxDuration}s`
			});
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	},

	validateFormatSettings: (template) => {
		const errors = [];
		const videoFormat = getVideoFormat(template.videoFormat);
		const settings = template.formatSettings;

		if (videoFormat?.recommendedSettings && settings) {
			if (settings.fps && settings.fps > (videoFormat.recommendedSettings.fps || 30)) {
				errors.push({
					field: 'fps',
					message: `FPS exceeds platform recommendation of ${videoFormat.recommendedSettings.fps}`
				});
			}

			if (settings.bitrate) {
				const currentBitrate = parseInt(settings.bitrate);
				const recommendedBitrate = parseInt(videoFormat.recommendedSettings.bitrate || '0');
				if (currentBitrate > recommendedBitrate) {
					errors.push({
						field: 'bitrate',
						message: `Bitrate exceeds platform recommendation of ${videoFormat.recommendedSettings.bitrate}`
					});
				}
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	},

	updateFormatSettings: (id, settings) => set((state) => ({
		templates: state.templates.map(template =>
			template.id === id ? {
				...template,
				formatSettings: settings,
				updated: new Date()
			} : template
		)
	})),

	addTemplate: (template) => {
		const validation = get().validateTemplate(template);
		if (!validation.isValid) {
			set({ error: validation.errors[0].message });
			return;
		}

		set((state) => ({
			templates: [...state.templates, template]
		}));
	},

	updateTemplate: (id, updates) => {
		const state = get();
		const template = state.templates.find(t => t.id === id);
		if (!template) return;

		const updatedTemplate = { ...template, ...updates };
		const validation = state.validateTemplate(updatedTemplate);
		
		if (!validation.isValid) {
			set({ error: validation.errors[0].message });
			return;
		}

		set((state) => ({
			templates: state.templates.map(t =>
				t.id === id ? { ...updatedTemplate, updated: new Date() } : t
			)
		}));
	},

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