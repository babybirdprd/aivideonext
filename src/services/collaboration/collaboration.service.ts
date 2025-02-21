import { CollaborationAction, CollaborationEvent, CollaborationState, CollaborationUser } from '@/store/collaboration.types';

export class CollaborationService {
	private socket: WebSocket;
	private state: CollaborationState;
	private handlers: Map<string, (event: CollaborationEvent) => void>;

	constructor(projectId: string, user: CollaborationUser) {
		this.socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/collaboration/${projectId}`);
		this.state = {
			users: [user],
			activeUsers: [user.id],
			pendingActions: [],
			lastSyncTimestamp: Date.now(),
		};
		this.handlers = new Map();

		this.setupSocketListeners();
	}

	private setupSocketListeners() {
		this.socket.onopen = () => {
			console.log('Collaboration connection established');
			this.broadcastEvent({
				type: 'user_joined',
				userId: this.state.users[0].id,
				timestamp: Date.now(),
				data: this.state.users[0],
			});
		};

		this.socket.onmessage = (event) => {
			const collaborationEvent: CollaborationEvent = JSON.parse(event.data);
			this.handleEvent(collaborationEvent);
		};

		this.socket.onclose = () => {
			console.log('Collaboration connection closed');
			this.broadcastEvent({
				type: 'user_left',
				userId: this.state.users[0].id,
				timestamp: Date.now(),
				data: null,
			});
		};
	}

	private handleEvent(event: CollaborationEvent) {
		switch (event.type) {
			case 'user_joined':
				this.state.users.push(event.data);
				this.state.activeUsers.push(event.userId);
				break;
			case 'user_left':
				this.state.users = this.state.users.filter(u => u.id !== event.userId);
				this.state.activeUsers = this.state.activeUsers.filter(id => id !== event.userId);
				break;
			case 'cursor_moved':
				const userIndex = this.state.users.findIndex(u => u.id === event.userId);
				if (userIndex !== -1) {
					this.state.users[userIndex].cursor = event.data;
				}
				break;
			case 'selection_changed':
				const selectionUserIndex = this.state.users.findIndex(u => u.id === event.userId);
				if (selectionUserIndex !== -1) {
					this.state.users[selectionUserIndex].selection = event.data;
				}
				break;
			case 'action_performed':
				this.state.pendingActions.push(event.data);
				break;
		}

		// Notify handlers
		this.handlers.get(event.type)?.(event);
	}

	public broadcastEvent(event: CollaborationEvent) {
		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(event));
		}
	}

	public broadcastAction(action: CollaborationAction) {
		this.broadcastEvent({
			type: 'action_performed',
			userId: this.state.users[0].id,
			timestamp: Date.now(),
			data: action,
		});
	}

	public updateCursor(position: { x: number; y: number }) {
		this.broadcastEvent({
			type: 'cursor_moved',
			userId: this.state.users[0].id,
			timestamp: Date.now(),
			data: position,
		});
	}

	public updateSelection(selectedIds: string[]) {
		this.broadcastEvent({
			type: 'selection_changed',
			userId: this.state.users[0].id,
			timestamp: Date.now(),
			data: selectedIds,
		});
	}

	public onEvent(type: CollaborationEvent['type'], handler: (event: CollaborationEvent) => void) {
		this.handlers.set(type, handler);
	}

	public getState(): CollaborationState {
		return { ...this.state };
	}

	public disconnect() {
		this.socket.close();
	}
}