<script>
import { onMount } from 'svelte';
import {linedata, L, parse, drawCanvas} from './lib';

const penroseLSystem = `order: 5
axiom: [N]++[N]++[N]++[N]++[N]
angle: 36
colorful

M -> OF++PF----NF[-OF----MF]++
N -> +OF--PF[---MF--NF]+
O -> -MF++NF[+++OF++PF]-
P -> --OF++++MF[+PF++++NF]--NF
F ->`;
onMount(() => {
  const canvas = document.getElementById('my-house');
  const ctx = canvas.getContext('2d');
  linedata(L(parse(penroseLSystem)), 5).then(data => {
    drawCanvas(ctx, data);
  });
});
</script>

<style>
/* Scale canvas with resize attribute to full size */
canvas[resize] {
    width: 100%;
    height: 100%;
}
</style>

<canvas id="my-house" resize></canvas>
