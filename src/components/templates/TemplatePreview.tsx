import React from 'react';
import { useTemplateStore } from '@/store/template.store';
import { useEditorStore } from '@/store/editor.store';
import { Template, TemplateParameter, TemplateVersion } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Clock, GitBranch } from 'lucide-react';

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

interface VersionHistoryProps {
	versions: TemplateVersion[];
	currentVersion: string;
	onRevert: (version: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, currentVersion, onRevert }) => (
	<div className="space-y-2">
		{versions.map((version) => (
			<div key={version.version} className="flex items-center justify-between p-2 border rounded">
				<div>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						<span className="font-medium">Version {version.version}</span>
					</div>
					<div className="text-sm text-muted-foreground">
						{new Date(version.timestamp).toLocaleDateString()}
					</div>
					<ul className="text-sm mt-1">
						{version.changes.map((change, i) => (
							<li key={i}>{change.description}</li>
						))}
					</ul>
				</div>
				{version.version !== currentVersion && (
					<Button variant="outline" size="sm" onClick={() => onRevert(version.version)}>
						Revert
					</Button>
				)}
			</div>
		))}
	</div>
);

export const TemplatePreview: React.FC = () => {
	const { selectedTemplate, templates, resolveInheritedValues, revertToVersion } = useTemplateStore();
	const { currentProject } = useEditorStore();
	const [paramValues, setParamValues] = React.useState<Record<string, any>>({});
	const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

	const template = templates.find(t => t.id === selectedTemplate);
	if (!template) return null;

	const resolvedTemplate = template.inheritance 
		? resolveInheritedValues(template)
		: template;

	const validateParameter = (param: TemplateParameter, value: any): string | null => {
		if (!param.validation) return null;
		if (param.validation.required && !value) return 'This field is required';
		if (param.validation.min !== undefined && value < param.validation.min) {
			return `Value must be at least ${param.validation.min}`;
		}
		if (param.validation.max !== undefined && value > param.validation.max) {
			return `Value must be at most ${param.validation.max}`;
		}
		if (param.validation.pattern && typeof value === 'string') {
			const regex = new RegExp(param.validation.pattern);
			if (!regex.test(value)) return 'Invalid format';
		}
		return null;
	};

	const handleParameterChange = (paramId: string, value: any) => {
		const param = resolvedTemplate.parameters.find(p => p.id === paramId);
		if (!param) return;

		const error = validateParameter(param, value);
		setValidationErrors(prev => ({
			...prev,
			[paramId]: error || ''
		}));

		setParamValues(prev => ({
			...prev,
			[paramId]: value
		}));
	};

	const applyTemplate = () => {
		const errors = resolvedTemplate.parameters.reduce((acc, param) => {
			const error = validateParameter(param, paramValues[param.id]);
			if (error) acc[param.id] = error;
			return acc;
		}, {});

		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			return;
		}

		// TODO: Apply template with parameter values to current project
		console.log('Applying template with values:', paramValues);
	};

	return (
		<div className="space-y-6 p-4">
			<div>
				<h2 className="text-lg font-semibold mb-2">{template.name}</h2>
				<p className="text-sm text-muted-foreground">{template.description}</p>
				{template.inheritance && (
					<div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
						<GitBranch className="h-4 w-4" />
						<span>Inherits from: {templates.find(t => t.id === template.inheritance?.parentId)?.name}</span>
					</div>
				)}
			</div>

			{resolvedTemplate.parameters.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-sm font-medium">Template Parameters</h3>
					{resolvedTemplate.parameters.map((param) => (
						<div key={param.id}>
							<Label>{param.name}</Label>
							<ParameterInput
								parameter={param}
								value={paramValues[param.id]}
								onChange={(value) => handleParameterChange(param.id, value)}
							/>
							{validationErrors[param.id] && (
								<Alert variant="destructive" className="mt-1">
									{validationErrors[param.id]}
								</Alert>
							)}
						</div>
					))}
				</div>
			)}

			{template.versionHistory.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-medium">Version History</h3>
					<VersionHistory
						versions={template.versionHistory}
						currentVersion={template.version}
						onRevert={(version) => revertToVersion(template.id, version)}
					/>
				</div>
			)}

			<div className="pt-4 border-t">
				<Button 
					className="w-full" 
					onClick={applyTemplate}
					disabled={!currentProject || Object.keys(validationErrors).length > 0}
				>
					Apply Template
				</Button>
			</div>
		</div>
	);
};