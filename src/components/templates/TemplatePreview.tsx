import React, { useState } from 'react';
import { Template } from '@/store/template.types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Smartphone, Monitor, Instagram } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getVideoFormat } from '@/types/video-format.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplatePreviewProps {
	template: Template;
	onStyleChange?: (styleStrength: number) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
	template,
	onStyleChange
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [styleStrength, setStyleStrength] = useState(0.5);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPlatform, setSelectedPlatform] = useState('original');

	const videoFormat = getVideoFormat(template.videoFormat);
	const aspectRatio = videoFormat ? `${videoFormat.width}/${videoFormat.height}` : '16/9';

	const getPlatformIcon = (platform: string) => {
		switch (platform) {
			case 'youtube': return <Monitor className="h-4 w-4" />;
			case 'tiktok': return <Smartphone className="h-4 w-4" />;
			case 'instagram': return <Instagram className="h-4 w-4" />;
			default: return <Monitor className="h-4 w-4" />;
		}
	};

	const handleStyleStrengthChange = (value: number[]) => {
		setStyleStrength(value[0]);
		onStyleChange?.(value[0]);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="w-full h-full absolute inset-0">
					<Play className="h-8 w-8" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[800px]">
				<Tabs defaultValue="original" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="original">Original</TabsTrigger>
						{videoFormat && ['youtube', 'tiktok', 'instagram'].map(platform => (
							<TabsTrigger 
								key={platform} 
								value={platform}
								className="flex items-center gap-2"
							>
								{getPlatformIcon(platform)}
								{platform}
							</TabsTrigger>
						))}
					</TabsList>

					{['original', 'youtube', 'tiktok', 'instagram'].map(platform => (
						<TabsContent key={platform} value={platform}>
							<div 
								className="bg-muted rounded-lg overflow-hidden relative"
								style={{ 
									aspectRatio,
									maxHeight: '70vh',
									margin: '0 auto'
								}}
							>
								{template.thumbnail && (
									<img
										src={template.thumbnail}
										alt={template.name}
										className="w-full h-full object-cover"
									/>
								)}
								<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
									<div className="flex items-center gap-2">
										<Button
											variant="secondary"
											size="icon"
											onClick={() => setIsPlaying(!isPlaying)}
										>
											{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
										</Button>
										<Button
											variant="secondary"
											size="icon"
											onClick={() => {
												setIsLoading(true);
												setTimeout(() => setIsLoading(false), 1000);
											}}
											disabled={isLoading}
										>
											<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
										</Button>
										<div className="flex-1 px-4">
											<Slider
												value={[styleStrength]}
												onValueChange={handleStyleStrengthChange}
												min={0}
												max={1}
												step={0.1}
												className="w-full"
											/>
										</div>
									</div>
								</div>
							</div>
						</TabsContent>
					))}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};
