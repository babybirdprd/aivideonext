import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const dbUtils = {
	parseJSON: <T>(str: string | null): T | null => {
		if (!str) return null;
		try {
			return JSON.parse(str) as T;
		} catch (e) {
			console.error('Error parsing JSON from DB:', e);
			return null;
		}
	},

	stringifyJSON: (data: any): string | null => {
		if (!data) return null;
		try {
			return JSON.stringify(data);
		} catch (e) {
			console.error('Error stringifying JSON for DB:', e);
			return null;
		}
	}
};
