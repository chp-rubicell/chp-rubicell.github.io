//+ ------------------------------------------------------------------- +//
//MARK: Materials

const Materials = {
    Line: {
        Edge: new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
        }),
    },
    Surface: {
        Ghost: new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            blending: THREE.AdditiveBlending
        }),  // for shadow
        HighlightedWall: new THREE.MeshPhongMaterial({
            color: '#ff4444', side: THREE.DoubleSide, opacity: 0.8}),
        HighlightedWindow: new THREE.MeshPhongMaterial({
            color: '#ff4444', side: THREE.DoubleSide, opacity: 0.3}),
        Adiabatic: new THREE.MeshPhongMaterial({
            color: '#f24b91', side: THREE.DoubleSide, opacity: 0.8}),
        Roof: new THREE.MeshPhongMaterial({
            color: '#a82525', side: THREE.DoubleSide, opacity: 0.5}),
        Inner: new THREE.MeshPhongMaterial({
            color: '#444444', side: THREE.DoubleSide, opacity: 0.5}),
        OuterWall: new THREE.MeshLambertMaterial({
            color: '#ffe16b', side: THREE.DoubleSide}),
        Window: new THREE.MeshPhongMaterial({
            color: '#00eaff', side: THREE.DoubleSide, opacity: 0.3}),
        Door: new THREE.MeshPhongMaterial({
            color: '#1747d4', side: THREE.DoubleSide, opacity: 0.5}),
        Shading: new THREE.MeshPhongMaterial({
            color: '#624285', side: THREE.DoubleSide, opacity: 0.7}),
        Ground: new THREE.MeshLambertMaterial({
            color: '#555555', side: THREE.DoubleSide}),
        Disabled: new THREE.MeshPhongMaterial({
            color: '#bbbbbb', side: THREE.DoubleSide, opacity: 0.3}),
    },
};
for (var matType of Object.values(Materials)) {
    for (var mat of Object.values(matType)) {
        if (mat.opacity < 1) {
            mat.transparent = true;
            //* mat.depthWrite = false;
        }
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Math related

// Convert from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}
// Convert from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
}
// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Returns which domain divided by the boundaries the value falls.
 * -1 (b1) 0 (b2) 1
 */
function checkDomains(val, bound1, bound2) {
    if ((val - bound1) * (val - bound2) < 0) return 0;
    else if ((val - bound1) * (bound2 - bound1) > 0) return 1;
    else return -1;
}
// const checkDomains = (val, bound1, bound2) => val < Math.min(bound1, bound2) ? -1 : val < Math.max(bound1, bound2) ? 0 : 1;

const isBetween = (val, bound1, bound2) => bound2 > bound1 ? (bound1 <= val && val <= bound2) : (bound2 <= val && val <= bound1);

// Cumulative sum
// const cumulativeSum = (sum => value => sum += value)(0);
// const cumulativeSum = (sum = 0, n => sum += n);
// example: [5, 10, 3, 2].map(cumulativeSum);

const THRESHOLD = 10e-6;
const isNearZero = (val) => Math.abs(val) < THRESHOLD;
const isSimilar = (val1, val2) => Math.abs(val2 - val1) < THRESHOLD;

function computeGridSize(range, int) {
    let unit = Math.pow(10, Math.floor(Math.log10(range / 10)));
    let gridSize = int * unit;
    let gridCount = Math.round(range / gridSize);
    return [gridCount, gridSize];
}
function computeGridTicksAuto(min, max) {
    const computedGrids = [5, 4, 2].map(int => computeGridSize(max - min, int));
    const distFromTarget = computedGrids.map(c => Math.abs(8 - c[0]));
    const closestIdx = distFromTarget.indexOf(Math.min(...distFromTarget));
    const gridSize = computedGrids[closestIdx][1];
    let adjustedMin = Math.floor(min / gridSize) * gridSize;
    let adjustedMax = Math.ceil(max / gridSize) * gridSize;
    let count = Math.ceil((adjustedMax - adjustedMin) / gridSize);
    let ticks = [...Array(count).keys()].map(x => x * gridSize + adjustedMin);
    return ticks;
}
function computeGridTicks(min, max) {
    const computedGrids = [1, 5, 10, 50].map(int => computeGridSize(max - min, int));
    const distFromTarget = computedGrids.map(c => Math.abs(8 - c[0]));
    const closestIdx = distFromTarget.indexOf(Math.min(...distFromTarget));
    const gridSize = computedGrids[closestIdx][1];
    let adjustedMin = Math.floor(min / gridSize) * gridSize;
    let adjustedMax = Math.ceil(max / gridSize) * gridSize;
    let count = Math.ceil((adjustedMax - adjustedMin) / gridSize);
    let ticks = [...Array(count).keys()].map(x => x * gridSize + adjustedMin);
    return ticks;
}

function roundValue(value) {
    // [m]
    return Number(value.toFixed(3));
}
function roundValueVector(v) {
    return new Vector(roundValue(v.x), roundValue(v.y));
}

//+ ------------------------------------------------------------------- +//
//MARK: Color related

function stringToRgb(str) {
    if (str.startsWith('#')) {
        return hexToRgb(str);
    }
    else if (str.startsWith('rgb')) {
        return rgbaStringToRgb(str);
    }
}
function rgbToHex(rgb) {
    r = parseInt(rgb.r * 255);
    g = parseInt(rgb.g * 255);
    b = parseInt(rgb.b * 255);
    hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    // return parseInt(hex, 16);
    return '#' + hex;
}
function hexToRgb(h) {
    // hex = h.toString(16);
    hex = h.slice(1);
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    }: null;
}
function rgbaStringToRgb(rgbaString) {
    let result = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*((?:\d*[.])?\d))?\)/i.exec(rgbaString);
    return result ? {
        r: parseInt(result[1]),
        g: parseInt(result[2]),
        b: parseInt(result[3]),
        a: result[4] ? parseFloat(result[4]) : 1.0,
    }: null;
}
function rgbToRgbaString(rgb) {
    return `rgb${rgb.a<1 ? "a" : ""}(${rgb.r}, ${rgb.g}, ${rgb.b}${rgb.a<1? ", "+rgb.a : ""})`;
}
function addWhiteToRgb(color, alpha=0.5) {
    if (typeof(color)=='string') {
        h_str = color;
    }
    else {
        h_str = rgbToHex(color);
    }
    rgb = hexToRgb(h_str);
    return Object.fromEntries(
        Object.entries(rgb).map(([channel, c]) => [channel, c*alpha + (1-alpha)])
    );
}
function addWhiteToHex(color, alpha=0.5) {
    return rgbToHex(addWhiteToRgb(color, alpha));
}
function addBlackToRgb(color, alpha=0.5) {
    if (typeof(color)=='string') {
        h_str = color;
    }
    else {
        h_str = rgbToHex(color);
    }
    rgb = hexToRgb(h_str);
    return Object.fromEntries(
        Object.entries(rgb).map(([channel, c]) => [channel, c*alpha])
    );
}
function addBlackToHex(color, alpha=0.5) {
    return rgbToHex(addBlackToRgb(color, alpha));
}

//+ ------------------------------------------------------------------- +//
//MARK: Building related

const floorToFloorTag = (floor) => (floor > 0 ? `F${floor}` : `BF${-floor}`);

const floorTagToFloor = (floorTag) => (floorTag.startsWith('BF') ? -parseInt(floorTag.slice(2)) : parseInt(floorTag.slice(1)));

const floorTextFromFloor = (floor) => (floor > 0 ? `${floor}F` : `B${-floor}F`);

//+ ------------------------------------------------------------------- +//
//MARK: Triangulate surfaces

//? 수평한 점 리스트로부터 triangulate된 리스트 생성
function triangulateVerticesFromFlatVertlist(vertList, holeIndices=null) {
    var vertTriangulated = [];
    earcut(vertList.flat(), holeIndices, 3).forEach(vIdx => {
        vertTriangulated.push(vertList[vIdx]);
    });
    return vertTriangulated
}

//? 점 리스트로부터 triangulate된 서피스 생성
function triangulatedSurfGeomFromVertlist(vertList, holeIndices=null) {

    const unitX = new THREE.Vector3(1, 0, 0);
    const unitZ = new THREE.Vector3(0, 0, 1);
    
    //? 면의 법선 벡터 계산
    // (첫 번째 점 -> 두 번째 점) 벡터와 (첫 번째 점 -> n 번째 점) 벡터의 cross product 계산 (법선 벡터)
    var surf_normvec = new THREE.Vector3();  // surface의 법선 벡터
    var vert1 = new THREE.Vector3(...vertList[0]);
    var vert2 = new THREE.Vector3(...vertList[1]);
    var vec1 = new THREE.Vector3().subVectors(vert2, vert1);
    for (let i = 2; i < vertList.length; i++) {
        var vert3 = new THREE.Vector3(...vertList[i]);
        var vec2 = new THREE.Vector3().subVectors(vert3, vert1);
        surf_normvec = new THREE.Vector3().crossVectors(vec2, vec1);
        if (surf_normvec.length() > THRESHOLD) {
            // 두 벡터가 일직선이 아님
            break;
        }
    }

    //? 서피스 생성
    var surfGeom = new THREE.BufferGeometry();

    surf_normvec.normalize();
    if (new THREE.Vector3().crossVectors(surf_normvec, unitZ).length() < THRESHOLD) {
        // 이미 수평일 때
        var vertSurf = new Float32Array(
            triangulateVerticesFromFlatVertlist(
                vertList,
                holeIndices
            ).flat()
        );
        surfGeom.setAttribute('position', new THREE.BufferAttribute(vertSurf, 3));
    }
    else {
        // 수평이 아닐 때
        var quaternion = new THREE.Quaternion();  // 평면을 회전시킬 quaternion
        quaternion.setFromUnitVectors(surf_normvec, unitZ);
        
        var vertListHor = [];
        vertList.forEach(v => {
            vec = new THREE.Vector3(...v);
            vec.applyQuaternion(quaternion);
            vertListHor.push([vec.x, vec.y, vec.z]);
        });
        var vertSurf = new Float32Array(
            triangulateVerticesFromFlatVertlist(
                vertListHor,
                holeIndices
            ).flat()
        );
        surfGeom.setAttribute('position', new THREE.BufferAttribute(vertSurf, 3));
        quaternion.invert();  // 회전을 반대 방향으로
        surfGeom.applyQuaternion(quaternion);
    }

    surfGeom.computeVertexNormals();

    return surfGeom;
}
