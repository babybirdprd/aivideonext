import React from 'react';
import { useEditorStore } from '@/store/editor.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Block, BlockType } from '@/store/types';

interface BlockPropertyEditorProps {
	block: Block;
	onUpdate: (updates: Partial<Block>) => void;
}

const TextBlockEditor: React.FC<BlockPropertyEditorProps> = ({ block, onUpdate }) => (
	<div className="space-y-4">
		<div>
			<Label>Text Content</Label>
			<Input
				value={block.content}
				onChange={(e) => onUpdate({ content: e.target.value })}
			/>
		</div>
		<div>
			<Label>Font Family</Label>
			<Input
				value={block.properties.font || ''}
				onChange={(e) => onUpdate({ 
					properties: { ...block.properties, font: e.target.value }
				})}
			/>
		</div>
		<div>
			<Label>Font Size (px)</Label>
			<Input
				type="number"
				value={block.properties.fontSize || '16'}
				onChange={(e) => onUpdate({ 
					properties: { ...block.properties, fontSize: e.target.value }
				})}
			/>
		</div>
	</div>
);

const MediaBlockEditor: React.FC<BlockPropertyEditorProps> = ({ block, onUpdate }) => (
	<div className="space-y-4">
		<div>
			<Label>Media URL</Label>
			<Input
				value={block.content}
				onChange={(e) => onUpdate({ content: e.target.value })}
			/>
		</div>
		<div>
			<Label>Media Type</Label>
			<Input
				value={block.properties.mediaType || 'video'}
				onChange={(e) => onUpdate({ 
					properties: { ...block.properties, mediaType: e.target.value }
				})}
			/>
		</div>
	</div>
);

const EffectBlockEditor: React.FC<BlockPropertyEditorProps> = ({ block, onUpdate }) => (
	<div className="space-y-4">
		<div>
			<Label>Effect Name</Label>
			<Input
				value={block.properties.effectName || ''}
				onChange={(e) => onUpdate({ 
					properties: { ...block.properties, effectName: e.target.value }
				})}
			/>
		</div>
		<div>
			<Label>Intensity (%)</Label>
			<Input
				type="number"
				min="0"
				max="100"
				value={block.properties.intensity || '100'}
				onChange={(e) => onUpdate({ 
					properties: { ...block.properties, intensity: e.target.value }
				})}
			/>
		</div>
	</div>
);

const TransitionBlockEditor: React.FC<BlockPropertyEditorProps> = ({ block, onUpdate }) => (
	<div className="space-y-4">
		<div>
			<Label>Transition Type</Label>
			<Input
				value={block.properties.transitionType || ''}
				onChange={(e) => onUpdate({ 
					properties: { ...block.properties, transitionType: e.target.value }
				})}
			/>
		</div>
	</div>
);

const blockEditors: Record<BlockType, React.FC<BlockPropertyEditorProps>> = {
	text: TextBlockEditor,
	media: MediaBlockEditor,
	effect: EffectBlockEditor,
	transition: TransitionBlockEditor,
};

export const PropertyPanel: React.FC = () => {
	const { currentProject, selectedBlock, updateBlock, removeBlock } = useEditorStore();
	
	const selectedBlockData = currentProject?.blocks.find(
		block => block.id === selectedBlock
	);

	if (!selectedBlockData) {
		return (
			<div className="text-muted-foreground text-center p-4">
				No block selected
			</div>
		);
	}

	const BlockEditor = blockEditors[selectedBlockData.type];

	return (
		<div className="space-y-6 p-4">
			<div className="space-y-4">
				<BlockEditor 
					block={selectedBlockData}
					onUpdate={(updates) => selectedBlock && updateBlock(selectedBlock, updates)}
				/>

				<div className="pt-4 border-t">
					<Label>Start Time (seconds)</Label>
					<Input
						type="number"
						value={selectedBlockData.start}
						onChange={(e) => updateBlock(selectedBlock!, { 
							start: parseFloat(e.target.value) 
						})}
					/>
				</div>

				<div>
					<Label>Duration (seconds)</Label>
					<Input
						type="number"
						value={selectedBlockData.duration}
						onChange={(e) => updateBlock(selectedBlock!, { 
							duration: parseFloat(e.target.value) 
						})}
					/>
				</div>
			</div>

			<Button
				variant="destructive"
				className="w-full"
				onClick={() => selectedBlock && removeBlock(selectedBlock)}
			>
				Delete Block
			</Button>
		</div>
	);
};