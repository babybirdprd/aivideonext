'use client';

import React from 'react';
import { VideoFormatId, VIDEO_PRESETS } from '@/types/video.types';
import { useTemplateStore } from '@/store/template.store';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { TemplateForm } from '@/components/templates/TemplateForm';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function TemplatesPage() {
	const { setFilterFormat, setFilterPublished, filterFormat, filterPublished } = useTemplateStore();
	const [isCreating, setIsCreating] = React.useState(false);

	return (
		<div className="container py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Video Templates</h1>
				<Button onClick={() => setIsCreating(!isCreating)}>
					<Plus className="h-4 w-4 mr-2" />
					{isCreating ? 'Cancel' : 'Create Template'}
				</Button>
			</div>

			{/* Filter Bar */}
			<div className="flex gap-4 mb-6 items-center">
				<div className="w-64">
					<Select
						value={filterFormat || ''}
						onValueChange={(value: VideoFormatId | '') => 
							setFilterFormat(value || null)
						}
					>
						<SelectTrigger>
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
				</div>

				<ToggleGroup
					type="single"
					value={filterPublished === null ? 'all' : filterPublished ? 'published' : 'draft'}
					onValueChange={(value) => {
						if (value === 'all') setFilterPublished(null);
						else if (value === 'published') setFilterPublished(true);
						else if (value === 'draft') setFilterPublished(false);
					}}
				>
					<ToggleGroupItem value="all">All</ToggleGroupItem>
					<ToggleGroupItem value="published">Published</ToggleGroupItem>
					<ToggleGroupItem value="draft">Drafts</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Template List */}
				<div className={`${isCreating ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
					<TemplateGrid />
				</div>

				{/* Template Form or Preview */}
				{isCreating ? (
					<div className="bg-card rounded-lg border">
						<TemplateForm />
					</div>
				) : (
					<div className="fixed bottom-4 right-4 w-80 bg-card rounded-lg border shadow-lg">
						<TemplatePreview />
					</div>
				)}
			</div>
		</div>
	);
}