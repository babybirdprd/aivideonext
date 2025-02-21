import { Block } from './types';

export type CollaborationAction = 
	| { type: 'ADD_BLOCK'; block: Block }
	| { type: 'UPDATE_BLOCK'; id: string; updates: Partial<Block> }
	| { type: 'REMOVE_BLOCK'; id: string }
	| { type: 'MOVE_BLOCK'; id: string; position: number }
	| { type: 'APPLY_TEMPLATE'; templateId: string; parameterValues: Record<string, any> };

export interface CollaborationUser {
	id: string;
	name: string;
	avatar?: string;
	cursor?: { x: number; y: number };
	selection?: string[];
}

export interface CollaborationState {
	users: CollaborationUser[];
	activeUsers: string[];
	pendingActions: CollaborationAction[];
	lastSyncTimestamp: number;
}

export interface CollaborationEvent {
	type: 'user_joined' | 'user_left' | 'cursor_moved' | 'selection_changed' | 'action_performed';
	userId: string;
	timestamp: number;
	data: any;
}