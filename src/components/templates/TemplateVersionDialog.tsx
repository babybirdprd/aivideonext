import React from 'react';
import { Template, TemplateVersion } from '@/store/template.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { marketplaceService } from '@/services/templates/marketplace.service';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

interface TemplateVersionDialogProps {
	template: Template;
	onVersionCreated?: (template: Template) => void;
}

export const TemplateVersionDialog: React.FC<TemplateVersionDialogProps> = ({
	template,
	onVersionCreated
}) => {
	const [version, setVersion] = React.useState('');
	const [changes, setChanges] = React.useState<{ type: 'added' | 'modified' | 'removed'; path: string; description: string }[]>([]);
	const [isOpen, setIsOpen] = React.useState(false);
	const { toast } = useToast();

	const handleAddChange = () => {
		setChanges([...changes, { type: 'added', path: '', description: '' }]);
	};

	const handleChangeUpdate = (index: number, field: keyof typeof changes[0], value: string) => {
		const newChanges = [...changes];
		newChanges[index] = { ...newChanges[index], [field]: value };
		setChanges(newChanges);
	};

	const handleSubmit = async () => {
		try {
			const newVersion: TemplateVersion = {
				version,
				changes,
				timestamp: new Date()
			};

			const updatedTemplate = await marketplaceService.createVersion(template.id, newVersion);
			onVersionCreated?.(updatedTemplate);
			setIsOpen(false);
			toast({
				title: 'Version created',
				description: `Version ${version} has been created successfully.`
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to create version.',
				variant: 'destructive'
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Create Version</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Version</DialogTitle>
					<DialogDescription>
						Create a new version of this template with a list of changes.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Version</label>
						<Input
							placeholder="e.g., 1.0.1"
							value={version}
							onChange={(e) => setVersion(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Changes</label>
						{changes.map((change, index) => (
							<div key={index} className="space-y-2">
								<select
									className="w-full rounded-md border p-2"
									value={change.type}
									onChange={(e) => handleChangeUpdate(index, 'type', e.target.value as any)}
								>
									<option value="added">Added</option>
									<option value="modified">Modified</option>
									<option value="removed">Removed</option>
								</select>
								<Input
									placeholder="Path"
									value={change.path}
									onChange={(e) => handleChangeUpdate(index, 'path', e.target.value)}
								/>
								<Textarea
									placeholder="Description"
									value={change.description}
									onChange={(e) => handleChangeUpdate(index, 'description', e.target.value)}
								/>
							</div>
						))}
						<Button type="button" variant="outline" onClick={handleAddChange}>
							Add Change
						</Button>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit}>Create Version</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};