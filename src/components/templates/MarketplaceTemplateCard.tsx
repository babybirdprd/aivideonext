import React, { useState, useEffect } from 'react';
import { Template } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { MonitorPlay, Tag, Star, Download, GitBranch, History } from 'lucide-react';
import { VIDEO_PRESETS } from '@/types/video.types';
import { useTemplateStore } from '@/store/template.store';
import { useToast } from '@/hooks/use-toast';
import { marketplaceService } from '@/services/templates/marketplace.service';
import { TemplatePreview } from './TemplatePreview';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MarketplaceTemplateCardProps {
	template: Template;
}

export const MarketplaceTemplateCard: React.FC<MarketplaceTemplateCardProps> = ({ template }) => {
	const { duplicateTemplate } = useTemplateStore();
	const { toast } = useToast();
	const [inheritedTemplates, setInheritedTemplates] = useState<Template[]>([]);
	const formatDimensions = VIDEO_PRESETS[template.videoFormat];

	useEffect(() => {
		if (template.isBase) {
			loadInheritedTemplates();
		}
	}, [template.isBase, template.id]);

	const loadInheritedTemplates = async () => {
		try {
			const templates = await marketplaceService.getInheritedTemplates(template.id);
			setInheritedTemplates(templates);
		} catch (error) {
			console.error('Error loading inherited templates:', error);
		}
	};

	const handleUseTemplate = () => {
		duplicateTemplate(template.id);
		toast({
			title: 'Template added to your library',
			description: 'You can now customize and use this template.',
		});
	};

	const handleInheritTemplate = async () => {
		try {
			await marketplaceService.inheritTemplate(template.id);
			toast({
				title: 'Template inherited',
				description: 'A new template has been created based on this one.',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to inherit template.',
				variant: 'destructive',
			});
		}
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
				<TemplatePreview template={template} />
				{template.trending && (
					<div className="absolute top-2 right-2">
						<Badge variant="secondary" className="bg-red-500/80 text-white">
							<Star className="h-3 w-3 mr-1 fill-current" /> Trending
						</Badge>
					</div>
				)}
			</div>

			  <div className="p-4">
				<div className="flex justify-between items-start mb-1">
				  <h3 className="font-medium">{template.name}</h3>
				  <div className="flex gap-1">
					{template.isBase && (
					  <Badge variant="secondary">Base</Badge>
					)}
					<Badge variant="outline">v{template.version}</Badge>
				  </div>
				</div>

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
				  {template.parentId && (
					<div className="flex items-center gap-1">
					  <GitBranch className="h-3 w-3" />
					  <span>Inherited</span>
					</div>
				  )}
				</div>

				<div className="flex gap-2">
				  <Button 
					className="flex-1"
					onClick={handleUseTemplate}
				  >
					<Download className="h-4 w-4 mr-2" />
					Use Template
				  </Button>

				  <DropdownMenu>
					<DropdownMenuTrigger asChild>
					  <Button variant="outline" size="icon">
						<History className="h-4 w-4" />
					  </Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
					  {template.versionHistory && JSON.parse(template.versionHistory).map((version: any) => (
						<DropdownMenuItem key={version.version}>
						  v{version.version} - {new Date(version.timestamp).toLocaleDateString()}
						</DropdownMenuItem>
					  ))}
					  {template.isBase && inheritedTemplates.length > 0 && (
						<>
						  <DropdownMenuItem className="font-semibold">
							Inherited Templates
						  </DropdownMenuItem>
						  {inheritedTemplates.map(t => (
							<DropdownMenuItem key={t.id}>
							  {t.name}
							</DropdownMenuItem>
						  ))}
						</>
					  )}
					</DropdownMenuContent>
				  </DropdownMenu>

				  {!template.parentId && (
					<Button
					  variant="outline"
					  size="icon"
					  onClick={handleInheritTemplate}
					  title="Create new template based on this one"
					>
					  <GitBranch className="h-4 w-4" />
					</Button>
				  )}
				</div>
			  </div>
		</div>
	);
};