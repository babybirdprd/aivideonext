import { useEditorStore } from '@/store/editor.store';
import { VideoFormat, VIDEO_PRESETS } from '@/types/video.types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

const VideoFormatSelector = () => {
	const { currentProject, setVideoFormat } = useEditorStore();
	const currentFormat = currentProject?.settings.videoFormat || 'youtube';

	const formatOptions = Object.entries(VIDEO_PRESETS).map(([format, dimensions]) => ({
		value: format,
		label: `${format} (${dimensions.width}x${dimensions.height})`
	}));

	const handleFormatChange = (value: string) => {
		setVideoFormat(value as VideoFormat);
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">Video Format</label>
			<Select value={currentFormat} onValueChange={handleFormatChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select format" />
				</SelectTrigger>
				<SelectContent>
					{formatOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="text-xs text-gray-500">
				{currentProject?.settings.dimensions.width} x {currentProject?.settings.dimensions.height}
				<span className="ml-2">({currentProject?.settings.dimensions.aspectRatio})</span>
			</div>
		</div>
	);
};

export default VideoFormatSelector;