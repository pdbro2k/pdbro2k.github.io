"use strict";

let cells = document.getElementsByTagName("td");

let interpolationConf = {
  "max": 100,
	"maxHexColor": "#99ff99"
};
for (let i=0; i < cells.length; ++i) {
    let currentValue = parseFloat(cells[i].innerHTML);
    let currentColor = interpolate(currentValue, interpolationConf);
    cells[i].style.cssText = "background-color: " + currentColor + ";";
}
