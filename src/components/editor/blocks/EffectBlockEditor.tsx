import React from 'react';
import { Block } from '@/store/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface EffectBlockEditorProps {
	block: Block;
	onUpdate: (updates: Partial<Block>) => void;
}

const EFFECT_TYPES = [
	'blur',
	'brightness',
	'contrast',
	'saturation',
	'overlay',
	'zoom',
	'pan',
	'rotate',
	'fade',
	'style-transfer'
] as const;

const STYLE_PRESETS = [
	'oil painting',
	'watercolor',
	'pencil sketch',
	'digital art',
	'anime',
	'photorealistic',
	'abstract',
	'pop art',
	'cyberpunk',
	'steampunk',
	'minimalist',
	'vintage',
	'gothic',
	'impressionist',
	'surrealist'
];

export const EffectBlockEditor: React.FC<EffectBlockEditorProps> = ({ block, onUpdate }) => {
	const handleEffectChange = (effectName: string) => {
		onUpdate({
			properties: {
				...block.properties,
				effectName,
				intensity: block.properties.intensity || 0.5,
			}
		});
	};

	const handleIntensityChange = (intensity: number) => {
		onUpdate({
			properties: {
				...block.properties,
				intensity: Math.max(0, Math.min(1, intensity)),
			}
		});
	};

	const handleStyleChange = (style: string) => {
		onUpdate({
			properties: {
				...block.properties,
				style,
			}
		});
	};

	const handlePreserveContentChange = (preserve: boolean) => {
		onUpdate({
			properties: {
				...block.properties,
				preserveContent: preserve,
			}
		});
	};

	return (
		<div className="space-y-4 p-4">
			<div>
				<Label>Effect Type</Label>
				<Select value={block.properties.effectName || ''} onValueChange={handleEffectChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select effect type" />
					</SelectTrigger>
					<SelectContent>
						{EFFECT_TYPES.map(effect => (
							<SelectItem key={effect} value={effect}>
								{effect.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{block.properties.effectName === 'style-transfer' ? (
				<>
					<div>
						<Label>Style</Label>
						<Select 
							value={block.properties.style || STYLE_PRESETS[0]} 
							onValueChange={handleStyleChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select style" />
							</SelectTrigger>
							<SelectContent>
								{STYLE_PRESETS.map(style => (
									<SelectItem key={style} value={style}>
										{style.charAt(0).toUpperCase() + style.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Style Strength</Label>
						<Slider
							value={[block.properties.intensity || 0.5]}
							onValueChange={([value]) => handleIntensityChange(value)}
							min={0}
							max={1}
							step={0.1}
							className="mt-2"
						/>
						<div className="text-sm text-muted-foreground mt-1">
							{Math.round((block.properties.intensity || 0.5) * 100)}%
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							checked={block.properties.preserveContent || true}
							onCheckedChange={handlePreserveContentChange}
						/>
						<Label>Preserve Content</Label>
					</div>
				</>
			) : (
				<div>
					<Label>Intensity</Label>
					<Slider
						value={[block.properties.intensity || 0.5]}
						onValueChange={([value]) => handleIntensityChange(value)}
						min={0}
						max={1}
						step={0.1}
						className="mt-2"
					/>
					<div className="text-sm text-muted-foreground mt-1">
						{Math.round((block.properties.intensity || 0.5) * 100)}%
					</div>
				</div>
			)}
		</div>
	);
};