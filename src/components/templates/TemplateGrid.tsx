import React from 'react';
import { useTemplateStore } from '@/store/template.store';
import { Template } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, GitBranch } from 'lucide-react';

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
					<div className="w-full h-full flex items-center justify-center text-muted-foreground">
						No Preview
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4">
				<h3 className="font-medium mb-1">{template.name}</h3>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{template.description}
				</p>
				<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
					<span>v{template.version}</span>
					<span>•</span>
					<span>{template.category}</span>
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

	const handleSelect = (template: Template) => {
		selectTemplate(template.id);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
			{templates.map((template) => (
				<TemplateCard
					key={template.id}
					template={template}
					onSelect={handleSelect}
				/>
			))}
		</div>
	);
};