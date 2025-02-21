import React from 'react';
import { useTemplateStore } from '@/store/template.store';
import { Template, TemplateParameter, TemplateInheritance } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, ChevronDown } from 'lucide-react';
import { TemplateVersionDialog } from './TemplateVersionDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { VideoFormatId } from '@/types/video.types';
import { VideoFormatSelector } from './VideoFormatSelector';

interface StyleParameterFormProps {
	parameter: TemplateParameter;
	onUpdate: (validation: TemplateParameter['validation']) => void;
}

const StyleParameterForm: React.FC<StyleParameterFormProps> = ({ parameter, onUpdate }) => {
	const validation = parameter.validation || {};
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Style Strength</Label>
				<Slider
					value={[validation.styleStrength || 0.8]}
					min={0}
					max={1}
					step={0.1}
					onValueChange={([value]) => 
						onUpdate({ ...validation, styleStrength: value })}
				/>
			</div>
			<div className="flex items-center gap-2">
				<Checkbox 
					checked={validation.preserveContent}
					onCheckedChange={(checked) => 
						onUpdate({ ...validation, preserveContent: checked })}
				/>
				<Label>Preserve Original Content</Label>
			</div>
			<div className="space-y-2">
				<Label>Style Presets</Label>
				<div className="grid grid-cols-2 gap-2">
					{parameter.stylePresets?.map((preset, index) => (
						<div key={index} className="flex items-center gap-2 p-2 border rounded">
							<Input
								placeholder="Preset Name"
								value={preset.name}
								onChange={(e) => {
									const newPresets = [...(parameter.stylePresets || [])];
									newPresets[index] = { ...preset, name: e.target.value };
									onUpdate({ 
										...validation, 
										stylePresets: newPresets 
									});
								}}
							/>
							<Input
								placeholder="Style Value"
								value={preset.value}
								onChange={(e) => {
									const newPresets = [...(parameter.stylePresets || [])];
									newPresets[index] = { ...preset, value: e.target.value };
									onUpdate({ 
										...validation, 
										stylePresets: newPresets 
									});
								}}
							/>
						</div>
					))}
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							const newPresets = [...(parameter.stylePresets || []), { name: '', value: '' }];
							onUpdate({ ...validation, stylePresets: newPresets });
						}}
					>
						Add Preset
					</Button>
				</div>
			</div>
		</div>
	);
};

interface ValidationFormProps {
	validation: TemplateParameter['validation'];
	onUpdate: (validation: TemplateParameter['validation']) => void;
}

const ValidationForm: React.FC<ValidationFormProps> = ({ validation = {}, onUpdate }) => (
	<div className="space-y-2 mt-2">
		<div className="flex items-center gap-2">
			<Checkbox 
				checked={validation.required}
				onCheckedChange={(checked) => onUpdate({ ...validation, required: checked })}
			/>
			<Label>Required</Label>
		</div>
		<div className="flex gap-2">
			<Input
				type="number"
				placeholder="Min"
				value={validation.min}
				onChange={(e) => onUpdate({ ...validation, min: Number(e.target.value) })}
			/>
			<Input
				type="number"
				placeholder="Max"
				value={validation.max}
				onChange={(e) => onUpdate({ ...validation, max: Number(e.target.value) })}
			/>
		</div>
		<Input
			placeholder="Pattern (regex)"
			value={validation.pattern}
			onChange={(e) => onUpdate({ ...validation, pattern: e.target.value })}
		/>
	</div>
);

interface ParameterFormProps {
	parameter: TemplateParameter;
	onUpdate: (updated: TemplateParameter) => void;
	onDelete: () => void;
}

const ParameterForm: React.FC<ParameterFormProps> = ({ parameter, onUpdate, onDelete }) => (
	<div className="flex gap-2 items-start border p-4 rounded-lg">
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
					<option value="style">Style Transfer</option>
				</select>
				{parameter.type !== 'style' && (
					<Input
						placeholder="Default Value"
						value={parameter.defaultValue}
						onChange={(e) => onUpdate({ ...parameter, defaultValue: e.target.value })}
					/>
				)}
			</div>
			{parameter.type === 'style' ? (
				<StyleParameterForm
					parameter={parameter}
					onUpdate={(validation) => onUpdate({ ...parameter, validation })}
				/>
			) : (
				<ValidationForm
					validation={parameter.validation}
					onUpdate={(validation) => onUpdate({ ...parameter, validation })}
				/>
			)}
		</div>
		<Button variant="ghost" size="icon" onClick={onDelete}>
			<X className="h-4 w-4" />
		</Button>
	</div>
);

interface InheritanceFormProps {
	inheritance?: TemplateInheritance;
	onUpdate: (inheritance: TemplateInheritance) => void;
	availableTemplates: Template[];
}

const InheritanceForm: React.FC<InheritanceFormProps> = ({ inheritance, onUpdate, availableTemplates }) => (
	<div className="space-y-4">
		<div>
			<Label>Parent Template</Label>
			<select
				className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
				value={inheritance?.parentId}
				onChange={(e) => onUpdate({ 
					parentId: e.target.value,
					overrides: inheritance?.overrides || [],
					inherited: inheritance?.inherited || ['blocks', 'parameters']
				})}
			>
				<option value="">None</option>
				{availableTemplates.map(t => (
					<option key={t.id} value={t.id}>{t.name}</option>
				))}
			</select>
		</div>
		{inheritance && (
			<div>
				<Label>Inherit Properties</Label>
				<div className="space-y-2">
					{['blocks', 'parameters'].map(prop => (
						<div key={prop} className="flex items-center gap-2">
							<Checkbox
								checked={inheritance.inherited.includes(prop)}
								onCheckedChange={(checked) => {
									const inherited = checked 
										? [...inheritance.inherited, prop]
										: inheritance.inherited.filter(p => p !== prop);
									onUpdate({ ...inheritance, inherited });
								}}
							/>
							<Label>{prop}</Label>
						</div>
					))}
				</div>
			</div>
		)}
	</div>
);

export const TemplateForm: React.FC = () => {
	const { addTemplate, templates } = useTemplateStore();
	const [template, setTemplate] = React.useState<Partial<Template>>({
		name: '',
		description: '',
		category: '',
		parameters: [],
		version: '1.0',
		versionHistory: [],
		created: new Date(),
		updated: new Date(),
		videoFormat: 'youtube-landscape', // Default format
		isPublished: false,
		blocks: [],
		tags: []
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

	const handleInheritanceUpdate = (inheritance: TemplateInheritance) => {
		setTemplate(prev => ({ ...prev, inheritance }));
	};

	const handleVersionCreated = (updatedTemplate: Template) => {
		setTemplate(prev => ({
			...prev,
			version: updatedTemplate.version,
			versionHistory: updatedTemplate.versionHistory
		}));
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
				<Label>Video Format</Label>
				<div className="mt-2">
					<VideoFormatSelector
						value={template.videoFormat}
						onChange={(value) => 
							setTemplate(prev => ({ 
								...prev, 
								videoFormat: value,
								// Reset blocks when format changes to prevent incompatible layouts
								blocks: [] 
							}))
						}
					/>
				</div>
				<p className="text-sm text-muted-foreground mt-2">
					Select the target platform and format for your video template.
					This will determine the dimensions and recommended settings for the output.
				</p>
			</div>

			<div>
				<Label>Publishing Status</Label>
				<div className="flex items-center space-x-2">
					<Switch
						checked={template.isPublished}
						onCheckedChange={(checked) =>
							setTemplate(prev => ({ ...prev, isPublished: checked }))
						}
					/>
					<Label>{template.isPublished ? 'Published' : 'Draft'}</Label>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between mb-2">
					<Label>Version Management</Label>
					<div className="flex items-center gap-2">
						<div className="text-sm text-muted-foreground">
							Current Version: {template.version}
						</div>
						{template.id && (
							<TemplateVersionDialog
								template={template as Template}
								onVersionCreated={handleVersionCreated}
							/>
						)}
					</div>
				</div>
				{template.versionHistory && template.versionHistory.length > 0 && (
					<div className="mt-2 space-y-2">
						<Label className="text-sm">Version History</Label>
						<div className="text-sm text-muted-foreground">
							{JSON.parse(template.versionHistory).map((version: any) => (
								<div key={version.version} className="flex items-center gap-2">
									<span>v{version.version}</span>
									<span>-</span>
									<span>{new Date(version.timestamp).toLocaleDateString()}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			<div>
				<Label>Inheritance</Label>
				<InheritanceForm
					inheritance={template.inheritance}
					onUpdate={handleInheritanceUpdate}
					availableTemplates={templates.filter(t => t.id !== template.id)}
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