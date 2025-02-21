// Base vertex shader used for all effects
export const baseVertexShader = `
	attribute vec2 a_position;
	attribute vec2 a_texCoord;
	varying vec2 v_texCoord;
	void main() {
		gl_Position = vec4(a_position, 0, 1);
		v_texCoord = a_texCoord;
	}
`;

// Effect shaders
export const effectShaders = {
	blur: `
		precision mediump float;
		uniform sampler2D u_image;
		uniform float u_intensity;
		varying vec2 v_texCoord;
		void main() {
			vec4 color = vec4(0.0);
			float blur = u_intensity * 0.01;
			color += texture2D(u_image, v_texCoord + vec2(-blur, -blur)) * 0.0625;
			color += texture2D(u_image, v_texCoord + vec2(-blur, 0.0)) * 0.125;
			color += texture2D(u_image, v_texCoord + vec2(-blur, blur)) * 0.0625;
			color += texture2D(u_image, v_texCoord + vec2(0.0, -blur)) * 0.125;
			color += texture2D(u_image, v_texCoord) * 0.25;
			color += texture2D(u_image, v_texCoord + vec2(0.0, blur)) * 0.125;
			color += texture2D(u_image, v_texCoord + vec2(blur, -blur)) * 0.0625;
			color += texture2D(u_image, v_texCoord + vec2(blur, 0.0)) * 0.125;
			color += texture2D(u_image, v_texCoord + vec2(blur, blur)) * 0.0625;
			gl_FragColor = color;
		}
	`,

	brightness: `
		precision mediump float;
		uniform sampler2D u_image;
		uniform float u_intensity;
		varying vec2 v_texCoord;
		void main() {
			vec4 color = texture2D(u_image, v_texCoord);
			gl_FragColor = vec4(color.rgb * (1.0 + u_intensity), color.a);
		}
	`,

	contrast: `
		precision mediump float;
		uniform sampler2D u_image;
		uniform float u_intensity;
		varying vec2 v_texCoord;
		void main() {
			vec4 color = texture2D(u_image, v_texCoord);
			gl_FragColor = vec4((color.rgb - 0.5) * (1.0 + u_intensity) + 0.5, color.a);
		}
	`,

	saturation: `
		precision mediump float;
		uniform sampler2D u_image;
		uniform float u_intensity;
		varying vec2 v_texCoord;
		void main() {
			vec4 color = texture2D(u_image, v_texCoord);
			float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
			gl_FragColor = vec4(mix(vec3(gray), color.rgb, 1.0 + u_intensity), color.a);
		}
	`,

	styleTransfer: `
		precision mediump float;
		uniform sampler2D u_image;
		uniform sampler2D u_style;
		uniform float u_intensity;
		uniform float u_preserveContent;
		varying vec2 v_texCoord;

		void main() {
			vec4 originalColor = texture2D(u_image, v_texCoord);
			vec4 styleColor = texture2D(u_style, v_texCoord);
			float preserveAmount = 1.0 - (u_intensity * (1.0 - u_preserveContent));
			
			// Blend between original and styled image
			vec4 blendedColor = mix(styleColor, originalColor, preserveAmount);
			gl_FragColor = blendedColor;
		}
	`
};

// Transition shaders
export const transitionShaders = {
	fade: `
		precision mediump float;
		uniform sampler2D u_image1;
		uniform sampler2D u_image2;
		uniform float u_progress;
		varying vec2 v_texCoord;
		void main() {
			vec4 color1 = texture2D(u_image1, v_texCoord);
			vec4 color2 = texture2D(u_image2, v_texCoord);
			gl_FragColor = mix(color1, color2, u_progress);
		}
	`,

	wipe: `
		precision mediump float;
		uniform sampler2D u_image1;
		uniform sampler2D u_image2;
		uniform float u_progress;
		uniform float u_direction;
		varying vec2 v_texCoord;
		void main() {
			float pos = u_direction < 90.0 ? v_texCoord.x : v_texCoord.y;
			vec4 color1 = texture2D(u_image1, v_texCoord);
			vec4 color2 = texture2D(u_image2, v_texCoord);
			gl_FragColor = pos < u_progress ? color2 : color1;
		}
	`,

	dissolve: `
		precision mediump float;
		uniform sampler2D u_image1;
		uniform sampler2D u_image2;
		uniform float u_progress;
		uniform float u_seed;
		varying vec2 v_texCoord;
		
		float random(vec2 co) {
			return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}
		
		void main() {
			vec4 color1 = texture2D(u_image1, v_texCoord);
			vec4 color2 = texture2D(u_image2, v_texCoord);
			float r = random(v_texCoord + vec2(u_seed));
			gl_FragColor = r < u_progress ? color2 : color1;
		}
	`
};

// Helper function to create shader program
export function createShaderProgram(
	gl: WebGLRenderingContext,
	vertexSource: string,
	fragmentSource: string
): WebGLProgram | null {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	
	if (!vertexShader || !fragmentShader) return null;
	
	const program = gl.createProgram();
	if (!program) return null;
	
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Unable to initialize shader program:', gl.getProgramInfoLog(program));
		return null;
	}
	
	return program;
}

function createShader(
	gl: WebGLRenderingContext,
	type: number,
	source: string
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Shader compile error:', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}