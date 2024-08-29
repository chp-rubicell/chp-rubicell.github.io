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

// pos: HTML상 좌표, px: canvas상 좌표, coord: 모델상 좌표[m]
var Editor = {
    //? viewport related
    hold: true,  // 초반에 로딩 시 렌더링 중지
    _zoom: 10,  // canvas 크기가 zoom[m]가 됨
    center: new Vector(0, 0),  // canvas 중심의 좌표
    boundary: [new Vector(0, 0), new Vector(0, 0)],  // (minX, minY), (maxX, maxY)
    panning: false,  // 가운데 마우스로 이동 중인지
    _state: -1,
    /*
    0: 없음
    -1: 수정 중
    1: 시작점 선택 중, 2: 끝점 선택 중
    */
    inputFieldVisibility: false,  // 값 입력 필드 표시 여부
    inputLength: NaN,  // 입력된 길이 [m]
    angleSnap: true,  // 그리는 선 각도 스냅 여부
    viewportPos: new Vector(0, 0),
    //? mouse related
    globalOffsetPosDiff: new Vector(0, 0),  // pageX - offsetX
    mouseLeftStartPos: new Vector(0, 0),
    mouseLeftStartCoord: new Vector(0, 0),
    mouseLeftEndRawPos: new Vector(0, 0),  // 실제 마우스 위치
    mouseLeftEndRawCoord: new Vector(0, 0),
    mouseLeftEndAdjustedPos: new Vector(0, 0),  // 오브젝트, 각도 스냅에 의한 수정된 위치
    mouseLeftEndAdjustedCoord: new Vector(0, 0),
    mouseLeftAdjustedVector: new Vector(0, 0),
    mouseLeftEndFinalCoord: new Vector(0, 0),  // 길이 입력 반영된 최종 위치
    mouseLeftSnap: false,  // 스냅 여부
    mouseMiddleStartGlobalPos: new Vector(0, 0),
    //? selection related
    MOUSESNAPDISTANCENORM: 0.02,
    mouseSnapDistance: NaN,
    inProximity: false,
    proximityObject: '',
    proximityCoord: new Vector(0, 0),
    //? editing related
    _currentFloor: NaN,  // 현재 수정 중인 층수
    currentFloorTag: '',
    hoveredWall: '',
    _selectedWall: '',
    selectedWallObject: null,
    // lastSelectedWall: '',
    showLowerFloor: true,
    showUpperFloor: false,

    get zoom() {
        return this._zoom;
    },
    set zoom(zoom) {
        this._zoom = zoom;
        this.mouseSnapDistance = this.MOUSESNAPDISTANCENORM * zoom;
    },
    get state() {
        return this._state;
    },
    set state(state) {
        this._state = state;

        // resetSelection();
        checkSnap(null);
        Editor.hoveredWall = '';
        Editor.selectedWall = '';

        if (state == 0 || state == 1 || state == 2) {
            editorCanvas.style.cursor = 'crosshair';
            document.getElementById('_btnToggleDraw').checked = true;
            document.getElementById('toolgroupDrawWall').style.visibility = 'visible';
        }
        else {
            editorCanvas.style.cursor = '';
            document.getElementById('_btnToggleDraw').checked = false;
            document.getElementById('toolgroupDrawWall').style.visibility = '';
        }

        if (state == -1 || state == 0) {
            hideEditorInputField();
            document.removeEventListener('mousemove', mouseMoveEventEditing);
        }
        
        if (!this.hold) updateEditorViewport();
    },
    get currentFloor() {
        return this._currentFloor;
    },
    set currentFloor(floor) {
        this._currentFloor = floor;
        this.currentFloorTag = floorToFloorTag(floor);
        if (!editorObjects[this.currentFloorTag]) {
            editorObjects[this.currentFloorTag] = {};
        }
        if (!viewerObjects[this.currentFloorTag]) {
            viewerObjects[this.currentFloorTag] = {};
        }
        floorSelector.selectedIndex = Building.floors.length - Building.floors.indexOf(floor);
        this.state = -1;
    },
    get selectedWall() {
        return this._selectedWall;
    },
    set selectedWall(wallName) {
        // 이전에 선택된 wall 초기화
        if (this.selectedWallObject) {
            this.selectedWallObject.object.material = Materials.Surface.OuterWall;
            for (winObject of Object.values(this.selectedWallObject.windows)) {
                winObject.object.material = Materials.Surface.Window;
            }
        }
        // selectedWall 업데이트
        this._selectedWall = wallName;
        if (viewerObjects[this.currentFloorTag] && viewerObjects[this.currentFloorTag][this._selectedWall]) {
            this.selectedWallObject = viewerObjects[this.currentFloorTag][this._selectedWall];
        }
        else {
            this.selectedWallObject = null;
        }
        // 새로 선택된 wall 업데이트
        if (wallName != '') {
            // 선택된 wall이 있을 때
            // document.getElementById('toolgroupWallProp').style.display = '';
            document.getElementById('toolgroupWallProp').querySelector('[data-property=wallName]').value = wallName;
            document.getElementById('toolgroupWallProp').style.visibility = 'visible';
            document.getElementById('inputWallWWR').value = editorObjects[this.currentFloorTag][wallName].wwr;
            
            let newSelectedWallObject = viewerObjects[this.currentFloorTag][wallName];
            newSelectedWallObject.object.material = Materials.Surface.Highlighted;
            for (winObject of Object.values(newSelectedWallObject.windows)) {
                winObject.object.material = Materials.Surface.HighlightedWindow;
            }
        }
        else {
            // 없을 때
            // document.getElementById('toolgroupWallProp').style.display = 'none';
            document.getElementById('toolgroupWallProp').style.visibility = 'hidden';
        }
        if (!this.hold) updateEditorViewport();
        updateCamera();
    },
}

/** update editorCanvas position offset */
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

//+ ------------------------------------------------------------------- +//
//MARK: Utilities

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

function addWall() {
    Editor.state = 0;
    coords = [
        Editor.mouseLeftStartCoord,
        Editor.mouseLeftEndFinalCoord,
    ];
    addWallSegment({
        floor: Editor.currentFloor,
        coords: coords,
        texture: 'rgb(150,150,150)'
    });
    // updateEditorViewport();
}
/*
function resetSelection() {
    checkSnap(null);
    Editor.hoveredWall = '';
    if (Editor.selectedWall != '') {
        viewerObjects[Editor.currentFloorTag][Editor.selectedWall].object.material = Materials.Surface.OuterWall;
    }
    Editor.selectedWall = '';
    updateEditorViewport();
    updateViewerViewport();
}
*/
//+ ------------------------------------------------------------------- +//
//MARK: Mouse controls

function adjustMousePos(pos, startPos) {
    coord = posToCoord(pos);
    startCoord = startPos ? posToCoord(startPos) : undefined;
    if (checkSnap(coord, startCoord)) {
        coord = Editor.proximityCoord;
        pos = coordToPos(coord);
    }
    return [pos, coord];
}

function updateMouseLeftEndPoint(endPos) {
    Editor.mouseLeftEndRawPos = endPos;
    Editor.mouseLeftEndRawCoord = posToCoord(endPos);
    adjustMouseLeftEndPoint();
}
function adjustMouseLeftEndPoint() {
    [Editor.mouseLeftEndAdjustedPos, Editor.mouseLeftEndAdjustedCoord] = adjustMousePos(Editor.mouseLeftEndRawPos, Editor.mouseLeftStartPos);
    
    if(Editor.angleSnap && !Editor.inProximity) {
        var mouseLeftVector = Editor.mouseLeftEndAdjustedCoord.sub(Editor.mouseLeftStartCoord);
        var snappedAngle = parseFloat(Math.round(mouseLeftVector.angleDeg2 / 45) * 45);
        var snappedVector = Vector.fromAngleDeg(snappedAngle);
        Editor.mouseLeftAdjustedVector = snappedVector.mul(Vector.dot(mouseLeftVector, snappedVector));
        Editor.mouseLeftEndAdjustedCoord = Editor.mouseLeftStartCoord.add(Editor.mouseLeftAdjustedVector);
        Editor.mouseLeftEndAdjustedPos = coordToPos(Editor.mouseLeftEndAdjustedCoord);
    }
    else {
        Editor.mouseLeftAdjustedVector = Editor.mouseLeftEndAdjustedCoord.sub(Editor.mouseLeftStartCoord);
    }
    
    var mouseLeftUnitVector = Editor.mouseLeftAdjustedVector.div(Editor.mouseLeftAdjustedVector.size);
    if (isNaN(Editor.inputLength)) {
        editorInputField.placeholder = parseInt(Editor.mouseLeftAdjustedVector.size*1000);
        Editor.mouseLeftEndFinalCoord = Editor.mouseLeftEndAdjustedCoord;
    }
    else {
        editorInputField.placeholder = parseInt(Editor.inputLength*1000);
        Editor.mouseLeftEndFinalCoord = Editor.mouseLeftStartCoord.add(mouseLeftUnitVector.mul(Editor.inputLength));
        // Editor.mouseLeftEndAdjustedPos = coordToPos(Editor.mouseLeftEndAdjustedCoord);
    }
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
    if (Editor.state == 1) {
        // 시작점 선택 중
        updateMouseLeftEndPoint((new Vector(e.pageX, e.pageY)).sub(Editor.globalOffsetPosDiff));
    }
    else if (Editor.state == 2) {
        // 끝점 선택 중
        updateMouseLeftEndPoint((new Vector(e.pageX, e.pageY)).sub(Editor.globalOffsetPosDiff));
    }
    updateEditorViewport();
}

editorCanvas.onmouseup = function(e) {
    if (Building.workingPanelIdx == 0 && e.button == 0) {
        // 좌클릭
        let mousePos = new Vector(e.pageX, e.pageY).sub(Editor.globalOffsetPosDiff);

        if (Editor.state == 1) {
            Editor.state = 2;
            updateMouseLeftEndPoint(Editor.mouseLeftStartPos);
        }
        else if(Editor.state == 2) {
            addWall();
        }
        else if(Editor.state == -1) {
            Editor.hoveredWall = '';
            Editor.selectedWall = selectWall(posToCoord(mousePos));
        }
    }
}

//! onMouseUp event는 main.js에

editorCanvas.addEventListener('mousedown', function(e) {
    if (e.button == 0) {
        // 좌클릭
        if (Editor.state == 0) {
            Editor.state = 1;
            // 클릭 위치
            var mouseLeftStartPos = new Vector(e.offsetX, e.offsetY);
            [Editor.mouseLeftStartPos, Editor.mouseLeftStartCoord] = adjustMousePos(mouseLeftStartPos);
            document.addEventListener('mousemove', mouseMoveEventEditing);
        }
        else if (Editor.state == 2) {
            addWall();
        }
        updateEditorViewport();
    }
    else if (e.button == 1) {
        // 가운데 클릭
        Editor.panning = true;
        // 클릭 위치
        Editor.mouseMiddleStartGlobalPos = new Vector(e.pageX, e.pageY);
        document.addEventListener('mousemove', mouseMoveEventPanning);
    }
    
})

editorCanvas.addEventListener('mousemove', function(e) {
    let mousePos = new Vector(e.pageX, e.pageY).sub(Editor.globalOffsetPosDiff);
    if (Editor.state == 0) {
        checkSnap(posToCoord(mousePos));
    }
    else if (Editor.state == -1) {
        Editor.hoveredWall = selectWall(posToCoord(mousePos));
    }
    updateEditorViewport();
});

editorCanvas.addEventListener('wheel', function(e) {
    e.preventDefault(); // prevent the page from scrolling
    var scrollOffset = clamp(e.wheelDeltaY / 120, -1, 1);
    var zoomMultiplier = 1 - scrollOffset / 10;
    var zoomCenterCoord = posToCoord(new Vector(e.offsetX, e.offsetY));
    Editor.zoom *= zoomMultiplier;
    Editor.center = Editor.center.sub(zoomCenterCoord).mul(zoomMultiplier).add(zoomCenterCoord);
    if (Editor.state == 2) {
        // Editor.mouseLeftEndCoord = posToCoord(Editor.mouseLeftEndOffsetPos);
        updateMouseLeftEndPoint(Editor.mouseLeftEndRawPos);
    }
    updateEditorViewport();
})

//+ ------------------------------------------------------------------- +//
//MARK: Change current floor

function changeFloor(selectObj) {
    if (selectObj.value === 'add lower') {
        let newOpt = document.createElement('option');
        let newFloor = Building.floors[0] == 1 ? -1 : Building.floors[0] - 1;
        Building.addFloor(newFloor);
        newOpt.value = newFloor;
        newOpt.innerHTML = floorTextFromFloor(newFloor);
        selectObj.insertBefore(newOpt, selectObj.options[selectObj.selectedIndex]);
        // selectObj.selectedIndex -= 1;
        Editor.currentFloor = newFloor;
    }
    else if (selectObj.value === 'add upper') {
        let newOpt = document.createElement('option');
        let newFloor = Building.highestFloor + 1;
        Building.addFloor(newFloor);
        newOpt.value = newFloor;
        newOpt.innerHTML = floorTextFromFloor(newFloor);
        selectObj.insertBefore(newOpt, selectObj.options[selectObj.selectedIndex].nextSibling);
        // selectObj.selectedIndex += 1;
        Editor.currentFloor = newFloor;
    }
    else {
        let newFloor = parseInt(selectObj.value);
        Editor.currentFloor = newFloor;
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Update wall property

function checkWWRValidity(inputFieldWWR) {
    let wwr = parseFloat(inputFieldWWR.value);
    if (wwr < 0 || wwr > 1) {
        inputFieldWWR.value = editorObjects[Editor.currentFloorTag][Editor.selectedWall].wwr;
    }
}
function updateWWR(e, inputFieldWWR) {
    if (e.key === 'Enter') {
        let wwr = parseFloat(inputFieldWWR.value);
        if (0 <= wwr && wwr <= 1) {
            updateWallSegmentWWR({
                floor: Editor.currentFloor,
                name: Editor.selectedWall,
                wwr: wwr,
            });
        }
        else {
            inputFieldWWR.value = editorObjects[Editor.currentFloorTag][Editor.selectedWall].wwr;
        }
        inputFieldWWR.blur();
    }
    else if (e.key === 'Escape') {
        inputFieldWWR.value = editorObjects[Editor.currentFloorTag][Editor.selectedWall].wwr;
        inputFieldWWR.blur();
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Input handling

editorInputField.addEventListener('focusout', function(e) {
    Editor.inputFieldVisibility = false;
    editorInput.style.opacity = '';
});

function checkInputValidity () {
    var value = editorInputField.value;
    var filter = value.match(/[1-9]\d{0,4}/gm);
    if (filter === null) {
        value = '';
        Editor.inputLength = NaN;
    }
    else {
        value = filter[0];
        Editor.inputLength = parseInt(value) / 1000;  // [mm] to [m]
    }
    adjustMouseLeftEndPoint();
    editorInputField.value = value;
    // input 끝으로 커서 이동 
    setTimeout(function(){ editorInputField.selectionStart = editorInputField.selectionEnd = 10000;}, 0);
    renderEditorViewport();
}

function showEditorInputField () {
    if (!Editor.inputFieldVisibility) {
        Editor.inputFieldVisibility = true;
        editorInput.style.opacity = 1;
        editorInputField.focus();
    }
}
function hideEditorInputField () {
    editorInputField.blur();
    editorInputField.value = '';
    Editor.inputLength = NaN;
}
function updateEditorInputFieldPos (pos) {
    editorInput.style.left = pos.x + 'px';
    editorInput.style.top = pos.y + 'px';
}
/** EditorInputField가 viewport 밖으로 넘어갈 경우 위치 조정 */
function adjustEditorInputFieldLocation (startPos, endPos, padding=0) {
    /*  (3)  (4)
        (2)  (1)
    */
    var editorCanvasCenter = new Vector(canvasSizes[0]/2, canvasSizes[0]/2);
    var cornerOffset = viewportSizes[0].div(2);
    var paddedCornerOffset = cornerOffset.sub(editorInputSize.div(2).add(padding));
    var endAngle = endPos.sub(startPos).angleDeg2;
    var cornerPoints = [
        editorCanvasCenter.add(cornerOffset),
        editorCanvasCenter.add(cornerOffset.flipX()),
        editorCanvasCenter.sub(cornerOffset),
        editorCanvasCenter.sub(cornerOffset.flipX()),
    ];
    var cornerAngles = [
        cornerPoints[0].sub(startPos).angleDeg2,
        cornerPoints[1].sub(startPos).angleDeg2,
        cornerPoints[2].sub(startPos).angleDeg2,
        cornerPoints[3].sub(startPos).angleDeg2,
    ];
    if (cornerAngles[3] < endAngle && endAngle < cornerAngles[0]) {
        // (4) - (1)
        var targetLength = cornerPoints[0].x - startPos.x;
        var length = endPos.x - startPos.x;
    }
    else if (cornerAngles[0] < endAngle && endAngle < cornerAngles[1]) {
        // (1) - (2)
        var targetLength = cornerPoints[1].y - startPos.y;
        var length = endPos.y - startPos.y;
    }
    else if (cornerAngles[1] < endAngle || endAngle < cornerAngles[2]) {
        // (2) - (3)
        var targetLength = startPos.x - cornerPoints[2].x;
        var length = startPos.x - endPos.x;
    }
    else {
        // (3) - (4)
        var targetLength = startPos.y - cornerPoints[3].y;
        var length = startPos.y - endPos.y;
    }
    
    //? 최종 위치 결정 (off screen 반영)
    if (targetLength < length) {
        var newPos = endPos.sub(startPos).mul(targetLength/length).add(startPos);
    }
    else {
        var newPos = endPos;
    }
    
    //? 마우스 커서가 가리는 경우 offset
    var safeBox = editorInputSize.add(20);
    /*
    var startEndVec = newPos.sub(startPos);
    var offsetDir = startEndVec.size > 0 ? startEndVec.unit.rotateDeg(90) : new Vector(0, 1);
    */
    var startEndVec = newPos.sub(startPos).size > 0 ? newPos.sub(startPos) : new Vector(1, 0);
    var offsetDir = startEndVec.unit.rotateDeg(90);
    var offsetAngle = startEndVec.abs.angle;
    var thresholdLength = (offsetAngle < safeBox.angle
        ? safeBox.x / Math.cos(offsetAngle)
        : safeBox.y / Math.sin(offsetAngle));
    if (startEndVec.size*2 < thresholdLength) {
        newPos = newPos.add(offsetDir.mul(safeBox.size/2));
    }

    if (
        newPos.sub(editorCanvasCenter).abs.x >= paddedCornerOffset.abs.x
        || newPos.sub(editorCanvasCenter).abs.y >= paddedCornerOffset.abs.y
    ) {
        return new Vector(
            clamp(
                newPos.x,
                editorCanvasCenter.x-paddedCornerOffset.x,
                editorCanvasCenter.x+paddedCornerOffset.x
            ),
            clamp(
                newPos.y,
                editorCanvasCenter.y-paddedCornerOffset.y,
                editorCanvasCenter.y+paddedCornerOffset.y
            )
        )
    }
    return newPos;
}

//+ ------------------------------------------------------------------- +//
//MARK: Render objects

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
    //TODO walls (우선은 line처럼)
    editorCtx.setLineDash([]);
    for (const floorTag of Building.floorTagsToDraw) {
        if (![0, 1, 2].includes(Editor.state) && floorTag !== Editor.currentFloorTag) {
            continue;
        }
        for (const [name, props] of Object.entries(editorObjects[floorTag] || {})) {
            // object에 currentFloorTag가 없을 경우 {}로 대체
            let bound = props.boundary;
            let texture = props.texture || '';
            if (checkBoundary(Editor.boundary, bound)) {
                // console.log(`${name} rendered`);
                if (name == Editor.hoveredWall) continue;

                var coords = props.coords;
                var nPoints = coords.length;
                editorCtx.beginPath();
                editorCtx.moveTo(...coordToPx(coords[0]));
                for (let i=1; i<nPoints; i++) {
                    editorCtx.lineTo(...coordToPx(coords[i]));
                }

                editorCtx.lineCap = 'round';
                editorCtx.lineWidth = 10;
                if (floorTag === Editor.currentFloorTag) {
                    editorCtx.strokeStyle = texture;
                }
                else {
                    let newRgb = stringToRgb(texture);
                    newRgb.a = 0.3;
                    editorCtx.strokeStyle = rgbToRgbaString(newRgb);
                }
                editorCtx.stroke();

            }
        }
    }
    //? axis lines
    editorCtx.setLineDash([]);
    for (const [name, props] of Object.entries(defaultEditorObjects.Lines)) {
        var bound = props.boundary;
        var texture = props.texture || '';
        if (checkBoundary(Editor.boundary, bound)) {
            // console.log(`${name} rendered`);
            var coords = props.coords;
            var nPoints = coords.length;
            editorCtx.beginPath();
            editorCtx.moveTo(...coordToPx(coords[0]));
            for (let i=1; i<nPoints; i++) {
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

            var editorInputFieldPos = Vector.midPoint(mouseLeftStartPos, mouseLeftEndFinalPos);
            editorInputFieldPos = adjustEditorInputFieldLocation(
                mouseLeftStartPos,
                editorInputFieldPos,
                padding=10
            );
            showEditorInputField()
            updateEditorInputFieldPos(editorInputFieldPos);
            
            editorCtx.beginPath();
            editorCtx.arc(...mouseLeftEndFinalPx, 8, 0, 2*Math.PI);
            editorCtx.closePath();
            editorCtx.stroke();
        }


        editorCtx.lineWidth = 2;
        editorCtx.strokeStyle = 'rgba(158,227,255,0.8)';
        editorCtx.beginPath();
        editorCtx.arc(...mouseLeftStartPx, 8, 0, 2*Math.PI);
        editorCtx.closePath();
        editorCtx.stroke();
    }
    //? proximity
    if (Editor.state == 0 || Editor.state == 1 || Editor.state == 2) {
        if (Editor.inProximity){
            editorCtx.beginPath();
            editorCtx.arc(...coordToPx(Editor.proximityCoord), 10, 0, 2*Math.PI);
            editorCtx.closePath();
            editorCtx.lineWidth = 4;
            editorCtx.strokeStyle = '#f44';
            editorCtx.stroke();
        }
    }
    else if (Editor.state == -1) {

        if (Editor.selectedWall) {
            let coords = editorObjects[Editor.currentFloorTag][Editor.selectedWall].coords;
            /*
            editorCtx.beginPath();
            editorCtx.moveTo(...coordToPx(coords[0]));
            editorCtx.lineTo(...coordToPx(coords[1]));

            editorCtx.lineCap = 'round';
            editorCtx.lineWidth = 20;
            editorCtx.strokeStyle = '#f44';
            */
            editorCtx.lineCap = 'round';
            editorCtx.lineWidth = 4;
            editorCtx.strokeStyle = '#f44';
            highlightLine(editorCtx, ...coordToPx(coords[0]), ...coordToPx(coords[1]), 12);
            editorCtx.stroke();
        }
        // if (Editor.hoveredWall != '' && Editor.hoveredWall != Editor.selectedWall) {
        if (Editor.hoveredWall != '') {
            let coords = editorObjects[Editor.currentFloorTag][Editor.hoveredWall].coords;

            editorCtx.beginPath();
            editorCtx.moveTo(...coordToPx(coords[0]));
            editorCtx.lineTo(...coordToPx(coords[1]));

            editorCtx.lineCap = 'round';
            editorCtx.lineWidth = 10;
            editorCtx.strokeStyle = '#f44';
            editorCtx.stroke();
        }
    }
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

//+ ------------------------------------------------------------------- +//
//MARK: Viewport

function resetEditorView() {
    let buildingSize = Math.max(...Building.boundaryXY[1].sub(Building.boundaryXY[0]));
    let buildingMidPoint = Vector.midPoint(...Building.boundaryXY);
    Editor.zoom = buildingSize * 1.2;
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
