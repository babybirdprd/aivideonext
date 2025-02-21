import React from 'react';
import { useDrag } from 'react-dnd';
import { Block } from '@/store/types';
import { cn } from '@/lib/utils';
import { BlockContent } from './BlockContent';

interface DraggableBlockProps {
	block: Block;
	isSelected?: boolean;
	onClick?: () => void;
	onDragStart?: () => void;
	onDragEnd?: () => void;
}

const blockTypeStyles = {
	text: "bg-blue-500/10 hover:bg-blue-500/20",
	media: "bg-purple-500/10 hover:bg-purple-500/20",
	effect: "bg-green-500/10 hover:bg-green-500/20",
	transition: "bg-orange-500/10 hover:bg-orange-500/20",
};

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
	block,
	isSelected,
	onClick,
	onDragStart,
	onDragEnd
}) => {
	const [{ isDragging }, drag] = useDrag(() => ({
		type: 'BLOCK',
		item: () => {
			onDragStart?.();
			return block;
		},
		end: (item, monitor) => {
			onDragEnd?.();
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	}));

	return (
		<div
			ref={drag}
			onClick={onClick}
			style={{ opacity: isDragging ? 0.5 : 1 }}
			className={cn(
				"cursor-move rounded-lg p-3 mb-2 transition-all",
				blockTypeStyles[block.type],
				isSelected && "ring-2 ring-primary shadow-lg",
				"hover:shadow-md"
			)}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					{block.type}
				</span>
				<span className="text-xs text-muted-foreground">
					{block.start}s - {block.start + block.duration}s
				</span>
			</div>
			<BlockContent block={block} />
		</div>
	);
};