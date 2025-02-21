import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

let wss: WebSocketServer;

export function GET(request: Request, { params }: { params: { projectId: string } }) {
	if (!wss) {
		wss = new WebSocketServer({ noServer: true });
		
		wss.on('connection', (ws, projectId: string) => {
			console.log(`Client connected for project: ${projectId}`);
			
			ws.on('message', (data) => {
				// Handle incoming messages if needed
				console.log('Received:', data);
			});

			ws.on('close', () => {
				console.log(`Client disconnected from project: ${projectId}`);
			});
		});
	}

	// Check if it's a WebSocket upgrade request
	if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
		return NextResponse.json(
			{ error: 'This route only handles WebSocket connections' },
			{ status: 426 }
		);
	}

	try {
		// Get the socket from the request
		const socket = (request as any).socket;

		if (!socket) {
			throw new Error('Could not get socket from request');
		}

		// Handle the WebSocket upgrade
		wss.handleUpgrade(request, socket, Buffer.alloc(0), (ws) => {
			wss.emit('connection', ws, params.projectId);
		});

	} catch (error) {
		console.error('WebSocket upgrade error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 }
		);
	}
}