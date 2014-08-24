'use strict'

module.exports = createErrorBars

var glslify       = require('glslify')
var createBuffer  = require('gl-buffer')
var createVAO     = require('gl-vao')

var createShader  = glslify({
  vert: './shaders/vertex.glsl',
  frag: './shaders/fragment.glsl'
})

var IDENTITY = [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1]

function ErrorBars(gl, buffer, vao, shader) {
  this.gl           = gl
  this.shader       = shader
  this.buffer       = buffer
  this.vao          = vao
  this.bounds       = [[ Infinity, Infinity, Infinity], [-Infinity,-Infinity,-Infinity]]
  this.clipBounds   = [[-Infinity,-Infinity,-Infinity], [ Infinity, Infinity, Infinity]]
  this.lineCount    = 0
  this.triCount     = 0
}

var proto = ErrorBars.prototype

proto.draw = function(cameraParams) {
  var gl = this.gl
  this.shader.bind()

  var uniforms        = this.shader.uniforms
  uniforms.model      = cameraParams.model      || IDENTITY
  uniforms.view       = cameraParams.view       || IDENTITY
  uniforms.projection = cameraParams.projection || IDENTITY
  uniforms.clipBounds = this.clipBounds

  this.vao.bind()
  this.vao.draw(gl.LINES,     this.lineCount)
  this.vao.unbind()
}

proto.update = function(options) {
  options = options || {}

  if('clipBounds' in options) {
    this.clipBounds = options.clipBounds
  }

  var color    = options.color || [0,0,0]
  var position = options.position
  var error    = options.error
  
  if(position && error) {
    var verts       = []
    var n           = position.length
    var vertexCount = 0

    //Build geometry for lines
    for(var i=0; i<n; ++i) {
      var p = position[i]
      var e = error[i]
      var c = color
      if(Array.isArray(color[0])) {
        c = color[i]
      }
      for(var j=0; j<3; ++j) {
        if(e[0][j] < 0) {
          var x = p.slice()
          x[j] += e[0][j]
          verts.push(p[0], p[1], p[2],
                     c[0], c[1], c[2],
                     x[0], x[1], x[2],
                     c[0], c[1], c[2])
          vertexCount += 2
        }
        if(e[1][j] > 0) {
          var x = p.slice()
          x[j] += e[1][j]
          verts.push(p[0], p[1], p[2],
                     c[0], c[1], c[2],
                     x[0], x[1], x[2],
                     c[0], c[1], c[2])
          vertexCount += 2
        }
      }
    }
    this.lineCount = vertexCount
  }
}

proto.dispose = function() {
  this.shader.dispose()
  this.buffer.dispose()
  this.vao.dispose()
}

function createErrorBars(gl, options) {
  var buffer = createBuffer(gl) 
  var vao = createVAO(gl, [
      {
        buffer: buffer,
        type:   gl.FLOAT,
        size:   3,
        offset: 0,
        stride: 24
      },
      {
        buffer: buffer,
        type:   gl.FLOAT,
        size:   3,
        offset: 12,
        stride: 24
      }
    ])

  var shader = createShader(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location    = 1

  var result = new ErrorBars(gl, buffer, vao, shader)
  result.update(options)
  return result
}