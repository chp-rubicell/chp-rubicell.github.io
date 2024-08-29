const viewerPanel = document.getElementById('viewerPanel');
const viewerCanvas = viewerPanel.querySelector('* canvas');
const viewerCanvasWrapper = viewerPanel.querySelector('.canvasWrapper');
// const viewerCtx = viewerCanvas.getContext('2d');

var Viewer = {
    renderer: new THREE.WebGLRenderer({canvas:viewerCanvas, alpha: true, antialias: true, preserveDrawingBuffer: true}),
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(fov=30, aspect=1, near=0.1, far=1000),
    //? lighting related
    lightDirect: new THREE.DirectionalLight(0xeeeeee, 0.6),
    lightDirectTarget: new THREE.Object3D(),
    lightAmbient: new THREE.AmbientLight(0x888888),
    lightShadow: new THREE.DirectionalLight(0xeeeeee, 0.0),
    lightShadowTarget: new THREE.Object3D(),
    shadowOffset: new Vector(45, 90),
    //? camera related
    camStepped: false,  // 카메라 45도 간격
    MAXZOOM: 950,
    //? mouse related
    state: 0,  // 0: 기본, 1: 회전, 2: 이동
    globalOffsetPosDiff: new Vector(0, 0),  // pageX - offsetX
    mouseStartPos: new Vector(0, 0),
    camMoving: false,
    camStepped: false,
    //? selection related
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
}

Viewer.renderer.setClearColor(0xffffff, 0);
Viewer.renderer.setSize(viewerResolution, viewerResolution);
viewerCanvas.style.width = '';
viewerCanvas.style.height = '';
// transparent background
Viewer.scene.background = null;
Viewer.camera.up = new THREE.Vector3(0, 0, 1);
// Viewer.lightShadow.shadow.radius = 10;
Viewer.lightShadow.shadow.mapSize.width = 1024; // default 512
Viewer.lightShadow.shadow.mapSize.height = 1024;
// object selection
Viewer.raycaster.layers.set(1);

/** update viewerCanvas position offset */
function updateViewerOffset() {
    Viewer.globalOffsetPosDiff.x = parseInt(
        viewerCanvas.getBoundingClientRect().x
        + document.documentElement.scrollLeft
    );
    Viewer.globalOffsetPosDiff.y = parseInt(
        viewerCanvas.getBoundingClientRect().y
        + document.documentElement.scrollTop
    );
}
viewerCanvas.onload = updateViewerOffset;

//+ ------------------------------------------------------------------- +//
//MARK: Camera

function polarCoord(alt, azm) {
    var altR = Math.radians(alt);
    var azmR = Math.radians(- azm - 90);

    return new THREE.Vector3(Math.cos(altR) * Math.cos(azmR),
                             Math.cos(altR) * Math.sin(azmR),
                             Math.sin(altR));
}

function updateCamera() {
    // if (camera.alt > 90) camera.alt = 90;
    // if (camera.alt < -90) camera.alt = -90;
    Viewer.camera.alt = clamp(Viewer.camera.alt, -90, 90);

    // if (Viewer.camera.radius < 1) Viewer.camera.radius = 1;
    Viewer.camera.radius = clamp(Viewer.camera.radius, 1, Viewer.MAXZOOM);

    Viewer.camera.azm %= 360;
    var displayAzm = Viewer.camera.azm;
    if (Viewer.camStepped) displayAzm = Math.round(Viewer.camera.azm / 45) * 45;

    Viewer.camera.position.copy(polarCoord(Viewer.camera.alt, displayAzm).multiplyScalar(Viewer.camera.radius).add(Viewer.camera.base));
    Viewer.camera.lookAt(Viewer.camera.base);
    if (Math.abs(Viewer.camera.alt) == 90) {
        Viewer.camera.rotation.z = Math.radians(-Math.sign(Viewer.camera.alt) * displayAzm);
    }
    
    Viewer.lightDirect.position.copy(polarCoord(Viewer.camera.alt, displayAzm+45).add(Viewer.camera.base));
    Viewer.lightDirectTarget.position.copy(Viewer.camera.base);
    Viewer.lightShadow.position.copy(polarCoord(Viewer.shadowOffset[0], displayAzm+Viewer.shadowOffset[1]).multiplyScalar(Viewer.camera.radius).add(Viewer.camera.base));
    // lightShadow.position.copy(polarCoord(45, displayAzm+90).multiplyScalar(10).add(Viewer.camera.base));
    Viewer.lightShadowTarget.position.copy(Viewer.camera.base);

    Viewer.renderer.render(Viewer.scene, Viewer.camera);
    //TODO labelRenderer.render(scene, camera);
}

//+ ------------------------------------------------------------------- +//
//MARK: Reset settings

function resetCamera() {
    // 카메라 초기화
    Viewer.camera.base = new THREE.Vector3(0, 0, 0);
    Viewer.camera.alt = 20;
    Viewer.camera.azm = -30;  // 0 = south
    Viewer.camera.radius = 50;
    updateCamera();
}
resetCamera();

function resetScene() {
    Viewer.scene.remove.apply(Viewer.scene, Viewer.scene.children);
    Viewer.scene.add(Viewer.lightDirect);
    Viewer.scene.add(Viewer.lightDirectTarget);
    Viewer.lightDirect.target = Viewer.lightDirectTarget;
    Viewer.scene.add(Viewer.lightAmbient);
    Viewer.scene.add(Viewer.lightShadow);
    Viewer.scene.add(Viewer.lightShadowTarget);
    Viewer.lightShadow.target = Viewer.lightShadowTarget;
}
resetScene();

//+ ------------------------------------------------------------------- +//
//MARK: Mouse controls

function mouseMoveViewerEvent(e) {
    let newMousePos = new Vector(e.pageX, e.pageY);
    let mouseDelta = newMousePos.sub(Viewer.mouseStartPos);
    if (Viewer.state == 1) {
        // 회전
        Viewer.camera.azm += mouseDelta.x / canvasSizes[1] * 180;
        Viewer.camera.alt += mouseDelta.y / canvasSizes[1] * 180;
        if (mouseDelta.size > 0) Viewer.camMoving = true;
    }
    else if (Viewer.state == 2) {
        // 이동
        var azmR = Math.radians(-Viewer.camera.azm-90-90);
        var horVec = new THREE.Vector3(Math.cos(azmR), Math.sin(azmR), 0).multiplyScalar(mouseDelta.x/canvasSizes[1]*10);
        Viewer.camera.base.add(new THREE.Vector3(
            horVec.x,
            horVec.y,
            mouseDelta.y/canvasSizes[1]*10*Math.cos(Math.radians(Viewer.camera.alt))
        ));
    }
    updateCamera();
    Viewer.mouseStartPos = newMousePos;
}

viewerCanvas.addEventListener('mousedown', function(e) {
    if (Viewer.state == 0) {
        // 클릭 위치
        Viewer.mouseStartPos = new Vector(e.pageX, e.pageY);
        if (e.button == 0) {
            // 좌클릭
            Viewer.state = 1;
        }
        else if (e.button == 1) {
            // 가운데 클릭
            Viewer.state = 2;
        }
        document.addEventListener('mousemove', mouseMoveViewerEvent);

    }
})

viewerCanvas.addEventListener('wheel', function(e) {
    e.preventDefault(); // prevent the page from scrolling
    Viewer.camera.radius -= e.wheelDeltaY / 100 * clamp((Viewer.camera.radius / 50) ** 1.2, 1, Infinity);
    updateCamera();
})

//+ ------------------------------------------------------------------- +//
//MARK: Object selection

function selectViewerObject(e) {
    if (Building.workingPanelIdx == 1 && e.button == 0 && !Viewer.camMoving) {
        // 좌클릭
        // calculate pointer position in normalized device coordinates
        let mousePos = new Vector(e.pageX, e.pageY).sub(Viewer.globalOffsetPosDiff);
        let mouseNorm = mousePos.div(canvasSizes[1]);  // 0 ~ 1
        mouseNorm.x = clamp(mouseNorm.x, 0, 1);
        mouseNorm.y = clamp(mouseNorm.y, 0, 1);
        let mouseOffsetNorm = mouseNorm.mul(2).sub(1);  // -1 ~ 1
        mouseOffsetNorm.y *= -1;
        
        Viewer.pointer.x = mouseOffsetNorm.x;
        Viewer.pointer.y = mouseOffsetNorm.y;
        
        // update the picking ray with the camera and pointer position
        Viewer.raycaster.setFromCamera(Viewer.pointer, Viewer.camera);

        // calculate objects intersecting the picking ray
        const intersects = Viewer.raycaster.intersectObjects(Viewer.scene.children);
        if (intersects.length == 0) {
            Editor.selectedWall = '';
        }
        else {
            let obj = intersects[0].object;
            let objName = obj.name;
            Editor.currentFloor = objectNameToFloorMap[objName];
            Editor.selectedWall = objName;
        }
    }
}

// viewerCanvas.addEventListener('pointermove', selectViewerObject);
viewerCanvas.addEventListener('mouseup', selectViewerObject);

//+ ------------------------------------------------------------------- +//
//MARK: Render objects

const EDGEMATERIAL = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1,
});

const axisLength = 10;
const axisXObjTemplate = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(axisLength, 0, 0),
    ]),
    new THREE.LineBasicMaterial({color: 0xff0000})
);
const axisYObjTemplate = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, axisLength, 0),
    ]),
    new THREE.LineBasicMaterial({color: 0x00ff00})
);
const axisZObjTemplate = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, axisLength),
    ]),
    new THREE.LineBasicMaterial({color: 0x0000ff})
);
var axisTrueNorthObjTemplate = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, axisLength, 0),
    ]),
    new THREE.LineDashedMaterial({
        color: 0x00ff00,
        linewidth: 2,
        dashSize: 1.5,
        gapSize: 1
    })
);
axisTrueNorthObjTemplate.computeLineDistances();

const shadowCatcherMat = new THREE.ShadowMaterial();
shadowCatcherMat.opacity = 0.5;

const matGhost = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending
});

//+ ------------------------------------------------------------------- +//
//MARK: Render viewport

function resetViewerView () {
    let boundary = [
        [...Building.boundaryXY[0], Building.boundaryZ[0]],
        [...Building.boundaryXY[1], Building.boundaryZ[1]],
    ];
    let center = [];
    let radius = 0;
    for (axis=0; axis<3; axis++) {
        center.push((boundary[0][axis] + boundary[1][axis]) / 2);
        radius += Math.pow(boundary[1][axis] - boundary[0][axis], 2);
    }
    bldgRadius = Math.sqrt(radius);
    Viewer.camera.base = new THREE.Vector3(center[0], center[1], center[2]);
    Viewer.camera.radius = bldgRadius * 2.5;

    updateCamera();
}

function addSurfaceObjectToViewer(surfObject, hold=false) {
    Viewer.scene.add(surfObject.object);
    Viewer.scene.add(surfObject.edgeObject);
    for (const [winName, winProps] of Object.entries(surfObject.windows)) {
        Viewer.scene.add(winProps.object);
        Viewer.scene.add(winProps.edgeObject);
    }
    if (!hold) updateCamera();
}

function removeSurfaceObjectFromViewer(surfObject, hold=false) {
    Viewer.scene.remove(surfObject.object);
    Viewer.scene.remove(surfObject.edgeObject);
    for (const [winName, winProps] of Object.entries(surfObject.windows)) {
        Viewer.scene.remove(winProps.object);
        Viewer.scene.remove(winProps.edgeObject);
    }
    if (!hold) updateCamera();
}

function refreshViewer() {
    resetScene();
    for (const [floorTag, surfaces] of Object.entries(viewerObjects)) {
        for (const [surfName, surfProps] of Object.entries(surfaces)) {
            Viewer.scene.add(surfProps.object);
            Viewer.scene.add(surfProps.edgeObject);
            for (const [winName, winProps] of Object.entries(surfProps.windows)) {
                Viewer.scene.add(winProps.object);
                Viewer.scene.add(winProps.edgeObject);
            }
        }
        // console.log(objType);
        // var filtered = Object.fromEntries(Object.entries(objs).filter(([name,props]) => checkCollision(editor.bound, props[0])));
        // renderObjects[objType] = filtered;
    }
    updateCamera();
}