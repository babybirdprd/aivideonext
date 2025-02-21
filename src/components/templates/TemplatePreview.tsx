import React from 'react';
import { useTemplateStore } from '@/store/template.store';
import { useEditorStore } from '@/store/editor.store';
import { Template, TemplateParameter } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ParameterInputProps {
	parameter: TemplateParameter;
	value: any;
	onChange: (value: any) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({ parameter, value, onChange }) => {
	switch (parameter.type) {
		case 'text':
			return (
				<Input
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					placeholder={`Enter ${parameter.name}`}
				/>
			);
		case 'number':
			return (
				<Input
					type="number"
					value={value || ''}
					onChange={(e) => onChange(parseFloat(e.target.value))}
					placeholder={`Enter ${parameter.name}`}
				/>
			);
		case 'color':
			return (
				<Input
					type="color"
					value={value || '#000000'}
					onChange={(e) => onChange(e.target.value)}
					className="h-9 w-full"
				/>
			);
		case 'select':
			return (
				<select
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
				>
					{parameter.options?.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			);
		default:
			return null;
	}
};

export const TemplatePreview: React.FC = () => {
	const { selectedTemplate, templates } = useTemplateStore();
	const { currentProject } = useEditorStore();
	const [paramValues, setParamValues] = React.useState<Record<string, any>>({});

	const template = templates.find(t => t.id === selectedTemplate);
	if (!template) return null;

	const handleParameterChange = (paramId: string, value: any) => {
		setParamValues(prev => ({
			...prev,
			[paramId]: value
		}));
	};

	const applyTemplate = () => {
		// TODO: Apply template with parameter values to current project
		console.log('Applying template with values:', paramValues);
	};

	return (
		<div className="space-y-6 p-4">
			<div>
				<h2 className="text-lg font-semibold mb-2">{template.name}</h2>
				<p className="text-sm text-muted-foreground">{template.description}</p>
			</div>

			{template.parameters.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-sm font-medium">Template Parameters</h3>
					{template.parameters.map((param) => (
						<div key={param.id}>
							<Label>{param.name}</Label>
							<ParameterInput
								parameter={param}
								value={paramValues[param.id]}
								onChange={(value) => handleParameterChange(param.id, value)}
							/>
						</div>
					))}
				</div>
			)}

			<div className="pt-4 border-t">
				<Button 
					className="w-full" 
					onClick={applyTemplate}
					disabled={!currentProject}
				>
					Apply Template
				</Button>
			</div>
		</div>
	);
};