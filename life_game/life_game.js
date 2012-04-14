// life_game.js

// Copyright (c) 2012, Jeremiah LaRocco jeremiah.larocco@gmail.com

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

// Simple WebGL version of the "game of life"

function createShader(gl, str, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    return shader;
}

function createProgram(gl, vstr, fstr) {
    var program = gl.createProgram();
    var vshader = createShader(gl, vstr, gl.VERTEX_SHADER);
    var fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    return program;
}

function mapPoint(x,y, width, height) {
    return [x*(2.0/width)-1,
            y*(2.0/height)-1]
}

function countNeighbors(i,j) {
    var w = mats[curMat].length;
    var h = mats[curMat][0].length;

    var num = 0;
    var up = i-1>0 ? -1 + i : -1 + h;
    var down = (i+1 <h-1) ? 1 + i : 0;
    var left = (j-1>0 ? -1 + j : -1 + w);
    var right = (j+1 < w-1 ? 1+j : 0);

    num += mats[curMat][up][j];
    num += mats[curMat][down][j];
    num += mats[curMat][i][left];
    num += mats[curMat][i][right];
    num += mats[curMat][up][left];
    num += mats[curMat][up][right];
    num += mats[curMat][down][left];
    num += mats[curMat][down][right];
    return num;

}
function evolve() {
    var nmat = curMat
    if (curMat ==0) {
        nmat = 1
    } else {
        nmat = 0
    }
    for (var i=0;i<mats[curMat].length;++i){
        for (var j=0;j<mats[curMat][i].length;++j) {
            var num = countNeighbors(i,j);
            mats[nmat][i][j] = false;
            
            if ((mats[curMat][i][j] && ((num >= 2) && (num <= 3))) || num==3) {
                mats[nmat][i][j] = true
            }
        }
    }
    curMat = nmat
}
function draw() {
    var canvas = document.getElementById('omg-webgl');
    var gl = canvas.getContext('experimental-webgl');

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    width = canvas.width
    height = canvas.height
    gl.viewport(0,0,width, height)
    
    var vs = 'attribute vec2 pos; void main() { gl_Position = vec4(pos, 0,1); }';
    var fs = 'precision mediump float; void main() { gl_FragColor = vec4(1.0,0.9,1.0,1); }';
    
    var program = createProgram(gl, vs, fs);
    gl.useProgram(program);

    var vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);

    var vertices = new Array(mats[0].length*mats[0].length*6)
    var dx = canvas.width/mats[0].length
    var dy = canvas.height/mats[0].length
    var cx = 0
    var cy = 0
    var curvx = 0
    for (i=0;i<mats[curMat].length; ++i) {
        cy = 0
        for (j=0;j<mats[curMat][0].length; ++j) {
            if (mats[curMat][i][j]) {
                
                np = mapPoint(cx,cy, width, height)
                vertices[curvx+0] = np[0]
                vertices[curvx+1] = np[1]

                np = mapPoint(cx+dx, cy, width, height)
                vertices[curvx+2] = np[0]
                vertices[curvx+3] = np[1]
                vertices[curvx+6] = np[0]
                vertices[curvx+7] = np[1]
                
                np = mapPoint(cx, cy+dy, width, height)
                vertices[curvx+4] = np[0]
                vertices[curvx+5] = np[1]
                vertices[curvx+8] = np[0]
                vertices[curvx+9] = np[1]
                
                np = mapPoint(cx+dx, cy+dy, width, height)
                vertices[curvx+10] = np[0]
                vertices[curvx+11] = np[1]

                curvx+=12
            }
            cy += dy
        }
        cx += dx
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    program.vertexPosAttrib = gl.getAttribLocation(program, 'pos');
    gl.enableVertexAttribArray(program.vertexPosAttrib);
    gl.vertexAttribPointer(program.vertexPosAttrib, 2, gl.FLOAT, false, 0,0);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2)
}

function tick() {
    draw()
    evolve()
    requestAnimFrame(tick);
    
    numFrames += 1
    curTime = new Date().getTime()
    var fps = numFrames/((curTime - startTime)/1000)
    document.getElementById('fps_txt').value = fps
}

function main() {
    numFrames = 0
    startTime = new Date().getTime();
    var num = 100
    curMat = 0
    mats = new Array(2)
    mats[0] = new Array(num)
    mats[1] = new Array(num)
    for (i=0;i<num; ++i) {
        mats[0][i] = new Array(num)
        mats[1][i] = new Array(num)
        for (j=0;j<num;++j) {
            mats[curMat][i][j] = Math.random()>0.5
        }
    }
    tick()
}
