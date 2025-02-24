"use client"

import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEditorStore } from '@/store/editor.store';
import { useCollaborationStore } from '@/store/collaboration.store';
import { CollaborationOverlay } from './collaboration/CollaborationOverlay';
import { Button } from '../ui/button';
import { DroppableTimeline } from './timeline/DroppableTimeline';
import { Block } from '@/store/types';
import { useDrag } from 'react-dnd';
import { PropertyPanel } from './properties/PropertyPanel';
import { PreviewPanel } from './preview/PreviewPanel';
import { Type, Image, Wand2 } from 'lucide-react';
import VideoFormatSelector from './VideoFormatSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutonomousPanel } from './autonomous/AutonomousPanel';

interface ToolButtonProps {
	block: Partial<Block>;
	icon: React.ReactNode;
	label: string;
}

const DraggableToolButton: React.FC<ToolButtonProps> = ({ block, icon, label }) => {
	const [{ isDragging }, drag] = useDrag(() => ({
		type: 'BLOCK',
		item: block,
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	}));

	return (
		<Button
			ref={drag}
			variant="outline"
			className="w-full justify-start gap-2 opacity-100"
			style={{ opacity: isDragging ? 0.5 : 1 }}
		>
			{icon}
			{label}
		</Button>
	);
};

const toolGroups = [
	{
		title: 'Content',
		tools: [
			{
				block: { type: 'text', content: 'New Text', duration: 5 },
				icon: <Type className="h-4 w-4" />,
				label: 'Text Block'
			},
			{
				block: { type: 'media', content: 'New Media', duration: 5 },
				icon: <Image className="h-4 w-4" />,
				label: 'Media Block'
			},
		]
	},
	{
		title: 'Effects',
		tools: [
			{
				block: { type: 'effect', content: 'New Effect', duration: 5 },
				icon: <Wand2 className="h-4 w-4" />,
				label: 'Effect'
			},
			{
				block: { type: 'transition', content: 'New Transition', duration: 2 },
				icon: <Wand2 className="h-4 w-4" />,
				label: 'Transition'
			},
		]
	}
];

export const EditorLayout: React.FC = () => {
	const { currentProject } = useEditorStore();
	const { initializeCollaboration, disconnectCollaboration } = useCollaborationStore();

	useEffect(() => {
		if (currentProject) {
			// Initialize collaboration with mock user (replace with actual auth user)
			initializeCollaboration(currentProject.id, {
				id: crypto.randomUUID(),
				name: `User ${Math.floor(Math.random() * 1000)}`,
			});

			return () => {
				disconnectCollaboration();
			};
		}
	}, [currentProject?.id]);

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="flex h-screen bg-background">
				{/* Tools Panel */}
				<div className="w-64 border-r border-border p-4 space-y-6">
					<h2 className="text-lg font-semibold">Tools</h2>
					{toolGroups.map((group, index) => (
						<div key={index} className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">{group.title}</h3>
							{group.tools.map((tool, toolIndex) => (
								<DraggableToolButton
									key={toolIndex}
									block={tool.block}
									icon={tool.icon}
									label={tool.label}
								/>
							))}
						</div>
					))}
				</div>

				{/* Main Editor Area */}
				<div className="flex-1 flex flex-col">
					{/* Preview Area */}
					<div className="flex-1 p-4">
						<PreviewPanel />
					</div>

					{/* Timeline */}
					<div className="h-48 p-4 border-t border-border">
						<DroppableTimeline />
					</div>
				</div>

				{/* Properties Panel */}
				<div className="w-64 border-l border-border p-4">
					<Tabs defaultValue="properties">
						<TabsList className="w-full mb-4">
							<TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
							<TabsTrigger value="autonomous" className="flex-1">AI Tools</TabsTrigger>
						</TabsList>
						<TabsContent value="properties">
							<div className="space-y-6">
								<VideoFormatSelector />
								<PropertyPanel />
							</div>
						</TabsContent>
						<TabsContent value="autonomous">
							<AutonomousPanel projectId={currentProject?.id || ''} />
						</TabsContent>
					</Tabs>
				</div>

				{/* Collaboration Overlay */}
				<CollaborationOverlay />
			</div>
		</DndProvider>
	);
};