precision mediump float;
uniform vec3 clipBounds[2];
uniform float opacity;
varying vec3 fragPosition;
varying vec4 fragColor;

bool outOfRange(float a, float b, float p) {
  if (p > max(a, b)) return true;
  if (p < min(a, b)) return true;
  return false;
}

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, fragPosition.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, fragPosition.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, fragPosition.z))) discard;

  gl_FragColor = opacity * fragColor;
}