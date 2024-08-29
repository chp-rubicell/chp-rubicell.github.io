//+ ------------------------------------------------------------------- +//
//MARK: Shared mouse event

document.onmouseup = function(e) {
    if (Building.workingPanelIdx == 0) {
        // Editor에서 시작됨
        if (e.button == 1) {
            // 가운데 클릭
            if (Editor.panning) {
                Editor.panning = false;
                document.removeEventListener('mousemove', mouseMoveEventPanning);
            }
        }
        updateEditorViewport();
    }
    else if (Building.workingPanelIdx == 1) {
        // Viewer에서 시작됨
        Viewer.state = 0;
        Viewer.camMoving = false
        if (Viewer.camStepped) Viewer.camera.azm = Math.round(Viewer.camera.azm / 45) * 45;
        Viewer.camStepped = false;
        document.removeEventListener('mousemove', mouseMoveViewerEvent);
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Shared keyboard event

document.onkeydown = function (e) {
    if (Building.workingPanelIdx == 0) {
        // Editor에서 시작됨
        switch (e.key) {
            case 'Escape':
                if (Editor.state == 0 || Editor.state == 1 || Editor.state == 2) {
                    Editor.state = -1;
                    document.removeEventListener('mousemove', mouseMoveEventEditing);
                    renderEditorViewport();
                }
                break;
            case 'Shift':
                Editor.angleSnap = false;
                adjustMouseLeftEndPoint();
                break;
        }
    }
    else if (Building.workingPanelIdx == 1) {
        // Viewer에서 시작됨
        switch (e.key) {
            case 'Shift':
                if (Viewer.state == 1) {
                    Viewer.camStepped = true;
                    updateCamera();
                }
                break;
        }
    }
    
    if (e.key == 'Delete') {
        if (Editor.selectedWall != '') {
            removeWallSegment(Editor.selectedWall)
        }
    }
}

document.onkeyup = function (e) {
    if (Building.workingPanelIdx == 0) {
        // Editor에서 시작됨
        switch (e.key) {
            case 'Shift':
                Editor.angleSnap = true;
                adjustMouseLeftEndPoint();
                break;
            case 'Enter':
                if (Editor.inputFieldVisibility) {
                    addWall();
                }
                break;
        }
    }
    else if (Building.workingPanelIdx == 1) {
        // Viewer에서 시작됨
        switch (e.key) {
            case 'Shift':
                if (Viewer.state == 1) {
                    Viewer.camStepped = false;
                    updateCamera();
                }
                break;
        }
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Window resize

window.addEventListener('resize', function(e) {
    updateDivider();
    updateEditorOffset();
}, true);


window.addEventListener("load", function() {
    //? Editor related
    Editor.currentFloor = 1;
    Editor.zoom = 10;
    Editor.state = -1;

    Editor.hold = false;
    updateEditorViewport();
    
    //? Viewer related

    refreshViewer();
});

//! ------------------------------------------------------------------- !//
//! MARK: Testing

window.addEventListener("load", function() {
    addWallSegment({
        floor: Editor.currentFloor,
        coords: [new Vector(0, 0), new Vector(10, 0)],
        texture: 'rgb(150,150,150)'
    });
    addWallSegment({
        floor: Editor.currentFloor,
        coords: [new Vector(10, 0), new Vector(10, 5)],
        texture: 'rgb(150,150,150)'
    });
    addWallSegment({
        floor: Editor.currentFloor,
        coords: [new Vector(10, 5), new Vector(0, 5)],
        texture: 'rgb(150,150,150)'
    });
    addWallSegment({
        floor: Editor.currentFloor,
        coords: [new Vector(0, 5), new Vector(0, 0)],
        texture: 'rgb(150,150,150)'
    });
    // Building.addFloor(3);
    // Building.addFloor(-1);
    resetEditorView();
    resetViewerView();
});
