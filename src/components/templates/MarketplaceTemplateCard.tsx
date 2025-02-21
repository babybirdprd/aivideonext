import React from 'react';
import { Template } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Copy, MonitorPlay, Tag, TrendingUp, Eye, Share2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarketplaceTemplateCardProps {
	template: Template;
	onSelect?: (template: Template) => void;
}


export function MarketplaceTemplateCard({ template, onSelect }: MarketplaceTemplateCardProps) {
	const isTrending = template.trendScore > 50;

	return (
		<div className="group relative bg-card rounded-lg overflow-hidden border hover:border-primary transition-colors">

			  {/* Thumbnail */}
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
				{isTrending && (
				  <Badge className="absolute top-2 left-2 bg-primary" variant="secondary">
					<TrendingUp className="h-3 w-3 mr-1" />
					Trending
				  </Badge>
				)}
			  </div>

			  {/* Content */}
			  <div className="p-4">
				<h3 className="font-medium mb-1">{template.name}</h3>
				<p className="text-sm text-muted-foreground line-clamp-2 mb-2">
				  {template.description}
				</p>
				
				{/* Metrics */}
				<div className="flex gap-3 text-sm text-muted-foreground mb-2">
				  <div className="flex items-center gap-1">
					<Eye className="h-4 w-4" />
					<span>{template.views}</span>
				  </div>
				  <div className="flex items-center gap-1">
					<Share2 className="h-4 w-4" />
					<span>{template.shares}</span>
				  </div>
				  <div className="flex items-center gap-1">
					<Heart className="h-4 w-4" />
					<span>{template.likes}</span>
				  </div>
				</div>

				{/* Tags */}
				<div className="flex flex-wrap gap-2">
				  <Badge variant="outline">{template.contentType}</Badge>
				  <Badge variant="outline">{template.niche}</Badge>
				  {template.subNiche && <Badge variant="outline">{template.subNiche}</Badge>}
				</div>
			  </div>

			  {/* Actions */}
			  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="flex gap-1">
				  <Button
					variant="secondary"
					size="icon"
					onClick={(e) => {
					  e.stopPropagation();
					  // Handle copy
					}}
				  >
					<Copy className="h-4 w-4" />
				  </Button>
				</div>
			  </div>

			  {/* Click overlay */}
			  {onSelect && (
				<button
				  className="absolute inset-0 bg-transparent"
				  onClick={() => onSelect(template)}
				/>
			  )}
			</div>
		  );
		}
