"use client"

import { useState } from 'react';
import { styleTransferService } from '@/services/ai/style.service';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface StyleTransferPreviewProps {
	sourceUrl: string;
	style: string;
	onStyleChange: (style: string) => void;
	strength?: number;
	onStrengthChange?: (strength: number) => void;
	preserveContent?: boolean;
	onPreserveContentChange?: (preserve: boolean) => void;
}

export const StyleTransferPreview: React.FC<StyleTransferPreviewProps> = ({
	sourceUrl,
	style,
	onStyleChange,
	strength = 0.8,
	onStrengthChange,
	preserveContent = true,
	onPreserveContentChange,
}) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handlePreview = async () => {
		try {
			setIsLoading(true);
			const result = await styleTransferService.transferStyle({
				sourceUrl,
				style,
				strength,
				preserveContent
			});
			setPreviewUrl(result.resultUrl);
		} catch (error) {
			console.error('Style transfer preview error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label>Original Image</Label>
					{sourceUrl && (
						<div className="relative aspect-video">
							<Image
								src={sourceUrl}
								alt="Source"
								fill
								className="object-cover rounded-lg"
							/>
						</div>
					)}
				</div>
				<div className="space-y-2">
					<Label>Preview</Label>
					<div className="relative aspect-video bg-secondary rounded-lg">
						{previewUrl ? (
							<Image
								src={previewUrl}
								alt="Preview"
								fill
								className="object-cover rounded-lg"
							/>
						) : (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								{isLoading ? 'Generating preview...' : 'No preview available'}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Style Strength</Label>
					<Slider
						value={[strength]}
						min={0}
						max={1}
						step={0.1}
						onValueChange={([value]) => onStrengthChange?.(value)}
					/>
				</div>

				<div className="flex items-center gap-2">
					<Checkbox
						checked={preserveContent}
						onCheckedChange={(checked) => 
							onPreserveContentChange?.(checked as boolean)}
					/>
					<Label>Preserve Original Content</Label>
				</div>

				<Button
					onClick={handlePreview}
					disabled={isLoading || !sourceUrl || !style}
				>
					{isLoading ? 'Generating...' : 'Generate Preview'}
				</Button>
			</div>
		</div>
	);
};