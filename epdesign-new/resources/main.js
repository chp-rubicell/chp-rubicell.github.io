//+ ------------------------------------------------------------------- +//
//MARK: Shared mouse event

document.onmouseup = function(e) {
    if (Building.workingPanelIdx == 0) {
        // Editor에서 시작됨
        if (e.button == 1 || e.button == 2) {
            // 가운데/우클릭
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
                    updateEditorViewport();
                }
                break;
            case 'Shift':
                Editor.angleSnap = false;
                updateEditingAdjustedCoord();
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
    
    if (e.key == 'Delete' || e.key == 'Backspace') {
        if (Editor.selectedWall != '' && e.target.tagName.toLowerCase() !== 'input') {
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
                updateEditingAdjustedCoord();
                break;
            case 'Enter':
                if (Editor.inputFieldVisibility) {
                    addToEditingCoords();
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

    //TODO refreshViewer();
});

//! ------------------------------------------------------------------- !//
//! MARK: Testing

window.addEventListener("load", function() {
    addZone({
        floor: Editor.currentFloor,
        coords: [new Vector(0, 0), new Vector(10, 0), new Vector(10, 5), new Vector(2, 5)],
    });
    addZone({
        floor: Editor.currentFloor,
        coords: [new Vector(5, 10), new Vector(10, 10), new Vector(10, 5), new Vector(5, 5)],
    });
    resetEditorView();
    // resetViewerView();
});
