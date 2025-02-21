'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { StyleTransferParams } from '@/services/ai/types';
import { styleTransferService } from '@/services/ai/style.service';

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

export const StyleTransferTest = () => {
	const [imageUrl, setImageUrl] = useState('');
	const [style, setStyle] = useState(STYLE_PRESETS[0]);
	const [strength, setStrength] = useState(0.8);
	const [preserveContent, setPreserveContent] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<string | null>(null);

	const handleStyleTransfer = async () => {
		try {
			setLoading(true);
			setError(null);

			const params: StyleTransferParams = {
				sourceUrl: imageUrl,
				style,
				strength,
				preserveContent
			};

			const result = await styleTransferService.transferStyle(params);
			setResult(result.resultUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Style transfer failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 p-4 max-w-4xl mx-auto">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Style Transfer</h3>
				{error && <p className="text-red-500 text-sm">{error}</p>}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<Input
						placeholder="Enter image URL"
						value={imageUrl}
						onChange={(e) => setImageUrl(e.target.value)}
					/>
					
					<Select onValueChange={setStyle} value={style}>
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

					<div className="space-y-2">
						<label className="text-sm font-medium">Style Strength</label>
						<Slider
							value={[strength]}
							onValueChange={([value]) => setStrength(value)}
							min={0}
							max={1}
							step={0.1}
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							checked={preserveContent}
							onCheckedChange={setPreserveContent}
						/>
						<label className="text-sm font-medium">Preserve Content</label>
					</div>

					<Button 
						onClick={handleStyleTransfer}
						disabled={!imageUrl || loading}
						className="w-full"
					>
						{loading ? 'Processing...' : 'Apply Style'}
					</Button>
				</div>

				<div className="space-y-4">
					{(imageUrl || result) && (
						<div className="grid gap-4">
							{imageUrl && (
								<div>
									<h4 className="text-sm font-medium mb-2">Original:</h4>
									<img 
										src={imageUrl} 
										alt="Original" 
										className="w-full rounded-lg object-cover aspect-video"
									/>
								</div>
							)}
							{result && (
								<div>
									<h4 className="text-sm font-medium mb-2">Styled:</h4>
									<img 
										src={result} 
										alt="Styled" 
										className="w-full rounded-lg object-cover aspect-video"
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};