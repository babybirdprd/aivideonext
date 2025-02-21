import React from 'react';
import { Block } from '@/store/types';
import { cn } from '@/lib/utils';

interface BlockContentProps {
	block: Block;
}

const TextBlockContent: React.FC<BlockContentProps> = ({ block }) => (
	<div className="space-y-1">
		<div className="text-sm font-medium">{block.content}</div>
		<div className="text-xs text-muted-foreground">
			Font: {block.properties.font || 'Default'} | 
			Size: {block.properties.fontSize || '16px'}
		</div>
	</div>
);

const MediaBlockContent: React.FC<BlockContentProps> = ({ block }) => (
	<div className="space-y-1">
		<div className="text-sm font-medium">
			{block.properties.fileName || 'Media'}
		</div>
		<div className="text-xs text-muted-foreground">
			Type: {block.properties.mediaType || 'video'} | 
			Duration: {block.duration}s
		</div>
	</div>
);

const EffectBlockContent: React.FC<BlockContentProps> = ({ block }) => (
	<div className="space-y-1">
		<div className="text-sm font-medium">{block.properties.effectName}</div>
		<div className="text-xs text-muted-foreground">
			Intensity: {block.properties.intensity || '100%'}
		</div>
	</div>
);

const TransitionBlockContent: React.FC<BlockContentProps> = ({ block }) => (
	<div className="space-y-1">
		<div className="text-sm font-medium">{block.properties.transitionType}</div>
		<div className="text-xs text-muted-foreground">
			Duration: {block.duration}s
		</div>
	</div>
);

export const BlockContent: React.FC<BlockContentProps> = ({ block }) => {
	const contentMap = {
		text: TextBlockContent,
		media: MediaBlockContent,
		effect: EffectBlockContent,
		transition: TransitionBlockContent,
	};

	const Component = contentMap[block.type];
	return Component ? <Component block={block} /> : null;
};