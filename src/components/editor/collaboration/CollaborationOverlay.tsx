import React, { useEffect } from 'react';
import { useCollaborationStore } from '@/store/collaboration.store';
import { motion, AnimatePresence } from 'framer-motion';

interface CursorProps {
	x: number;
	y: number;
	color: string;
	name: string;
}

interface SelectionHighlightProps {
	ids: string[];
	color: string;
	name: string;
}

const SelectionHighlight: React.FC<SelectionHighlightProps> = ({ ids, color, name }) => (
	<>
		{ids.map(id => {
			const element = document.getElementById(id);
			if (!element) return null;
			const { x, y, width, height } = element.getBoundingClientRect();
			
			return (
				<motion.div
					key={id}
					className="absolute pointer-events-none border-2 rounded-md"
					style={{ 
						borderColor: color,
						backgroundColor: `${color}20`,
					}}
					initial={{ opacity: 0 }}
					animate={{ 
						opacity: 1,
						x,
						y,
						width,
						height,
					}}
					transition={{ duration: 0.2 }}
				>
					<div 
						className="absolute -top-6 left-0 px-2 py-1 rounded-md text-xs text-white"
						style={{ backgroundColor: color }}
					>
						{name}
					</div>
				</motion.div>
			);
		})}
	</>
);

const Cursor: React.FC<CursorProps> = ({ x, y, color, name }) => (
	<motion.div
		className="pointer-events-none absolute"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1, x, y }}
		exit={{ opacity: 0 }}
	>
		<svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
			<path d="M0 0L16 6L10 10L6 16L0 0Z" />
		</svg>
		<div 
			className="absolute left-4 top-0 px-2 py-1 rounded-md text-xs text-white"
			style={{ backgroundColor: color }}
		>
			{name}
		</div>
	</motion.div>
);

export const CollaborationOverlay: React.FC = () => {
	const { users, activeUsers } = useCollaborationStore();
	const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const { updateCursorPosition } = useCollaborationStore.getState();
			updateCursorPosition(e.clientX, e.clientY);
		};

		const handleSelection = () => {
			const { updateSelection } = useCollaborationStore.getState();
			const selectedElements = document.querySelectorAll('[data-selected="true"]');
			const selectedIds = Array.from(selectedElements).map(el => el.id);
			updateSelection(selectedIds);
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('click', handleSelection);
		window.addEventListener('keyup', handleSelection);
		
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('click', handleSelection);
			window.removeEventListener('keyup', handleSelection);
		};
	}, []);

	return (
		<div className="fixed inset-0 pointer-events-none">
			<AnimatePresence>
				{users
					.filter(user => activeUsers.includes(user.id) && user.cursor)
					.map((user, index) => (
						<Cursor
							key={user.id}
							x={user.cursor!.x}
							y={user.cursor!.y}
							color={colors[index % colors.length]}
							name={user.name}
						/>
					))}
			</AnimatePresence>

			{users
				.filter(user => activeUsers.includes(user.id) && user.selection?.length)
				.map((user, index) => (
					<SelectionHighlight
						key={user.id}
						ids={user.selection!}
						color={colors[index % colors.length]}
						name={user.name}
					/>
				))}

			<div className="fixed top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
				<div className="text-sm font-medium mb-2">Active Users</div>
				<div className="space-y-1">
					{users
						.filter(user => activeUsers.includes(user.id))
						.map((user, index) => (
							<div
								key={user.id}
								className="flex items-center gap-2"
							>
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: colors[index % colors.length] }}
								/>
								<span className="text-sm">{user.name}</span>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};