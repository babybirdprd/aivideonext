import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/store/editor.store';
import { Wand2 } from 'lucide-react';

interface AutonomousPanelProps {
	projectId: string;
}

export const AutonomousPanel: React.FC<AutonomousPanelProps> = ({ projectId }) => {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [sourceUrl, setSourceUrl] = useState('');
	const [instructions, setInstructions] = useState('');
	const [prompt, setPrompt] = useState('');
	const [duration, setDuration] = useState(30);

	const handleAutoEdit = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/ai/autonomous', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId,
					action: 'edit',
					params: {
						sourceVideoUrl: sourceUrl,
						editInstructions: instructions,
						outputFormat: 'mp4'
					}
				})
			});

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error);
			}

			toast({
				title: 'Success',
				description: 'Video edited successfully'
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to edit video',
				variant: 'destructive'
			});
		} finally {
			setLoading(false);
		}
	};

	const handleAutoCreate = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/ai/autonomous', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId,
					action: 'create',
					params: {
						prompt,
						duration,
						outputFormat: 'mp4'
					}
				})
			});

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error);
			}

			toast({
				title: 'Success',
				description: 'Video created successfully'
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to create video',
				variant: 'destructive'
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 p-4">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Auto Edit</h3>
				<Input
					placeholder="Source video URL"
					value={sourceUrl}
					onChange={(e) => setSourceUrl(e.target.value)}
				/>
				<Textarea
					placeholder="Edit instructions"
					value={instructions}
					onChange={(e) => setInstructions(e.target.value)}
				/>
				<Button
					onClick={handleAutoEdit}
					disabled={loading || !sourceUrl || !instructions}
				>
					<Wand2 className="w-4 h-4 mr-2" />
					Auto Edit
				</Button>
			</div>

			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Auto Create</h3>
				<Textarea
					placeholder="Video concept prompt"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
				/>
				<Input
					type="number"
					placeholder="Duration (seconds)"
					value={duration}
					onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
					min={5}
					max={300}
				/>
				<Button
					onClick={handleAutoCreate}
					disabled={loading || !prompt}
				>
					<Wand2 className="w-4 h-4 mr-2" />
					Auto Create
				</Button>
			</div>
		</div>
	);
};