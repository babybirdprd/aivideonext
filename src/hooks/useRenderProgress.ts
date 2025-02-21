import { useState, useEffect } from 'react';
import { RenderProgress } from '@/services/media/types';
import { RenderWebSocketService } from '@/services/media/websocket.service';

interface RenderProgressState {
	progress?: RenderProgress;
	error?: string;
}

export function useRenderProgress(projectId: string) {
	const [state, setState] = useState<RenderProgressState>({});
	const wsService = RenderWebSocketService.getInstance();

	useEffect(() => {
		// Connect to WebSocket
		wsService.connect(projectId);
		const ws = wsService['connections'].get(projectId);

		if (ws) {
			ws.onmessage = (event) => {
				const message = JSON.parse(event.data);
				switch (message.type) {
					case 'progress':
						setState(prev => ({ ...prev, progress: message.data }));
						break;
					case 'complete':
						setState(prev => ({ 
							...prev, 
							progress: { ...prev.progress, totalProgress: 1 } as RenderProgress 
						}));
						break;
					case 'error':
						setState(prev => ({ ...prev, error: message.data.error }));
						break;
				}
			};

			ws.onerror = () => {
				setState(prev => ({ 
					...prev, 
					error: 'WebSocket connection error' 
				}));
			};
		}

		// Cleanup
		return () => {
			wsService.disconnect(projectId);
		};
	}, [projectId]);

	return state;

};