//+ ------------------------------------------------------------------- +//
//MARK: Default objects
/** [bound, coordinates, snappable, color] */
const defaultEditorObjects = {
    Points: {
        'origin': {
            boundary  : [new Vector(0, 0), new Vector(0, 0)],
            coord     : new Vector(0, 0),
            snappable : true,
            texture   : '#ffffff',
        },
    },
    Lines: {
        'axisX': {
            boundary  : [new Vector(0, 0), new Vector(1, 0)],
            coords    : [new Vector(0, 0), new Vector(1, 0)],
            snappable : false,
            texture   : '#ff0000',
        },
        'axisY': {
            boundary  : [new Vector(0, 0), new Vector(0, 1)],
            coords    : [new Vector(0, 0), new Vector(0, 1)],
            snappable : false,
            texture   : '#00ff00',
        },
    },
}
const defaultSnapObjects = {
    Points: {
        origin : [new Vector(0, 0)],
    },
    Lines: {},
}

//+ ------------------------------------------------------------------- +//
//MARK: Parameters

var Building = {
    name: '',
    workingPanelIdx: -1,
    //? floor info
    get floors() {
        return this._undergroundFloors.concat(this._abovegroundFloors);
    },
    get highestFloor() {
        return this.floors[this.floors.length - 1];
    },
    get floorsToDraw() {
        let floorsToDraw = [Editor.currentFloor];
        if (Editor.showLowerFloor) {
            let lowerFloor = Building.getLowerFloor(Editor.currentFloor);
            if (lowerFloor) floorsToDraw = [lowerFloor].concat(floorsToDraw);
        }
        if (Editor.showUpperFloor) {
            let upperFloor = Building.getUpperFloor(Editor.currentFloor);
            if (upperFloor) floorsToDraw = floorsToDraw.concat([upperFloor]);
        }
        return floorsToDraw;
    },
    get floorTagsToDraw() {
        return this.floorsToDraw.map(floorToFloorTag);
    },
    get floorHeights() {
        return this._undergroundFloorHeights.concat(this._abovegroundFloorHeights);
    },
    get floorZs() {
        return this._undergroundFloorZs.concat(this._abovegroundFloorZs);
    },
    _abovegroundFloors       : [1],
    _abovegroundFloorHeights : [3.5],
    _abovegroundFloorZs      : [0],
    _undergroundFloors       : [],
    _undergroundFloorHeights : [],
    _undergroundFloorZs      : [],
    //? geometry
    boundaryXY: [new Vector(0, 0), new Vector(0, 0)],
    get boundaryZ() {
        return new Vector(
            this.floorZs[0],
            this.floorZs[this.floorZs.length-1]+this.floorHeights[this.floorHeights.length-1],
        );
    },
}
Building.addFloor = function (floor) {
    if (floor > 0) {
        // 지상층
        hightestFloor = this._abovegroundFloors[this._abovegroundFloors.length - 1];
        if (floor > hightestFloor) {
            newFloors = Array.from(new Array(floor-hightestFloor), (x, i) => i+hightestFloor+1);
            this._abovegroundFloors = this._abovegroundFloors.concat(newFloors);
            this._abovegroundFloorHeights = this._abovegroundFloorHeights.concat(Array(newFloors.length).fill(3.5));
            this.updateFloorZs();
        }
    }
    else {
        // 지하층
        lowestFloor = this._undergroundFloors[0] || 0;
        if (floor < lowestFloor) {
            newFloors = Array.from(new Array(lowestFloor-floor), (x, i) => i+floor);
            this._undergroundFloors = newFloors.concat(this._undergroundFloors);
            this._undergroundFloorHeights = Array(newFloors.length).fill(3.5).concat(this._undergroundFloorHeights);
            this.updateFloorZs();
        }
    }
}
Building.removeFloor = function (floor) {
    if (floor > 0) {
        // 지상층
        if (this._abovegroundFloors[this._abovegroundFloors.length - 1] === floor) {
            this._abovegroundFloors.pop();
            this._abovegroundFloorHeights.pop();
            this.updateFloorZs();
        }
    }
    else {
        // 지하층
        if (this._undergroundFloors[0] === floor) {
            this._undergroundFloors.shift();
            this._undergroundFloorHeights.shift();
            this.updateFloorZs();
        }
    }
}
Building.getLowerFloor = function (floor) {
    let lowerFloor = floor - 1;
    if (lowerFloor == 0) lowerFloor -= 1;
    if (Building.floors.includes(lowerFloor)) {
        return lowerFloor;
    }
    else {
        return null;
    }
}
Building.getUpperFloor = function (floor) {
    let upperFloor = floor + 1;
    if (upperFloor == 0) upperFloor += 1;
    if (Building.floors.includes(upperFloor)) {
        return upperFloor;
    }
    else {
        return null;
    }
}
Building.changeFloorHeight = function (floor, height) {
    if (floor > 0) {
        // 지상층
        floorIdx = this._abovegroundFloors.indexOf(floor);
        this._abovegroundFloorHeights[floorIdx] = height;
    }
    else {
        // 지하층
        floorIdx = this._undergroundFloors.indexOf(floor);
        this._undergroundFloorHeights[floorIdx] = height;
    }
    this.updateFloorZs();
    updateViewerObjectsHeight(floorToFloorTag(floor));
}
Building.updateFloorZs = function () {
    this._abovegroundFloorZs = [0].concat(this._abovegroundFloorHeights.slice(0,-1).map((sum = 0, n => sum += n)));
    this._undergroundFloorZs = this._undergroundFloorHeights.reverse().map((sum = 0, n => sum += n)).map(x => -x).reverse();
    /*
    console.log(this._abovegroundFloors);
    console.log(this._abovegroundFloorHeights);
    console.log(this._abovegroundFloorZs);
    console.log('');
    console.log(this._undergroundFloors);
    console.log(this._undergroundFloorHeights);
    console.log(this._undergroundFloorZs);
    console.log('');
    */
}
Building.getFloorInfo = function (floor) {
    if (floor > 0) {
        // 지상층
        floorIdx = this._abovegroundFloors.indexOf(floor);
        return [
            this._abovegroundFloorHeights[floorIdx],
            this._abovegroundFloorZs[floorIdx],
        ];
    }
    else {
        // 지하층
        floorIdx = this._undergroundFloors.indexOf(floor);
        return [
            this._undergroundFloorHeights[floorIdx],
            this._undergroundFloorZs[floorIdx],
        ];
    }
}
Building.getFloorHeight = function (floor) {
    return this.getFloorInfo(floor)[0];
}
Building.getFloorZ = function (floor) {
    return this.getFloorInfo(floor)[1];
}
Building.resetBoundaryXY = function () {
    this.boundaryXY = [new Vector(Infinity, Infinity), new Vector(-Infinity, -Infinity)];
}
Building.updateBoundaryXY = function (newBoundary) {
    this.boundaryXY = [
        Vector.min(this.boundaryXY[0], newBoundary[0]),
        Vector.max(this.boundaryXY[1], newBoundary[1]),
    ];
}
Building.recomputeBoundaryXY = function () {
    this.resetBoundaryXY();
    for (const [floorTag, walls] of Object.entries(editorObjects)) {
        for (const [wallName, wallProps] of Object.entries(walls)) {
            this.updateBoundaryXY(wallProps.boundary);
        }
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Objects

var objectNameToFloorMap = {};

/* 형태: {
    floorTag: {
        wallName: {
            boundary: [boundary],
            coords: [coordinates],
            wwr: wwr,
            snappable: snappable,
            texture: texture,
        },
    },
}*/
var editorObjects = {};
var objectCount = {};

/* 형태: {
    floorTag: {
        surfName: {
            zone: zoneName,
            coords: [coordinates],
            windows: {
                winName: {
                    coords: coordinates
                },
            },
        },
    },
}*/
var viewerObjects = {};

//+ ------------------------------------------------------------------- +//
//MARK: 2D geometry

function checkBoundary(bound1, bound2) {
    // check x
    var collX = false;
    if (bound2[0].x < bound1[0].x) {
        // (2)  (1)---(1)
        if (bound2[1].x < bound1[0].x) collX = false;
        else collX = true;
    }
    else if (bound2[0].x < bound1[1].x) {
        // (1)- (2) -(1)
        collX = true;
    }
    else {
        // (1)---(1)  (2)
    }
    // check y
    var collY = false;
    if (bound2[0].y < bound1[0].y) {
        // (2)  (1)---(1)
        if (bound2[1].y < bound1[0].y) collY = false;
        else collY = true;
    }
    else if (bound2[0].y < bound1[1].y) {
        // (1)- (2) -(1)
        collY = true;
    }
    else {
        // (1)---(1)  (2)
    }
    // final
    return collX & collY;
}

function checkSnap(coord, startCoord) {
    Editor.inProximity = false;
    Editor.proximityObject = '';
    if (!coord) return false;
    //? 원점 검사
    if (Vector.distance(coord, defaultEditorObjects.Points.origin.coord) < Editor.mouseSnapDistance) {
        Editor.inProximity = true;
        Editor.proximityObject = 'origin';
        Editor.proximityCoord = defaultEditorObjects.Points.origin.coord;
        return true;
    }
    //? wall 검사
    // 끝점 검사
    for (const floorTag of Building.floorTagsToDraw) {
        for (const [wallName, wallProps] of Object.entries(editorObjects[floorTag])) {
            let wallCoords = wallProps.coords;
            for (let i=0; i<wallCoords.length; i++) {
                let wallCoord = wallCoords[i];
                if (Vector.distance(coord, wallCoord) < Editor.mouseSnapDistance) {
                    Editor.inProximity = true;
                    Editor.proximityObject = wallName;
                    Editor.proximityCoord = wallCoord;
                    return true;
                }
            }
        }
    }
    // 선 검사
    for (const floorTag of Building.floorTagsToDraw) {
        for (const [wallName, wallProps] of Object.entries(editorObjects[floorTag])) {
            let [w1, w2] = wallProps.coords;
            let wallVec = w2.sub(w1);
            let targetVec = coord.sub(w1);
            let projLoc = Vector.dot(targetVec, wallVec.unit);
            let dist = Vector.distance(wallVec.unit.mul(projLoc), targetVec);
            if (Editor.angleSnap && startCoord && !pointOnLine(startCoord, w1, w2)) {
                if (dist < Editor.mouseSnapDistance) {
                    let mouseVec = coord.sub(startCoord);
                    mouseVec = Vector.fromAngleDeg(
                        parseFloat(Math.round(mouseVec.angleDeg2 / 45) * 45)
                    );
                    let startVec = startCoord.sub(w1);
                    let intersectLoc = (mouseVec.y*startVec.x - mouseVec.x*startVec.y)
                        / (wallVec.x*mouseVec.y - wallVec.y*mouseVec.x);
                    if (0 <= intersectLoc && intersectLoc <= 1) {
                        Editor.inProximity = true;
                        Editor.proximityObject = wallName;
                        Editor.proximityCoord = wallVec.mul(intersectLoc).add(w1);
                        return true;
                    }
                }
            }
            else {
                if (0 <= projLoc && projLoc <= wallVec.size) {
                    if (dist < Editor.mouseSnapDistance) {
                        Editor.inProximity = true;
                        Editor.proximityObject = wallName;
                        Editor.proximityCoord = wallVec.unit.mul(projLoc).add(w1);
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function selectWall(coord) {
    for (const [wallName, wallProps] of Object.entries(editorObjects[Editor.currentFloorTag])) {
        let [w1, w2] = wallProps.coords;
        let wallVec = w2.sub(w1);
        let targetVec = coord.sub(w1);
        let projLoc = Vector.dot(targetVec, wallVec.unit);
        if (0 <= projLoc && projLoc <= wallVec.size) {
            let dist = Vector.distance(wallVec.unit.mul(projLoc), targetVec);
            if (dist < Editor.mouseSnapDistance) {
                return wallName;
            }
        }
    }
    return '';
}

//+ ------------------------------------------------------------------- +//
//MARK: Edit wall segment (2D + 3D)

function addWallSegment({floor, coords, name='', snappable=true, texture='#fff'}) {
    let floorTag = floorToFloorTag(floor);
    if (name == '') {
        var count = objectCount[floorTag] || 1;
        name = `wall_${floorTag}_${count}`;
        objectCount[floorTag] = count + 1;
    }
    //? object별 floor 정보 저장
    objectNameToFloorMap[name] = floor;
    //? 2D object에 추가
    let bound = [Vector.min(...coords), Vector.max(...coords)];
    editorObjects[floorTag][name] = {
        boundary: bound,
        coords: coords,
        wwr: 0.5,  //TODO WWR
        snappable: snappable,
        texture: texture,
    }
    //? 3D object에 추가
    viewerObjects[floorTag][name] = generateSurfaceAndFenestration(
        name, coords, Building.getFloorHeight(floor), Building.getFloorZ(floor), 0.5);  //TODO
    //? update boundary
    Building.updateBoundaryXY(bound);
    //? update viewports
    updateEditorViewport();
    addSurfaceObjectToViewer(viewerObjects[floorTag][name]);
}

function removeWallSegment(name) {
    const floor = objectNameToFloorMap[name];
    const floorTag = floorToFloorTag(floor);
    if (Editor.hoveredWall == name) Editor.hoveredWall = '';
    if (Editor.selectedWall == name) Editor.selectedWall = '';
    delete objectNameToFloorMap[name];
    delete editorObjects[floorTag][name];
    removeSurfaceObjectFromViewer(viewerObjects[floorTag][name], hold=true);
    delete viewerObjects[floorTag][name];
    //? update boundary
    Building.recomputeBoundaryXY();
    //? update viewports
    updateEditorViewport();
    updateCamera();
}

function updateWallSegmentWWR({floor, name, wwr}) {
    let floorTag = floorToFloorTag(floor);
    let prevEditorObject = editorObjects[floorTag][name];
    //? 2D object 대체
    editorObjects[floorTag][name] = {
        boundary: prevEditorObject.boundary,
        coords: prevEditorObject.coords,
        wwr: wwr,
        snappable: prevEditorObject.snappable,
        texture: prevEditorObject.texture,
    };
    //? 3D object 대체
    removeSurfaceObjectFromViewer(viewerObjects[floorTag][name], hold=true);
    viewerObjects[floorTag][name] = generateSurfaceAndFenestration(
        name, prevEditorObject.coords, Building.getFloorHeight(floor), Building.getFloorZ(floor), wwr);
    addSurfaceObjectToViewer(viewerObjects[floorTag][name]);
    // highlight 업데이트
    Editor.selectedWall = Editor.selectedWall;
}

//+ ------------------------------------------------------------------- +//
//MARK: 3D objects

function surfaceObjectFromGeometry(geom, mat, name) {
    var surfObject = new THREE.Mesh(geom, mat);
    surfObject.renderOrder = 0;
    surfObject.layers.enable(1);  // for mouse selection
    surfObject.name = name || '';
    return surfObject;
}

function edgeObjectFromVertList(vertList) {
    var points = [];
    vertList.forEach(v => {
        points.push(new THREE.Vector3(...v));
    });
    points.push(points[0]);
    var edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    var edgeObject = new THREE.Line(edgeGeom, Materials.Line.Edge);
    return edgeObject;
}

function shadowObjectFromGeometry(geom) {
    var shadowObject = new THREE.Mesh(geom, Materials.Surface.Ghost);
    shadowObject.castShadow = true;
    shadowObject.material.colorWrite = false;
    // shadowObject.material.transparent = true; // only needed if there are other transparent objects
    shadowObject.renderOrder = Infinity;
    return shadowObject;
}


//+ ------------------------------------------------------------------- +//
//MARK: 3D geometry

function generateSurfaceAndFenestration(surfName, coords, height, floorZ, wwr) {

    //? 좌표 리스트 생성
    var surfVertices = [
        [...coords[0], floorZ],
        [...coords[1], floorZ],
        [...coords[1], floorZ + height],
        [...coords[0], floorZ + height],
    ];
    const WINPAD = 0.0001;
    var coordVec = coords[1].sub(coords[0])
    var fenCoords = [
        coords[0].add(coordVec.mul(WINPAD)),
        coords[0].add(coordVec.mul(1 - WINPAD))
    ]
    adjwwr = wwr * (1 + WINPAD*2);
    if (adjwwr > 1 - WINPAD) adjwwr = 1 - WINPAD;
    var fenVertices = [
        [...fenCoords[0], floorZ + height*(1-adjwwr)/2],
        [...fenCoords[1], floorZ + height*(1-adjwwr)/2],
        [...fenCoords[1], floorZ + height*(1-adjwwr)/2 + height*adjwwr],
        [...fenCoords[0], floorZ + height*(1-adjwwr)/2 + height*adjwwr],
    ]

    //? window object 생성
    var windows = {};
    if (wwr > 0) {
        var winGeom = triangulatedSurfGeomFromVertlist(fenVertices);
        windows[`${surfName}_winDefault`] = {
            vertices     : fenVertices,
            geometry     : winGeom,
            object       : surfaceObjectFromGeometry(winGeom, Materials.Surface.Window, surfName),
            edgeObject   : edgeObjectFromVertList(fenVertices),
            construction : '',
        }
    }

    //? window indices 생성
    if (Object.keys(windows).length > 0) {
        // 만약 surface에 창문이 있다면, 구멍을 추가
        var holeIndices = [];
        for (const fenProps of Object.values(windows)) {
            holeIndices.push(surfVertices.length);
            surfVertices = surfVertices.concat(fenProps.vertices);
        }
    }
    else {
        var holeIndices = null;
    }
    
    //? surface object 생성
    var surfGeom = triangulatedSurfGeomFromVertlist(surfVertices, holeIndices);
    var surfObject = {
        zone         : '_zoneName',
        vertices     : surfVertices,
        geometry     : surfGeom,
        object       : surfaceObjectFromGeometry(surfGeom, Materials.Surface.OuterWall, surfName),
        edgeObject   : edgeObjectFromVertList(surfVertices),
        shadowObject : shadowObjectFromGeometry(surfGeom),
        construction : '',
        windows      : windows,
    }
    return surfObject;
}

function updateViewerObjectsHeight(floorTag) {
    var floor = floorTagToFloor(floorTag);
    var height = Building.getFloorHeight(floor);
    var floorZ = Building.getFloorZ(floor);
    editorObjects[floorTag] = {};
    for (const [wallName, wallProps] of Object.entries(editorObjects[floorTag])) {
        viewerObjects[floorTag][wallName] = generatewallaceAndFenestration(wallName, wallProps.coords, height, floorZ, wallProps.wwr);
    }
    //TODO remove previous, add new objects, update viewports
}
