//MARK: DOM elements

const editorPanel = document.getElementById('editorPanel');
const editorCanvas = editorPanel.querySelector('* canvas');
const editorCtx = editorCanvas.getContext('2d');

const editorInput = document.getElementById('editorInput');
const editorInputField = document.getElementById('editorInputField');
const editorInputSize = new Vector(editorInput.clientWidth, editorInput.clientHeight);

const floorSelector = document.getElementById('floorSelector');

//? Canvas sizing
editorCanvas.width = editorResolution;
editorCanvas.height = editorResolution;

//+ -------------------------------------------------------------- +//
//MARK: Editor

const Editor = {
    //? viewport related
    hold: true,  // 초반 로딩 시 렌더링 중지
    _zoom: 10,  // canvas 크기가 zoom[m]가 됨
    get zoom() {
        return this._zoom;
    },
    set zoom(zoom) {
        this._zoom = zoom;
        // this.mouseSnapDistance = this.MOUSESNAPDISTANCENORM * zoom;
    },
    center: new Vector(0, 0),  // canvas 중심 좌표 [m]
    boundary: [new Vector(0, 0), new Vector(0, 0)],  // (minX, minY), (maxX, maxY)
    panning: false,  // 가운데 마우스로 이동 중인지
    _state: -1,
    /*
    0: 없음
    -1: 속성 수정 중
    1: 시작점 선택 중, 2: 다음 점들 선택 중
    */
    get state() {
        return this._state;
    },
    set state(state) {
        this._state = state;

        resetSelection();

        if (state == 0 || state == 1 || state == 2) {
            // 벽 추가 모드
            editorCanvas.style.cursor = 'crosshair';
            document.getElementById('btnToggleDrawZone').checked = true;  // 수정 버튼 토글
            document.getElementById('toolgroupDrawZone').style.visibility = 'visible';
        }
        else {
            editorCanvas.style.cursor = '';
            document.getElementById('btnToggleDrawZone').checked = false;
            document.getElementById('toolgroupDrawZone').style.visibility = '';
        }

        if (state == -1 || state == 0) {
            // 수정 UI 제거
            //TODO hideEditorInputField();
            //TODO document.removeEventListener('mousemove', mouseMoveEventEditing);
        }
        
        if (!this.hold) updateEditorViewport();
    },
    //? editing related
    _currentFloor: 1,  // 현재 수정 중인 층
    get currentFloor() {
        return this._currentFloor;
    },
    set currentFloor(floor) {
        this._currentFloor = floor;
        floorSelector.selectedIndex = Building.floors.length - Building.floors.indexOf(floor);
        this.state = -1;
    },
    get currentFloorTag() {
        return floorToFloorTag(this.currentFloor);
    },
    showLowerFloor: true,
    showUpperFloor: false,
    inputFieldVisibility: false,  // 값 입력 필드 표시 여부
    inputLength: NaN,  // 입력된 길이 [m]
    _objectSnap: true,  // 오브젝트 스냅 여부
    get objectSnap() {return this._objectSnap;},
    set objectSnap(snap) {
        this._objectSnap = snap;
        updateEditingAdjustedCoord();
    },
    _angleSnap: true,  // 그리는 선 각도 스냅 여부
    get angleSnap() {return this._angleSnap;},
    set angleSnap(snap) {
        this._angleSnap = snap;
        updateEditingAdjustedCoord();
    },
    viewportPos: new Vector(0, 0),  // viewport 왼쪽 아래 pos
    //? mouse related
    globalOffsetPosDiff: new Vector(0, 0),  // pageX - offsetX
    mouseMiddleStartGlobalPos: new Vector(0, 0),  // 가운데 마우스 시작 위치
    editingCoords: [],  // 추가된 좌표들
    // 마지막으로 추가된 좌표
    get lastEditingCoord() {
        return this.editingCoords.length > 0 ? this.editingCoords[this.editingCoords.length-1] : null;
    },
    // 추가된 좌표들 + 아직 확정 안된 수정 중인 위치 포함
    get editingCoordsCurrent() {
        return this.editingCoords.concat([this.newEditingFinalCoord]);
    },
    newEditingRawCoord: new Vector(0, 0),  // 실제 마우스 위치
    newEditingAdjustedCoord: new Vector(0, 0),  // 오브젝트, 각도 스냅에 의한 수정된 위치
    newEditingFinalCoord: new Vector(0, 0),  // 길이 입력 반영된 최종 위치
    //? selection related
    MOUSESNAPDISTANCENORM: 0.02,  // 마우스 스냅 norm 단위
    get mouseSnapDistance() {
        // 마우스 스냅 m 단위
        return this.MOUSESNAPDISTANCENORM * this.zoom;
    },
    snappedToObject: false, // 오브젝트 스냅 여부
    _selectObjectType: 'wall',  // 선택할 오브젝트 종류 (wall/zone)
    get selectObjectType() {
        return this._selectObjectType;
    },
    set selectObjectType(mode) {
        if (mode == 'wall' || mode == 'zone') {
            this._selectObjectType = mode;
            resetSelection();
        }
    },
    hoveredSegment: null,
    selectedSegment: null,
    selectedZone: null,
    //? render related
    WALLTHICKNESS: 0.25,  // [m]
    get wallThicknessPx() {return mToPx(this.WALLTHICKNESS);},
}

//? Update editorCanvas position offset
function updateEditorOffset() {
    Editor.globalOffsetPosDiff.x = parseInt(
        editorCanvas.getBoundingClientRect().x
        + document.documentElement.scrollLeft
    );
    Editor.globalOffsetPosDiff.y = parseInt(
        editorCanvas.getBoundingClientRect().y
        + document.documentElement.scrollTop
    );
    Editor.viewportPos.x = parseInt(
        editorPanel.getBoundingClientRect().x
        + document.documentElement.scrollLeft
    );
    Editor.viewportPos.y = parseInt(
        editorPanel.getBoundingClientRect().y
        + editorPanel.getBoundingClientRect().height
        + document.documentElement.scrollTop
    );
    Editor.viewportPos = Editor.viewportPos.sub(Editor.globalOffsetPosDiff);
    updateEditorViewport();
}
editorCanvas.onload = updateEditorOffset;

//+ -------------------------------------------------------------- +//
//MARK: Coordinates
// pos: HTML상 좌표, px: canvas상 좌표, coord: 모델상 좌표[m]
function coordToPx(coord) {
    // canvas 중심 기준 offset
    var offsetNorm = coord.sub(Editor.center).div(Editor.zoom);
    // y축 반전, 왼쪽 위 기준으로 transform
    var transformedNorm = offsetNorm.flipY().add(0.5, 0.5);
    // px 단위로 변환
    var px = transformedNorm.mul(editorResolution);
    return px;
}
function posToCoord(pos) {
    // -0.5 ~ 0.5
    var offsetNorm = pos.div(canvasSizes[0]).sub(0.5).flipY();
    // 좌표 [m]
    var coord = offsetNorm.mul(Editor.zoom).add(Editor.center);
    return coord;
}
function coordToPos(coord) {
    var offsetNorm = coord.sub(Editor.center).div(Editor.zoom);
    var pos = offsetNorm.flipY().add(0.5).mul(canvasSizes[0]);
    return pos
}
function posToPx(pos) {
    var coord = posToCoord(pos);
    var px = coordToPx(coord);
    return px
}
function mToPx(m) {
    let norm = m / Editor.zoom;
    let px = norm * editorResolution;
    return px;
}

//+ -------------------------------------------------------------- +//
//MARK: Adding coordinates

/** 수정 중인 좌표 업데이트 */
function updateEditingRawCoord(pos) {
    Editor.newEditingRawCoord = posToCoord(pos);
    updateEditingAdjustedCoord();
}

/** 오브젝트와 각도에 스냅을 반영하여 수정 중인 좌표 업데이트 */
function updateEditingAdjustedCoord() {
    let lastCoord = Editor.lastEditingCoord;

    //? 오브젝트에 스냅
    if (Editor.objectSnap) {
        let snapped = checkSnap(Editor.newEditingRawCoord, lastCoord);
        if (snapped) {
            Editor.snappedToObject = true;
            Editor.newEditingAdjustedCoord = snapped.coord;
        }
        else {
            Editor.snappedToObject = false;
            Editor.newEditingAdjustedCoord = Editor.newEditingRawCoord;
        }
    }

    //? 각도에 스냅
    if (lastCoord) {
        if (Editor.angleSnap && Editor.snappedToObject) {
            let mouseLeftVector = Editor.newEditingAdjustedCoord.sub(lastCoord);
            let snappedAngle = parseFloat(Math.round(mouseLeftVector.angleDeg2 / 45) * 45);
            let snappedVector = Vector.fromAngleDeg(snappedAngle);
            let newSnappedVector = snappedVector.mul(Vector.dot(mouseLeftVector, snappedVector));
            Editor.newEditingAdjustedCoord = lastCoord.add(newSnappedVector);
        }
    }

    updateEditingFinalCoord();
}

/** 입력 길이를 반영하여 수정 중인 좌표를 업데이트 */
function updateEditingFinalCoord() {
    let lastCoord = Editor.lastEditingCoord;

    if (lastCoord) {
        let newEditingVector = Editor.newEditingAdjustedCoord.sub(lastCoord);
        if (isNaN(Editor.inputLength)) {
            editorInputField.placeholder = parseInt(newEditingVector.size*1000);
            Editor.newEditingFinalCoord = Editor.newEditingAdjustedCoord;
        }
        else {
            editorInputField.placeholder = parseInt(Editor.inputLength*1000);
            Editor.newEditingFinalCoord = lastCoord.add(newEditingVector.unit.mul(Editor.inputLength));
        }
    }
    else {
        Editor.newEditingFinalCoord = Editor.newEditingAdjustedCoord;
    }
}

/** 수정 중인 좌표들 초기화 */
function resetEditingObjects() {
    Editor.editingCoords = [];
    Editor.snappedToObject = false;
}

/** 새로 추가하려는 수정 좌표의 유효성 검사 */
function isEditCoordValid() {
    let newWall = [
        Editor.editingCoordsCurrent[Editor.editingCoordsCurrent.length-2],
        Editor.editingCoordsCurrent[Editor.editingCoordsCurrent.length-1],
    ];
    //? 스스로 겹치는지
    if (Editor.editingCoords.length > 1) {
        let firstWall = [
            Editor.editingCoords[0],
            Editor.editingCoords[1],
        ];
        let lastWall = [
            Editor.editingCoordsCurrent[Editor.editingCoordsCurrent.length-3],
            Editor.editingCoordsCurrent[Editor.editingCoordsCurrent.length-2],
        ];
        if (pointOnLine(lastWall[0], newWall)
            || pointOnLine(newWall[1], lastWall)
        ) {
            // 그냥 중첩을 검사할 경우 이미 연결된 점이 있어서 제대로 검사가 안됨
            return false;
        }
        if (Editor.editingCoords.length > 2) {
            for (let ptIdx = 2; ptIdx < Editor.editingCoords.length-1; ptIdx++) {
                // 첫 segment 제외하고 검사
                let wall = [
                    Editor.editingCoords[ptIdx-1], Editor.editingCoords[ptIdx]
                ];
                if (lineIntersection(wall, newWall)) return false;
            }
            let intersectionWithFirstWall = lineIntersection(firstWall, newWall);
            if (intersectionWithFirstWall && !intersectionWithFirstWall.isSimilar(firstWall[0])) {
                return false;
            }
        }
        // if (Editor.editingCoords[0].isSimilar(Editor.editingCoordsCurrent[Editor.editingCoordsCurrent.length-1])) {
        //     return true;
        // }
    }
    //? 다른 존과 겹치는지
    for (const [otherZoneName, otherZoneProps] of Object.entries(Building.objects[Editor.currentFloorTag].zones)) {
        // 새 점이 안에 있는 경우
        if (pointInPolygon(otherZoneProps['coords'], Editor.newEditingFinalCoord)) {
            return false;
        }
        // 새 벽이 다른 존을 관통하는 경우
        for (const [otherWallName, otherWallProps] of Object.entries(otherZoneProps.walls)) {
            //TODO 정확히 변 위에 올라가는 경우 반영 필요
            if (lineIntersection(newWall, otherWallProps.coords)) {
                return false;
            }
        }
    }
    return true;
    //? 벽이 다른 존을 관통하는지
    //TODO
}

function addToEditingCoords() {
    if (isEditCoordValid()) {
        Editor.editingCoords.push(Editor.newEditingFinalCoord);

    }
}

//+ -------------------------------------------------------------- +//
//MARK: Object selection

function resetSelection(mode) {
    const resetH = !mode || mode == 'hover';
    const resetS = !mode || mode == 'select';
    if (resetH) {
        Editor.hoveredSegment = null;
        Editor.hoveredZone = null;
    }
    if (resetS) {
        Editor.selectedSegment = null;
        Editor.selectedZone = null;
    }
}

/**
 * Object hover/selection.
 * @param {Vector} pos - 마우스 position
 * @param {string} mode - 'hover' 또는 'select'
 */
function pickObject(pos, mode) {
    let coord = posToCoord(pos);
    if (Editor.selectObjectType == 'wall') {
        let snappedSeg = checkSnapSegments(coord, startCoord=null, detailed=true);
        if (snappedSeg) {
            const segName = snappedSeg.name;
            const zoneName = Building.walls[Building.segments[segName].wall].zone;
            if (mode == 'hover') {
                Editor.hoveredSegment = segName;
                Editor.hoveredZone = zoneName;
            }
            else {
                resetSelection('select');
                Editor.selectedSegment = segName;
                Editor.selectedZone = zoneName;
            }
        }
        else {
            resetSelection(mode);
        }
    }
    else {
        // selectObjectType: 'zone'인 경우 고려 필요
    }
    //TODO update viewport
}

//+ -------------------------------------------------------------- +//
//MARK: Mouse controls

function getMousePosFromEvent(e) {
    return new Vector(e.pageX, e.pageY).sub(Editor.globalOffsetPosDiff);
}

function mouseMoveEventPanning(e) {
    var mouseNewGlobalPos = new Vector(e.pageX, e.pageY);
    var mouseDeltaPos = mouseNewGlobalPos.sub(Editor.mouseMiddleStartGlobalPos);
    var mouseDeltaCoord = mouseDeltaPos.flipY().div(canvasSizes[0]).mul(Editor.zoom);
    Editor.center = Editor.center.sub(mouseDeltaCoord);
    Editor.mouseMiddleStartGlobalPos = mouseNewGlobalPos;
    updateEditorViewport();
}

function mouseMoveEventEditing(e) {
    let mousePos = getMousePosFromEvent(e);
    if (Editor.state == 1) {
        // 시작점 선택 중
        updateEditingRawCoord(mousePos);
    }
    else if (Editor.state == 2) {
        // 끝점 선택 중
        updateEditingRawCoord(mousePos);
    }
    updateEditorViewport();
}

//! onMouseUp event는 main.js에

editorCanvas.addEventListener('mousedown', function(e) {
    let mousePos = new Vector(e.pageX, e.pageY).sub(Editor.globalOffsetPosDiff);
    if (e.button == 0) {
        // 좌클릭
        if (Editor.state == 0) {
            Editor.state = 1;
            // 클릭 위치
            updateEditingRawCoord(mousePos);  //TODO
            document.addEventListener('mousemove', mouseMoveEventEditing);
        }
        else if (Editor.state == 2) {
            // addWall();
        }
        updateEditorViewport();
    }
    else if (e.button == 1 || e.button == 2) {
        // 가운데/우클릭
        Editor.panning = true;
        // 클릭 위치
        Editor.mouseMiddleStartGlobalPos = new Vector(e.pageX, e.pageY);
        document.addEventListener('mousemove', mouseMoveEventPanning);
    }
    
})

editorCanvas.addEventListener('mousemove', function(e) {
    Building.workingPanelIdx = 0;
    let mousePos = getMousePosFromEvent(e);
    if (Editor.state == 0 || Editor.state == 1 || Editor.state == 2) {
        updateEditingRawCoord(mousePos);
        //TODO checkSnap(posToCoord(mousePos));
    }
    else if (Editor.state == -1) {
        pickObject(mousePos, mode='hover');
    }
    updateEditorViewport();
});

editorCanvas.onmouseup = function(e) {
    if (Building.workingPanelIdx == 0 && e.button == 0) {
        // 좌클릭
        let mousePos = getMousePosFromEvent(e);

        if (Editor.state == 1) {
            // 시작점 선택 완료
            Editor.state = 2;
            resetEditingObjects();
            updateEditingRawCoord(mousePos);
            addToEditingCoords();
        }
        else if(Editor.state == 2) {
            // 점 추가
            // addWall();
            addToEditingCoords();
        }
        else if(Editor.state == -1) {
            // 선택 완료
            /*
            TODO
            Editor.hoveredSegment = '';
            Editor.selectedSegment = selectWall(posToCoord(mousePos));
            */
            pickObject(mousePos, mode='select');
        }
    }
}

editorCanvas.addEventListener('wheel', function(e) {
    e.preventDefault(); // prevent the page from scrolling
    var scrollOffset = clamp(e.wheelDeltaY / 120, -1, 1);
    var zoomMultiplier = 1 - scrollOffset / 10;
    var zoomCenterCoord = posToCoord(new Vector(e.offsetX, e.offsetY));
    Editor.zoom *= zoomMultiplier;
    Editor.center = Editor.center.sub(zoomCenterCoord).mul(zoomMultiplier).add(zoomCenterCoord);
    if (Editor.state == 2) {
        // Editor.mouseLeftEndCoord = posToCoord(Editor.mouseLeftEndOffsetPos);
        // updateEditingRawCoord(Editor.newEditingAdjustedCoord);
    }
    updateEditorViewport();
})

editorCanvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

//+ -------------------------------------------------------------- +//
//MARK: Viewport rendering

function resetEditorView() {
    let buildingSize = Math.max(...Building.boundaryXY[1].sub(Building.boundaryXY[0]));
    let buildingMidPoint = Vector.midPoint(...Building.boundaryXY);
    Editor.zoom = buildingSize * 1.4;
    Editor.center = buildingMidPoint;
    updateEditorViewport();
}

function updateEditorViewport() {
    // viewport boundary
    let viewportOffset = new Vector(Editor.zoom/2, Editor.zoom/2);
    Editor.boundary = [Editor.center.sub(viewportOffset).sub(1), Editor.center.add(viewportOffset).add(1)];
    // editorObjects collision detection
    /*
    for (const [objType, objs] of Object.entries(editorObjects)) {
        var filtered = Object.fromEntries(Object.entries(objs).filter(([name,props]) => checkBoundary(Editor.boundary, props[0])));
        renderObjects[objType] = filtered;
    }*/
    // 매번 업데이트 안 하고 그냥 렌더링하면?
    renderEditorViewport();
}

function renderEditorViewport() {
    editorCtx.reset();
    //? grid
    let xticks = computeGridTicks(Editor.boundary[0].x, Editor.boundary[1].x);
    let yticks = computeGridTicks(Editor.boundary[0].y, Editor.boundary[1].y);
    editorCtx.lineWidth = 1;
    editorCtx.strokeStyle = 'rgba(255,255,255,0.2)';
    for (const xtick of xticks) {
        editorCtx.beginPath();
        editorCtx.moveTo(...coordToPx(new Vector(xtick, Editor.boundary[0].y)));
        editorCtx.lineTo(...coordToPx(new Vector(xtick, Editor.boundary[1].y)));
        editorCtx.stroke();
    }
    for (const ytick of yticks) {
        editorCtx.beginPath();
        editorCtx.moveTo(...coordToPx(new Vector(Editor.boundary[0].x, ytick)));
        editorCtx.lineTo(...coordToPx(new Vector(Editor.boundary[1].x, ytick)));
        editorCtx.stroke();
    }
    //? size legend
    let gridSize = xticks[1] - xticks[0];
    let legendCoord = posToCoord(Editor.viewportPos).add(0.01*Editor.zoom);
    /*
    editorCtx.beginPath();
    editorCtx.moveTo(...coordToPx(legendCoord.add(0, gridSize)));
    editorCtx.lineTo(...coordToPx(legendCoord));
    editorCtx.lineTo(...coordToPx(legendCoord.add(gridSize, 0)));
    editorCtx.strokeStyle = '#fff';
    editorCtx.stroke();
    editorCtx.font = '30px Roboto';
    editorCtx.textAlign = 'center';
    editorCtx.fillText(`${gridSize}m`, ...coordToPx(legendCoord.add(gridSize/2, 0)));
    */
    editorCtx.font = 'bold 25px Roboto';
    editorCtx.textAlign = 'left';
    editorCtx.fillStyle = 'rgba(255,255,255,0.3)';
    editorCtx.fillText(`${gridSize}m`, ...coordToPx(legendCoord));

    //? Draw current floor zones
    for (const [zoneName, zoneProps] of Object.entries(Building.objects[Editor.currentFloorTag].zones)) {
        // 존 배경
        let coords = zoneProps.coords;
        editorCtx.beginPath();
        editorCtx.moveTo(...coordToPx(coords[0]));
        for (let i=1; i<coords.length; i++) {
            editorCtx.lineTo(...coordToPx(coords[i]));
        }
        editorCtx.closePath();
        editorCtx.fillStyle = zoneName == Editor.hoveredZone ? 'rgba(255,68,68,0.1)' : zoneName == Editor.selectedZone ? 'rgba(255,68,68,0.3)' : 'rgb(150,150,150,0.2)';
        editorCtx.fill();
        // 존 이름
        editorCtx.font = `${mToPx(0.5)}px Roboto`;
        editorCtx.textAlign = 'center';
        editorCtx.textBaseline = 'middle';
        editorCtx.fillStyle = 'rgba(255,255,255,0.3)';
        editorCtx.fillText(zoneName, ...coordToPx(zoneProps.centroid));
    }

    //? Draw walls
    editorCtx.setLineDash([]);
    for (const floorTag of Building.floorTagsToDraw) {
        if (![0, 1, 2].includes(Editor.state) && floorTag !== Editor.currentFloorTag) {
            // 그리는 중이 아니거나, 현재 수정 중인 층인 경우 스킵
            continue;
        }
        for (const [zoneName, zoneProps] of Object.entries(Building.objects[floorTag].zones || {})) { // object에 currentFloorTag가 없을 경우 {}로 대체
            if (checkBoundary(Editor.boundary, zoneProps.boundary)) {
                let textureRgb = 'rgb(150,150,150)';  //TODO 나중에 따로 빼기
                const coords = zoneProps.coords;
                editorCtx.beginPath();
                editorCtx.moveTo(...coordToPx(coords[0]));
                for (let i=1; i<coords.length; i++) {
                    editorCtx.lineTo(...coordToPx(coords[i]));
                }
                editorCtx.closePath();

                editorCtx.lineCap = 'miter';
                editorCtx.lineWidth = Editor.wallThicknessPx;
                if (floorTag === Editor.currentFloorTag) {
                    editorCtx.strokeStyle = textureRgb;
                }
                else {
                    let newRgb = stringToRgb(texture);
                    newRgb.a = 0.3;
                    editorCtx.strokeStyle = rgbToRgbaString(newRgb);
                }
                editorCtx.stroke();
                /*
                for (const [wallName, wallProps] of Object.entries(zoneProps.walls)) {
                    for (const [segName, segProps] of Object.entries(wallProps.segments)) {
                        let textureRgb = 'rgb(150,150,150)';  //TODO 나중에 따로 빼기
                        // console.log(`${name} rendered`);
                        if (segName == Editor.hoveredSegment) continue;

                        var coords = segProps.coords;
                        var nPoints = coords.length;
                        editorCtx.beginPath();
                        editorCtx.moveTo(...coordToPx(coords[0]));
                        for (let i=1; i<nPoints; i++) {
                            editorCtx.lineTo(...coordToPx(coords[i]));
                        }

                        editorCtx.lineCap = 'round';
                        editorCtx.lineWidth = Editor.wallThicknessPx;
                        if (floorTag === Editor.currentFloorTag) {
                            editorCtx.strokeStyle = textureRgb;
                        }
                        else {
                            let newRgb = stringToRgb(texture);
                            newRgb.a = 0.3;
                            editorCtx.strokeStyle = rgbToRgbaString(newRgb);
                        }
                        editorCtx.stroke();
                    }
                }
                */
            }
        }
    }

    //? 수정 중인 좌표
    if (Editor.state == 1) {
        //TODO ???????????
        editorCtx.lineWidth = 2;
        editorCtx.strokeStyle = 'rgba(158,227,255,0.8)';
        editorCtx.beginPath();
        editorCtx.arc(...coordToPx(coordToPx(Editor.editingCoordsCurrent[0])), 8, 0, 2*Math.PI);
        editorCtx.closePath();
        editorCtx.stroke();
    }
    else if (Editor.state == 2 && Editor.editingCoords.length > 0) {
        //? 수정 중인 존 그리기
        // fill editing zone
        editorCtx.beginPath();
        editorCtx.moveTo(...coordToPx(Editor.editingCoords[0]));
        for (let ptIdx = 1; ptIdx < Editor.editingCoordsCurrent.length; ptIdx++) {
            editorCtx.lineTo(...coordToPx(Editor.editingCoordsCurrent[ptIdx]));
        }
        editorCtx.closePath();
        editorCtx.fillStyle = isEditCoordValid() ? 'rgba(158,227,255,0.3)' : 'rgba(255,50,50,0.3)';
        editorCtx.fill();

        // editing zone edges
        editorCtx.lineWidth = Editor.wallThicknessPx;
        editorCtx.lineCap = 'miter';
        editorCtx.strokeStyle = isEditCoordValid() ? 'rgba(158,227,255,0.8)' : 'rgba(255,50,50,0.8)';
        editorCtx.beginPath();
        editorCtx.moveTo(...coordToPx(Editor.editingCoords[0]));
        for (let ptIdx = 1; ptIdx < Editor.editingCoordsCurrent.length; ptIdx++) {
            editorCtx.lineTo(...coordToPx(Editor.editingCoordsCurrent[ptIdx]));
        }
        editorCtx.stroke();

        /*
        TODO
        //? input field
        var editorInputFieldPos = Vector.midPoint(coordToPos(lastCoord), coordToPos(newCoord));
        editorInputFieldPos = adjustEditorInputFieldLocation(
            coordToPos(lastCoord),
            editorInputFieldPos,
            padding=10
        );
        showEditorInputField()
        updateEditorInputFieldPos(editorInputFieldPos);

        if (Editor.newEditingAdjustedCoord.sub(lastCoord).size > Editor.inputLength) {
            editorCtx.beginPath();
            editorCtx.moveTo(...coordToPx(newCoord));
            editorCtx.lineTo(...coordToPx(Editor.newEditingAdjustedCoord));
            editorCtx.setLineDash([5, 10]);
            editorCtx.stroke();
            editorCtx.setLineDash([]);
        }
        */
        
        // editorCtx.beginPath();
        // editorCtx.arc(...mouseLeftEndFinalPx, 8, 0, 2*Math.PI);
        // editorCtx.closePath();
        // editorCtx.stroke();

        /*
        //TODO intersect experiment
        for (const [name, props] of Object.entries(editorObjects[Editor.currentFloorTag])) {
            const intersectCoord = lineIntersection(props.coords, [lastCoord, newCoord]);
            if (intersectCoord) {
                // editorCtx.beginPath();
                // editorCtx.arc(...coordToPx(intersectCoord), 8, 0, 2*Math.PI);
                // editorCtx.closePath();
                crossmark(editorCtx, ...coordToPx(intersectCoord), 8)
                editorCtx.lineWidth = 2;
                editorCtx.strokeStyle = '#f00';
                editorCtx.stroke();
            }
        }
        */
    }


    /*
    TODO zones
    for (const [name, props] of Object.entries(zoneObjects[Editor.currentFloorTag] || {})) {
        // object에 currentFloorTag가 없을 경우 {}로 대체
        var coords = props.coords;
        editorCtx.beginPath();
        editorCtx.moveTo(...coordToPx(coords[0]));
        for (let ptIdx = 1; ptIdx < coords.length; ptIdx++) {
            editorCtx.lineTo(...coordToPx(coords[ptIdx]));
        }
        editorCtx.closePath();
        editorCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        editorCtx.fill();
    }
    */
    /*
    //TODO walls (우선은 line처럼)
    */
    //? highlights
    if (Editor.state == 0 || Editor.state == 1 || Editor.state == 2) {
        /*
        if (Editor.inProximity){
            editorCtx.beginPath();
            editorCtx.arc(...coordToPx(Editor.proximityCoord), 10, 0, 2*Math.PI);
            editorCtx.closePath();
            editorCtx.lineWidth = 4;
            editorCtx.strokeStyle = '#f44';
            editorCtx.stroke();
        }
        */
    }
    else if (Editor.state == -1) {
        if (Editor.selectedSegment) {
            let coords = Building.segments[Editor.selectedSegment].coords;
            
            // editorCtx.beginPath();
            // editorCtx.moveTo(...coordToPx(coords[0]));
            // editorCtx.lineTo(...coordToPx(coords[1]));

            // editorCtx.lineCap = 'round';
            // editorCtx.lineWidth = 20;
            // editorCtx.strokeStyle = '#f44';
            
            editorCtx.lineCap = 'round';
            editorCtx.lineWidth = Math.max(3, mToPx(0.1));
            editorCtx.strokeStyle = '#f44';
            highlightLine(editorCtx, ...coordToPx(coords[0]), ...coordToPx(coords[1]), Editor.wallThicknessPx+4);
            editorCtx.stroke();
        }

        if (Editor.hoveredSegment) {
            //TODO hoveredSegment가 벽에 아닌 경우 수정 필요
            let coords = Building.segments[Editor.hoveredSegment].coords;

            /*
            editorCtx.beginPath();
            editorCtx.moveTo(...coordToPx(coords[0]));
            editorCtx.lineTo(...coordToPx(coords[1]));

            editorCtx.lineCap = 'round';
            editorCtx.lineWidth = Editor.wallThicknessPx;
            editorCtx.strokeStyle = '#f44';
            editorCtx.stroke();
            */

            const prevCoords = Building.segments[getPreviousSegmentName(Editor.hoveredSegment)].coords;
            const nextCoords = Building.segments[getNextSegmentName(Editor.hoveredSegment)].coords;
            const prevMiterAngle = (
                prevCoords[0].sub(prevCoords[1]).angleDeg2
                - coords[1].sub(coords[0]).angleDeg2
                + 360
            ) / 2 % 180;
            const nextMiterAngle = (
                coords[0].sub(coords[1]).angleDeg2
                - nextCoords[1].sub(nextCoords[0]).angleDeg2
                + 360
            ) / 2 % 180;
            
            editorCtx.fillStyle = '#f44';
            miteredLine(editorCtx, ...coordToPx(coords[0]), ...coordToPx(coords[1]), Editor.wallThicknessPx, prevMiterAngle, nextMiterAngle);
            editorCtx.fill();
        }
    }
    //? axis lines
    editorCtx.setLineDash([]);
    for (const [name, props] of Object.entries(defaultEditorObjects.Lines)) {
        var bound = props.boundary;
        var texture = props.texture || '';
        if (checkBoundary(Editor.boundary, bound)) {
            // console.log(`${name} rendered`);
            let coords = props.coords;
            editorCtx.beginPath();
            editorCtx.moveTo(...coordToPx(coords[0]));
            for (let i=1; i<coords.length; i++) {
                editorCtx.lineTo(...coordToPx(coords[i]));
            }
            editorCtx.lineWidth = 5;
            editorCtx.lineCap = 'round';
            editorCtx.strokeStyle = texture+'aa';
            editorCtx.stroke();
        }
    }
    //? points
    for (const [name, props] of Object.entries(defaultEditorObjects.Points)) {
        var bound = props.boundary;
        var texture = props.texture || '';
        if (checkBoundary(Editor.boundary, bound)) {
            // console.log(`${key} rendered`);
            var coord = props.coord;

            editorCtx.beginPath();
            editorCtx.arc(...coordToPx(coord), 4, 0, 2*Math.PI);
            editorCtx.closePath();
            editorCtx.fillStyle = texture;
            editorCtx.fill();
        }
    }
    // editing
    if (Editor.state == -1 || Editor.state == 0) {
        // hideEditorInputField();
    }
    /*
    else if (Editor.state == 1 || Editor.state == 2) {
        var mouseLeftStartPos = coordToPos(Editor.mouseLeftStartCoord);
        var mouseLeftStartPx = coordToPx(Editor.mouseLeftStartCoord);
        var mouseLeftEndFinalPos = coordToPos(Editor.mouseLeftEndFinalCoord);
        var mouseLeftEndFinalPx = coordToPx(Editor.mouseLeftEndFinalCoord);

        
        if (Editor.state == 2) {
            editorCtx.lineWidth = 2;
            editorCtx.lineCap = 'round';
            editorCtx.strokeStyle = 'rgba(158,227,255,0.8)';
            
            editorCtx.beginPath();
            editorCtx.moveTo(...mouseLeftStartPx);
            editorCtx.lineTo(...mouseLeftEndFinalPx);
            editorCtx.stroke();

            if (Editor.mouseLeftAdjustedVector.size > Editor.inputLength) {
                editorCtx.beginPath();
                editorCtx.moveTo(...mouseLeftEndFinalPx);
                editorCtx.lineTo(...coordToPx(Editor.mouseLeftEndAdjustedCoord));
                editorCtx.setLineDash([5, 10]);
                editorCtx.stroke();
                editorCtx.setLineDash([]);
            }

        }
    }
    */
}

function highlightLine(ctx, x1, y1, x2, y2, thickness) {
    let p1 = new Vector(x1, y1);
    let p2 = new Vector(x2, y2);
    let dir = p2.sub(p1).unit;
    let dirAngle = dir.angle2;
    ctx.beginPath();
    ctx.arc(x1, y1, thickness, dirAngle+Math.PI/2, dirAngle-Math.PI/2, false);
    ctx.arc(x2, y2, thickness, dirAngle-Math.PI/2, dirAngle+Math.PI/2, false);
    ctx.closePath();
}

function crossmark(ctx, x, y, size) {
    let pt = new Vector(x, y);
    let offset = new Vector(size, size);
    ctx.beginPath();
    ctx.moveTo(...pt.add(offset));
    ctx.lineTo(...pt.sub(offset));
    ctx.moveTo(...pt.add(offset.flipX()));
    ctx.lineTo(...pt.sub(offset.flipX()));
}

function miteredLine(ctx, x1, y1, x2, y2, thickness, angle1, angle2) {
    let p1 = new Vector(x1, y1);
    let p2 = new Vector(x2, y2);
    let dirAngle = p2.sub(p1).angleDeg2;
    let a1 = Vector.fromAngleDeg(-angle1 + dirAngle).mul(thickness / 2 / Math.sin(Math.radians(angle1)));
    let a2 = Vector.fromAngleDeg(angle2 + dirAngle).mul(thickness / 2 / Math.sin(Math.radians(angle2)));
    ctx.beginPath();
    ctx.moveTo(...p1.add(a1));
    ctx.lineTo(...p1.sub(a1));
    ctx.lineTo(...p2.add(a2));
    ctx.lineTo(...p2.sub(a2));
    ctx.closePath();
}
