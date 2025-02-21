import React from 'react';
import { Template } from '@/store/template.types';
import { getVideoFormat } from '@/types/video-format.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormatSettingsFormProps {
	template: Template;
	onUpdate: (settings: Template['formatSettings']) => void;
}

export const FormatSettingsForm: React.FC<FormatSettingsFormProps> = ({
	template,
	onUpdate
}) => {
	const videoFormat = getVideoFormat(template.videoFormat);
	const settings = template.formatSettings || {};
	const recommended = videoFormat?.recommendedSettings;

	if (!videoFormat || !recommended) return null;

	const handleChange = (field: keyof Template['formatSettings'], value: string) => {
		const newSettings = { ...settings };
		if (field === 'fps') {
			newSettings[field] = parseInt(value) || recommended.fps;
		} else if (field === 'bitrate') {
			newSettings[field] = value || recommended.bitrate;
		} else if (field === 'maxDuration') {
			newSettings[field] = parseInt(value) || recommended.maxDuration;
		}
		onUpdate(newSettings);
	};

	const isExceedingRecommended = (field: keyof Template['formatSettings']): boolean => {
		if (!settings[field] || !recommended[field]) return false;
		if (field === 'bitrate') {
			return parseInt(settings[field]) > parseInt(recommended[field]);
		}
		return settings[field] > recommended[field];
	};

	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<div className="space-y-2">
					<Label>FPS</Label>
					<Input
						type="number"
						value={settings.fps || recommended.fps}
						onChange={(e) => handleChange('fps', e.target.value)}
						min={1}
						max={120}
					/>
					{isExceedingRecommended('fps') && (
						<Alert variant="warning">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Exceeds recommended FPS ({recommended.fps})
							</AlertDescription>
						</Alert>
					)}
				</div>

				<div className="space-y-2">
					<Label>Bitrate</Label>
					<Input
						value={settings.bitrate || recommended.bitrate}
						onChange={(e) => handleChange('bitrate', e.target.value)}
						placeholder={recommended.bitrate}
					/>
					{isExceedingRecommended('bitrate') && (
						<Alert variant="warning">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Exceeds recommended bitrate ({recommended.bitrate})
							</AlertDescription>
						</Alert>
					)}
				</div>

				<div className="space-y-2">
					<Label>Max Duration (seconds)</Label>
					<Input
						type="number"
						value={settings.maxDuration || recommended.maxDuration}
						onChange={(e) => handleChange('maxDuration', e.target.value)}
						min={1}
					/>
					{isExceedingRecommended('maxDuration') && (
						<Alert variant="warning">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Exceeds platform limit ({recommended.maxDuration}s)
							</AlertDescription>
						</Alert>
					)}
				</div>
			</CardContent>
		</Card>
	);
};