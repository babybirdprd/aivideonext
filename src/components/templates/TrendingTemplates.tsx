"use client";

import React, { useEffect, useState } from 'react';
import { Template } from '@/store/template.types';
import { useTemplateStore } from '@/store/template.store';
import { Flame, TrendingUp } from 'lucide-react';

interface TrendingTemplateItemProps {
	template: Template;
	rank: number;
	onSelect: (template: Template) => void;
}

const TrendingTemplateItem: React.FC<TrendingTemplateItemProps> = ({ template, rank, onSelect }) => {
	return (
		<button
			onClick={() => onSelect(template)}
			className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors"
		>
			<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
				<span className="text-primary font-semibold">{rank}</span>
			</div>
			<div className="flex-1 text-left">
				<h3 className="font-medium">{template.name}</h3>
				<p className="text-sm text-muted-foreground line-clamp-1">{template.description}</p>
			</div>
			{rank <= 3 && <Flame className="w-5 h-5 text-primary" />}
		</button>
	);
};

export function TrendingTemplates() {
	const [trendingTemplates, setTrendingTemplates] = useState<Template[]>([]);
	const { selectTemplate } = useTemplateStore();

	useEffect(() => {
		const fetchTrending = async () => {
			try {
				const response = await fetch('/api/templates/marketplace/trending');
				if (!response.ok) throw new Error('Failed to fetch trending templates');
				const data = await response.json();
				setTrendingTemplates(data);
			} catch (error) {
				console.error('Error fetching trending templates:', error);
			}
		};

		fetchTrending();
	}, []);

	if (!trendingTemplates.length) return null;

	return (
		<div className="rounded-lg border bg-card">
			<div className="flex items-center gap-2 p-4 border-b">
				<TrendingUp className="w-5 h-5 text-primary" />
				<h2 className="font-semibold">Trending Templates</h2>
			</div>
			<div className="divide-y">
				{trendingTemplates.map((template, index) => (
					<TrendingTemplateItem
						key={template.id}
						template={template}
						rank={index + 1}
						onSelect={selectTemplate}
					/>
				))}
			</div>
		</div>
	);
}