import React, { useEffect, useRef } from 'react';
import { Effect, Transition } from '@/services/media/types';

interface PreviewRendererProps {
	videoUrl?: string;
	currentTime: number;
	effects?: Effect[];
	transition?: Transition;
	isPlaying: boolean;
	onTimeUpdate?: (time: number) => void;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
	videoUrl,
	currentTime,
	effects,
	transition,
	isPlaying,
	onTimeUpdate
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const rafRef = useRef<number>();
	const contextRef = useRef<WebGLRenderingContext | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext('webgl');
		if (!gl) return;

		contextRef.current = gl;
		initWebGL(gl);

		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video || !videoUrl) return;

		video.src = videoUrl;
		video.load();
	}, [videoUrl]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (isPlaying) {
			video.play();
			animate();
		} else {
			video.pause();
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		}
	}, [isPlaying]);

	const initWebGL = (gl: WebGLRenderingContext) => {
		// Initialize shaders and buffers
		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
		if (!vertexShader || !fragmentShader) return;

		const program = createProgram(gl, vertexShader, fragmentShader);
		if (!program) return;

		gl.useProgram(program);
	};

	const animate = () => {
		const gl = contextRef.current;
		const video = videoRef.current;
		if (!gl || !video) return;

		renderFrame(gl, video);
		
		if (onTimeUpdate) {
			onTimeUpdate(video.currentTime);
		}

		rafRef.current = requestAnimationFrame(animate);
	};

	const renderFrame = (gl: WebGLRenderingContext, video: HTMLVideoElement) => {
		// Apply active effects
		effects?.forEach(effect => {
			if (video.currentTime >= effect.startTime && 
					video.currentTime <= effect.startTime + effect.duration) {
				applyEffect(gl, effect);
			}
		});

		// Apply transition if active
		if (transition) {
			applyTransition(gl, transition);
		}
	};

	const applyEffect = (gl: WebGLRenderingContext, effect: Effect) => {
		// Effect-specific WebGL operations
		switch (effect.type) {
			case 'blur':
				// Apply blur shader
				break;
			case 'brightness':
				// Apply brightness adjustment
				break;
			// ... other effects
		}
	};

	const applyTransition = (gl: WebGLRenderingContext, transition: Transition) => {
		// Transition-specific WebGL operations
		switch (transition.type) {
			case 'fade':
				// Apply fade shader
				break;
			case 'dissolve':
				// Apply dissolve shader
				break;
			// ... other transitions
		}
	};

	return (
		<div className="relative w-full h-full">
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full"
			/>
			<video
				ref={videoRef}
				className="hidden"
				playsInline
				muted
			/>
		</div>
	);
};

// WebGL shader sources
const vertexShaderSource = `
	attribute vec2 a_position;
	attribute vec2 a_texCoord;
	varying vec2 v_texCoord;
	void main() {
		gl_Position = vec4(a_position, 0, 1);
		v_texCoord = a_texCoord;
	}
`;

const fragmentShaderSource = `
	precision mediump float;
	uniform sampler2D u_image;
	varying vec2 v_texCoord;
	void main() {
		gl_FragColor = texture2D(u_image, v_texCoord);
	}
`;

// WebGL helper functions
function createShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
	const program = gl.createProgram();
	if (!program) return null;
	
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}
	
	return program;
}