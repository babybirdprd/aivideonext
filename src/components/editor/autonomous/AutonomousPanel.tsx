import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/store/editor.store';
import { Wand2, Settings2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
	const [showAdvanced, setShowAdvanced] = useState(false);
	
	// Advanced settings
	const [style, setStyle] = useState('modern');
	const [temperature, setTemperature] = useState(0.7);
	const [useVisionAnalysis, setUseVisionAnalysis] = useState(true);
	const [outputFormat, setOutputFormat] = useState('mp4');
	const [quality, setQuality] = useState('high');

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
						outputFormat,
						style,
						temperature,
						useVisionAnalysis,
						quality
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
						outputFormat,
						style,
						temperature,
						quality
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
					className="w-full"
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
					className="w-full"
				>
					<Wand2 className="w-4 h-4 mr-2" />
					Auto Create
				</Button>
			</div>

			<div className="space-y-2">
				<Button
					variant="outline"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="w-full"
				>
					<Settings2 className="w-4 h-4 mr-2" />
					{showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
				</Button>

				{showAdvanced && (
					<div className="space-y-4 mt-4 p-4 border rounded-lg">
						<div className="space-y-2">
							<label className="text-sm font-medium">Style</label>
							<Select value={style} onValueChange={setStyle}>
								<SelectTrigger>
									<SelectValue placeholder="Select style" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="modern">Modern</SelectItem>
									<SelectItem value="cinematic">Cinematic</SelectItem>
									<SelectItem value="vintage">Vintage</SelectItem>
									<SelectItem value="minimal">Minimal</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">AI Temperature ({temperature})</label>
							<Slider
								value={[temperature]}
								onValueChange={([value]) => setTemperature(value)}
								min={0}
								max={1}
								step={0.1}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Output Format</label>
							<Select value={outputFormat} onValueChange={setOutputFormat}>
								<SelectTrigger>
									<SelectValue placeholder="Select format" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="mp4">MP4</SelectItem>
									<SelectItem value="webm">WebM</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Quality</label>
							<Select value={quality} onValueChange={setQuality}>
								<SelectTrigger>
									<SelectValue placeholder="Select quality" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="vision"
								checked={useVisionAnalysis}
								onCheckedChange={(checked) => setUseVisionAnalysis(checked as boolean)}
							/>
							<label htmlFor="vision" className="text-sm font-medium">
								Use Vision Analysis
							</label>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};