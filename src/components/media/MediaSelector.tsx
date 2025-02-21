import React, { useState, useEffect } from 'react';
import { pexelsService } from '@/services/media/pexels.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaSelectorProps {
	onSelect: (media: { url: string; type: 'image' | 'video'; id: string }) => void;
	type?: 'image' | 'video' | 'both';
	aspectRatio?: string;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
	onSelect,
	type = 'both',
	aspectRatio
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [mediaType, setMediaType] = useState<'image' | 'video'>(type === 'video' ? 'video' : 'image');
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		
		setLoading(true);
		try {
			let orientation = 'landscape';
			if (aspectRatio) {
				const [width, height] = aspectRatio.split('/').map(Number);
				if (width < height) orientation = 'portrait';
				else if (width === height) orientation = 'square';
			}

			const media = await pexelsService.searchMedia({
				query: searchQuery,
				type: mediaType,
				orientation,
				perPage: 20
			});
			setResults(media);
		} catch (error) {
			console.error('Error searching media:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search for media..."
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<Button onClick={handleSearch} disabled={loading}>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
				</Button>
			</div>

			{type === 'both' && (
				<Tabs value={mediaType} onValueChange={(v) => setMediaType(v as 'image' | 'video')}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="image" className="flex items-center gap-2">
							<Image className="h-4 w-4" />
							Images
						</TabsTrigger>
						<TabsTrigger value="video" className="flex items-center gap-2">
							<Video className="h-4 w-4" />
							Videos
						</TabsTrigger>
					</TabsList>
				</Tabs>
			)}

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{results.map((item) => (
					<Card
						key={item.id}
						className="group cursor-pointer overflow-hidden"
						onClick={() => onSelect({
							url: item.url,
							type: item.type,
							id: item.id
						})}
					>
						<CardContent className="p-0 aspect-video relative">
							<img
								src={item.preview || item.url}
								alt={item.keywords?.join(', ') || 'Media preview'}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<Button variant="secondary" size="sm">
									Select
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};