export type BlockType = 'text' | 'media' | 'effect' | 'transition';

export interface Block {
	id: string;
	type: BlockType;
	content: string;
	start: number;  // Start time in seconds
	duration: number;  // Duration in seconds
	properties: {
		[key: string]: any;
	};
}

export interface Asset {
	id: string;
	type: string;
	url: string;
	metadata?: Record<string, any>;
}

export interface Project {
	id: string;
	name: string;
	blocks: Block[];
	settings: {
		resolution: string;
		fps: number;
		duration: number;
		theme: string;
	};
	assets: Asset[];
}

export interface EditorState {
	currentProject: Project | null;
	selectedBlock: string | null;
	history: {
		past: Project[];
		future: Project[];
	};
	isProcessing: boolean;
	renderProgress: number;
}