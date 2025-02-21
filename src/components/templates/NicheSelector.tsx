"use client";

import { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

const NICHES = {
	'social-media': {
		label: 'Social Media',
		subNiches: ['Instagram', 'TikTok', 'YouTube Shorts', 'LinkedIn']
	},
	'education': {
		label: 'Education',
		subNiches: ['Tutorial', 'Course', 'Explainer', 'How-to']
	},
	'marketing': {
		label: 'Marketing',
		subNiches: ['Product', 'Brand', 'Service', 'Advertisement']
	},
	'entertainment': {
		label: 'Entertainment',
		subNiches: ['Vlog', 'Gaming', 'Music', 'Comedy']
	}
} as const;

interface NicheSelectorProps {
	onNicheChange: (niche: string, subNiche?: string) => void;
}

export function NicheSelector({ onNicheChange }: NicheSelectorProps) {
	const [selectedNiche, setSelectedNiche] = useState<string>('');
	const [selectedSubNiche, setSelectedSubNiche] = useState<string>('');

	return (
		<div className="flex gap-4">
			<Select
				value={selectedNiche}
				onValueChange={(value) => {
					setSelectedNiche(value);
					setSelectedSubNiche('');
					onNicheChange(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Select niche" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="">All Niches</SelectItem>
					{Object.entries(NICHES).map(([key, { label }]) => (
						<SelectItem key={key} value={key}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{selectedNiche && (
				<Select
					value={selectedSubNiche}
					onValueChange={(value) => {
						setSelectedSubNiche(value);
						onNicheChange(selectedNiche, value);
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select sub-niche" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All {NICHES[selectedNiche as keyof typeof NICHES].label}</SelectItem>
						{NICHES[selectedNiche as keyof typeof NICHES].subNiches.map((subNiche) => (
							<SelectItem key={subNiche} value={subNiche}>
								{subNiche}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</div>
	);
}