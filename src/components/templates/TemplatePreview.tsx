import React, { useState } from 'react';
import { Template } from '@/store/template.types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Smartphone, Monitor, Instagram, Wand2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getVideoFormat } from '@/types/video-format.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { styleTransferService } from '@/services/ai/style.service';

const STYLE_PRESETS = [
	'oil painting', 'watercolor', 'pencil sketch', 'digital art',
	'anime', 'photorealistic', 'abstract', 'pop art', 'cyberpunk',
	'steampunk', 'minimalist', 'vintage', 'gothic', 'impressionist', 'surrealist'
];

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
	const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
	const [preserveContent, setPreserveContent] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [styledImage, setStyledImage] = useState<string | null>(null);

	const videoFormat = getVideoFormat(template.videoFormat);
	const aspectRatio = videoFormat ? `${videoFormat.width}/${videoFormat.height}` : '16/9';

	const handleStyleTransfer = async () => {
		try {
			setIsLoading(true);
			setError(null);
			
			const result = await styleTransferService.transferStyle({
				sourceUrl: template.thumbnail || '',
				style: selectedStyle,
				strength: styleStrength,
				preserveContent
			});
			
			setStyledImage(result.resultUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Style transfer failed');
		} finally {
			setIsLoading(false);
		}
	};

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
					  <TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="original">Original</TabsTrigger>
						<TabsTrigger value="styled" className="flex items-center gap-2">
						  <Wand2 className="h-4 w-4" />
						  Styled
						</TabsTrigger>
						{['youtube', 'tiktok', 'instagram'].map(platform => (
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

					  <TabsContent value="original">
						<PreviewContent
						  imageUrl={template.thumbnail}
						  aspectRatio={aspectRatio}
						  isPlaying={isPlaying}
						  setIsPlaying={setIsPlaying}
						  isLoading={isLoading}
						  setIsLoading={setIsLoading}
						/>
					  </TabsContent>

					  <TabsContent value="styled">
						<div className="space-y-4">
						  {error && (
							<Alert variant="destructive">
							  <AlertDescription>{error}</AlertDescription>
							</Alert>
						  )}
						  
						  <div className="grid grid-cols-2 gap-4">
							<div className="space-y-4">
							  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
								<SelectTrigger>
								  <SelectValue placeholder="Select a style" />
								</SelectTrigger>
								<SelectContent>
								  {STYLE_PRESETS.map((style) => (
									<SelectItem key={style} value={style}>
									  {style}
									</SelectItem>
								  ))}
								</SelectContent>
							  </Select>

							  <div className="space-y-2">
								<label className="text-sm">Style Strength</label>
								<Slider
								  value={[styleStrength]}
								  onValueChange={([value]) => setStyleStrength(value)}
								  min={0}
								  max={1}
								  step={0.1}
								/>
							  </div>

							  <div className="flex items-center space-x-2">
								<Switch
								  checked={preserveContent}
								  onCheckedChange={setPreserveContent}
								/>
								<label className="text-sm">Preserve Content</label>
							  </div>

							  <Button 
								onClick={handleStyleTransfer}
								disabled={isLoading || !template.thumbnail}
								className="w-full"
							  >
								{isLoading ? 'Applying Style...' : 'Apply Style'}
							  </Button>
							</div>

							<div 
							  className="bg-muted rounded-lg overflow-hidden relative"
							  style={{ aspectRatio }}
							>
							  {styledImage ? (
								<img
								  src={styledImage}
								  alt="Styled preview"
								  className="w-full h-full object-cover"
								/>
							  ) : (
								<div className="flex items-center justify-center h-full text-muted-foreground">
								  Apply a style to preview
								</div>
							  )}
							</div>
						  </div>
						</div>
					  </TabsContent>

					  {['youtube', 'tiktok', 'instagram'].map(platform => (
						<TabsContent key={platform} value={platform}>
						  <PreviewContent
							imageUrl={styledImage || template.thumbnail}
							aspectRatio={aspectRatio}
							isPlaying={isPlaying}
							setIsPlaying={setIsPlaying}
							isLoading={isLoading}
							setIsLoading={setIsLoading}
						  />
						</TabsContent>
					  ))}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

interface PreviewContentProps {
	imageUrl: string | null;
	aspectRatio: string;
	isPlaying: boolean;
	setIsPlaying: (playing: boolean) => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({
	imageUrl,
	aspectRatio,
	isPlaying,
	setIsPlaying,
	isLoading,
	setIsLoading
}) => (
	<div 
		className="bg-muted rounded-lg overflow-hidden relative"
		style={{ 
			aspectRatio,
			maxHeight: '70vh',
			margin: '0 auto'
		}}
	>
		{imageUrl && (
			<img
				src={imageUrl}
				alt="Preview"
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
			</div>
		</div>
	</div>
);

const getPlatformIcon = (platform: string) => {
	switch (platform) {
		case 'youtube': return <Monitor className="h-4 w-4" />;
		case 'tiktok': return <Smartphone className="h-4 w-4" />;
		case 'instagram': return <Instagram className="h-4 w-4" />;
		default: return <Monitor className="h-4 w-4" />;
	}
};
