# colorInterpolator.js

This repo includes the JS file resources/js/colorInterpolator.js with the function `interpolate` which can be used to interpolate between two or three colors (see HTML files in examples).

## Configuration

the function `interpolate` accepts a param conf with the following key value pairs:

- `min`: the minimum value of the scale (defaults to `0`)
- `max`: the maximum value of the scale (defaults to `1000`)
- `minHexColor`: the hex code of the color that should be used for the minimum value of the scale (defaults to `#ffffff` (= white); builds a black scale if left out (or red/blue/... scale if `maxHexColor` is set accordingly))
- `maxHexColor`: the hex code of the color that should be used for the maximum value of the scale (defaults to `#000000` (= black))
- `medHexColor`: the hex code of the color that should be used for the medium value of the scale (if left out the interpolation is only between the other two colors)

Released under CC-BY 4.0, @pdbro2k