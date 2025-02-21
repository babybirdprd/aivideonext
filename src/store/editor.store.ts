import { create } from 'zustand';
import { EditorState, Project, Block, Template } from './types';

const DEFAULT_PROJECT: Project = {
	id: 'default',
	name: 'Untitled Project',
	blocks: [],
	settings: {
		resolution: '1080p',
		fps: 30,
		duration: 0,
		theme: 'default'
	},
	assets: []
};

interface TemplateApplication {
	template: Template;
	parameterValues: Record<string, any>;
}

export const useEditorStore = create<EditorState & {
	setProject: (project: Project) => void;
	addBlock: (block: Block) => void;
	updateBlock: (id: string, updates: Partial<Block>) => void;
	removeBlock: (id: string) => void;
	moveBlock: (id: string, position: number) => void;
	selectBlock: (id: string | null) => void;
	setProcessing: (isProcessing: boolean) => void;
	setRenderProgress: (progress: number) => void;
	undo: () => void;
	redo: () => void;
	applyTemplate: (application: TemplateApplication) => void;
	revertTemplateApplication: (templateId: string) => void;
	getAppliedTemplates: () => string[];
}>((set, get) => ({
	currentProject: DEFAULT_PROJECT,
	selectedBlock: null,
	history: {
		past: [],
		future: []
	},
	isProcessing: false,
	renderProgress: 0,
	appliedTemplates: [] as string[],

	setProject: (project) => set({ currentProject: project }),

	addBlock: (block) => set((state) => {
		if (!state.currentProject) return state;
		const newProject = {
			...state.currentProject,
			blocks: [...state.currentProject.blocks, block]
		};
		return {
			currentProject: newProject,
			history: {
				past: [...state.history.past, state.currentProject],
				future: []
			}
		};
	}),

	updateBlock: (id, updates) => set((state) => {
		if (!state.currentProject) return state;
		const newBlocks = state.currentProject.blocks.map(block =>
			block.id === id ? { ...block, ...updates } : block
		);
		const newProject = {
			...state.currentProject,
			blocks: newBlocks
		};
		return {
			currentProject: newProject,
			history: {
				past: [...state.history.past, state.currentProject],
				future: []
			}
		};
	}),

	removeBlock: (id) => set((state) => {
		if (!state.currentProject) return state;
		const newProject = {
			...state.currentProject,
			blocks: state.currentProject.blocks.filter(block => block.id !== id)
		};
		return {
			currentProject: newProject,
			history: {
				past: [...state.history.past, state.currentProject],
				future: []
			}
		};
	}),

	selectBlock: (id) => set({ selectedBlock: id }),

	setProcessing: (isProcessing) => set({ isProcessing }),

	setRenderProgress: (progress) => set({ renderProgress: progress }),

	undo: () => set((state) => {
		const previous = state.history.past[state.history.past.length - 1];
		if (!previous) return state;

		const newPast = state.history.past.slice(0, -1);
		return {
			currentProject: previous,
			history: {
				past: newPast,
				future: [state.currentProject!, ...state.history.future]
			}
		};
	}),

	redo: () => set((state) => {
		const next = state.history.future[0];
		if (!next) return state;

		const newFuture = state.history.future.slice(1);
		return {
			currentProject: next,
			history: {
				past: [...state.history.past, state.currentProject!],
				future: newFuture
			}
		};
	}),

	applyTemplate: (application) => set((state) => {
		if (!state.currentProject) return state;

		// Process template blocks with parameter values
		const processedBlocks = application.template.blocks.map(block => {
			const newBlock = { ...block, id: crypto.randomUUID() };
			
			// Replace parameter placeholders in block properties
			Object.entries(application.parameterValues).forEach(([paramId, value]) => {
				const param = application.template.parameters.find(p => p.id === paramId);
				if (!param) return;

				// Replace {{paramName}} in block properties
				Object.entries(newBlock.properties || {}).forEach(([key, propValue]) => {
					if (typeof propValue === 'string') {
						newBlock.properties[key] = propValue.replace(
							`{{${param.name}}}`,
							value.toString()
						);
					}
				});
			});

			return newBlock;
		});

		const newProject = {
			...state.currentProject,
			blocks: [...state.currentProject.blocks, ...processedBlocks],
		};

		return {
			currentProject: newProject,
			appliedTemplates: [...state.appliedTemplates, application.template.id],
			history: {
				past: [...state.history.past, state.currentProject],
				future: []
			}
		};
	}),

	revertTemplateApplication: (templateId) => set((state) => {
		if (!state.currentProject) return state;

		// Remove blocks added by this template
		const templateIndex = state.appliedTemplates.indexOf(templateId);
		if (templateIndex === -1) return state;

		const newProject = {
			...state.currentProject,
			blocks: state.currentProject.blocks.filter(block => 
				!block.templateId || block.templateId !== templateId
			),
		};

		return {
			currentProject: newProject,
			appliedTemplates: state.appliedTemplates.filter(id => id !== templateId),
			history: {
				past: [...state.history.past, state.currentProject],
				future: []
			}
		};
	}),

	moveBlock: (id, position) => set((state) => {
		if (!state.currentProject) return state;
		
		const blocks = [...state.currentProject.blocks];
		const blockIndex = blocks.findIndex(block => block.id === id);
		if (blockIndex === -1) return state;

		// Remove block from current position
		const [block] = blocks.splice(blockIndex, 1);
		// Insert at new position
		blocks.splice(position, 0, block);

		const newProject = {
			...state.currentProject,
			blocks
		};

		return {
			currentProject: newProject,
			history: {
				past: [...state.history.past, state.currentProject],
				future: []
			}
		};
	}),

	getAppliedTemplates: () => get().appliedTemplates,
}));