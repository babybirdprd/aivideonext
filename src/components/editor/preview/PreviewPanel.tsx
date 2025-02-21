import React from 'react';
import { useEditorStore } from '@/store/editor.store';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewRenderer } from './PreviewRenderer';
import { useRenderProgress } from '@/hooks/useRenderProgress';

const RenderProgress = ({ projectId }: { projectId: string }) => {
	const { progress, error } = useRenderProgress(projectId);

	if (!progress) return null;

	return (
		<div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
			<div className="space-y-2">
				<h3 className="font-semibold">Rendering Progress</h3>
				<div className="space-y-1">
					<div className="text-sm">
						Segment {progress.segment} of {progress.totalSegments}
					</div>
					<div className="h-2 bg-secondary rounded-full overflow-hidden">
						<div 
							className="h-full bg-primary transition-all duration-300"
							style={{ width: `${progress.totalProgress * 100}%` }}
						/>
					</div>
					<div className="text-xs text-muted-foreground">
						{Math.round(progress.totalProgress * 100)}% Complete
					</div>
				</div>
				{error && (
					<div className="text-sm text-destructive mt-2">
						Error: {error}
					</div>
				)}
			</div>
		</div>
		<RenderProgress projectId={projectId} />
	);
};

export const PreviewPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
	const { currentProject, isProcessing, renderProgress } = useEditorStore();
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);

	const handlePlayPause = () => {
		setIsPlaying(!isPlaying);
	};

	const handleReset = () => {
		setCurrentTime(0);
		setIsPlaying(false);
	};

	const handleTimeUpdate = (time: number) => {
		setCurrentTime(time);
	};

	// Get active effects and transitions for current time
	const activeEffects = currentProject?.blocks
		?.filter(block => block.type === 'effect')
		?.map(block => ({
			type: block.properties.effectName,
			intensity: block.properties.intensity || 0.5,
			startTime: block.startTime,
			duration: block.duration,
			params: block.properties.params
		}));

	const activeTransition = currentProject?.blocks
		?.find(block => block.type === 'transition')
		?.properties;

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 relative">
				<div className="aspect-video bg-black rounded-lg w-full h-full relative">
					{isProcessing ? (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50">
							<div className="text-center">
								<Loader2 className="h-8 w-8 animate-spin mx-auto" />
								<div className="mt-2">Processing... {renderProgress}%</div>
							</div>
						</div>
					) : currentProject?.videoUrl ? (
						<PreviewRenderer
							videoUrl={currentProject.videoUrl}
							currentTime={currentTime}
							effects={activeEffects}
							transition={activeTransition}
							isPlaying={isPlaying}
							onTimeUpdate={handleTimeUpdate}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
							No video loaded
						</div>
					)}
				</div>
			</div>
			
			<div className="h-12 mt-4 flex items-center justify-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={handleReset}
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={handlePlayPause}
				>
					{isPlaying ? (
						<Pause className="h-4 w-4" />
					) : (
						<Play className="h-4 w-4" />
					)}
				</Button>
				<div className="text-sm text-muted-foreground ml-2">
					{currentTime.toFixed(1)}s / {currentProject?.settings.duration.toFixed(1)}s
				</div>
			</div>
		</div>
	);
};