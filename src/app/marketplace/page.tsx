'use client';

import React from 'react';
import { useTemplateStore } from '@/store/template.store';
import { VideoFormatId, VIDEO_PRESETS } from '@/types/video.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { MarketplaceTemplateCard } from '@/components/templates/MarketplaceTemplateCard';

export default function MarketplacePage() {
	const { getFilteredTemplates, setFilterFormat, filterFormat } = useTemplateStore();
	const [searchQuery, setSearchQuery] = React.useState('');
	const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

	const templates = getFilteredTemplates().filter(template => 
		template.isPublished && 
		(searchQuery === '' || 
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
		(selectedCategory === 'all' || template.category === selectedCategory)
	);

	const categories = [...new Set(getFilteredTemplates()
		.filter(t => t.isPublished)
		.map(t => t.category))];

	return (
		<div className="container py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Template Marketplace</h1>
			</div>

			<div className="flex gap-4 mb-6">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search templates..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Filters */}
				<div className="flex gap-2">
					<Select value={filterFormat || ''} onValueChange={(v: VideoFormatId | '') => setFilterFormat(v || null)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="All formats" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All formats</SelectItem>
							{Object.entries(VIDEO_PRESETS).map(([id, dimensions]) => (
								<SelectItem key={id} value={id}>
									{id.replace(/-/g, ' ')} ({dimensions.width}x{dimensions.height})
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{categories.map(category => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{templates.map((template) => (
					<MarketplaceTemplateCard key={template.id} template={template} />
				))}
			</div>
		</div>
	);
}