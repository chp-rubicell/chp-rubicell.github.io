//! ========================= Basic Utilities ========================= !//

// import earcut from './earcut.js';

// Convert from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}
// Convert from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
}


//! =========================== Scene Setup =========================== !//

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);
//? transparent background
scene.background = null;

const camera = new THREE.PerspectiveCamera(fov=30, aspect=canvWidth / canvHeight, near=0.1, far=1000);
camera.up = new THREE.Vector3(0, 0, 1);

// const lightDirect = new THREE.DirectionalLight(0xffffff, 1);
const lightDirect = new THREE.DirectionalLight(0xeeeeee, 0.6);  // 0.6
// lightDirect.castShadow = true;
// lightDirect.shadow.radius = 10;
const lightDirectTarget = new THREE.Object3D();
// const lightAmbient = new THREE.AmbientLight(0x777777);
const lightAmbient = new THREE.AmbientLight(0x888888);
const lightShadow = new THREE.DirectionalLight(0xeeeeee, 0.0);
// lightShadow.shadow.radius = 10;
lightShadow.shadow.mapSize.width = 1024; // default 512
lightShadow.shadow.mapSize.height = 1024;
// lightShadow.shadow.camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.5, 1000);
// lightShadow.shadow.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.5, 1000);
const lightShadowTarget = new THREE.Object3D();

const DEV = false;
const matDev = new THREE.MeshPhongMaterial({color: 0xffff00});
const geomDev = new THREE.SphereGeometry(3, 8, 4);
const objDev = new THREE.Mesh(geomDev, matDev);


//! ============================= Renderer ============================ !//

// const renderer = new THREE.WebGLRenderer();
// const renderer = new THREE.WebGLRenderer({alpha: true});
//? 배경 투명하게
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, preserveDrawingBuffer: true});
renderer.setClearColor(0xffffff, 0);
//? 배경 하얗게
// const renderer = new THREE.WebGLRenderer({alpha: false, antialias: true, preserveDrawingBuffer: true});
// renderer.setClearColor(0xffffff, 1);

renderer.setSize(canvWidth, canvHeight);
renderer.domElement.id = 'CanvasRenderer';
// document.body.appendChild(renderer.domElement);
document.getElementById("CanvasContainer").appendChild(renderer.domElement);
// renderer.domElement.style.width = panelWidth+"px";
// renderer.domElement.style.height = panelHeight+"px";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";

/*
TODO
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(panelWidth, panelHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.zIndex = '100';
// labelRenderer.domElement.style.width = "100%";
// labelRenderer.domElement.style.height = "100%";
// pointer-events: none;
labelRenderer.domElement.style.pointerEvents = 'none';
// document.body.appendChild( labelRenderer.domElement );
document.getElementById('CanvasContainer').appendChild(labelRenderer.domElement);
*/

const renderCanvas = document.getElementById('CanvasRenderer');

function exportImage() {
    console.log('exporting image...');

    var image = renderCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    var link = document.createElement("a");
    link.setAttribute("href", image);
    link.setAttribute("download", idfName + ".png");
    document.body.appendChild(link);
    link.click();
    link.remove();
}

//! ============================== Camera ============================= !//

// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function polarCoord(alt, azm) {
    var altR = Math.radians(alt);
    var azmR = Math.radians(- azm - 90);

    return new THREE.Vector3(Math.cos(altR) * Math.cos(azmR),
                             Math.cos(altR) * Math.sin(azmR),
                             Math.sin(altR));
}

var shadowOffset = new Array(45, 90);
function updateCamera() {
    // if (camera.alt > 90) camera.alt = 90;
    // if (camera.alt < -90) camera.alt = -90;
    camera.alt = clamp(camera.alt, -90, 90);

    // if (camera.radius < 1) camera.radius = 1;
    camera.radius = clamp(camera.radius, 1, 950);

    camera.azm %= 360;
    var displayAzm = camera.azm;
    if (camStepped) displayAzm = Math.round(camera.azm / 45) * 45;

    camera.position.copy(polarCoord(camera.alt, displayAzm).multiplyScalar(camera.radius).add(camera.base));
    camera.lookAt(camera.base);
    if (Math.abs(camera.alt) == 90) {
        camera.rotation.z = Math.radians(-Math.sign(camera.alt) * displayAzm);
    }
    
    lightDirect.position.copy(polarCoord(camera.alt, displayAzm+45).add(camera.base));
    lightDirectTarget.position.copy(camera.base);
    lightShadow.position.copy(polarCoord(shadowOffset[0], displayAzm+shadowOffset[1]).multiplyScalar(camera.radius).add(camera.base));
    // lightShadow.position.copy(polarCoord(45, displayAzm+90).multiplyScalar(10).add(camera.base));
    lightShadowTarget.position.copy(camera.base);

    objDev.position.copy(polarCoord(45, displayAzm+90).multiplyScalar(10).add(camera.base));

    renderer.render(scene, camera);
    //TODO labelRenderer.render(scene, camera);
}


//! ============================== Inputs ============================= !//

//? Key input
var clickable = false;
var mouseLeft = false;
var mouseMiddle = false;
var shiftKey = false;
var camStepped = false;  // 카메라 45도 간격
var camFixed = false;
var commandOn = false;

var pressedKeys = {};
// window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
// window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

//? Mouse input
CanvasContainer.ondragstart = function() {
    return false;
}
function customOnMouseMove(event) {
    event = event || window.event;
    newX = event.pageX;
    newY = event.pageY;
    dX = newX - startX;
    dY = newY - startY;

    if (mouseLeft) {
        camera.azm += dX / panelWidth * 180;
        // camera.alt = clamp(camera.alt + dY / panelHeight * 180, -90, 90);
        camera.alt += dY / panelHeight * 180;
        // console.log(camera.azm, camera.alt);
        // console.log(camera.position, camera.rotation);
    }
    else if (mouseMiddle) {
        var azmR = Math.radians(-camera.azm-90-90);
        var horVec = new THREE.Vector3(Math.cos(azmR), Math.sin(azmR), 0).multiplyScalar(dX/panelWidth*10);
        camera.base.add(new THREE.Vector3(
            horVec.x,
            horVec.y,
            dY/panelHeight*10*Math.cos(Math.radians(camera.alt))
        ));
    }
    updateCamera();
    startX = newX;
    startY = newY;
}
CanvasContainer.onmousedown = function (event) {
    event = event || window.event;
    
    if (clickable) {
        startX = event.pageX;
        startY = event.pageY;

        if (event.button == 0) {
            // 좌클릭
            mouseLeft = true;
            mouseMiddle = false;
        }
        if (event.button == 1) {
            // 가운데 클릭
            mouseMiddle = true;
            mouseLeft = false;
        }

        document.addEventListener('mousemove', customOnMouseMove);
        document.onmouseup = function(event) {
            // event = event || window.event;
            mouseLeft = false;
            mouseMiddle = false;
            if (camStepped) camera.azm = Math.round(camera.azm / 45) * 45;
            document.removeEventListener('mousemove', customOnMouseMove);
        }
    }
    // else {
    //     settingsPanelVisibility();
    // }
}
document.addEventListener('onmouseleave', function() {
    document.removeEventListener('mousemove', customOnMouseMove);
})
// CanvasContainer.onmouseup = function(event) {
//     event = event || window.event;
//     CanvasContainer.removeEventListener('mousemove', customOnMouseMove);
// }
CanvasContainer.onwheel = function (event) {
    if (clickable) {
        camera.radius -= event.wheelDeltaY / 100 * clamp((camera.radius / 50) ** 1.2, 1, Infinity);
        // camera.zoom = event.wheelDeltaY / 210;
        updateCamera();
    }
}
document.getElementById('PageWrapper').onwheel = function (event) {
    event = event || window.event;
    if (event.target.id == 'CanvasRenderer'  && clickable) {
        return false;
    }
}
document.getElementById('PageWrapper').onmousedown = function (event) {
    event = event || window.event;
    if (event.button == 1 && event.target.id == 'CanvasRenderer') {
        return false;
    }
}

document.onkeydown = function (event) {
    if (event.shiftKey) shiftKey = true;
    if (mouseLeft && event.shiftKey) {
        camStepped = true;
        updateCamera();
    }
    /*
    if (event.key == 's' && idfName !== '' && !commandOn) {
        exportImage();
    }
    */
}
const nonCommandKey = new Array('Shift', 'Alt', 'Control', 'Enter', 'Escape', 'Tab', 'CapsLock', 'ContextMenu');
document.onkeyup = function (event) {
    // for command
    // console.log(event.key, nonCommandKey.includes(event.key))
    // (!nonCommandKey.includes(event.key))
    if (commandOn && !event.metaKey) {
        if (event.key == 'ArrowUp' && lastCommand != '') {
            commandListener.innerHTML = lastCommand;
        }
        if (event.key.length == 1) {
            commandListener.innerHTML += event.key.toLowerCase();
        }
    }

    // various actions
    switch (event.key) {
        case 'Shift':
            shiftKey = false;
            camStepped = false;
            updateCamera();
            break;
        case '/':
            if (!commandOn) {
                commandOn = true;
                commandListenerVisibility(1);
            }
            break;
        case 'Enter':
            if (commandOn) {
                commandOn = false;
                commandListenerVisibility(0);
                runCommand(commandListener.innerHTML);
            }
            break;
        case 'Escape':
            if (commandOn) {
                commandOn = false;
                commandListenerVisibility(0);
            }
            else settingsPanelVisibility(0);
            break;
        case 'Backspace':
            if (commandOn) {
                commandListener.innerHTML = commandListener.innerHTML.slice(0, -1);
            }
            break;
    }
}


/*
// scrollTop = window.pageYOffset || document.documentElement.scrollTop;
// scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
// window.onscroll = function () {
//     window.scrollTo(scrollLeft, scrollTop);
// }
function preventScroll (e) {
    // e.preventDefault();
    // e.stopPropagation();

    // return false;
    window.scrollTo(0, 0)
}
function disablePageScroll () {
    // document.querySelector('.scrollable').addEventListener('wheel', preventScroll);
    window.addEventListener('wheel', preventScroll);
    window.addEventListener('scroll', preventScroll);
}
function enablePageScroll () {
    // document.querySelector('.scrollable').removeEventListener('wheel', preventScroll);
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('scroll', preventScroll);
}
disablePageScroll();
window.onscroll() = function () {
    return false;
}
*/



//! ========================== Reset Settings ========================= !//

function resetCamera() {
    // 카메라 초기화
    camera.base = new THREE.Vector3(0, 0, 0);
    camera.alt = 20;
    camera.azm = -30;  // 0 = south
    camera.radius = 10;
    updateCamera();
}
resetCamera();

function resetScene() {
    scene.remove.apply(scene, scene.children);

    scene.add(lightDirect);
    scene.add(lightDirectTarget);
    lightDirect.target = lightDirectTarget;
    scene.add(lightAmbient);
    scene.add(lightShadow);
    scene.add(lightShadowTarget);
    lightShadow.target = lightShadowTarget;
    // scene.add(new THREE.CameraHelper(lightShadow.shadow.camera));
    // scene.add(new THREE.DirectionalLightHelper(lightShadow));

    if (DEV) scene.add(objDev);
}
resetScene();


//! ======================= Triangulate Surface ======================= !//

function triangulateSurface(vertList, vertical=false, holes=null) {
    if (vertical) {
        //? 면이 수직일 때

        var minZ = Infinity
        var rotateVecVert = [];
        var vectorList = []

        vertList.forEach(v => {
            newVec = new THREE.Vector3(v[0], v[1], v[2]);
            if (v[2] < minZ) {
                minZ = v[2];
                rotateVecVert = [newVec];
            }
            else if (rotateVecVert.length < 2 && v[2] == minZ) {
                rotateVecVert.push(newVec);
                // return false;
            }
            vectorList.push(newVec);
        });
        if (rotateVecVert.length < 2) {
            // console.log(vertList);
            console.error(rotateVecVert);
        }

        // 바닥과 접하는 벡터
        rotateVec = new THREE.Vector3().subVectors(rotateVecVert[0], rotateVecVert[1]);
        const unitX = new THREE.Vector3(1, 0, 0);
        const unitZ = new THREE.Vector3(0, 0, 1);
        // x축과 평행하도록 회전시켜야하는 각도
        var ang1 = Math.acos(unitX.dot(rotateVec) / rotateVec.length());

        var vertListHor = [];
        vectorList.forEach(vec => {
            vec.applyAxisAngle(unitZ, ang1);  // x축과 평행하도록 회전
            vec.applyAxisAngle(unitX, Math.PI / 2);  // 수평이 되도록 회전
            vertListHor.push([vec.x, vec.y, vec.z]);
            // vertListHor.push([vec.x, vec.y, minZ]);
        });
        vertListHorTrian = triangulateSurface(vertListHor, vertical=false, holes=holes);

        var vertListVerTrian = []
        vertListHorTrian.forEach(v => {
            vec = new THREE.Vector3(v[0], v[1], v[2]);
            vec.applyAxisAngle(unitX, -Math.PI / 2);
            vec.applyAxisAngle(unitZ, -ang1);
            vertListVerTrian.push([vec.x, vec.y, vec.z]);
        });
        return vertListVerTrian;
    }

    else {
        //? 면이 수평일 때
        var vertTriangulated = [];
        earcut(vertList.flat(), holes, 3).forEach(vIdx => {
            vertTriangulated.push(vertList[vIdx]);
        });
        return vertTriangulated
    }
}


//! ========================== Load IDF File ========================== !//

var idfName = "";
var northAxis = 0;
var boundary = [];
var bldgRadius = 0;
var zoneList = [];
var constList = [];
var surfList = {};
var fenList = {};
var shadeList = {};

var geometryList = {};
var shadowCatcher = null;

var savedMeshEdges = [];



function readFile (fileList) {
    if (fileList.length > 0) {
        idfFile = fileList[0];
        if (!idfFile.name.endsWith('.idf')) {
            window.alert('Not an idf file!');
            return;
        }
        idfName = idfFile.name.slice(0, -4);
        fileSelectorTag.innerHTML = idfFile.name;
        reader.readAsText(idfFile, "utf-8");
    }
}

function loadFile (code) {
    settingsPanelVisibility(0);
    transparencyOn = true;
    debugOn = false;
    parseIDF(code);
    updateSettingsPanel();
    addModel();
}

const reader = new FileReader();
reader.onload = function () {loadFile(reader.result)};

const fileSelector = document.getElementById('fileSelector');
const fileSelectorTag = document.getElementById('fileSelectorTag');
fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    readFile(fileList);
});

document.body.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    clickable = true;
    fileHoverMask.style.display = 'none';
    fileHover.style.display = 'none';

    const fileList = e.dataTransfer.files;
    readFile(fileList);
});
const fileHoverMask = document.getElementById('fileHoverMask');  // drag&drop 받기 위한 object
const fileHover = document.getElementById('fileHover');  // drag&drop 설명 object
const fileHoverText = document.getElementById('fileHoverText');  // drag&drop 설명 text
document.body.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    clickable = false;
    fileHoverMask.style.display = 'block';
    fileHover.style.display = 'block';
    if (e.shiftKey) {
        camFixed = true;
        fileHoverText.style.textShadow = '#fff 0 0 10px, #ffe880 0 0 20px, #000 0 0 30px';
    }
    else {
        camFixed = false;
        fileHoverText.style.textShadow = '#fff 0 0 10px, #80daff 0 0 20px, #000 0 0 30px';
    }
});
fileHoverMask.addEventListener('dragleave', function(e) {
    // console.log(e.target)
    camFixed = false;
    clickable = true;
    fileHoverMask.style.display = 'none';
    fileHover.style.display = 'none';
});


function parseIDF(code) {

    northAxis = 0;
    boundary = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
    bldgRadius = 0;
    zoneList = {};
    constList = [];
    surfList = {};
    fenList = {};
    shadeList = {};
    geometryList = {
        'Opaque'     : [],
        'Transparent': [],
        'Edge'       : [],
    };
    shadowCatcher = null;


    if (code.length <= 0) return -1;

    //? 주석 제거
    code = code.replace(/!.*\s*/g, '');
    //? 공백 제거
    code = code.replace(/,\s*/g, ',').replace(/;\s*/g, ';').trim();
    //? 오브젝트별로 분리
    const objectList = code.split(';');

    //? 버전 검사
    iddInfoLibrary = null;
    iddInfo = null;
    for (let i = 0; i < objectList.length; i++) {
        var obj = objectList[i];
        if (obj.toLowerCase().startsWith('Version'.toLowerCase())) {
            var version = obj.split(',')[1].split('.');
            console.log(version);
            v = [parseInt(version[0]), parseInt(version[1])]
            for (let iter = 0; iter < 10; iter++) {
                versionCode = v[0] + '_' + v[1] + '_0';
                if (versionCode in versionLibrary) {
                    break;
                }
                else {
                    v[1]--;
                }
            }
            break;
        }
    }
    iddInfoLibrary = versionLibrary[versionCode];
    console.log(iddInfoLibrary);

    //? North Axis 검사
    for (let i = 0; i < objectList.length; i++) {
        var obj = objectList[i];
        if (obj.toLowerCase().startsWith('Building'.toLowerCase())) {
            northAxis = parseFloat(obj.split(',')[2]);
            break;
        }
    }

    //? Zone, Construction 관련
    objectList.forEach(obj => {
        if (!obj.toLowerCase().startsWith('Zone'.toLowerCase())
                && !obj.toLowerCase().startsWith('Construction'.toLowerCase())) {
            return;
        }
        var objSplit = obj.split(',');
        var objName = objSplit[1];

        switch (objSplit[0].toLowerCase()) {
            case 'Zone'.toLowerCase():
                iddInfo = iddInfoLibrary['Zone'.toLowerCase()];

                if (!(objName in zoneList))
                    zoneList[objName] = {
                        'Surfaces'   : [],
                        'Origin'     : [Number(objSplit[iddInfo.indexOf('x origin')]),
                                        Number(objSplit[iddInfo.indexOf('y origin')]),
                                        Number(objSplit[iddInfo.indexOf('z origin')])],
                        'NDirection' : [],  //TODO zone 원점과 방향이 다를 때 반영
                        'Visible'    : true,
                    };
                break;

            case 'Construction'.toLowerCase():
                constList.push(objName);
                break;
        }
    });

    //? Wall, Window로 정의되어 있는지 검사
    alerted = false;
    objectList.forEach(obj => {
        if (obj.toLowerCase().startsWith('Wall,'.toLowerCase())
                || obj.toLowerCase().startsWith('Wall:'.toLowerCase())
                || obj.toLowerCase().startsWith('Window,'.toLowerCase())
                || obj.toLowerCase().startsWith('Window:'.toLowerCase())) {
            if (!alerted) {
                window.alert('Currently only supports idf files using "BuildingSurface:Detailed".');
                alerted = true;
                settingsPanelVisibility(-1);
            }
            return;
        }
        //? Surface 관련

        if (!obj.toLowerCase().startsWith('BuildingSurface:Detailed'.toLowerCase())
                && !obj.toLowerCase().startsWith('FenestrationSurface:Detailed'.toLowerCase())
                && !obj.toLowerCase().startsWith('Shading:Building:Detailed'.toLowerCase())) {
            return;
        }
        var objSplit = obj.split(',');
        var objName = objSplit[1].toLowerCase();

        switch (objSplit[0].toLowerCase()) {

            case 'BuildingSurface:Detailed'.toLowerCase():
                iddInfo = iddInfoLibrary['BuildingSurface:Detailed'.toLowerCase()];

                zoneName = objSplit[iddInfo.indexOf('zone name')];
                zoneCoord = zoneList[zoneName].Origin;

                // var vertNum = objSplit[10];  // 점 개수
                var vCoordStart = iddInfo.indexOf('vertex 1 x-coordinate');
                var vertNum = parseInt((objSplit.length-vCoordStart) / 3);  // 점 개수
                var surfVertices = [];  // 점 좌표 리스트
                var maxZ = -Infinity;  // 가장 큰 z값 (shadow object 생성 시 필요)
                for (var v=0; v<vertNum; v++) {
                    var vCoord = [];  // 점 하나 좌표
                    for (var axis=0; axis<3; axis++) {
                        coordRelative = Number(objSplit[vCoordStart + v*3 + axis]);  // 현재 좌푯값
                        var coord = zoneCoord[axis] + coordRelative;  // zone 기준점 반영한 좌푯값
                        // boundary 양쪽 끝 점 업데이트
                        if (coord < boundary[0][axis]) boundary[0][axis] = coord;
                        if (coord > boundary[1][axis]) boundary[1][axis] = coord;

                        vCoord.push(coord)  // 좌푯값 추가

                        if (axis == 2 && maxZ < coord) maxZ = coord;
                    }
                    surfVertices.push(vCoord);
                    // surfVertices.push(new THREE.Vector3(vCoord[0], vCoord[1], vCoord[2]));
                }
                var fens = [];
                if (objName in surfList) var fens = surfList[objName].Fenestrations;

                surfList[objName] = {
                    'SurfaceType'  : objSplit[iddInfo.indexOf('surface type')].toLowerCase(),
                    'Construction' : objSplit[iddInfo.indexOf('construction name')],
                    'ZoneName'     : zoneName,
                    'OutsideBC'    : objSplit[iddInfo.indexOf('outside boundary condition')].toLowerCase(),
                    'OutsideBCObj' : objSplit[iddInfo.indexOf('outside boundary condition object')],
                    'VerticeNumber': vertNum,
                    'Vertices'     : surfVertices,
                    'Fenestrations': fens,
                    'MaximumZ'     : maxZ
                }

                zoneList[zoneName].Surfaces.push(objName);
                
                break;

            case 'FenestrationSurface:Detailed'.toLowerCase():
                iddInfo = iddInfoLibrary['FenestrationSurface:Detailed'.toLowerCase()];

                surfName = objSplit[iddInfo.indexOf('building surface name')].toLowerCase();
                zoneName = surfList[surfName].ZoneName;
                zoneCoord = zoneList[zoneName].Origin;

                // var vertNum = objSplit[9];  // 점 개수
                var vCoordStart = iddInfo.indexOf('vertex 1 x-coordinate');
                var vertNum = parseInt((objSplit.length-vCoordStart) / 3);  // 점 개수
                var surfVertices = [];  // 점 좌표 리스트
                for (var v=0; v<vertNum; v++) {
                    var vCoord = [];  // 점 하나 좌표
                    for (var axis=0; axis<3; axis++) {
                        coordRelative = Number(objSplit[vCoordStart + v*3 + axis]);  // 현재 좌푯값
                        var coord = zoneCoord[axis] + coordRelative;  // zone 기준점 반영한 좌푯값
                        // boundary 양쪽 끝 점 업데이트
                        if (coord < boundary[0][axis]) boundary[0][axis] = coord;
                        if (coord > boundary[1][axis]) boundary[1][axis] = coord;

                        vCoord.push(coord)  // 좌푯값 추가
                    }
                    surfVertices.push(vCoord);
                    // surfVertices.push(new THREE.Vector3(vCoord[0], vCoord[1], vCoord[2]));
                }
                fenList[objName] = {
                    'SurfaceType'  : objSplit[iddInfo.indexOf('surface type')].toLowerCase(),
                    'Construction' : objSplit[iddInfo.indexOf('construction name')],
                    'SurfaceName'  : surfName,
                    'VerticeNumber': vertNum,
                    'Vertices'     : surfVertices,
                }

                if (surfName in surfList) {
                    surfList[surfName].Fenestrations.push(objName);
                }
                else {
                    surfList[surfName] = {
                        // 'SurfaceType'  : undefined,
                        // 'Construction' : undefined,
                        // 'ZoneName'     : undefined,
                        // 'VerticeNumber': undefined,
                        // 'Vertices'     : undefined,
                        'Fenestrations': [objName],
                    }
                }
                break;

            case 'Shading:Building:Detailed'.toLowerCase():
                iddInfo = iddInfoLibrary['Shading:Building:Detailed'.toLowerCase()];

                zoneName = objSplit[iddInfo.indexOf('zone name')];

                var vCoordStart = iddInfo.indexOf('vertex 1 x-coordinate');
                var vertNum = parseInt((objSplit.length-vCoordStart) / 3);  // 점 개수
                var surfVertices = [];  // 점 좌표 리스트
                var maxZ = -Infinity;  // 가장 큰 z값 (shadow object 생성 시 필요)
                for (var v=0; v<vertNum; v++) {
                    var vCoord = [];  // 점 하나 좌표
                    for (var axis=0; axis<3; axis++) {
                        coordRelative = Number(objSplit[vCoordStart + v*3 + axis]);  // 현재 좌푯값
                        var coord = zoneCoord[axis] + coordRelative;  // zone 기준점 반영한 좌푯값
                        // boundary 양쪽 끝 점 업데이트
                        if (coord < boundary[0][axis]) boundary[0][axis] = coord;
                        if (coord > boundary[1][axis]) boundary[1][axis] = coord;

                        vCoord.push(coord)  // 좌푯값 추가

                        if (axis == 2 && maxZ < coord) maxZ = coord;
                    }
                    surfVertices.push(vCoord);
                    // surfVertices.push(new THREE.Vector3(vCoord[0], vCoord[1], vCoord[2]));
                }
                shadeList[objName] = {
                    'VerticeNumber': vertNum,
                    'Vertices'     : surfVertices,
                }

                break;
        
            default:
                break;
        }
    });

    //? 중복되는 면 제거
    // surfNameSet = new Set(Object.keys(surfList));
    // for (const [surfName, surfProp] of Object.entries(surfList)) {
    //     if (
    //         surfProp.OutsideBC != 'outdoors'
    //         && surfProp.OutsideBC != 'grounds'
    //         && surfProp.SurfaceType != 'roof'
    //         && surfNameSet.has(surfProp.OutsideBCObj)
    //     ) {
    //         delete surfList[surfName];
    //         surfNameSet.delete(surfName);
    //     }
    // }
    console.log(constList);
    console.log(surfList);
    console.log(fenList);
    console.log("Done!");

    // if (scheduleLines.length < 2) return -1;
}


const settingsPanelContent = document.getElementById('SettingsPanelContent');

function changeZoneAll(visible) {
    for (const [zoneName, zoneProp] of Object.entries(zoneList)) {
        zoneProp.Visible = visible;
        document.getElementsByName(zoneName)[0].checked = visible;
    }
    updateModel();
}
function changeZoneVisibility(zoneCheckbox) {
    zoneList[zoneCheckbox.name].Visible = zoneCheckbox.checked;
    updateModel();
}

//? 투명도 설정
var transparencyOn = true;
function toggleOpacity(checkbox) {
    transparencyOn = checkbox.checked;
    updateModel();
}
//? 그림자 설정
var shadowOn = false;
function toggleShadow(checkbox) {
    shadowOn = checkbox.checked;
    renderer.shadowMap.enabled = shadowOn;
    lightShadow.castShadow = shadowOn;
    updateModel();
}
//? 디버그 설정
var debugOn = false;
function toggleDebug(checkbox) {
    debugOn = checkbox.checked;
    updateModel();
}
//? Shading 설정
var shadingOn = true;

function updateModel() {
    resetScene();
    renderModel();
}

function updateSettingsPanel() {

    settingsPanelContent.scrollTo(0, 0);
    
    // innerHTML = '<label><input type="checkbox" checked> Opacity</label>';
    innerHTML = '';

    //? General
    innerHTML += `
    <div class="settingsPanelBlock">
        <h5>General</h5>

        <label style="padding-right: 10px;"><input type="checkbox" onclick="toggleOpacity(this);"${transparencyOn ? ' checked' : ''}> Transparent materials</label>
        <label style="padding-right: 10px;"><input type="checkbox" onclick="toggleShadow(this);"${shadowOn ? ' checked' : ''}> Shadow <font color="color="#8f4242"><b>(experimental)</b></font></label>
        <label style="padding-right: 10px;"><input type="checkbox" onclick="toggleDebug(this);"${debugOn ? ' checked' : ''}> Debug</label>

    </div>
    `;

    //? Zone Visibility
    innerHTML += `
    <div class="settingsPanelBlock">
        <h5>Background</h5>

        <center>
            <button class="settingsPanelButton changeBackgroundColorBtn" onclick="changeBackgroundColor(0, this);">Black</button>
            <button class="settingsPanelButton changeBackgroundColorBtn changeBgColorBtnHighlighted" onclick="changeBackgroundColor(1, this);" disabled>White</button>
            <button class="settingsPanelButton changeBackgroundColorBtn" onclick="changeBackgroundColor(-1, this);">Transparent</button>
        </center>
    </div>
    `;

    //? Zone Visibility
    innerHTML += `
    <div class="settingsPanelBlock">
        <h5>Zone Visibility</h5>

        <center>
            <button class="settingsPanelButton" onclick="changeZoneAll(true);">Select all</button>
            <button class="settingsPanelButton" onclick="changeZoneAll(false);">Deselect all</button>
        </center>
    `;
    for (const [zoneName, zoneProp] of Object.entries(zoneList)) {
        innerHTML += `<label><input type="checkbox" name="${zoneName}" onclick="changeZoneVisibility(this);" checked> ${zoneName}</label>`;
    }
    innerHTML += '</div>';

    //? Materials
    innerHTML += `
    <div class="settingsPanelBlock">
        <h5>Materials</h5>

        <center>Coming Soon</center>
    </div>
    `;

    settingsPanelContent.innerHTML = innerHTML;

}


//! =========================== Render Model ========================== !//

const matEdge = new THREE.LineBasicMaterial({
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

function addModel() {
    resetScene();

    if (!camFixed) {
        resetCamera();

        // 모델에 맞게 카메라 위치 설정
        var center = [];
        var radius = 0;
        for (axis=0; axis<3; axis++) {
            center.push((boundary[0][axis] + boundary[1][axis]) / 2);
            radius += Math.pow(boundary[1][axis] - boundary[0][axis], 2);
        }
        bldgRadius = Math.sqrt(radius);
        camera.base = new THREE.Vector3(center[0], center[1], center[2]);
        camera.radius = bldgRadius * 1.5;
    }

    //? ShadowCatcher 생성
    // minZ = boundary[0][2] - 0.01;
    minZ = - 0.01;
    shadCatPadX = boundary[1][0] - boundary[0][0];
    shadCatPadY = boundary[1][1] - boundary[0][1];
    shadCatPad = Math.max(shadCatPadX, shadCatPadY);

    var shadowCatcherGeom = new THREE.BufferGeometry();
    shadowCatcherVerts = new Float32Array([
        boundary[0][0]-shadCatPadX, boundary[0][1]-shadCatPadY, minZ,
        boundary[1][0]+shadCatPadX, boundary[0][1]-shadCatPadY, minZ,
        boundary[1][0]+shadCatPadX, boundary[1][1]+shadCatPadY, minZ,
        boundary[0][0]-shadCatPadX, boundary[0][1]-shadCatPadY, minZ,
        boundary[1][0]+shadCatPadX, boundary[1][1]+shadCatPadY, minZ,
        boundary[0][0]-shadCatPadX, boundary[1][1]+shadCatPadY, minZ,
    ]);
    shadowCatcherGeom.setAttribute('position', new THREE.BufferAttribute(shadowCatcherVerts, 3));
    shadowCatcherGeom.computeVertexNormals();
    shadowCatcher = new THREE.Mesh(shadowCatcherGeom, shadowCatcherMat);
    shadowCatcher.receiveShadow = true;
    shadowCatcher.renderOrder = Infinity;
    shadowCatcher.translateZ(boundary[0][2]);

    // Shadow 조명 범위 설정
    lightShadow.shadow.camera = new THREE.OrthographicCamera(-shadCatPad, shadCatPad, shadCatPad, -shadCatPad, 0.5, 1000);

    //? axis object 생성
    var axisOffset = new THREE.Vector3(boundary[0][0]-bldgRadius*0.1, boundary[0][1]-bldgRadius*0.1, 0);
    axisXObject = axisXObjTemplate.clone();
    axisXObject.translateX(axisOffset.x);  axisXObject.translateY(axisOffset.y);
    axisYObject = axisYObjTemplate.clone();
    axisYObject.translateX(axisOffset.x);  axisYObject.translateY(axisOffset.y);
    axisZObject = axisZObjTemplate.clone();
    axisZObject.translateX(axisOffset.x);  axisZObject.translateY(axisOffset.y);
    axisTrueNorthObject = axisTrueNorthObjTemplate.clone();
    axisTrueNorthObject.translateX(axisOffset.x);  axisTrueNorthObject.translateY(axisOffset.y);
    axisTrueNorthObject.rotateZ(Math.radians(northAxis));

    //? Surface(Fenestration 제외) 테두리 및 면 생성
    for (const [surfName, surfProp] of Object.entries(surfList)) {

        //? Surface 면 생성
        const surfGeom = new THREE.BufferGeometry();

        var vertList = surfProp.Vertices;
        if (surfProp.Fenestrations.length > 0) {
            // 만약 surface에 창문이 있다면, 구멍을 추가
            var holes = [];
            surfProp.Fenestrations.forEach(fenName => {
                fen = fenList[fenName];
                holes.push(vertList.length);
                vertList = vertList.concat(fen.Vertices);
            });
        }
        else {
            var holes = null;
        }

        const vertSurf = new Float32Array(
            triangulateSurface(
                vertList,
                surfProp.SurfaceType == 'wall',
                holes
            ).flat()
        );
        surfGeom.setAttribute('position', new THREE.BufferAttribute(vertSurf, 3));
        surfGeom.computeVertexNormals();

        surfList[surfName].Geometries = surfGeom;

        //? Surface 테두리 생성
        var points = [];
        surfProp.Vertices.forEach(v => {
            points.push(new THREE.Vector3(v[0], v[1], v[2]));
        });
        points.push(points[0]);
        var edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
        surfList[surfName].EdgeObjects = new THREE.Line(edgeGeom, matEdge);

        //? Surface 그림자 생성용 geometry 생성
        if (surfList[surfName].MaximumZ > boundary[0][2]) {  // shadow catcher와 겹치지 않을 경우
            var surfShadGeom = new THREE.BufferGeometry();
            var vertSurfShad = new Float32Array(
                triangulateSurface(surfProp.Vertices, surfProp.SurfaceType == 'wall').flat()
            );  // 구멍 뚫리지 않은 surface
            surfShadGeom.setAttribute('position', new THREE.BufferAttribute(vertSurfShad, 3));
            surfShadGeom.computeVertexNormals();

            var surfShadObj = new THREE.Mesh(surfShadGeom, matGhost);
            surfShadObj.castShadow = true;
            surfShadObj.material.colorWrite = false;
            // surfShadObj.material.transparent = true; // only needed if there are other transparent objects
            surfShadObj.renderOrder = Infinity;

            surfList[surfName].ShadowObjects = surfShadObj;
        }
        else {
            surfList[surfName].ShadowObjects = null;
        }
    }
    //? Fenestration 테두리 및 면 생성
    for (const [fenName, fenProp] of Object.entries(fenList)) {

        //? Fenestration 면 생성
        const fenGeom = new THREE.BufferGeometry();
        const vertFen = new Float32Array(
            triangulateSurface(
                fenProp.Vertices,
                true,
            ).flat()
        );
        fenGeom.setAttribute('position', new THREE.BufferAttribute(vertFen, 3));
        fenGeom.computeVertexNormals();

        fenList[fenName].Geometries = fenGeom;
        
        //? Fenestration 테두리 생성
        var points = [];
        fenProp.Vertices.forEach(v => {
            points.push(new THREE.Vector3(v[0], v[1], v[2]));
        });
        points.push(points[0]);
        //? line으로 그릴 때
        var edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
        fenList[fenName].EdgeObjects = new THREE.Line(edgeGeom, matEdge);
        //? pipe로 그릴 때
        // var edgeGeom = 
    }
    //? Shading 테두리 및 면 생성
    for (const [shadeName, shadeProp] of Object.entries(shadeList)) {

        //? Shading 면 생성
        const shadeGeom = new THREE.BufferGeometry();
        const vertShade = new Float32Array(
            triangulateSurface(
                shadeProp.Vertices,
                true,
            ).flat()
        );
        shadeGeom.setAttribute('position', new THREE.BufferAttribute(vertShade, 3));
        shadeGeom.computeVertexNormals();

        shadeList[shadeName].Geometries = shadeGeom;
        
        //? Shading 테두리 생성
        var points = [];
        shadeProp.Vertices.forEach(v => {
            points.push(new THREE.Vector3(v[0], v[1], v[2]));
        });
        points.push(points[0]);
        //? line으로 그릴 때
        var edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
        shadeList[shadeName].EdgeObjects = new THREE.Line(edgeGeom, matEdge);
        //? pipe로 그릴 때
        // var edgeGeom = 
    }

    renderModel();
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
function add_white_color_rgb(color, alpha=0.5) {
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
function add_white_color_hex(color, alpha=0.5) {
    return rgbToHex(add_white_color_rgb(color, alpha));
}
function add_black_color_rgb(color, alpha=0.5) {
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
function add_black_color_hex(color, alpha=0.5) {
    return rgbToHex(add_black_color_rgb(color, alpha));
}


const matDefault = {
    'Adiabatic': new THREE.MeshPhongMaterial({color: '#f24b91', side: THREE.DoubleSide, opacity: 0.8}),
    'Roof': new THREE.MeshPhongMaterial({color: '#a82525', side: THREE.DoubleSide, opacity: 0.5}),
    'OuterWall': new THREE.MeshLambertMaterial({color: '#ffe16b', side: THREE.DoubleSide}),
    'InnerSurf': new THREE.MeshPhongMaterial({color: '#444444', side: THREE.DoubleSide, opacity: 0.5}),
    'Window': new THREE.MeshPhongMaterial({color: '#00eaff', side: THREE.DoubleSide, opacity: 0.3}),
    'Door': new THREE.MeshPhongMaterial({color: '#1747d4', side: THREE.DoubleSide, opacity: 0.5}),
    'Shading': new THREE.MeshPhongMaterial({color: '#624285', side: THREE.DoubleSide, opacity: 0.7}),
    'Ground': new THREE.MeshLambertMaterial({color: '#555555', side: THREE.DoubleSide}),
}
for (var mat in matDefault) {
    if (matDefault[mat].opacity < 1) {
        matDefault[mat].transparent = true;
    }
}



function renderModel() {

    //TODO 저장된 테두리 모델 불러와서 렌더링

    // 그림자 받을 평면
    if (shadowOn) {
        // var shadowCatcher = new THREE.Mesh(shadowCatcherGeom, new THREE.MeshPhongMaterial({color: '#f24b91'}));
        scene.add(shadowCatcher);

        /*
        const geometry = new THREE.SphereGeometry( 3, 32, 16 );
        const sphere = new THREE.Mesh( geometry, matDev ); scene.add( sphere );
        sphere.translateZ(3);
        sphere.castShadow = true;
        */
    }

    // Surface 렌더링
    for (const [surfName, surfProp] of Object.entries(surfList)) {

        zoneName = surfProp.ZoneName;
        if (!zoneList[zoneName].Visible) continue;

        surfGeom = surfProp.Geometries;  // 면 geometry 불러옴

        // 면 재질 설정
        var matSurf = matDefault.InnerSurf;
        switch (surfProp.OutsideBC) {
            case 'outdoors':

                switch (surfProp.SurfaceType) {
                    case 'wall':
                        matSurf = matDefault.OuterWall;
                        break;
                    case 'roof':
                        matSurf = matDefault.Roof;
                        break;
                }
                
                break;

            case 'adiabatic':
                matSurf = matDefault.Adiabatic;
                break;

            case 'ground':
                matSurf = matDefault.Ground;
                break;
        
            default:
                break;
        }
        if (surfName.toLowerCase() == surfProp.OutsideBCObj.toLowerCase()) {
            matSurf = matDefault.Adiabatic;
        }
        /*
        if (surfName.startsWith('front_pv')) {
            matSurf = new THREE.MeshLambertMaterial({color: '#163aba', side: THREE.DoubleSide})
        }
        if (surfName.endsWith('iues3') || surfName.endsWith('iues4')) {
            matSurf = new THREE.MeshLambertMaterial({color: '#8f8f8f', side: THREE.DoubleSide})
        }
        */
        matSurf = matSurf.clone();
        if (!transparencyOn) {
            if (matSurf.opacity < 1) {
                // matSurf.color = add_black_color_rgb(matSurf.color, matSurf.opacity);
                matSurf.color = add_white_color_rgb(
                    add_black_color_hex(matSurf.color, matSurf.opacity),
                    1-(1-matSurf.opacity)/2.5
                );
                matSurf.opacity = 1;
            }
            matSurf.transparent = false;
        }
        const surfMesh = new THREE.Mesh(surfGeom, matSurf)
        scene.add(surfMesh);  //!!!!!

        /*
        TODO
        surfMesh.layers.enableAll();
        const earthDiv = document.createElement('div');
        earthDiv.className = 'label';
        earthDiv.textContent = 'Earth';
        earthDiv.style.backgroundColor = 'transparent';
        const earthLabel = new CSS2DObject(earthDiv);
        earthLabel.position.set(0, 0, 0 );
        // earthLabel.center.set(0, 0);
        earthLabel.layers.set(0);
        surfMesh.add(earthLabel);
        */

        // if (surfProp.SurfaceType != 'roof' && surfProp.SurfaceType != 'floor' && surfProp.SurfaceType != 'ceiling') {
        //     scene.add(surfProp.EdgeObjects);
        // }
        scene.add(surfProp.EdgeObjects);

        if (shadowOn && surfProp.ShadowObjects != null) scene.add(surfProp.ShadowObjects);
    }

    // Fenestration 렌더링 
    for (const [fenName, fenProp] of Object.entries(fenList)) {
        zoneName = surfList[fenProp.SurfaceName].ZoneName;
        if (!zoneList[zoneName].Visible) continue;

        fenGeom = fenProp.Geometries;

        var matFen = matDefault.Window;
        switch (fenProp.SurfaceType) {
            case 'door':
                matFen = matDefault.Door;
                break;
        }

        matFen = matFen.clone();
        if (!transparencyOn) {
            if (matFen.opacity < 1) {
                // matFen.color = add_black_color_rgb(matFen.color, matFen.opacity);
                // matFen.color = add_white_color_rgb(matFen.color, matFen.opacity);
                matFen.color = add_white_color_rgb(
                    add_black_color_hex(matFen.color, matFen.opacity),
                    1-(1-matFen.opacity)/2.2
                );
                matFen.opacity = 1;
            }
            matFen.transparent = false;
        }
        scene.add(new THREE.Mesh(fenGeom, matFen));  //!!!!!

        scene.add(fenProp.EdgeObjects);
    }

    // Shading 렌더링
    if (shadingOn) {
        for (const [shadeName, shadeProp] of Object.entries(shadeList)) {

            shadeGeom = shadeProp.Geometries;

            var matShade = matDefault.Shading;
            switch (shadeProp.SurfaceType) {
                case 'door':
                    matShade = matDefault.Door;
                    break;
            }

            matShade = matShade.clone();
            if (!transparencyOn) {
                if (matShade.opacity < 1) {
                    // matShade.color = add_black_color_rgb(matShade.color, matShade.opacity);
                    // matShade.color = add_white_color_rgb(matShade.color, matShade.opacity);
                    matShade.color = add_white_color_rgb(
                        add_black_color_hex(matShade.color, matShade.opacity),
                        1-(1-matShade.opacity)/2.2
                    );
                    matShade.opacity = 1;
                }
                matShade.transparent = false;
            }
            scene.add(new THREE.Mesh(shadeGeom, matShade));  //!!!!!

            scene.add(shadeProp.EdgeObjects);
        }
    }

    if (debugOn) {
        scene.add(axisXObject);
        scene.add(axisYObject);
        scene.add(axisZObject);
        scene.add(axisTrueNorthObject);
    }

    // scene.add(new THREE.CameraHelper(lightShadow.shadow.camera));

    updateCamera();
}

/*
TODO
축척
방위 표시
선 굵기
*/


//! ========================= Background color ======================== !//

function changeBackgroundColor(color=-1, eventBtn=null) {
    Array.from(document.getElementsByClassName('changeBackgroundColorBtn')).forEach((btn) => {
        btn.classList.remove('changeBgColorBtnHighlighted');
        btn.disabled = false;
    });
    eventBtn.classList.add('changeBgColorBtnHighlighted');
    eventBtn.disabled = true;
    switch (color) {
        case -1:
            // transparent
            CanvasContainer.style.backgroundColor = '';
            console.log('Background changed to "transparent"');
            break;
        case 0:
            // black
            CanvasContainer.style.backgroundColor = 'black';
            console.log('Background changed to "black"');
            break;
        case 1:
            //white
            CanvasContainer.style.backgroundColor = 'white';
            console.log('Background changed to "white"');
            break;
    }
}



//! ============================= Command ============================= !//

const commandListener = document.getElementById('CommandListener');
commandListenerVisibility(0);

function commandListenerVisibility(toggle=0) {
    switch (toggle){
        case 0:
            // 닫을 때
            commandListener.style.visibility = 'hidden';
            commandListener.style.opacity = 0;
            commandListener.classList.remove('fadein');
            commandListener.classList.add('fadeout');
            break;
        case 1:
            // 열 때
            commandListener.innerHTML = '';
            commandListener.style.visibility = 'visible';
            commandListener.style.opacity = 1;
            commandListener.classList.remove('fadeout');
            commandListener.classList.add('fadein');
            commandListener.classList.remove('CommandFail');
            commandListener.classList.remove('CommandSuccess');
    }
}
var lastCommand = ''
function runCommand(command='') {
    lastCommand = command;
    commandListener.classList.add('CommandSuccess');
    switch (command) {
        case 'test':
            console.log('TEST!');
            break;
        default:
            if (!command.includes(' ')) {
                lastCommand = ''
                commandListener.classList.remove('CommandSuccess');
                commandListener.classList.add('CommandFail');
                return
            }
            log = command.match(/(\S+)\s+(\S+)/)
            commandName = log[1];
            commandVal = log[2];
            lastCommand = commandName;
            switch (commandName) {
                case 'test':
                    console.log('TEST! -', commandVal);
                    break;
                case 'shadowalt':
                    commandVal = parseFloat(commandVal);
                    shadowOffset[0] = commandVal;
                    updateCamera();
                    break;
                case 'shadowazm':
                    commandVal = parseFloat(commandVal);
                    shadowOffset[1] = commandVal;
                    updateCamera();
                    break;
                case 'shadowmapsize':
                    commandVal = parseInt(commandVal);
                    lightShadow.shadow.mapSize.width = commandVal;
                    lightShadow.shadow.mapSize.height = commandVal;
                    lightShadow.shadow.map.dispose();
                    lightShadow.shadow.map = null;
                    updateCamera();
                    break;
                case 'shadowradius':
                    commandVal = parseFloat(commandVal);
                    lightShadow.shadow.radius = commandVal;
                    lightShadow.shadow.map.dispose();
                    lightShadow.shadow.map = null;
                    updateCamera();
                    break;
                case 'shadowheight':
                    commandVal = parseFloat(commandVal);
                    shadowCatcher.translateZ(commandVal - shadowCatcher.position.z);
                    updateCamera();
                    break;
                default:
                    lastCommand = ''
                    commandListener.classList.remove('CommandSuccess');
                    commandListener.classList.add('CommandFail');
                    return
            }
            break;
    }
}

