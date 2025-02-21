'use client';

import React from 'react';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { TemplateForm } from '@/components/templates/TemplateForm';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TemplatesPage() {
	const [isCreating, setIsCreating] = React.useState(false);

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Video Templates</h1>
				<Button onClick={() => setIsCreating(!isCreating)}>
					<Plus className="h-4 w-4 mr-2" />
					{isCreating ? 'Cancel' : 'Create Template'}
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Template List */}
				<div className={`${isCreating ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
					<TemplateGrid />
				</div>

				{/* Template Form or Preview */}
				{isCreating ? (
					<div className="bg-card rounded-lg border">
						<TemplateForm />
					</div>
				) : (
					<div className="fixed bottom-4 right-4 w-80 bg-card rounded-lg border shadow-lg">
						<TemplatePreview />
					</div>
				)}
			</div>
		</div>
	);
}