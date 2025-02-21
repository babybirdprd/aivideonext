import React from 'react';
import { Block } from '@/store/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface TransitionBlockEditorProps {
	block: Block;
	onUpdate: (updates: Partial<Block>) => void;
}

const TRANSITION_TYPES = [
	'fade',
	'dissolve',
	'wipe',
	'slide',
	'zoom',
	'push',
	'crossfade',
	'swipe',
] as const;

const TRANSITION_DIRECTIONS = [
	'left',
	'right',
	'up',
	'down',
	'center',
] as const;

export const TransitionBlockEditor: React.FC<TransitionBlockEditorProps> = ({ block, onUpdate }) => {
	const handleTransitionChange = (transitionType: string) => {
		onUpdate({
			properties: {
				...block.properties,
				transitionType,
				direction: block.properties.direction || 'left',
				smoothness: block.properties.smoothness || 0.5,
			}
		});
	};

	const handleDirectionChange = (direction: string) => {
		onUpdate({
			properties: {
				...block.properties,
				direction,
			}
		});
	};

	const handleSmoothnessChange = (smoothness: number) => {
		onUpdate({
			properties: {
				...block.properties,
				smoothness: Math.max(0, Math.min(1, smoothness)),
			}
		});
	};

	return (
		<div className="space-y-4 p-4">
			<div>
				<Label>Transition Type</Label>
				<Select
					value={block.properties.transitionType || ''}
					onValueChange={handleTransitionChange}
				>
					{TRANSITION_TYPES.map(transition => (
						<option key={transition} value={transition}>
							{transition.charAt(0).toUpperCase() + transition.slice(1)}
						</option>
					))}
				</Select>
			</div>

			<div>
				<Label>Direction</Label>
				<Select
					value={block.properties.direction || 'left'}
					onValueChange={handleDirectionChange}
				>
					{TRANSITION_DIRECTIONS.map(direction => (
						<option key={direction} value={direction}>
							{direction.charAt(0).toUpperCase() + direction.slice(1)}
						</option>
					))}
				</Select>
			</div>

			<div>
				<Label>Smoothness</Label>
				<Input
					type="range"
					min="0"
					max="1"
					step="0.1"
					value={block.properties.smoothness || 0.5}
					onChange={(e) => handleSmoothnessChange(parseFloat(e.target.value))}
				/>
				<div className="text-sm text-muted-foreground mt-1">
					{Math.round((block.properties.smoothness || 0.5) * 100)}%
				</div>
			</div>
		</div>
	);
};