import { RenderProgress } from './types';

export class RenderWebSocketService {
	private static instance: RenderWebSocketService;
	private connections: Map<string, WebSocket>;

	private constructor() {
		this.connections = new Map();
	}

	public static getInstance(): RenderWebSocketService {
		if (!RenderWebSocketService.instance) {
			RenderWebSocketService.instance = new RenderWebSocketService();
		}
		return RenderWebSocketService.instance;
	}

	public connect(projectId: string): void {
		const ws = new WebSocket(`ws://localhost:3001/api/render/${projectId}`);
		this.connections.set(projectId, ws);
	}

	public disconnect(projectId: string): void {
		const ws = this.connections.get(projectId);
		if (ws) {
			ws.close();
			this.connections.delete(projectId);
		}
	}

	public updateProgress(projectId: string, progress: RenderProgress): void {
		const ws = this.connections.get(projectId);
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'progress', data: progress }));
		}
	}

	public sendComplete(projectId: string, videoUrl: string): void {
		const ws = this.connections.get(projectId);
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'complete', data: { videoUrl } }));
		}
	}

	public sendError(projectId: string, error: string): void {
		const ws = this.connections.get(projectId);
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'error', data: { error } }));
		}
	}
}
