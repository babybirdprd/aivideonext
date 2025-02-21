import React from 'react';
import { Block } from '@/store/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

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
] as const;

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

	return (
		<div className="space-y-4 p-4">
			<div>
				<Label>Effect Type</Label>
				<Select
					value={block.properties.effectName || ''}
					onValueChange={handleEffectChange}
				>
					{EFFECT_TYPES.map(effect => (
						<option key={effect} value={effect}>
							{effect.charAt(0).toUpperCase() + effect.slice(1)}
						</option>
					))}
				</Select>
			</div>

			<div>
				<Label>Intensity</Label>
				<Input
					type="range"
					min="0"
					max="1"
					step="0.1"
					value={block.properties.intensity || 0.5}
					onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
				/>
				<div className="text-sm text-muted-foreground mt-1">
					{Math.round((block.properties.intensity || 0.5) * 100)}%
				</div>
			</div>
		</div>
	);
};