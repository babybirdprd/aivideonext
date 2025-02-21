import React from 'react';
import { useEditorStore } from '@/store/editor.store';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PreviewPanel: React.FC = () => {
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
					) : (
						<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
							Preview Area
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