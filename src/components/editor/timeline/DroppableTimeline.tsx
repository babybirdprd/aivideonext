import React, { useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { Block } from '@/store/types';
import { useEditorStore } from '@/store/editor.store';
import { DraggableBlock } from '../blocks/DraggableBlock';
import { cn } from '@/lib/utils';

const TimeMarker: React.FC<{ time: number; left: string }> = ({ time, left }) => (
	<div className="absolute h-full" style={{ left }}>
		<div className="h-2 w-px bg-muted-foreground/30" />
		<div className="text-xs text-muted-foreground mt-1">{time}s</div>
	</div>
);

export const DroppableTimeline: React.FC = () => {
	const { currentProject, selectedBlock, addBlock, selectBlock, updateBlock } = useEditorStore();

	const timeMarkers = useMemo(() => {
		const duration = currentProject?.settings.duration || 0;
		const markers = [];
		const interval = Math.max(5, Math.floor(duration / 10)); // Show markers every 5 seconds or 1/10th of duration
		
		for (let time = 0; time <= duration; time += interval) {
			markers.push({
				time,
				left: `${(time / duration) * 100}%`
			});
		}
		return markers;
	}, [currentProject?.settings.duration]);

	const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: 'BLOCK',
		drop: (item: Block, monitor) => {
			const offset = monitor.getClientOffset();
			if (offset && currentProject) {
				const timelineRect = document.getElementById('timeline')?.getBoundingClientRect();
				if (!timelineRect) return;

				const relativeX = offset.x - timelineRect.left;
				const timePosition = (relativeX / timelineRect.width) * currentProject.settings.duration;
				const snappedTime = Math.max(0, Math.round(timePosition * 2) / 2); // Snap to 0.5s intervals

				if (item.id) {
					updateBlock(item.id, { start: snappedTime });
				} else {
					addBlock({
						...item,
						id: crypto.randomUUID(),
						start: snappedTime,
						duration: 5,
						properties: {}
					});
				}
			}
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	}));

	const getBlockStyle = (block: Block) => {
		const duration = currentProject?.settings.duration || 0;
		return {
			position: 'absolute' as const,
			left: `${(block.start / duration) * 100}%`,
			width: `${(block.duration / duration) * 100}%`,
		};
	};

	return (
		<div
			id="timeline"
			ref={drop}
			className={cn(
				"h-full min-h-[200px] bg-muted rounded-lg p-4 relative",
				isOver && "bg-muted/80",
				canDrop && "ring-2 ring-primary/50"
			)}
		>
			{/* Time markers */}
			<div className="absolute top-0 left-0 w-full h-6 border-b border-muted-foreground/20">
				{timeMarkers.map(({ time, left }) => (
					<TimeMarker key={time} time={time} left={left} />
				))}
			</div>

			{/* Blocks container */}
			<div className="relative mt-8">
				{currentProject?.blocks.map((block) => (
					<div key={block.id} style={getBlockStyle(block)}>
						<DraggableBlock
							block={block}
							isSelected={selectedBlock === block.id}
							onClick={() => selectBlock(block.id)}
							onDragStart={() => selectBlock(block.id)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};