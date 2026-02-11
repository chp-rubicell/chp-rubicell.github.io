//+ ------------------------------------------------------------------- +//
//MARK: Building

const Building = {
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
            let lowerFloor = this.getLowerFloor(Editor.currentFloor);
            if (lowerFloor) floorsToDraw = [lowerFloor].concat(floorsToDraw);
        }
        if (Editor.showUpperFloor) {
            let upperFloor = this.getUpperFloor(Editor.currentFloor);
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
    addFloor: function(floor) {
        const floorTag = floorToFloorTag(floor);
        if (!(floorTag in this.objects)) {
            this.objects[floorTag] = {
                zoneCount: 0,
                zones: {},
            }
        }
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
    },
    removeFloor: function(floor) {
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
    },
    getLowerFloor: function(floor) {
        let lowerFloor = floor - 1;
        if (lowerFloor == 0) lowerFloor -= 1;
        if (this.floors.includes(lowerFloor)) {
            return lowerFloor;
        }
        else {
            return null;
        }
    },
    getUpperFloor: function(floor) {
        let upperFloor = floor + 1;
        if (upperFloor == 0) upperFloor += 1;
        if (this.floors.includes(upperFloor)) {
            return upperFloor;
        }
        else {
            return null;
        }
    },
    changeFloorHeight: function(floor, height) {
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
    },
    updateFloorZs: function() {
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
    },
    getFloorInfo: function(floor) {
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
    },
    getFloorHeight: function(floor) {
        return this.getFloorInfo(floor)[0];
    },
    getFloorZ: function(floor) {
        return this.getFloorInfo(floor)[1];
    },
    //? geometry
    boundaryXY: [new Vector(0, 0), new Vector(0, 0)],
    get boundaryZ() {
        return new Vector(
            this.floorZs[0],
            this.floorZs[this.floorZs.length-1]+this.floorHeights[this.floorHeights.length-1],
        );
    },
    resetBoundaryXY: function() {
        this.boundaryXY = [new Vector(Infinity, Infinity), new Vector(-Infinity, -Infinity)];
    },
    updateBoundaryXY: function(newBoundary) {
        this.boundaryXY = [
            Vector.min(this.boundaryXY[0], newBoundary[0]),
            Vector.max(this.boundaryXY[1], newBoundary[1]),
        ];
    },
    recomputeBoundaryXY: function() {
        this.resetBoundaryXY();
        for (const [floorTag, walls] of Object.entries(editorObjects)) {
            for (const [wallName, wallProps] of Object.entries(walls)) {
                this.updateBoundaryXY(wallProps.boundary);
            }
        }
    },
    objects: {
        F1: {
            zoneCount: 0,
            zones: {},
        }
    },
    /* Building.objects 형태:
    {
        'floorTag': {
            zoneCount: 0,
            zones: {
                'zoneName': {
                    boundary: [boundary],
                    centroid: centroid,
                    coords: [coords, coords, ...],
                    walls: {
                        'wallName': {
                            zone: 'zoneName',
                            index: index,
                            coords: [coords],
                            segmentCoords: [[coords], [coords], ...],
                            segmentSplicedLoc: [[0.2,'segName1'], [0.4,null], ..., [1,'segName2']],
                            segmentCount: 0,
                            segments: {
                                'segName': {
                                    wall: 'wallName',
                                    coords: [coords],
                                    loc: [loc],
                                    adjSegName: adjSegName,
                                    windows: {
                                        'winName': {
                                            coords: [coords]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    */
   zones: {},
   walls: {},
   segments: {},
}


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
//MARK: 2D geometry

/** check if bound1 and bound2 intersect */
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

/** check snap with object, return name and coordinate */
function checkSnap(coord, startCoord) {
    if (!coord) return false;
    let checkPoint = checkSnapPoints(coord);
    if (checkPoint) return checkPoint;
    return checkSnapSegments(coord, startCoord);
}
/** check snap with only points */
function checkSnapPoints(coord) {
    if (!coord) return false;
    //? 원점 검사
    if (Vector.distance(coord, defaultEditorObjects.Points.origin.coord) < Editor.mouseSnapDistance) {
        return {
            name: 'origin',
            coord: defaultEditorObjects.Points.origin.coord,
        };
    }
    //? segment 검사 (wall이 아님)
    // 끝점 검사
    for (const floorTag of Building.floorTagsToDraw) {
        for (const [zoneName, zoneProps] of Object.entries(Building.objects[floorTag].zones)) {
            for (const [wallName, wallProps] of Object.entries(zoneProps.walls)) {
                let segmentCoords = wallProps.segmentCoords;
                for (let i=0; i<segmentCoords.length; i++) {
                    let segmentCoord = segmentCoords[i];
                    if (Vector.distance(coord, segmentCoord) < Editor.mouseSnapDistance) {
                        return {
                            name: wallName,
                            coord: segmentCoord,
                        };
                    }
                }
            }
        }
    }
}

/**
 * Check snap with only segments.
 * @param {Vector} coord - 검사하려는 좌표
 * @param {?Vector} startCoord - 시작지점 좌표
 * @param {boolean} detailed - 겹친 segment 중 마우스 위치 기반하여 선택
 * @returns snapped object
 */
function checkSnapSegments(coord, startCoord, detailed=false) {
    if (!coord) return false;
    // 선 검사
    for (const floorTag of Building.floorTagsToDraw) {
        for (const [zoneName, zoneProps] of Object.entries(Building.objects[floorTag].zones)) {
            for (const [wallName, wallProps] of Object.entries(zoneProps.walls)) {
                let [w1, w2] = wallProps.coords;
                let wallVec = w2.sub(w1);
                let targetVec = coord.sub(w1);
                let projLoc = Vector.dot(targetVec, wallVec.unit) / wallVec.size;
                let dist = Vector.distance(wallVec.mul(projLoc), targetVec);
                if (0 <= projLoc && projLoc <= 1 && dist < Editor.mouseSnapDistance && !pointOnLine(startCoord, [w1, w2])) {
                    const filtered = wallProps.segmentSplicedLoc.filter((pair) => projLoc <= pair[0]);
                    const segName = filtered[0][1];  // 가장 처음 일치하는 loc의 segment 이름 가져오기
                    if (Editor.angleSnap && startCoord) {
                        let mouseVec = coord.sub(startCoord);
                        mouseVec = Vector.fromAngleDeg(
                            parseFloat(Math.round(mouseVec.angleDeg2 / 45) * 45)
                        );
                        let startVec = startCoord.sub(w1);
                        let intersectLoc = (mouseVec.y*startVec.x - mouseVec.x*startVec.y)
                            / (wallVec.x*mouseVec.y - wallVec.y*mouseVec.x);
                        if (0 <= intersectLoc && intersectLoc <= 1) {
                            return {
                                name: segName,
                                coord: wallVec.mul(intersectLoc).add(w1),
                            };
                        }
                    }
                    else {
                        const snappedCoord = wallVec.mul(projLoc).add(w1);
                        const adjSegName = Building.segments[segName].adjSegName;
                        if (detailed && adjSegName) {
                            // 여러 segment가 겹쳐있는 경우 마우스 위치 가지고 판단
                            if (pointInPolygon(zoneProps.coords, coord)) {
                                // 선택한 좌표가 해당 존 안에 있는 경우
                                return {
                                    name: segName,
                                    coord: snappedCoord,
                                };
                            }
                            else {
                                // 좌표가 해당 존 밖에 있는 경우, 인접 segment로
                                return {
                                    name: adjSegName,
                                    coord: snappedCoord,
                                };
                            }
                        }
                        else {
                            return {
                                name: segName,
                                coord: snappedCoord,
                            };
                        }
                    }
                }
            }
        }
    }
}

function selectWallSegment(coord) {
}

//+ ------------------------------------------------------------------- +//
//MARK: Zones

/**
 * 새로운 zone object를 추가
 * @param {number} floor - 추가할 층
 * @param {Vector[]} coords - [[coords], [coords], ...] 형태, 끝점 반복X
 * @param {?string} zoneName - zone 이름
 */
function addZone({floor, coords, zoneName=null}) {
    let floorTag = floorToFloorTag(floor);
    //? 이름 생성
    if (!zoneName) {
        Building.objects[floorTag].zoneCount ++;
        zoneName = `zone_${floorTag}_${Building.objects[floorTag].zoneCount}`;
    }
    //? boundary
    const zoneBound = [Vector.min(...coords), Vector.max(...coords)];
    //? wall 생성
    let walls = {};
    for (let i=0; i<coords.length; i++) {
        if (i == 0) var wallCoords = [coords[coords.length-1], coords[0]];
        else var wallCoords = [coords[i-1], coords[i]];
        let wallName = `${zoneName}_wall_${i+1}`;
        let wallProps = {
            zone: zoneName,
            index: i,
            coords: wallCoords,
        };
        walls[wallName] = wallProps;
        Building.walls[wallName] = wallProps;
    }
    const zoneProps = {
        floor: floor,
        boundary: zoneBound,
        centroid: getPolygonCentroid(coords),
        coords: coords,
        walls: walls,
    };
    Building.objects[floorTag].zones[zoneName] = zoneProps;
    Building.zones[zoneName] = zoneProps;
    //? wall adjacency
    for (const [wallName, wallProps] of Object.entries(Building.objects[floorTag].zones[zoneName].walls)) {
        updateWallSegments(wallName, zoneName, floor, updateAdj=true);
    };
    //? update building boundary
    Building.updateBoundaryXY(zoneBound);
    updateEditorViewport();
}

function updateWallSegments(wallName, zoneName, floor, updateAdj=true, adjSegName) {
    if (!zoneName) {
        zoneName = Building.wallToZone[wallName];
    }
    if (!floor) {
        floor = Building.zones[zoneName].floor;
    }
    const floorTag = floorToFloorTag(floor);
    //TODO Remove selection
    const zones = Building.objects[floorTag].zones;
    const wallProps = zones[zoneName].walls[wallName];
    const wallCoords = wallProps.coords;
    wallProps.segmentCoords = [];
    wallProps.segmentSplicedLoc = [ [1, null] ];
    wallProps.segmentCount = 0;
    wallProps.segments = {};
    for (const [otherZoneName, otherZoneProps] of Object.entries(zones)) {
        if (otherZoneName == zoneName) {continue;}
        for (const [otherWallName, otherWallProps] of Object.entries(otherZoneProps.walls)) {
            const segmentLoc = spliceLine(wallCoords, otherWallProps.coords);
            if (segmentLoc) {
                const segName = addSegmentToWallProps(wallName, wallProps, segmentLoc, adjSegName);  // 새 segment 추가
                if (adjSegName) {
                    // 인접한 segment 이름이 주어졌을 경우, 인접 segment의 인접 정보도 업데이트
                    Building.segments[adjSegName].adjSegName = segName;
                }
                let newUpperLoc = Math.max(...segmentLoc);
                let prevSpliceLoc = wallProps.segmentSplicedLoc.filter((pair) => pair[0] == newUpperLoc);
                if (prevSpliceLoc.length > 0) {
                    // 이미 null로 있는 경우 업데이트
                    if (prevSpliceLoc.length > 1) {
                        console.error('multiple spliceLoc:', wallName, otherWallName, newUpperLoc);
                    }
                    prevSpliceLoc[0][1] = segName;
                }
                else {
                    wallProps.segmentSplicedLoc.push([newUpperLoc, segName]);
                }
                if (updateAdj) {
                    updateWallSegments(otherWallName, otherZoneName, floor, updateAdj=false, adjSegName=segName);
                }
            }
        }
    }
    // wallProps.segmentSplicedLoc를 loc로 정렬
    wallProps.segmentSplicedLoc.sort(
        function(a, b) {return a[0] - b[0]}
    );  // pair의 앞 값 (loc)으로 정렬
    for (const [locIdx, pair] of Object.entries(wallProps.segmentSplicedLoc)) {
        const [loc, spliced] = pair;
        if (spliced) continue;  // 다른 존과 인접해서 segment가 이미 추가됐다면 통과
        let previousLoc = locIdx == 0 ? 0 : wallProps.segmentSplicedLoc[locIdx - 1][0];
        // console.log(`${locIdx}: ${previousLoc}-${loc} = ${spliced}`);
        const segName = addSegmentToWallProps(wallName, wallProps, [previousLoc, loc]);
        pair[1] = segName;
    }
}

function addSegmentToWallProps(wallName, wallProps, segmentLoc, adjSegName) {
    const wallCoords = wallProps.coords;
    let segmentCoords = [];
    for (let loc of segmentLoc) {
        segmentCoords.push(wallCoords[1].sub(wallCoords[0]).mul(loc).add(wallCoords[0]));
    }
    wallProps.segmentCount ++;
    const segName = `${wallName}_${wallProps.segmentCount}`;
    const segProps = {
        wall: wallName,
        coords: segmentCoords,
        loc: segmentLoc,
        adjSegName: adjSegName,
        windows: {},
    }
    wallProps.segments[segName] = segProps;
    Building.segments[segName] = segProps
    return segName;
}

/** Get the name of the previous segment. */
function getPreviousSegmentName(segName) {
    const segProps = Building.segments[segName];
    const wallProps = Building.walls[segProps.wall];
    if (segProps.loc[0] == 0) {
        // 같은 존에서 직전 벽 찾기
        const zoneProps = Building.zones[wallProps.zone];
        const wallIdx = wallProps.index;
        const prevIdx = wallIdx == 0 ? Object.keys(zoneProps.walls).length-1 : wallIdx - 1;
        const prevWallProps = zoneProps.walls[Object.keys(zoneProps.walls)[prevIdx]];
        // 직전 벽 중 마지막 segment
        const previousLoc = prevWallProps.segmentSplicedLoc[prevWallProps.segmentSplicedLoc.length-1];
        return previousLoc[1];
    }
    else {
        const previousLoc = wallProps.segmentSplicedLoc.filter((pair) => pair[0] == segProps.loc[0])[0];  // 직전 splicedLoc pair (loc, segName)
        return previousLoc[1];
    }
}

/** Get the name of the next segment. */
function getNextSegmentName(segName) {
    const segProps = Building.segments[segName];
    const wallProps = Building.walls[segProps.wall];
    if (segProps.loc[1] == 1) {
        // 같은 존에서 다음 벽 찾기
        const zoneProps = Building.zones[wallProps.zone];
        const wallIdx = wallProps.index;
        const nextIdx = wallIdx == Object.keys(zoneProps.walls).length-1 ? 0 : wallIdx + 1;
        const nextWallProps = zoneProps.walls[Object.keys(zoneProps.walls)[nextIdx]];
        // 다음 벽 중 첫 segment
        const nextLoc = nextWallProps.segmentSplicedLoc[0];
        return nextLoc[1];
    }
    else {
        const nextLoc = wallProps.segmentSplicedLoc.filter((pair) => pair[0] > segProps.loc[1])[0];  // splicedLoc 뒤에 나오는 segment 중 가장 첫 번째
        return nextLoc[1];
    }
}
