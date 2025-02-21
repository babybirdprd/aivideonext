import React, { useState, useMemo } from 'react';
import { useTemplateStore } from '@/store/template.store';
import { Template } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, GitBranch, MonitorPlay, Tag, CircleDot } from 'lucide-react';
import { NicheSelector } from './NicheSelector';
import { Input } from '@/components/ui/input';

interface TemplateCardProps {
	template: Template;
	onSelect: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
	const { duplicateTemplate, deleteTemplate, createVersionFromTemplate } = useTemplateStore();

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
			</div>

			{/* Content */}
			<div className="p-4">
				<h3 className="font-medium mb-1">{template.name}</h3>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{template.description}
				</p>
				<div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
					<div className="flex items-center gap-1">
						<MonitorPlay className="h-3 w-3" />
						<span>{template.videoFormat.replace(/-/g, ' ')}</span>
					</div>
					<div className="flex items-center gap-1">
						<Tag className="h-3 w-3" />
						<span>{template.category}</span>
					</div>
					<div className="flex items-center gap-1">
						<CircleDot className="h-3 w-3" />
						<span>{template.isPublished ? 'Published' : 'Draft'}</span>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="flex gap-1">
					<Button
						variant="secondary"
						size="icon"
						onClick={() => duplicateTemplate(template.id)}
					>
						<Copy className="h-4 w-4" />
					</Button>
					<Button
						variant="secondary"
						size="icon"
						onClick={() => createVersionFromTemplate(template.id)}
					>
						<GitBranch className="h-4 w-4" />
					</Button>
					<Button
						variant="destructive"
						size="icon"
						onClick={() => deleteTemplate(template.id)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Click overlay */}
			<button
				className="absolute inset-0 bg-transparent"
				onClick={() => onSelect(template)}
			/>
		</div>
	);
};

export const TemplateGrid: React.FC = () => {
	const { templates, selectTemplate } = useTemplateStore();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedNiche, setSelectedNiche] = useState('');
	const [selectedSubNiche, setSelectedSubNiche] = useState('');

	const filteredTemplates = useMemo(() => {
		return templates.filter(template => {
			const matchesSearch = searchQuery === '' || 
				template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				template.description.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesNiche = selectedNiche === '' || template.niche === selectedNiche;
			const matchesSubNiche = selectedSubNiche === '' || template.subNiche === selectedSubNiche;

			return matchesSearch && matchesNiche && matchesSubNiche;
		});
	}, [templates, searchQuery, selectedNiche, selectedSubNiche]);

	const handleNicheChange = (niche: string, subNiche?: string) => {
		setSelectedNiche(niche);
		setSelectedSubNiche(subNiche || '');
	};

	const handleSelect = (template: Template) => {
		selectTemplate(template.id);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row gap-4 p-4">
				<Input
					placeholder="Search templates..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-sm"
				/>
				<NicheSelector onNicheChange={handleNicheChange} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
				{filteredTemplates.length > 0 ? (
					filteredTemplates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							onSelect={handleSelect}
						/>
					))
				) : (
					<div className="col-span-full text-center py-8 text-muted-foreground">
						No templates found matching your criteria
					</div>
				)}
			</div>
		</div>
	);
};