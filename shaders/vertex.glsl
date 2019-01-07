precision mediump float;

attribute vec3 position, shift;
attribute vec4 color;

uniform float lineWidth;
uniform vec2 screenShape;
uniform float pixelRatio;
uniform mat4 model, view, projection;
uniform float capSize;

varying vec4 fragColor;
varying vec3 worldPosition;

void main() {
  vec4 Q = model * vec4(position, 1.0);
  Q = (Q / Q.w) + vec4(capSize * shift, 0.0);
  gl_Position         = projection * view * Q;
  fragColor           = color;
  worldPosition        = position;
}