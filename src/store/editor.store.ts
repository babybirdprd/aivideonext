import { create } from 'zustand';
import { EditorState, Project, Block } from './types';

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

export const useEditorStore = create<EditorState & {
	setProject: (project: Project) => void;
	addBlock: (block: Block) => void;
	updateBlock: (id: string, updates: Partial<Block>) => void;
	removeBlock: (id: string) => void;
	selectBlock: (id: string | null) => void;
	setProcessing: (isProcessing: boolean) => void;
	setRenderProgress: (progress: number) => void;
	undo: () => void;
	redo: () => void;
}>((set) => ({
	currentProject: DEFAULT_PROJECT,
	selectedBlock: null,
	history: {
		past: [],
		future: []
	},
	isProcessing: false,
	renderProgress: 0,

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
	})
}));