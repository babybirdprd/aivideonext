import React from 'react';
import { VideoFormat, VideoPlatform, VIDEO_FORMATS, getPlatformFormats } from '@/types/video-format.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Smartphone, Instagram } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VideoFormatSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const VideoFormatSelector: React.FC<VideoFormatSelectorProps> = ({
	value,
	onChange
}) => {
	const [selectedPlatform, setSelectedPlatform] = React.useState<VideoPlatform>('youtube');
	const selectedFormat = VIDEO_FORMATS.find(format => format.id === value);
	const platformFormats = getPlatformFormats(selectedPlatform);

	const getPlatformIcon = (platform: VideoPlatform) => {
		switch (platform) {
			case 'youtube': return <Monitor className="h-4 w-4" />;
			case 'tiktok': return <Smartphone className="h-4 w-4" />;
			case 'instagram': return <Instagram className="h-4 w-4" />;
			default: return <Monitor className="h-4 w-4" />;
		}
	};

	return (
		<div className="space-y-4">
			<Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as VideoPlatform)}>
				<TabsList className="grid w-full grid-cols-3">
					{['youtube', 'tiktok', 'instagram'].map(platform => (
						<TabsTrigger 
							key={platform} 
							value={platform}
							className="flex items-center gap-2"
						>
							{getPlatformIcon(platform as VideoPlatform)}
							{platform}
						</TabsTrigger>
					))}
				</TabsList>

				{['youtube', 'tiktok', 'instagram'].map(platform => (
					<TabsContent key={platform} value={platform}>
						<div className="grid gap-4">
							<Select value={value} onValueChange={onChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select format" />
								</SelectTrigger>
								<SelectContent>
									{platformFormats.map(format => (
										<SelectItem key={format.id} value={format.id}>
											{format.name} ({format.width}x{format.height})
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{selectedFormat && (
								<Card>
									<CardContent className="pt-6">
										<div className="grid gap-2 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Resolution:</span>
												<span>{selectedFormat.width}x{selectedFormat.height}</span>
											</div>
											{selectedFormat.recommendedSettings && (
												<>
													<div className="flex justify-between">
														<span className="text-muted-foreground">FPS:</span>
														<span>{selectedFormat.recommendedSettings.fps}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Bitrate:</span>
														<span>{selectedFormat.recommendedSettings.bitrate}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Max Duration:</span>
														<span>{selectedFormat.recommendedSettings.maxDuration}s</span>
													</div>
												</>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
};