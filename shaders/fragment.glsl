precision mediump float;

#pragma glslify: outOfRange = require(./reversed-scenes-out-of-range.glsl)

uniform vec3 clipBounds[2];
uniform float opacity;
varying vec3 fragPosition;
varying vec4 fragColor;

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, fragPosition.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, fragPosition.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, fragPosition.z))) discard;

  gl_FragColor = opacity * fragColor;
}