function interpolate(value, conf) {
	const minValue = "min" in conf ? conf.min : 0;
	const maxValue = "max" in conf ? conf.max : 1000;
	const minHexColor = "minHexColor" in conf ? conf.minHexColor : "#FFFFFF";
	const medHexColor = "medHexColor" in conf ? conf.medHexColor : "";
	const maxHexColor = "maxHexColor" in conf ? conf.maxHexColor : "#000000";

	// local helper functions
	function getRValue(hexValue) {
		return parseInt(hexValue.substring(1, 3), 16);
	}
	function getGValue(hexValue) {
		return parseInt(hexValue.substring(3, 5), 16);
	}
	function getBValue(hexValue) {
		return parseInt(hexValue.substring(5, 7), 16);
	}
	function getHex(intValue) {
		return Number(intValue).toString(16).padStart(2, "0")
	};
	function getInterpolatedValue(value, minValue, maxValue, minColorValue, maxColorValue) {
		if (value <= minValue) {
			return minColorValue;
		}
		if (value >= maxValue) {
			return maxColorValue;
		}
		return minColorValue + Math.round((maxColorValue - minColorValue) * (value - minValue) / (maxValue - minValue))
	}

	// handle min-med-max interpolation
	if (medHexColor !== "") {
		const medValue = (minValue + maxValue) / 2;
		if (value <= medValue) {
			const currentRValue = getInterpolatedValue(value, minValue, medValue, getRValue(minHexColor), getRValue(medHexColor));
			const currentGValue = getInterpolatedValue(value, minValue, medValue, getGValue(minHexColor), getGValue(medHexColor));
			const currentBValue = getInterpolatedValue(value, minValue, medValue, getBValue(minHexColor), getBValue(medHexColor));
			return "#" + getHex(currentRValue) + getHex(currentGValue) + getHex(currentBValue);
		}
		const currentRValue = getInterpolatedValue(value, medValue, maxValue, getRValue(medHexColor), getRValue(maxHexColor));
		const currentGValue = getInterpolatedValue(value, medValue, maxValue, getGValue(medHexColor), getGValue(maxHexColor));
		const currentBValue = getInterpolatedValue(value, medValue, maxValue, getBValue(medHexColor), getBValue(maxHexColor));
		return "#" + getHex(currentRValue) + getHex(currentGValue) + getHex(currentBValue);
	}

	// handle min-max interpolation
	const currentRValue = getInterpolatedValue(value, minValue, maxValue, getRValue(minHexColor), getRValue(maxHexColor));
	const currentGValue = getInterpolatedValue(value, minValue, maxValue, getGValue(minHexColor), getGValue(maxHexColor));
	const currentBValue = getInterpolatedValue(value, minValue, maxValue, getBValue(minHexColor), getBValue(maxHexColor));
	return "#" + getHex(currentRValue) + getHex(currentGValue) + getHex(currentBValue);

}
