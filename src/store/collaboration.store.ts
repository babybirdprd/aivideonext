import { create } from 'zustand';
import { CollaborationService } from '@/services/collaboration/collaboration.service';
import { CollaborationState, CollaborationUser, CollaborationEvent, CollaborationAction } from './collaboration.types';
import { useEditorStore } from './editor.store';

interface CollaborationStore extends CollaborationState {
	service: CollaborationService | null;
	initializeCollaboration: (projectId: string, user: CollaborationUser) => void;
	disconnectCollaboration: () => void;
	handleEditorAction: (action: CollaborationAction) => void;
	updateCursorPosition: (x: number, y: number) => void;
	updateBlockSelection: (blockIds: string[]) => void;
	resolveConflicts: (actions: CollaborationAction[]) => CollaborationAction[];
}

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
	users: [],
	activeUsers: [],
	pendingActions: [],
	lastSyncTimestamp: 0,
	service: null,

	resolveConflicts: (actions) => {
		const resolvedActions: CollaborationAction[] = [];
		const actionMap = new Map<string, CollaborationAction>();

		// Sort actions by timestamp
		actions.sort((a, b) => (a as any).timestamp - (b as any).timestamp);

		for (const action of actions) {
			switch (action.type) {
				case 'UPDATE_BLOCK':
				case 'REMOVE_BLOCK': {
					// For updates and removes, last action wins
					actionMap.set(action.id, action);
					break;
				}
				case 'MOVE_BLOCK': {
					// For moves, merge with existing move if present
					const existing = actionMap.get(action.id);
					if (existing?.type === 'MOVE_BLOCK') {
						action.position = existing.position;
					}
					actionMap.set(action.id, action);
					break;
				}
				case 'ADD_BLOCK':
				case 'APPLY_TEMPLATE': {
					// These actions don't conflict, add them directly
					resolvedActions.push(action);
					break;
				}
			}
		}

		// Add resolved actions from the map
		actionMap.forEach(action => resolvedActions.push(action));
		return resolvedActions;
	},

	initializeCollaboration: (projectId: string, user: CollaborationUser) => {
		const service = new CollaborationService(projectId, user);

		service.onEvent('user_joined', (event) => {
			set((state) => ({
				users: [...state.users, event.data],
				activeUsers: [...state.activeUsers, event.userId],
			}));
		});

		service.onEvent('user_left', (event) => {
			set((state) => ({
				users: state.users.filter(u => u.id !== event.userId),
				activeUsers: state.activeUsers.filter(id => id !== event.userId),
			}));
		});

		service.onEvent('action_performed', (event) => {
			const { pendingActions } = get();
			const newAction = event.data;
			
			// Add new action to pending actions
			const updatedActions = [...pendingActions, newAction];
			
			// Resolve conflicts
			const resolvedActions = get().resolveConflicts(updatedActions);
			
			// Apply resolved actions
			const editorStore = useEditorStore.getState();
			resolvedActions.forEach(action => {
				switch (action.type) {
					case 'ADD_BLOCK':
						editorStore.addBlock(action.block);
						break;
					case 'UPDATE_BLOCK':
						editorStore.updateBlock(action.id, action.updates);
						break;
					case 'REMOVE_BLOCK':
						editorStore.removeBlock(action.id);
						break;
					case 'MOVE_BLOCK':
						editorStore.moveBlock(action.id, action.position);
						break;
					case 'APPLY_TEMPLATE':
						// Handle template application
						break;
				}
			});

			// Update state with resolved actions
			set({ 
				pendingActions: resolvedActions,
				lastSyncTimestamp: event.timestamp 
			});
		});

		set({ service });
	},

	disconnectCollaboration: () => {
		const { service } = get();
		if (service) {
			service.disconnect();
			set({ service: null });
		}
	},

	handleEditorAction: (action) => {
		const { service } = get();
		if (service) {
			service.broadcastAction(action);
		}
	},

	updateCursorPosition: (x: number, y: number) => {
		const { service } = get();
		if (service) {
			service.updateCursor({ x, y });
		}
	},

	updateBlockSelection: (blockIds: string[]) => {
		const { service } = get();
		if (service) {
			service.updateSelection(blockIds);
		}
	},
}));