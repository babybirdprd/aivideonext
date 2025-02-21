import { useEditorStore } from '@/store/editor.store';
import { VideoFormat, VIDEO_FORMATS, calculateAspectRatio } from '@/types/video.types';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

const VideoFormatSelector = () => {
	const { currentProject, setVideoFormat } = useEditorStore();
	const currentFormat = currentProject?.settings.videoFormat || 'youtube-landscape';

	const handleFormatChange = (formatId: string) => {
		setVideoFormat(formatId);
	};

	const currentDimensions = currentProject?.settings.dimensions;

	// Group formats by platform
	const groupedFormats = VIDEO_FORMATS.reduce((acc, format) => {
		if (!acc[format.platform]) {
			acc[format.platform] = [];
		}
		acc[format.platform].push(format);
		return acc;
	}, {} as Record<string, VideoFormat[]>);

	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">Video Format</label>
			<Select value={currentFormat} onValueChange={handleFormatChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select format" />
				</SelectTrigger>
				<SelectContent>
					{Object.entries(groupedFormats).map(([platform, formats]) => (
						<SelectGroup key={platform}>
							<SelectLabel className="capitalize">{platform}</SelectLabel>
							{formats.map((format) => (
								<SelectItem key={format.id} value={format.id}>
									{format.name} ({format.width}x{format.height})
								</SelectItem>
							))}
						</SelectGroup>
					))}
				</SelectContent>
			</Select>
			{currentDimensions && (
				<div className="text-xs text-gray-500">
					{currentDimensions.width} x {currentDimensions.height}
					<span className="ml-2">
						({calculateAspectRatio(currentDimensions.width, currentDimensions.height)})
					</span>
				</div>
			)}
		</div>
	);
};

export default VideoFormatSelector;