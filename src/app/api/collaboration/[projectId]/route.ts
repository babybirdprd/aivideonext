import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';
import { CollaborationEvent } from '@/store/collaboration.types';

const wss = new WebSocketServer({ noServer: true });

const projectConnections = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket, projectId: string) => {
	// Add connection to project group
	if (!projectConnections.has(projectId)) {
		projectConnections.set(projectId, new Set());
	}
	projectConnections.get(projectId)!.add(ws);

	ws.on('message', (data: string) => {
		try {
			const event: CollaborationEvent = JSON.parse(data);
			
			// Broadcast to all clients in the same project except sender
			projectConnections.get(projectId)?.forEach(client => {
				if (client !== ws && client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		} catch (error) {
			console.error('Error processing message:', error);
		}
	});

	ws.on('close', () => {
		// Remove connection from project group
		projectConnections.get(projectId)?.delete(ws);
		if (projectConnections.get(projectId)?.size === 0) {
			projectConnections.delete(projectId);
		}
	});
});

export function GET(
	request: Request,
	{ params }: { params: { projectId: string } }
) {
	if (!request.headers.get('upgrade')?.includes('websocket')) {
		return new NextResponse('Expected websocket', { status: 400 });
	}

	wss.handleUpgrade(request, request.socket, Buffer.alloc(0), (ws) => {
		wss.emit('connection', ws, params.projectId);
	});
}