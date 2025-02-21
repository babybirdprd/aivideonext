export type BlockType = 'text' | 'media' | 'effect' | 'transition';

export type EffectType = 'blur' | 'brightness' | 'contrast' | 'saturation' | 'overlay' | 'zoom' | 'pan' | 'rotate' | 'fade';
export type TransitionType = 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'push' | 'crossfade' | 'swipe';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'center';

export interface Block {
	id: string;
	type: BlockType;
	content: string;
	start: number;  // Start time in seconds
	duration: number;  // Duration in seconds
	properties: {
		// Effect properties
		effectName?: EffectType;
		intensity?: number;
		// Transition properties
		transitionType?: TransitionType;
		direction?: TransitionDirection;
		smoothness?: number;
		// Other properties
		[key: string]: any;
	};
	templateId?: string; // For template-based blocks
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
	videoUrl?: string; // URL for preview video
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