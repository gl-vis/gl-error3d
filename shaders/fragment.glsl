precision mediump float;
uniform vec3 clipBounds[2];
varying vec3 fragPosition;
varying vec4 fragColor;

void main() {
  if(any(lessThan(fragPosition, clipBounds[0])) || any(greaterThan(fragPosition, clipBounds[1]))) {
    discard;
  }
  gl_FragColor = fragColor;
}