'use client';

import React, { useEffect } from 'react';
import { useTemplateStore } from '@/store/template.store';
import { VideoFormatId, VIDEO_PRESETS } from '@/types/video.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp } from 'lucide-react';
import { MarketplaceTemplateCard } from '@/components/templates/MarketplaceTemplateCard';
import { marketplaceService } from '@/services/templates/marketplace.service';
import { trendAnalysisService } from '@/services/ai/trend.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MarketplacePage() {
	const { getFilteredTemplates, setFilterFormat, filterFormat } = useTemplateStore();
	const [searchQuery, setSearchQuery] = React.useState('');
	const [trendingTemplates, setTrendingTemplates] = React.useState<any[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

	// New filter states
	const [selectedNiche, setSelectedNiche] = React.useState<string>('all');
	const [selectedContentType, setSelectedContentType] = React.useState<string>('all');
	const [selectedTone, setSelectedTone] = React.useState<string>('all');

	useEffect(() => {
		const loadTrendingTemplates = async () => {
			try {
				const trending = await marketplaceService.getTrendingTemplates();
				setTrendingTemplates(trending);
			} catch (error) {
				console.error('Error loading trending templates:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadTrendingTemplates();
	}, []);

	const [activeTab, setActiveTab] = React.useState('trending');

	const filteredTemplates = getFilteredTemplates().filter(template => 
		template.isPublished && 
		(searchQuery === '' || 
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
		(selectedCategory === 'all' || template.category === selectedCategory) &&
		(selectedNiche === 'all' || template.niche === selectedNiche) &&
		(selectedContentType === 'all' || template.contentType === selectedContentType) &&
		(selectedTone === 'all' || template.stylePreferences?.tone === selectedTone)
	);

	const sortedTemplates = React.useMemo(() => {
		return [...filteredTemplates].sort((a, b) => {
			switch (activeTab) {
				case 'trending':
					return (b.trendScore || 0) - (a.trendScore || 0);
				case 'popular':
					return ((b.views || 0) + (b.uses || 0)) - ((a.views || 0) + (a.uses || 0));
				case 'recent':
					return new Date(b.updated).getTime() - new Date(a.updated).getTime();
				default:
					return 0;
			}
		});
	}, [filteredTemplates, activeTab]);

	// Get unique values for filters
	const categories = Array.from(new Set(getFilteredTemplates()
		.filter(t => t.isPublished)
		.map(t => t.category)));

	const niches = ['all', ...Array.from(new Set(getFilteredTemplates()
		.filter(t => t.isPublished && t.niche)
		.map(t => t.niche)))];

	const contentTypes = ['all', 'educational', 'entertainment', 'marketing', 'social', 'other'];
	const tones = ['all', 'professional', 'casual', 'funny', 'serious', 'inspirational'];

	return (
		<div className="container py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Template Marketplace</h1>
			</div>

			  <div className="flex flex-col gap-4 mb-6">
				{/* Search bar row */}
				<div className="flex gap-4">
				  <div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
					  placeholder="Search templates..."
					  value={searchQuery}
					  onChange={(e) => setSearchQuery(e.target.value)}
					  className="pl-10"
					/>
				  </div>
				</div>

				{/* Filters row */}
				<div className="flex flex-wrap gap-2">
				  <Select value={filterFormat || ''} onValueChange={(v: VideoFormatId | '') => setFilterFormat(v || null)}>
					<SelectTrigger className="w-[180px]">
					  <SelectValue placeholder="All formats" />
					</SelectTrigger>
					<SelectContent>
					  <SelectItem value="">All formats</SelectItem>
					  {Object.entries(VIDEO_PRESETS).map(([id, dimensions]) => (
						<SelectItem key={id} value={id}>
						  {id.replace(/-/g, ' ')} ({dimensions.width}x{dimensions.height})
						</SelectItem>
					  ))}
					</SelectContent>
				  </Select>

				  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
					<SelectTrigger className="w-[180px]">
					  <SelectValue placeholder="All categories" />
					</SelectTrigger>
					<SelectContent>
					  <SelectItem value="all">All categories</SelectItem>
					  {categories.map(category => (
						<SelectItem key={category} value={category}>
						  {category}
						</SelectItem>
					  ))}
					</SelectContent>
				  </Select>

				  <Select value={selectedNiche} onValueChange={setSelectedNiche}>
					<SelectTrigger className="w-[180px]">
					  <SelectValue placeholder="All niches" />
					</SelectTrigger>
					<SelectContent>
					  {niches.map(niche => (
						<SelectItem key={niche} value={niche}>
						  {niche === 'all' ? 'All niches' : niche}
						</SelectItem>
					  ))}
					</SelectContent>
				  </Select>

				  <Select value={selectedContentType} onValueChange={setSelectedContentType}>
					<SelectTrigger className="w-[180px]">
					  <SelectValue placeholder="Content type" />
					</SelectTrigger>
					<SelectContent>
					  {contentTypes.map(type => (
						<SelectItem key={type} value={type}>
						  {type === 'all' ? 'All content types' : type}
						</SelectItem>
					  ))}
					</SelectContent>
				  </Select>

				  <Select value={selectedTone} onValueChange={setSelectedTone}>
					<SelectTrigger className="w-[180px]">
					  <SelectValue placeholder="Tone" />
					</SelectTrigger>
					<SelectContent>
					  {tones.map(tone => (
						<SelectItem key={tone} value={tone}>
						  {tone === 'all' ? 'All tones' : tone}
						</SelectItem>
					  ))}
					</SelectContent>
				  </Select>
				</div>
			</div>

			  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
				<TabsList className="mb-4">
				  <TabsTrigger value="trending">Trending</TabsTrigger>
				  <TabsTrigger value="popular">Popular</TabsTrigger>
				  <TabsTrigger value="recent">Recent</TabsTrigger>
				</TabsList>

				<TabsContent value="trending">
				  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{!isLoading && trendingTemplates.map((template) => (
					  <MarketplaceTemplateCard key={template.id} template={template} />
					))}
				  </div>
				</TabsContent>

				<TabsContent value="popular">
				  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{sortedTemplates.slice(0, 8).map((template) => (
					  <MarketplaceTemplateCard key={template.id} template={template} />
					))}
				  </div>
				</TabsContent>

				<TabsContent value="recent">
				  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{sortedTemplates.map((template) => (
					  <MarketplaceTemplateCard key={template.id} template={template} />
					))}
				  </div>
				</TabsContent>
			  </Tabs>
		</div>
	);
}