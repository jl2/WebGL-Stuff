function createShader(gl, str, type) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, str)
    gl.compileShader(shader)
    return shader
}

function createProgram(gl, vstr, fstr) {
    var program = gl.createProgram()
    var vshader = createShader(gl, vstr, gl.VERTEX_SHADER)
    var fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER)
    gl.attachShader(program, vshader)
    gl.attachShader(program, fshader)
    gl.linkProgram(program)
    return program
}

function x(u, v) {
    return Math.sin(2*u)*Math.cos(u)
}

function y(u, v) {
    return Math.sin(2*u)*Math.sin(u)
}

function z(u,v) {
    return v
}

function main() {
    var canvas = document.getElementById('omg-webgl')
    var gl = canvas.getContext('experimental-webgl', {antialias: true, stencil: true})

    mvMatrix = mat4.create();
    pMatrix = mat4.create();

    gl.scale = function (x, y, z)
    {
        mat4.scale(mvMatrix, [x, y, z]);
    }

    gl.rotate = function(degrees, x, y, z)
    {
        mat4.rotate(mvMatrix, degrees*Math.PI/180, [x, y, z]);
    }

    gl.translate = function(x, y, z)
    {
        mat4.translate(mvMatrix, [x, y, z]);
    }

    gl.pushMatrix = function()
    {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        matrixStack.push(copy);
    }

    gl.popMatrix = function()
    {
        if(matrixStack.length == 0) throw "Invalid popMatrix!";
        mvMatrix = matrixStack.pop();
    }

    gl.loadIdentity = function(mat)
    {
        mat4.identity(mat);
    }

    gl.lookAt = function(eyeX, eyeY, eyeZ, focusX, focusY, focusZ, upX, upY, upZ)
    {
        mat4.lookAt([eyeX, eyeY, eyeZ], [focusX, focusY, focusZ], [upX, upY, upZ], mvMatrix);
    }

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix)
    mat4.identity(mvMatrix)

    var vertexPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
    var vertices = []
    var steps = 120

    var du = (2*Math.PI)/(steps-1)
    var dv = (2*Math.PI)/(steps-1)
    var u = -Math.PI
    for (var i = 0; i<steps; ++i) {
        var v = -Math.PI;
        for (var j=0;j<steps;++j) {
            vertices.push(x(u,v))
            vertices.push(y(u,v))
            vertices.push(z(u,v))

            vertices.push(x(u+du,v))
            vertices.push(y(u+du,v))
            vertices.push(z(u+du,v))

            vertices.push(x(u+du,v+dv))
            vertices.push(y(u+du,v+dv))
            vertices.push(z(u+du,v+dv))

            // vertices.push(x(u,v+dv))
            // vertices.push(y(u,v+dv))
            // vertices.push(z(u,v+dv))

            v += dv
        }
        u += du
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    var vs = 'attribute vec3 pos;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; void main() {gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);}';
    var fs = 'precision mediump float;void main() {gl_FragColor=vec4(0.4,0.9,0,1);}'
    var program = createProgram(gl, vs, fs)
    gl.useProgram(program)

    program.pMatrixUniform = gl.getUniformLocation(program, 'uPMatrix');
    program.mvMatrixUniform = gl.getUniformLocation(program, 'uMVMatrix');
    
    // program.pMatrix = gl.getAttribLocation(program, 'uPMatrix')
    // program.mvMatrix = gl.getAttribLocation(program, 'uMVMatrix')


    program.vertexPosAttrib = gl.getAttribLocation(program, 'pos')
    // alert(mvMatrix);



    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

    gl.vertexAttribPointer(program.vertexPosAttrib, 3, gl.FLOAT, false, 0,0)
    gl.enableVertexAttribArray(program.vertexPosAttrib)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3)
}
