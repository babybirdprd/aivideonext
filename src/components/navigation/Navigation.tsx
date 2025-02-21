'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Video, Store } from 'lucide-react';

const navItems = [
	{
		href: '/',
		label: 'Home',
		icon: Home
	},
	{
		href: '/templates',
		label: 'Templates',
		icon: Video
	},
	{
		href: '/marketplace',
		label: 'Marketplace',
		icon: Store
	}
];

export const Navigation = () => {
	const pathname = usePathname();

	return (
		<nav className="border-b">
			<div className="container flex h-14 items-center">
				<div className="mr-4 font-semibold">AI Video</div>
				<div className="flex gap-6">
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-2 text-sm transition-colors hover:text-foreground/80",
									pathname === item.href
										? "text-foreground"
										: "text-foreground/60"
								)}
							>
								<Icon className="h-4 w-4" />
								{item.label}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
};