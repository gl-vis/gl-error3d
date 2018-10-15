precision mediump float;

#pragma glslify: outOfRange = require(glsl-out-of-range)

uniform vec3 clipBounds[2];
uniform float opacity;
varying vec3 fragPosition;
varying vec4 fragColor;

void main() {
  if (outOfRange(clipBounds[0], clipBounds[1], fragPosition)) discard;

  gl_FragColor = opacity * fragColor;
}