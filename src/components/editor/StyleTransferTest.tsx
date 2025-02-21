'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

const STYLE_PRESETS = [
	'oil painting',
	'watercolor',
	'pencil sketch',
	'digital art',
	'anime',
	'photorealistic',
	'abstract',
	'pop art'
];

export const StyleTransferTest = () => {
	const [imageUrl, setImageUrl] = useState('');
	const [style, setStyle] = useState(STYLE_PRESETS[0]);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	const handleStyleTransfer = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/ai/replicate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					modelVersion: 'stability-ai/sdxl',
					input: {
						image: imageUrl,
						prompt: `Style transfer: ${style}`,
						strength: 0.8
					}
				})
			});

			const data = await response.json();
			if (data.output && typeof data.output === 'string') {
				setResult(data.output);
			}
		} catch (error) {
			console.error('Style transfer failed:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 p-4">
			<h3 className="text-lg font-semibold">Style Transfer Test</h3>
			<div className="space-y-2">
				<Input
					placeholder="Enter image URL"
					value={imageUrl}
					onChange={(e) => setImageUrl(e.target.value)}
				/>
				<Select onValueChange={setStyle} value={style}>
					<SelectTrigger className="w-full">
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
				<Button 
					onClick={handleStyleTransfer}
					disabled={!imageUrl || loading}
				>
					{loading ? 'Processing...' : 'Apply Style'}
				</Button>
			</div>
			{result && (
				<div className="mt-4">
					<h4 className="text-sm font-medium mb-2">Result:</h4>
					<div className="grid grid-cols-2 gap-4">
						<img src={imageUrl} alt="Original" className="rounded-lg" />
						<img src={result} alt="Styled" className="rounded-lg" />
					</div>
				</div>
			)}
		</div>
	);
};