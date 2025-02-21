import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MediaSelector } from './MediaSelector';
import { Image, Video } from 'lucide-react';

interface MediaDialogProps {
	onSelect: (media: { url: string; type: 'image' | 'video'; id: string }) => void;
	type?: 'image' | 'video' | 'both';
	aspectRatio?: string;
	currentValue?: string;
}

export const MediaDialog: React.FC<MediaDialogProps> = ({
	onSelect,
	type = 'both',
	aspectRatio,
	currentValue
}) => {
	const [isOpen, setIsOpen] = React.useState(false);

	const handleSelect = (media: { url: string; type: 'image' | 'video'; id: string }) => {
		onSelect(media);
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden group cursor-pointer">
					{currentValue ? (
						<img 
							src={currentValue} 
							alt="Selected media"
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							{type === 'video' ? (
								<Video className="h-8 w-8 text-muted-foreground" />
							) : (
								<Image className="h-8 w-8 text-muted-foreground" />
							)}
						</div>
					)}
					<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
						<Button variant="secondary">
							{currentValue ? 'Change Media' : 'Select Media'}
						</Button>
					</div>
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Select Media</DialogTitle>
				</DialogHeader>
				<MediaSelector
					onSelect={handleSelect}
					type={type}
					aspectRatio={aspectRatio}
				/>
			</DialogContent>
		</Dialog>
	);
};