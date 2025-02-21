import React from 'react';
import { useTemplateStore } from '@/store/template.store';
import { Template, TemplateParameter } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface ParameterFormProps {
	parameter: TemplateParameter;
	onUpdate: (updated: TemplateParameter) => void;
	onDelete: () => void;
}

const ParameterForm: React.FC<ParameterFormProps> = ({ parameter, onUpdate, onDelete }) => (
	<div className="flex gap-2 items-start">
		<div className="flex-1 space-y-2">
			<Input
				placeholder="Parameter Name"
				value={parameter.name}
				onChange={(e) => onUpdate({ ...parameter, name: e.target.value })}
			/>
			<div className="flex gap-2">
				<select
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
					value={parameter.type}
					onChange={(e) => onUpdate({ 
						...parameter, 
						type: e.target.value as TemplateParameter['type']
					})}
				>
					<option value="text">Text</option>
					<option value="number">Number</option>
					<option value="color">Color</option>
					<option value="select">Select</option>
					<option value="media">Media</option>
				</select>
				<Input
					placeholder="Default Value"
					value={parameter.defaultValue}
					onChange={(e) => onUpdate({ ...parameter, defaultValue: e.target.value })}
				/>
			</div>
		</div>
		<Button variant="ghost" size="icon" onClick={onDelete}>
			<X className="h-4 w-4" />
		</Button>
	</div>
);

export const TemplateForm: React.FC = () => {
	const { addTemplate } = useTemplateStore();
	const [template, setTemplate] = React.useState<Partial<Template>>({
		name: '',
		description: '',
		category: '',
		version: '1.0',
		parameters: [],
		blocks: [],
		tags: [],
	});

	const addParameter = () => {
		setTemplate(prev => ({
			...prev,
			parameters: [
				...(prev.parameters || []),
				{
					id: crypto.randomUUID(),
					name: '',
					type: 'text',
					defaultValue: '',
				}
			]
		}));
	};

	const updateParameter = (id: string, updated: TemplateParameter) => {
		setTemplate(prev => ({
			...prev,
			parameters: prev.parameters?.map(p =>
				p.id === id ? updated : p
			)
		}));
	};

	const deleteParameter = (id: string) => {
		setTemplate(prev => ({
			...prev,
			parameters: prev.parameters?.filter(p => p.id !== id)
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!template.name || !template.description) return;

		const newTemplate: Template = {
			...template as Template,
			id: crypto.randomUUID(),
			created: new Date(),
			updated: new Date(),
		};

		addTemplate(newTemplate);
		setTemplate({
			name: '',
			description: '',
			category: '',
			version: '1.0',
			parameters: [],
			blocks: [],
			tags: [],
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 p-4">
			<div>
				<Label>Template Name</Label>
				<Input
					value={template.name}
					onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
					placeholder="Enter template name"
				/>
			</div>

			<div>
				<Label>Description</Label>
				<Input
					value={template.description}
					onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
					placeholder="Enter template description"
				/>
			</div>

			<div>
				<Label>Category</Label>
				<Input
					value={template.category}
					onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
					placeholder="Enter template category"
				/>
			</div>

			<div>
				<div className="flex items-center justify-between mb-2">
					<Label>Parameters</Label>
					<Button type="button" variant="outline" size="sm" onClick={addParameter}>
						<Plus className="h-4 w-4 mr-1" />
						Add Parameter
					</Button>
				</div>
				<div className="space-y-2">
					{template.parameters?.map((param) => (
						<ParameterForm
							key={param.id}
							parameter={param}
							onUpdate={(updated) => updateParameter(param.id, updated)}
							onDelete={() => deleteParameter(param.id)}
						/>
					))}
				</div>
			</div>

			<Button type="submit" className="w-full">
				Create Template
			</Button>
		</form>
	);
};