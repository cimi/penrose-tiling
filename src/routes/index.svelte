<script>
import { onMount } from 'svelte';
import paper from 'paper';
import {scaleLinear, scaleOrdinal} from "d3-scale";
import {linedata, L, parse, bounds} from './lib';
import { colors, fillColorByArea } from "./colors";


const penroseLSystem = `order: 5
axiom: [N]++[N]++[N]++[N]++[N]
angle: 36
colorful

M -> OF++PF----NF[-OF----MF]++
N -> +OF--PF[---MF--NF]+
O -> -MF++NF[+++OF++PF]-
P -> --OF++++MF[+PF++++NF]--NF
F ->`;

const config = {
  size: 600,
  concurrency: 4,
  colors: [
    { bgColor: '#E1DAD2', scheme: ['#FF4400', '#F7DA00', '#07748C'] },
    { bgColor: '#FED322', scheme: ['#20BA4E', '#F20775', '#51358C'] },
    { bgColor: '#F2EFC7', scheme: ['#FF9D83', '#4071A6', '#D3DEE8'] }
    // { bgColor: '#101115', scheme: d3.schemePastel1 },
    // { bgColor: '#fefefe', interpolator: d3.interpolatePlasma },
  ]
};

function drawCanvas(context, data) {
  const width = window.innerHeight / 2;
  const height = window.innerHeight / 2;
  const concurrency = 4;
  const c = colors();
  const b = bounds(data.lines);
  paper.setup(context.canvas);
  paper.view.viewSize = new paper.Size(width, height);

  const lines = data.lines.reverse();
  let paths = [];
  let i = 0;
  let fillColor;

  const reset = () => {
    paper.project.activeLayer.removeChildren();
    const backgroundLayer = new paper.Layer();
    const background = new paper.Path.Rectangle(paper.view.bounds);
    const colorIdx = Math.floor(Math.random() * config.colors.length);
    fillColor = fillColorByArea(config.colors[colorIdx]);
    background.style = { fillColor: config.colors[colorIdx].bgColor };
    document.body.style.backgroundColor = config.colors[colorIdx].bgColor;
    paper.view.draw();
    i = 0;
  };

  const animate = lines => {
    paths = [];
    i = 0;
    const b = bounds(lines);
    const scaleX = scaleLinear()
      .domain([b[0], b[2]])
      .range([10, width - 10]);
    const scaleY = scaleLinear()
      .domain([b[1], b[3]])
      .range([10, height - 10]);
    return () => {
      if (i > lines.length / concurrency) return;
      for (let batch = 0; batch < concurrency; batch++) {
        const pos = batch * Math.floor(lines.length / concurrency) + i;
        if (!lines[pos]) continue;
        const path = new paper.Path({
          segments: [],
          strokeColor: 'white'
        });
        lines[pos].forEach(point => {
          path.add(new paper.Point(scaleX(point.x), scaleY(point.y)));
        });
        if (Math.abs(path.area) < 10) continue;
        path.fillColor = fillColor(path);
        paths.push(path);
      }
      i++;
    };
  }
  reset();
  context.canvas.onclick = reset;
  paper.view.onFrame = animate(lines);
}

onMount(() => {
  const canvas = document.getElementById('tiling');
  const ctx = canvas.getContext('2d');
  linedata(L(parse(penroseLSystem)), 4).then(data => {
    drawCanvas(ctx, data);
  });
});
</script>

<style>
/* Scale canvas with resize attribute to full size */
#tiling {
  cursor: pointer;
  display: block;
  margin: 0 auto;
}
</style>

<svelte:head>
  <title>Penrose Tiling</title>
</svelte:head>
<canvas id="tiling" resize></canvas>
