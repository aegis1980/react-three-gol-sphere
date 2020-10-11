/*
shameless tear off of spherised implementation of c++ implementation at
https://github.com/caosdoar/spheres/blob/master/src/spheres.cpp
*/

import {
  Mesh,
  Geometry,
  Vector3,
  Face3,
  Color,
  MeshBasicMaterial
} from "three";

//X11 color name - all 140 color names are supported.
//Note the lack of CamelCase in the name

const BLACK = [
  new Color("steelblue"),
  new Color("steelblue"),
  new Color("steelblue"),
  new Color("steelblue"),
  new Color("steelblue"),
  new Color("steelblue")
];

const WHITE = new Color("white");

const CubeToSphere = {
  origins: [
    new Vector3(-1.0, -1.0, -1.0),
    new Vector3(1.0, -1.0, -1.0),
    new Vector3(1.0, -1.0, 1.0),
    new Vector3(-1.0, -1.0, 1.0),
    new Vector3(-1.0, 1.0, -1.0),
    new Vector3(-1.0, -1.0, 1.0)
  ],
  rights: [
    new Vector3(2.0, 0.0, 0.0),
    new Vector3(0.0, 0.0, 2.0),
    new Vector3(-2.0, 0.0, 0.0),
    new Vector3(0.0, 0.0, -2.0),
    new Vector3(2.0, 0.0, 0.0),
    new Vector3(2.0, 0.0, 0.0)
  ],
  ups: [
    new Vector3(0.0, 2.0, 0.0),
    new Vector3(0.0, 2.0, 0.0),
    new Vector3(0.0, 2.0, 0.0),
    new Vector3(0.0, 2.0, 0.0),
    new Vector3(0.0, 0.0, 2.0),
    new Vector3(0.0, 0.0, -2.0)
  ]
};

class Quad {
  constructor(triangles) {
    this.triangles = triangles;
  }
}

class SpherisedCube extends Geometry {
  constructor(radius, divisions) {
    super();
    this.divisions = divisions;
    this.r = radius;
    this.quads = {
      0: this.makeQuads(divisions),
      1: this.makeQuads(divisions),
      2: this.makeQuads(divisions),
      3: this.makeQuads(divisions),
      4: this.makeQuads(divisions),
      5: this.makeQuads(divisions)
    };
    var step = 1 / divisions;
    var step3 = new Vector3(step, step, step);

    for (var face = 0; face < 6; face++) {
      var origin = CubeToSphere.origins[face];
      var right = CubeToSphere.rights[face];
      var up = CubeToSphere.ups[face];
      for (var j = 0; j < divisions + 1; j++) {
        var j3 = new Vector3(j, j, j);
        for (var i = 0; i < divisions + 1; i++) {
          var i3 = new Vector3(i, i, i);
          var a = new Vector3(i3.x * right.x, i3.y * right.y, i3.z * right.z);
          var b = new Vector3(j3.x * up.x, j3.y * up.y, j3.z * up.z);
          var c = new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
          var d = new Vector3(step3.x * c.x, step3.y * c.y, step3.z * c.z);
          var p = new Vector3(origin.x + d.x, origin.y + d.y, origin.z + d.z);

          var p2 = new Vector3(p.x * p.x, p.y * p.y, p.z * p.z);
          var n = new Vector3(
            p.x * Math.sqrt(1.0 - 0.5 * (p2.y + p2.z) + (p2.y * p2.z) / 3.0),
            p.y * Math.sqrt(1.0 - 0.5 * (p2.z + p2.x) + (p2.z * p2.x) / 3.0),
            p.z * Math.sqrt(1.0 - 0.5 * (p2.x + p2.y) + (p2.x * p2.y) / 3.0)
          );
          this.vertices.push(n);
        }
      }
    }
    var k = divisions + 1;
    for (face = 0; face < 6; face++) {
      for (j = 0; j < divisions; j++) {
        var is_btm = j < divisions / 2;
        for (var i = 0; i < divisions; i++) {
          var is_left = i < divisions / 2;
          var a = (face * k + j) * k + i;
          var b = (face * k + j) * k + i + 1;
          var c = (face * k + j + 1) * k + i;
          var d = (face * k + j + 1) * k + i + 1;
          var tris = [];
          if (is_btm ^ is_left) {
            tris = this.addQuadAlt(a, c, d, b);
          } else {
            tris = this.addQuad(a, c, d, b);
          }
          this.quads[face][j][i] = new Quad(tris);
        }
      }
    }

    this.computeFaceNormals();
  }

  updateBoardStatus(boardStatus) {
    for (var face = 0; face < 6; face++) {
      for (var j = 0; j < this.divisions; j++) {
        for (let i = 0; i < this.divisions; i++) {
          var f1 = this.quads[face][j][i].triangles[0];
          var f2 = this.quads[face][j][i].triangles[1];
          var c = boardStatus[face][i][j] ? BLACK[face] : WHITE;
          this.faces[f1].color = c;
          this.faces[f2].color = c;
        }
      }
    }
  }

  makeQuads(divisions) {
    // Create a multidimensional array
    var table = new Array(divisions); // 10 rows of the table
    for (var i = 0; i < table.length; i++) table[i] = new Array(10); // Each row has 10 columns

    // Initialize the array
    for (var row = 0; row < table.length; row++) {
      for (var col = 0; col < table[row].length; col++) {
        table[row][col] = new Quad();

        return table;
      }
    }
  }

  addQuad(a, b, c, d) {
    var f1 = this.faces.push(new Face3(a, b, c));
    var f2 = this.faces.push(new Face3(a, c, d));
    return [f1 - 1, f2 - 1];
  }

  addQuadAlt(a, b, c, d) {
    var f1 = this.faces.push(new Face3(a, b, d));
    var f2 = this.faces.push(new Face3(b, c, d));
    return [f1 - 1, f2 - 1];
  }
}

export default SpherisedCube;
