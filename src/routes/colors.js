import {scaleOrdinal, scaleSequential} from "d3-scale";
import {schemeSet1, schemeSet2, schemeTableau10} from "d3-scale-chromatic";

// TODO: color by area
export function colors() {
  const color1 = scaleOrdinal(schemeSet1);
  const color2 = scaleOrdinal(schemeSet2);
  const color3 = scaleOrdinal(schemeTableau10);

  return {
    background: () => '#101115',
    primary: color1,
    secondary: color2,
    sweep: () => '#101115'
  }
}

export function fillColorByArea(colors) {
  let scale;
  if (colors.interpolator) {
    scale = scaleSequential()
      .domain([240, 720])
      .interpolator(colors.interpolator);
  } else if (colors.scheme) {
    scale = scaleOrdinal(colors.scheme);
  }
  let vals = new Set();
  return path => {
    const val = Math.abs(Math.round(path.area));
    vals.add(val);
    return scale(val);
  };
}
