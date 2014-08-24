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
  this.lineWidth    = 1
  this.capSize      = 0.1
  this.lineCount    = 0
  this.triCount     = 0
}

var proto = ErrorBars.prototype

proto.draw = function(cameraParams) {
  var gl = this.gl
  var uniforms        = this.shader.uniforms
  
  gl.lineWidth(this.lineWidth)
  gl.disable(gl.CULL_FACE)

  this.shader.bind()
  uniforms.model      = cameraParams.model      || IDENTITY
  uniforms.view       = cameraParams.view       || IDENTITY
  uniforms.projection = cameraParams.projection || IDENTITY
  uniforms.clipBounds = this.clipBounds
  uniforms.capSize    = this.capSize

  this.vao.bind()
  this.vao.draw(gl.LINES, this.lineCount)
  this.vao.draw(gl.LINES, this.triCount, this.lineCount)
  this.vao.unbind()
}

function updateBounds(bounds, point) {
  for(var i=0; i<3; ++i) {
    bounds[0][i] = Math.min(bounds[0][i], point[i])
    bounds[1][i] = Math.max(bounds[1][i], point[i])
  }
}

var FACE_TABLE = (function(){
  var table = new Array(3)
  for(var d=0; d<3; ++d) {
    var row = []
    for(var j=1; j<=2; ++j) {
      for(var s=-1; s<=1; s+=2) {
        var u = (j+d) % 3
        var y = [0,0,0]
        y[u] = s
        row.push(y)
      }
    }
    table[d] = row
  }
  return table
})()


function emitFace(verts, x, c, d) {
  var offsets = FACE_TABLE[d]
  for(var i=0; i<offsets.length; ++i) {
    var o = offsets[i]
    verts.push(x[0], x[1], x[2],
               c[0], c[1], c[2],
               o[0], o[1], o[2])
  }
  return offsets.length
}

proto.update = function(options) {
  options = options || {}

  if('clipBounds' in options) {
    this.clipBounds = options.clipBounds
  }
  if('lineWidth' in options) {
    this.lineWidth = options.lineWidth
  }
  if('capSize' in options) {
    this.capSize = options.capSize
  }

  var color    = options.color || [[0,0,0],[0,0,0],[0,0,0]]
  var position = options.position
  var error    = options.error
  
  if(!Array.isArray(color[0])) {
    color = [color,color,color]
  }

  if(position && error) {

    this.bounds = [[Infinity, Infinity, Infinity], [-Infinity,-Infinity,-Infinity]]
    var verts       = []
    var n           = position.length
    var vertexCount = 0

    //Build geometry for lines
    for(var i=0; i<n; ++i) {
      var p = position[i]
      var e = error[i]
      for(var j=0; j<3; ++j) {
        var c = color[j]
        if(Array.isArray(c[0])) {
          c = color[i]
        }
        if(e[0][j] < 0) {
          var x = p.slice()
          x[j] += e[0][j]
          verts.push(p[0], p[1], p[2],
                     c[0], c[1], c[2],
                        0,    0,    0,
                     x[0], x[1], x[2],
                     c[0], c[1], c[2],
                        0,    0,    0)
          vertexCount += 2
          updateBounds(this.bounds, x)
        }
        if(e[1][j] > 0) {
          var x = p.slice()
          x[j] += e[1][j]
          verts.push(p[0], p[1], p[2],
                     c[0], c[1], c[2],
                        0,    0,    0,
                     x[0], x[1], x[2],
                     c[0], c[1], c[2],
                        0,    0,    0)
          vertexCount += 2
          updateBounds(this.bounds, x)
        }
      }
    }
    this.lineCount = vertexCount

    //Build geometry for caps
    for(var i=0; i<n; ++i) {
      var p = position[i]
      var e = error[i]
      var c = color
      if(Array.isArray(color[0])) {
        c = color[i]
      }
      for(var j=0; j<3; ++j) {
        var c = color[j]
        if(Array.isArray(c[0])) {
          c = color[i]
        }
        if(e[0][j] < 0) {
          var x = p.slice()
          x[j] += e[0][j]
          vertexCount += emitFace(verts, x, c, j)
        }
        if(e[1][j] > 0) {
          var x = p.slice()
          x[j] += e[1][j]
          vertexCount += emitFace(verts, x, c, j)
        }
      }
    }
    this.triCount = vertexCount - this.lineCount

    this.buffer.update(verts)
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
        stride: 36
      },
      {
        buffer: buffer,
        type:   gl.FLOAT,
        size:   3,
        offset: 12,
        stride: 36
      },
      {
        buffer: buffer,
        type:   gl.FLOAT,
        size:   3,
        offset: 24,
        stride: 36
      }
    ])

  var shader = createShader(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location    = 1
  shader.attributes.offset.location   = 2

  var result = new ErrorBars(gl, buffer, vao, shader)
  result.update(options)
  return result
}