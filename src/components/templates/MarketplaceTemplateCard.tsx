import React from 'react';
import { Template } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { MonitorPlay, Tag, Star, Download } from 'lucide-react';
import { VIDEO_PRESETS } from '@/types/video.types';
import { useTemplateStore } from '@/store/template.store';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceTemplateCardProps {
	template: Template;
}

export const MarketplaceTemplateCard: React.FC<MarketplaceTemplateCardProps> = ({ template }) => {
	const { duplicateTemplate } = useTemplateStore();
	const { toast } = useToast();
	const formatDimensions = VIDEO_PRESETS[template.videoFormat];

	const handleUseTemplate = () => {
		duplicateTemplate(template.id);
		toast({
			title: 'Template added to your library',
			description: 'You can now customize and use this template.',
		});
	};

	return (
		<div className="group bg-card rounded-lg border overflow-hidden">
			<div className="aspect-video bg-muted relative">
				{template.thumbnail ? (
					<img
						src={template.thumbnail}
						alt={template.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-accent">
						<MonitorPlay className="h-8 w-8 text-muted-foreground" />
					</div>
				)}
			</div>

			<div className="p-4">
				<h3 className="font-medium mb-1">{template.name}</h3>
				<p className="text-sm text-muted-foreground line-clamp-2 mb-2">
					{template.description}
				</p>

				<div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
					<div className="flex items-center gap-1">
						<MonitorPlay className="h-3 w-3" />
						<span>{template.videoFormat.replace(/-/g, ' ')}</span>
					</div>
					<div className="flex items-center gap-1">
						<Tag className="h-3 w-3" />
						<span>{template.category}</span>
					</div>
				</div>

				<Button 
					className="w-full"
					onClick={handleUseTemplate}
				>
					<Download className="h-4 w-4 mr-2" />
					Use Template
				</Button>
			</div>
		</div>
	);
};