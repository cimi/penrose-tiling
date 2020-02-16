import { Matrix } from 'transformation-matrix-js';

// code copied from https://observablehq.com/@kelleyvanevert/l-systems-2
export function parse(text = '') {
  const def = {
    axiom: 'X',
    angle: 90,
    fill: '#f6f6f6',
    stroke: 'black',
    bg: '#f9f9f9'
  };

  const known = {
    angle: [/^[0-9\.]+$/, parseFloat],
    order: [/^[0-9]+$/, parseInt],
    axiom: String,
    animate: () => true,
    colorful: () => true,
    stroke: String,
    fill: String,
    bg: String
  };

  // inherit defaults
  const system = Object.create(def);
  system.rules = {};
  system._text = text;

  var m, f;

  text.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.match(/^\/\//)) return;

    if ((m = line.match(/^([a-z]+)(?:[ ]*:[ ]*(.*))?$/))) {
      if ((f = known[m[1]])) {
        var test = /.*/;
        var coerce = f;
        if (f.splice) {
          test = f[0];
          coerce = f[1];
        }
        if (!(m[2] || '').match(test)) {
          throw 'Parameter invalid: ' + m[1];
        }
        system[m[1]] = coerce(m[2] || '');
      } else {
        throw 'Err: key not known: ' + m[1];
      }
    } else if ((m = line.match(/^([A-Z])[ ]*(?:->|=)[ ]*(.*)$/))) {
      system.rules[m[1]] = m[2];
    } else {
      throw 'Err: line not parseable: ' + line;
    }
  });

  const constants = {};
  Object.values(system.rules).forEach(v => {
    v.split('').forEach(c => {
      if (system.rules[c] === undefined) {
        constants[c] = c;
      }
    });
  });
  system.rules = Object.assign(Object.create(constants), system.rules);

  if (!system.order) {
    system.order = 2;
  }

  return system;
}

export function bounds(lines) {
  const b = [0, 0, 0, 0]; // minx, miny, maxx, maxy

  for (var line of lines) {
    for (var p of line) {
      if (p.x < b[0]) b[0] = p.x;
      if (p.y < b[1]) b[1] = p.y;
      if (p.x > b[2]) b[2] = p.x;
      if (p.y > b[3]) b[3] = p.y;
    }
  }

  return b;
}

export function L(system = {}) {
  var gen;

  function reset() {
    gen = [system.axiom];
  }

  function g(n = 0) {
    return new Promise(resolve => {
      function go() {
        if (gen[n]) return resolve(gen[n]);
        gen.push(gen[gen.length - 1].replace(/./g, c => system.rules[c]));
        setTimeout(go, 1);
      }
      go();
    });
  }

  reset();

  g.reset = reset;
  g.system = system;
  return g;
}

export function linedata(g, order = g.system.order) {
  const lines = [];
  const polygons = [];
  const editpolys = [];
  const mat = [new Matrix()];
  mat[0]._step = 1;

  const start_new_line = () => lines.unshift([mat[0].applyToPoint(0, 0)]);
  const draw_line = () => lines[0].push(mat[0].applyToPoint(mat[0]._step, 0));
  const just_move = () => mat[0].translate(mat[0]._step, 0);

  const add_poly_dot = () => {
    if (!editpolys.length) throw 'No polygon [add_poly_dot]';
    editpolys[0].push(mat[0].applyToPoint(0, 0));
  };
  const start_polygon = () => editpolys.unshift([]);
  const close_polygon = () => {
    if (!editpolys.length) throw 'No polygon [close_polyong]';
    var polygon = editpolys.shift();
    polygon.push(polygon[0]);
    polygons.push(polygon);
  };

  const instructions = {
    F: () => (draw_line(), just_move()), // draw & move forward
    f: () => (draw_line(), start_new_line()), // draw but don't move
    g: () => (just_move(), start_new_line()), // only move forward
    '+': () => mat[0].rotateDeg(g.system.angle), // rotate right
    '-': () => mat[0].rotateDeg(-g.system.angle), // rotate left
    '|': () => mat[0].rotateDeg(180),
    '[': () => {
      mat.unshift(mat[0].clone());
      mat[0]._step = mat[1]._step;
    }, // push matrix
    ']': () => (mat.shift(), start_new_line()), // pop matrix

    '.': () => add_poly_dot(),
    '{': () => start_polygon(),
    '}': () => close_polygon()
  };

  start_new_line();

  return new Promise(resolve => {
    g(order).then(str => {
      var m;

      while ((m = str.match(/^([^@]|@[IQ]?[0-9\.]+\^?)/))) {
        str = str.slice(m[1].length);
        if (m[1][0] == '@') {
          m = m[1].match(/^@([IQ]?)([0-9\.]+)(\^?)/);
          var mod = m[1];
          var n = parseFloat(m[2]);
          if (m[3]) n = Math.pow(n, g.system.order);
          if (mod == 'I') n = 1 / n;
          if (mod == 'Q') n = Math.sqrt(n);
          mat[0]._step *= n;
        } else {
          if (instructions[m[1]]) {
            instructions[m[1]]();
          }
        }
      }

      resolve({ lines, polygons });
    });
  });
}

