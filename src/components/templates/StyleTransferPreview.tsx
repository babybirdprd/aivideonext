"use client"

import { useState } from 'react';
import { styleTransferService } from '@/services/ai/style.service';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

const STYLE_PRESETS = [
	'oil painting',
	'watercolor',
	'pencil sketch',
	'digital art',
	'anime',
	'photorealistic',
	'abstract',
	'pop art',
	'cyberpunk',
	'steampunk',
	'minimalist',
	'vintage',
	'gothic',
	'impressionist',
	'surrealist'
];

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
	const [error, setError] = useState<string | null>(null);

	const handlePreview = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const result = await styleTransferService.transferStyle({
				sourceUrl,
				style,
				strength,
				preserveContent
			});
			setPreviewUrl(result.resultUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Style transfer preview failed');
			console.error('Style transfer preview error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
					<Label>Style</Label>
					<Select value={style} onValueChange={onStyleChange}>
						<SelectTrigger>
							<SelectValue placeholder="Select a style" />
						</SelectTrigger>
						<SelectContent>
							{STYLE_PRESETS.map((styleOption) => (
								<SelectItem key={styleOption} value={styleOption}>
									{styleOption}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

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
					<Switch
						checked={preserveContent}
						onCheckedChange={onPreserveContentChange}
					/>
					<Label>Preserve Original Content</Label>
				</div>

				<Button
					onClick={handlePreview}
					disabled={isLoading || !sourceUrl || !style}
					className="w-full"
				>
					{isLoading ? 'Generating...' : 'Generate Preview'}
				</Button>
			</div>
		</div>
	);
};