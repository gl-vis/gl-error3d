gl-error-bars
=============

Draws error bars around scatter points.

# Example

```javascript
var shell           = require('gl-now')({ clearColor: [0,0,0,0] })
var camera          = require('game-shell-orbit-camera')(shell)
var createAxes      = require('gl-axes')
var createErrorBars = require('gl-error-bars')
var mat4            = require('gl-mat4')

var bounds = [[-5,-5,-5], [5,5,5]]
var errorbars, axes

shell.on('gl-init', function() {
  var gl = shell.gl

  camera.lookAt(bounds[1], [0,0,0], [0, 1, 0])

  axes = createAxes(gl, {
    bounds: bounds
  })

  errorbars = createErrorBars(gl, {
    position: [
      [0,0,0],
      [0,2,0],
      [-2,-3,0]
    ],

    error: [
      [[-0.5,-0.5,-0.1], [0.5,0.5,0.5]],
      [[0,0,0], [0.5,0.5,0.5]],
      [[-0.5,-0.5,0], [0,0,0]]
    ],

    color: [
      [1,0,0],
      [0,1,0],
      [0,0,1]
    ]
  })
})

shell.on('gl-render', function() {
  var gl = shell.gl
  gl.enable(gl.DEPTH_TEST)

  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(
        mat4.create(),
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0)
  }

  axes.draw(cameraParameters)
  errorbars.draw(cameraParameters)
})
```

# API

## Constructor

#### `var errorBars = require('gl-error-bars')(gl, options)`
Creates a new error bar object.

* `gl` is a WebGL context
* `object` is a collection of properties which are used to initialize the object

**Returns** A new error bar object

## Methods

#### `errorBars.draw(camera)`
Draws the error bars

* `camera` is an object storing the parameters to draw

    + `camera.model` is the model matrix
    + `camera.view` is the view matrix
    + `camera.projection` is the projection matrix

#### `errorBars.update(options)`
Updates the error bar object

* `position` is the position of each point in the plot
* `error` is an array of error bounds represented as `[lo,hi]` for each point
* `color` is either a single RGB or an array of RGB colors representing the colors of each point
* `lineWidth` is the width of the error bar lines in pixels
* `capSize` is the size of the cap for error bars
* `clipBounds` is a box to which all error bars will be clipped

#### `errorBars.dispose()`
Destroy the error bars and release all associated resources

#### `errorBars.bounds`
Bounds on the error bar object for display purposes

# Credits
(c) 2014 Mikola Lysenko. MIT License