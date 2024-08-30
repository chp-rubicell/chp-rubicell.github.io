var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(a){var c=0;return function(){return c<a.length?{done:!1,value:a[c++]}:{done:!0}}};$jscomp.arrayIterator=function(a){return{next:$jscomp.arrayIteratorImpl(a)}};$jscomp.makeIterator=function(a){var c="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return c?c.call(a):$jscomp.arrayIterator(a)};$jscomp.arrayFromIterator=function(a){for(var c,d=[];!(c=a.next()).done;)d.push(c.value);return d};
$jscomp.arrayFromIterable=function(a){return a instanceof Array?a:$jscomp.arrayFromIterator($jscomp.makeIterator(a))};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,c,d){a!=Array.prototype&&a!=Object.prototype&&(a[c]=d.value)};
$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,c,d,e){if(c){d=$jscomp.global;a=a.split(".");for(e=0;e<a.length-1;e++){var f=a[e];f in d||(d[f]={});d=d[f]}a=a[a.length-1];e=d[a];c=c(e);c!=e&&null!=c&&$jscomp.defineProperty(d,a,{configurable:!0,writable:!0,value:c})}};
$jscomp.polyfill("Math.sign",function(a){return a?a:function(a){a=Number(a);return 0===a||isNaN(a)?a:0<a?1:-1}},"es6","es3");$jscomp.polyfill("Array.prototype.flat",function(a){return a?a:function(a){a=void 0===a?1:a;for(var c=[],e=0;e<this.length;e++){var f=this[e];Array.isArray(f)&&0<a?(f=Array.prototype.flat.call(f,a-1),c.push.apply(c,f)):c.push(f)}return c}},"es9","es5");
$jscomp.checkStringArgs=function(a,c,d){if(null==a)throw new TypeError("The 'this' value for String.prototype."+d+" must not be null or undefined");if(c instanceof RegExp)throw new TypeError("First argument to String.prototype."+d+" must not be a regular expression");return a+""};
$jscomp.polyfill("String.prototype.endsWith",function(a){return a?a:function(a,d){var c=$jscomp.checkStringArgs(this,a,"endsWith");a+="";void 0===d&&(d=c.length);d=Math.max(0,Math.min(d|0,c.length));for(var f=a.length;0<f&&0<d;)if(c[--d]!=a[--f])return!1;return 0>=f}},"es6","es3");
$jscomp.polyfill("String.prototype.startsWith",function(a){return a?a:function(a,d){var c=$jscomp.checkStringArgs(this,a,"startsWith");a+="";var f=c.length,l=a.length;d=Math.max(0,Math.min(d|0,c.length));for(var h=0;h<l&&d<f;)if(c[d++]!=a[h++])return!1;return h>=l}},"es6","es3");$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};
$jscomp.SymbolClass=function(a,c){this.$jscomp$symbol$id_=a;$jscomp.defineProperty(this,"description",{configurable:!0,writable:!0,value:c})};$jscomp.SymbolClass.prototype.toString=function(){return this.$jscomp$symbol$id_};$jscomp.Symbol=function(){function a(d){if(this instanceof a)throw new TypeError("Symbol is not a constructor");return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX+(d||"")+"_"+c++,d)}var c=0;return a}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("Symbol.iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))}});$jscomp.initSymbolIterator=function(){}};
$jscomp.initSymbolAsyncIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.asyncIterator;a||(a=$jscomp.global.Symbol.asyncIterator=$jscomp.global.Symbol("Symbol.asyncIterator"));$jscomp.initSymbolAsyncIterator=function(){}};$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};
$jscomp.iteratorFromArray=function(a,c){$jscomp.initSymbolIterator();a instanceof String&&(a+="");var d=0,e={next:function(){if(d<a.length){var f=d++;return{value:c(f,a[f]),done:!1}}e.next=function(){return{done:!0,value:void 0}};return e.next()}};e[Symbol.iterator]=function(){return e};return e};$jscomp.polyfill("Array.prototype.keys",function(a){return a?a:function(){return $jscomp.iteratorFromArray(this,function(a){return a})}},"es6","es3");
$jscomp.owns=function(a,c){return Object.prototype.hasOwnProperty.call(a,c)};$jscomp.polyfill("Object.entries",function(a){return a?a:function(a){var c=[],e;for(e in a)$jscomp.owns(a,e)&&c.push([e,a[e]]);return c}},"es8","es3");
$jscomp.polyfill("Object.fromEntries",function(a){return a?a:function(a){var c={};$jscomp.initSymbolIterator();if(!(Symbol.iterator in a))throw new TypeError(""+a+" is not iterable");a=a[Symbol.iterator].call(a);for(var e=a.next();!e.done;e=a.next()){e=e.value;if(Object(e)!==e)throw new TypeError("iterable for fromEntries should yield objects");c[e[0]]=e[1]}return c}},"es_2019","es3");
$jscomp.polyfill("Object.is",function(a){return a?a:function(a,d){return a===d?0!==a||1/a===1/d:a!==a&&d!==d}},"es6","es3");$jscomp.polyfill("Array.prototype.includes",function(a){return a?a:function(a,d){var c=this;c instanceof String&&(c=String(c));var f=c.length;d=d||0;for(0>d&&(d=Math.max(d+f,0));d<f;d++){var l=c[d];if(l===a||Object.is(l,a))return!0}return!1}},"es7","es3");
$jscomp.polyfill("String.prototype.includes",function(a){return a?a:function(a,d){return-1!==$jscomp.checkStringArgs(this,a,"includes").indexOf(a,d||0)}},"es6","es3");
$jscomp.polyfill("Array.from",function(a){return a?a:function(a,d,e){d=null!=d?d:function(a){return a};var c=[],l="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];if("function"==typeof l){a=l.call(a);for(var h=0;!(l=a.next()).done;)c.push(d.call(e,l.value,h++))}else for(l=a.length,h=0;h<l;h++)c.push(d.call(e,a[h],h));return c}},"es6","es3");Math.radians=function(a){return a*Math.PI/180};Math.degrees=function(a){return 180*a/Math.PI};
var clamp=function(a,c,d){return Math.min(Math.max(a,c),d)},THRESHOLD=1E-4,scene=new THREE.Scene;scene.background=null;var camera=new THREE.PerspectiveCamera(fov=30,aspect=canvWidth/canvHeight,near=.1,far=1E3);camera.up=new THREE.Vector3(0,0,1);var lightDirect=new THREE.DirectionalLight(15658734,.6),lightDirectTarget=new THREE.Object3D,lightAmbient=new THREE.AmbientLight(8947848),lightShadow=new THREE.DirectionalLight(15658734,0);lightShadow.shadow.mapSize.width=1024;
lightShadow.shadow.mapSize.height=1024;var lightShadowTarget=new THREE.Object3D,DEV=!1,matDev=new THREE.MeshPhongMaterial({color:16776960}),geomDev=new THREE.SphereGeometry(3,8,4),objDev=new THREE.Mesh(geomDev,matDev),renderer=new THREE.WebGLRenderer({alpha:!0,antialias:!0,preserveDrawingBuffer:!0});renderer.setClearColor(16777215,0);renderer.setSize(canvWidth,canvHeight);renderer.domElement.id="CanvasRenderer";document.getElementById("CanvasContainer").appendChild(renderer.domElement);
renderer.domElement.style.width="100%";renderer.domElement.style.height="100%";var CanvasRenderer=renderer.domElement;function exportImage(){console.log("exporting image...");var a=CanvasRenderer.toDataURL("image/png").replace("image/png","image/octet-stream"),c=document.createElement("a");c.setAttribute("href",a);c.setAttribute("download",idfName+".png");document.body.appendChild(c);c.click();c.remove()}
function polarCoord(a,c){a=Math.radians(a);c=Math.radians(-c-90);return new THREE.Vector3(Math.cos(a)*Math.cos(c),Math.cos(a)*Math.sin(c),Math.sin(a))}var maxZoom=950,shadowOffset=[45,90];
function updateCamera(){camera.alt=clamp(camera.alt,-90,90);camera.radius=clamp(camera.radius,1,maxZoom);camera.azm%=360;var a=camera.azm;camStepped&&(a=45*Math.round(camera.azm/45));camera.position.copy(polarCoord(camera.alt,a).multiplyScalar(camera.radius).add(camera.base));camera.lookAt(camera.base);90==Math.abs(camera.alt)&&(camera.rotation.z=Math.radians(-Math.sign(camera.alt)*a));lightDirect.position.copy(polarCoord(camera.alt,a+45).add(camera.base));lightDirectTarget.position.copy(camera.base);
lightShadow.position.copy(polarCoord(shadowOffset[0],a+shadowOffset[1]).multiplyScalar(camera.radius).add(camera.base));lightShadowTarget.position.copy(camera.base);objDev.position.copy(polarCoord(45,a+90).multiplyScalar(10).add(camera.base));renderer.render(scene,camera)}var clickable=!1,mouseLeft=!1,mouseMiddle=!1,shiftKey=!1,camStepped=!1,camFixed=!1,commandOn=!1,pressedKeys={};CanvasContainer.ondragstart=function(){return!1};
function customOnMouseMove(a){a=a||window.event;newX=a.pageX;newY=a.pageY;dX=newX-startX;dY=newY-startY;mouseLeft?(camera.azm+=dX/panelWidth*180,camera.alt+=dY/panelHeight*180):mouseMiddle&&(a=Math.radians(-camera.azm-90-90),a=(new THREE.Vector3(Math.cos(a),Math.sin(a),0)).multiplyScalar(dX/panelWidth*10),camera.base.add(new THREE.Vector3(a.x,a.y,dY/panelHeight*10*Math.cos(Math.radians(camera.alt)))));updateCamera();startX=newX;startY=newY}
CanvasContainer.onmousedown=function(a){a=a||window.event;clickable&&(startX=a.pageX,startY=a.pageY,0==a.button&&(mouseLeft=!0,mouseMiddle=!1),1==a.button&&(mouseMiddle=!0,mouseLeft=!1),document.addEventListener("mousemove",customOnMouseMove),document.onmouseup=function(a){mouseMiddle=mouseLeft=!1;camStepped&&(camera.azm=45*Math.round(camera.azm/45));document.removeEventListener("mousemove",customOnMouseMove)})};
document.addEventListener("onmouseleave",function(){document.removeEventListener("mousemove",customOnMouseMove)});CanvasContainer.onwheel=function(a){clickable&&(camera.radius-=a.wheelDeltaY/100*clamp(Math.pow(camera.radius/50,1.2),1,Infinity),updateCamera())};document.getElementById("PageWrapper").onwheel=function(a){a=a||window.event;if("CanvasRenderer"==a.target.id&&clickable)return!1};
document.getElementById("PageWrapper").onmousedown=function(a){a=a||window.event;if(1==a.button&&"CanvasRenderer"==a.target.id)return!1};var raycaster=new THREE.Raycaster;raycaster.layers.set(1);
var pointer=new THREE.Vector2,objectDisplay=document.getElementById("objectDisplay"),lastHighlightedObj=null,lastHighlightedObjMat=null,matHighlighted=new THREE.MeshPhongMaterial({color:"#ff0000",side:THREE.DoubleSide,opacity:.7,transparent:!0}),highlightedObjDisplayText="",lastSelectedObj=null,lastSelectedObjMat=null,matSelected=new THREE.MeshPhongMaterial({color:"#ff0000",side:THREE.DoubleSide,opacity:.8,transparent:!0}),selectedObjDisplayText="";
function objectHighlight(a){var c=a.target.getBoundingClientRect(),d=a.pageY-c.top;a=2*clamp((a.pageX-c.left)/mainPanelWidth,0,1)-1;d=2*-clamp(d/mainPanelHeight,0,1)+1;pointer.x=a;pointer.y=d;raycaster.setFromCamera(pointer,camera);d=raycaster.intersectObjects(scene.children);null!==lastHighlightedObj&&(lastHighlightedObj.material=lastHighlightedObjMat,null!==lastSelectedObj&&(lastSelectedObj.material=matSelected));if(0==d.length)objectDisplay.innerHTML="";else{lastHighlightedObj=obj=d[0].object;
lastHighlightedObjMat=obj.material.clone();obj.material=matHighlighted;selectedObjName=d=obj.sourceObjName;a=obj.sourceObjType;var e="<b>[Name]</b> "+d;switch(a){case "surface":c=surfList[d];void 0!==c.OutsideBCObj&&""!=c.OutsideBCObj&&(e+=" ("+c.OutsideBCObj.toLowerCase()+")");e+="<br><b>[Type]</b> "+a+" ("+c.SurfaceType+")";e+="<br><b>[Construction]</b> "+c.Construction;e+="<br><b>[Zone]</b> "+c.ZoneName;e+="<br>  \u2514\u2500<b>[Surface]</b> "+d;break;case "fenestration":c=fenList[d];void 0!==
c.OutsideBCObj&&""!=c.OutsideBCObj&&(e+=" ("+c.OutsideBCObj.toLowerCase()+")");e+="<br><b>[Type]</b> "+a+" ("+c.SurfaceType+")";e+="<br><b>[Construction]</b> "+c.Construction;e+="<br><b>[Zone]</b> "+surfList[c.SurfaceName].ZoneName;e+="<br>  \u2514\u2500<b>[Surface]</b> "+c.SurfaceName;e+="<br>     \u2514\u2500<b>[Fenestration]</b> "+d;break;case "shading":e+="<br><b>[Type]</b> "+a}e=e.replaceAll(" ","&nbsp;");highlightedObjDisplayText=objectDisplay.innerHTML=e}updateCamera()}
CanvasRenderer.addEventListener("pointerleave",function(){null!==lastHighlightedObj&&(lastHighlightedObj.material=lastHighlightedObjMat,updateCamera());objectDisplay.innerHTML=""});document.onkeydown=function(a){a.shiftKey&&(shiftKey=!0);mouseLeft&&a.shiftKey&&(camStepped=!0,updateCamera());"s"!=a.key||""===idfName||commandOn||exportImage()};var nonCommandKey="Shift Alt Control Enter Escape Tab CapsLock ContextMenu".split(" ");
document.onkeyup=function(a){commandOn&&!a.metaKey&&("ArrowUp"==a.key&&""!=lastCommand&&(commandListener.innerHTML=lastCommand),1==a.key.length&&(commandListener.innerHTML+=a.key.toLowerCase()));switch(a.key){case "Shift":camStepped=shiftKey=!1;updateCamera();break;case "/":commandOn||(commandOn=!0,commandListenerVisibility(1));break;case "Enter":commandOn&&(commandOn=!1,commandListenerVisibility(0),runCommand(commandListener.innerHTML));break;case "Escape":commandPanelVisibility(-1);commandOn?(commandOn=
!1,commandListenerVisibility(0)):""==idfName?settingsPanelVisibility(-1):settingsPanelVisibility(0);break;case "Backspace":commandOn&&(commandListener.innerHTML=commandListener.innerHTML.slice(0,-1))}};function resetCamera(){camera.base=new THREE.Vector3(0,0,0);camera.alt=20;camera.azm=-30;camera.radius=10;updateCamera()}resetCamera();
function resetScene(){scene.remove.apply(scene,scene.children);scene.add(lightDirect);scene.add(lightDirectTarget);lightDirect.target=lightDirectTarget;scene.add(lightAmbient);scene.add(lightShadow);scene.add(lightShadowTarget);lightShadow.target=lightShadowTarget;DEV&&scene.add(objDev)}resetScene();function triangulateSurfacefromFlatVertlist(a,c){c=void 0===c?null:c;var d=[];earcut(a.flat(),c,3).forEach(function(c){d.push(a[c])});return d}
function triangulatedSurfacefromVertlist(a,c){c=void 0===c?null:c;new THREE.Vector3(1,0,0);var d=new THREE.Vector3(0,0,1),e=new THREE.Vector3,f=new (Function.prototype.bind.apply(THREE.Vector3,[null].concat($jscomp.arrayFromIterable(a[0])))),l=new (Function.prototype.bind.apply(THREE.Vector3,[null].concat($jscomp.arrayFromIterable(a[1]))));l=(new THREE.Vector3).subVectors(l,f);for(var h=2;h<a.length&&!(e=new (Function.prototype.bind.apply(THREE.Vector3,[null].concat($jscomp.arrayFromIterable(a[h])))),
e=(new THREE.Vector3).subVectors(e,f),e=(new THREE.Vector3).crossVectors(e,l),e.length()>THRESHOLD);h++);f=new THREE.BufferGeometry;e.normalize();if((new THREE.Vector3).crossVectors(e,d).length()<THRESHOLD)a=new Float32Array(triangulateSurfacefromFlatVertlist(a,c).flat()),f.setAttribute("position",new THREE.BufferAttribute(a,3));else{var n=new THREE.Quaternion;n.setFromUnitVectors(e,d);var q=[];a.forEach(function(a){vec=new (Function.prototype.bind.apply(THREE.Vector3,[null].concat($jscomp.arrayFromIterable(a))));
vec.applyQuaternion(n);q.push([vec.x,vec.y,vec.z])});a=new Float32Array(triangulateSurfacefromFlatVertlist(q,c).flat());f.setAttribute("position",new THREE.BufferAttribute(a,3));n.invert();f.applyQuaternion(n)}f.computeVertexNormals();return f}var idfName="",northAxis=0,boundary=[],bldgRadius=0,zoneList=[],constList=[],surfList={},fenList={},shadeList={},geometryList={},shadowCatcher=null,savedMeshEdges=[];
function readFile(a){0<a.length&&(idfFile=a[0],idfFile.name.endsWith(".idf")?(idfName=idfFile.name.slice(0,-4),reader.readAsText(idfFile,"utf-8")):window.alert("Not an idf file!"))}
function loadFile(a){CanvasRenderer.removeEventListener("pointermove",objectHighlight);settingsPanelVisibility(0);commandPanelVisibility(0);transparencyOn=!0;debugOn=!1;lastHighlightedObjMat=lastHighlightedObj=null;parseIDF(a);fileSelectorTag.innerHTML=""==idfName?"":idfName+".idf";updateSettingsPanel();addModel();CanvasRenderer.addEventListener("pointermove",objectHighlight)}var reader=new FileReader;reader.onload=function(){loadFile(reader.result)};
var fileSelector=document.getElementById("fileSelector"),fileSelectorTag=document.getElementById("fileSelectorTag");fileSelector.addEventListener("change",function(a){readFile(a.target.files)});document.body.addEventListener("drop",function(a){a.stopPropagation();a.preventDefault();clickable=!0;fileHoverMask.style.display="none";fileHover.style.display="none";readFile(a.dataTransfer.files)});
var fileHoverMask=document.getElementById("fileHoverMask"),fileHover=document.getElementById("fileHover"),fileHoverText=document.getElementById("fileHoverText");
document.body.addEventListener("dragover",function(a){a.stopPropagation();a.preventDefault();a.dataTransfer.dropEffect="copy";clickable=!1;fileHoverMask.style.display="block";fileHover.style.display="block";a.shiftKey?(camFixed=!0,fileHoverText.style.textShadow="#fff 0 0 10px, #ffe880 0 0 20px, #000 0 0 30px"):(camFixed=!1,fileHoverText.style.textShadow="#fff 0 0 10px, #80daff 0 0 20px, #000 0 0 30px")});
fileHoverMask.addEventListener("dragleave",function(a){camFixed=!1;clickable=!0;fileHoverMask.style.display="none";fileHover.style.display="none"});
function parseIDF(a){northAxis=0;boundary=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];bldgRadius=0;zoneList={};constList=[];surfList={};fenList={};shadeList={};geometryList={Opaque:[],Transparent:[],Edge:[]};shadowCatcher=null;if(0>=a.length)return-1;a=a.replace(/!.*\s*/g,"");a=a.replace(/,\s*/g,",").replace(/;\s*/g,";").trim();a=a.split(";");iddInfo=iddInfoLibrary=null;for(var c=0;c<a.length;c++){var d=a[c];if(d.toLowerCase().startsWith("version")){d=d.split(",")[1].split(".");
console.log(d);v=[parseInt(d[0]),parseInt(d[1])];versionCode=v[0]+"_"+v[1]+"_0";versionCode in versionLibrary||(versionCode=7>=v[0]?"7_2_0":Object.keys(versionLibrary)[Object.keys(versionLibrary).length-1]);console.log(versionCode+".idd used.");break}}iddInfoLibrary=versionLibrary[versionCode];console.log(iddInfoLibrary);for(c=0;c<a.length;c++)if(d=a[c],d.toLowerCase().startsWith("building")){northAxis=parseFloat(d.split(",")[2]);break}a.forEach(function(a){if(a.toLowerCase().startsWith("zone")||
a.toLowerCase().startsWith("construction")){a=a.split(",");var c=a[1];switch(a[0].toLowerCase()){case "zone":iddInfo=iddInfoLibrary.zone;c in zoneList||(zoneList[c]={Surfaces:[],Origin:[Number(a[iddInfo.indexOf("x origin")]),Number(a[iddInfo.indexOf("y origin")]),Number(a[iddInfo.indexOf("z origin")])],NDirection:[],Visible:!0});break;case "construction":constList.push(c)}}});alerted=!1;a.forEach(function(a){if(a.toLowerCase().startsWith("wall,")||a.toLowerCase().startsWith("wall:")||a.toLowerCase().startsWith("window,")||
a.toLowerCase().startsWith("window:"))alerted||(alerted=!0,idfName="",settingsPanelVisibility(-1),window.alert('Currently only supports idf files using "BuildingSurface:Detailed".'));else if(a.toLowerCase().startsWith("buildingsurface:detailed")||a.toLowerCase().startsWith("fenestrationsurface:detailed")||a.toLowerCase().startsWith("shading:building:detailed")){a=a.split(",");var c=a[1].toLowerCase();switch(a[0].toLowerCase()){case "buildingsurface:detailed":iddInfo=iddInfoLibrary["buildingsurface:detailed"];
zoneName=a[iddInfo.indexOf("zone name")];zoneCoord=zoneList[zoneName].Origin;for(var d=iddInfo.indexOf("vertex 1 x-coordinate"),e=parseInt((a.length-d)/3),n=[],q=-Infinity,p=0;p<e;p++){for(var t=[],k=0;3>k;k++){coordRelative=Number(a[d+3*p+k]);var m=zoneCoord[k]+coordRelative;m<boundary[0][k]&&(boundary[0][k]=m);m>boundary[1][k]&&(boundary[1][k]=m);t.push(m);2==k&&q<m&&(q=m)}n.push(t)}d=[];c in surfList&&(d=surfList[c].Fenestrations);surfList[c]={SurfaceType:a[iddInfo.indexOf("surface type")].toLowerCase(),
Construction:a[iddInfo.indexOf("construction name")],ZoneName:zoneName,OutsideBC:a[iddInfo.indexOf("outside boundary condition")].toLowerCase(),OutsideBCObj:a[iddInfo.indexOf("outside boundary condition object")],VerticeNumber:e,Vertices:n,Fenestrations:d,MaximumZ:q};zoneList[zoneName].Surfaces.push(c);break;case "fenestrationsurface:detailed":iddInfo=iddInfoLibrary["fenestrationsurface:detailed"];surfName=a[iddInfo.indexOf("building surface name")].toLowerCase();zoneName=surfList[surfName].ZoneName;
zoneCoord=zoneList[zoneName].Origin;d=iddInfo.indexOf("vertex 1 x-coordinate");e=parseInt((a.length-d)/3);n=[];for(p=0;p<e;p++){t=[];for(k=0;3>k;k++)coordRelative=Number(a[d+3*p+k]),m=zoneCoord[k]+coordRelative,m<boundary[0][k]&&(boundary[0][k]=m),m>boundary[1][k]&&(boundary[1][k]=m),t.push(m);n.push(t)}fenList[c]={SurfaceType:a[iddInfo.indexOf("surface type")].toLowerCase(),Construction:a[iddInfo.indexOf("construction name")],SurfaceName:surfName,OutsideBCObj:a[iddInfo.indexOf("outside boundary condition object")],
VerticeNumber:e,Vertices:n};surfName in surfList?surfList[surfName].Fenestrations.push(c):surfList[surfName]={Fenestrations:[c]};break;case "shading:building:detailed":iddInfo=iddInfoLibrary["shading:building:detailed"];d=iddInfo.indexOf("vertex 1 x-coordinate");e=parseInt((a.length-d)/3);n=[];q=-Infinity;for(p=0;p<e;p++){t=[];for(k=0;3>k;k++)m=Number(a[d+3*p+k]),m<boundary[0][k]&&(boundary[0][k]=m),m>boundary[1][k]&&(boundary[1][k]=m),t.push(m),2==k&&q<m&&(q=m);n.push(t)}shadeList[c]={VerticeNumber:e,
Vertices:n}}}});console.log(constList);console.log(surfList);console.log(fenList);console.log("Done!")}var settingsPanelContent=document.getElementById("SettingsPanelContent");function changeZoneAll(a){for(var c=$jscomp.makeIterator(Object.entries(zoneList)),d=c.next();!d.done;d=c.next()){d=$jscomp.makeIterator(d.value);var e=d.next().value;d.next().value.Visible=a;document.getElementsByName(e)[0].checked=a}updateModel()}
function changeZoneVisibility(a){zoneList[a.name].Visible=a.checked;updateModel()}var transparencyOn=!0;function toggleOpacity(a){transparencyOn=a.checked;updateModel()}var shadowOn=!1;function toggleShadow(a){shadowOn=a.checked;renderer.shadowMap.enabled=shadowOn;lightShadow.castShadow=shadowOn;updateModel()}var debugOn=!1;function toggleDebug(a){debugOn=a.checked;updateModel()}var shadingOn=!0;function updateModel(){resetScene();renderModel()}
function updateSettingsPanel(){settingsPanelContent.scrollTo(0,0);innerHTML="";innerHTML+='\n    <div class="settingsPanelBlock">\n        <h5>General</h5>\n\n        <label style="padding-right: 10px;"><input type="checkbox" onclick="toggleOpacity(this);"'+(transparencyOn?" checked":"")+'> Transparent materials</label>\n        <label style="padding-right: 10px;"><input type="checkbox" onclick="toggleShadow(this);"'+(shadowOn?" checked":"")+'> Shadow <font color="color="#8f4242"><b>(experimental)</b></font></label>\n        <label style="padding-right: 10px;"><input type="checkbox" onclick="toggleDebug(this);"'+
(debugOn?" checked":"")+"> Debug</label>\n\n    </div>\n    ";innerHTML+='\n    <div class="settingsPanelBlock">\n        <h5>Background</h5>\n\n        <center>\n            <button class="settingsPanelButton changeBackgroundColorBtn" onclick="changeBackgroundColor(0, this);">Black</button>\n            <button class="settingsPanelButton changeBackgroundColorBtn changeBgColorBtnHighlighted" onclick="changeBackgroundColor(1, this);" disabled>White</button>\n            <button class="settingsPanelButton changeBackgroundColorBtn" onclick="changeBackgroundColor(-1, this);">Transparent</button>\n        </center>\n    </div>\n    ';
innerHTML+='\n    <div class="settingsPanelBlock">\n        <h5>Zone Visibility</h5>\n\n        <center>\n            <button class="settingsPanelButton" onclick="changeZoneAll(true);">Select all</button>\n            <button class="settingsPanelButton" onclick="changeZoneAll(false);">Deselect all</button>\n        </center>\n    ';for(var a=$jscomp.makeIterator(Object.entries(zoneList)),c=a.next();!c.done;c=a.next()){c=$jscomp.makeIterator(c.value);var d=c.next().value;c.next();innerHTML+='<label><input type="checkbox" name="'+
d+'" onclick="changeZoneVisibility(this);" checked> '+d+"</label>"}innerHTML+="</div>";innerHTML+='\n    <div class="settingsPanelBlock">\n        <h5>Materials</h5>\n\n        <center>Coming Soon</center>\n    </div>\n    ';settingsPanelContent.innerHTML=innerHTML}
var matEdge=new THREE.LineBasicMaterial({color:0,linewidth:1}),axisLength=10,axisXObjTemplate=new THREE.Line((new THREE.BufferGeometry).setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(axisLength,0,0)]),new THREE.LineBasicMaterial({color:16711680})),axisYObjTemplate=new THREE.Line((new THREE.BufferGeometry).setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,axisLength,0)]),new THREE.LineBasicMaterial({color:65280})),axisZObjTemplate=new THREE.Line((new THREE.BufferGeometry).setFromPoints([new THREE.Vector3(0,
0,0),new THREE.Vector3(0,0,axisLength)]),new THREE.LineBasicMaterial({color:255})),axisTrueNorthObjTemplate=new THREE.Line((new THREE.BufferGeometry).setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,axisLength,0)]),new THREE.LineDashedMaterial({color:65280,linewidth:2,dashSize:1.5,gapSize:1}));axisTrueNorthObjTemplate.computeLineDistances();var shadowCatcherMat=new THREE.ShadowMaterial;shadowCatcherMat.opacity=.5;
var matGhost=new THREE.MeshBasicMaterial({color:0,side:THREE.DoubleSide,transparent:!0,blending:THREE.AdditiveBlending});
function addModel(){resetScene();if(!camFixed){resetCamera();var a=[],c=0;for(axis=0;3>axis;axis++)a.push((boundary[0][axis]+boundary[1][axis])/2),c+=Math.pow(boundary[1][axis]-boundary[0][axis],2);bldgRadius=Math.sqrt(c);camera.base=new THREE.Vector3(a[0],a[1],a[2]);camera.radius=1.5*bldgRadius}minZ=-.01;shadCatPadX=boundary[1][0]-boundary[0][0];shadCatPadY=boundary[1][1]-boundary[0][1];shadCatPad=Math.max(shadCatPadX,shadCatPadY);a=new THREE.BufferGeometry;shadowCatcherVerts=new Float32Array([boundary[0][0]-
shadCatPadX,boundary[0][1]-shadCatPadY,minZ,boundary[1][0]+shadCatPadX,boundary[0][1]-shadCatPadY,minZ,boundary[1][0]+shadCatPadX,boundary[1][1]+shadCatPadY,minZ,boundary[0][0]-shadCatPadX,boundary[0][1]-shadCatPadY,minZ,boundary[1][0]+shadCatPadX,boundary[1][1]+shadCatPadY,minZ,boundary[0][0]-shadCatPadX,boundary[1][1]+shadCatPadY,minZ]);a.setAttribute("position",new THREE.BufferAttribute(shadowCatcherVerts,3));a.computeVertexNormals();shadowCatcher=new THREE.Mesh(a,shadowCatcherMat);shadowCatcher.receiveShadow=
!0;shadowCatcher.renderOrder=Infinity;shadowCatcher.translateZ(boundary[0][2]);lightShadow.shadow.camera=new THREE.OrthographicCamera(-shadCatPad,shadCatPad,shadCatPad,-shadCatPad,.5,1E3);a=new THREE.Vector3(boundary[0][0]-.1*bldgRadius,boundary[0][1]-.1*bldgRadius,0);axisXObject=axisXObjTemplate.clone();axisXObject.translateX(a.x);axisXObject.translateY(a.y);axisYObject=axisYObjTemplate.clone();axisYObject.translateX(a.x);axisYObject.translateY(a.y);axisZObject=axisZObjTemplate.clone();axisZObject.translateX(a.x);
axisZObject.translateY(a.y);axisTrueNorthObject=axisTrueNorthObjTemplate.clone();axisTrueNorthObject.translateX(a.x);axisTrueNorthObject.translateY(a.y);axisTrueNorthObject.rotateZ(Math.radians(northAxis));a=$jscomp.makeIterator(Object.entries(surfList));for(c=a.next();!c.done;c=a.next()){var d=$jscomp.makeIterator(c.value);c=d.next().value;var e=d.next().value,f=e.Vertices;if(0<e.Fenestrations.length){var l=[];e.Fenestrations.forEach(function(a){fen=fenList[a];l.push(f.length);f=f.concat(fen.Vertices)})}else l=
null;d=triangulatedSurfacefromVertlist(f,l);surfList[c].Geometries=d;var h=[];e.Vertices.forEach(function(a){h.push(new THREE.Vector3(a[0],a[1],a[2]))});h.push(h[0]);d=(new THREE.BufferGeometry).setFromPoints(h);surfList[c].EdgeObjects=new THREE.Line(d,matEdge);surfList[c].MaximumZ>boundary[0][2]?(d=triangulatedSurfacefromVertlist(e.Vertices),d=new THREE.Mesh(d,matGhost),d.castShadow=!0,d.material.colorWrite=!1,d.renderOrder=Infinity,surfList[c].ShadowObjects=d):surfList[c].ShadowObjects=null}a=$jscomp.makeIterator(Object.entries(fenList));
for(c=a.next();!c.done;c=a.next())d=$jscomp.makeIterator(c.value),c=d.next().value,d=d.next().value,e=triangulatedSurfacefromVertlist(d.Vertices),e.computeVertexNormals(),fenList[c].Geometries=e,h=[],d.Vertices.forEach(function(a){h.push(new THREE.Vector3(a[0],a[1],a[2]))}),h.push(h[0]),d=(new THREE.BufferGeometry).setFromPoints(h),fenList[c].EdgeObjects=new THREE.Line(d,matEdge);a=$jscomp.makeIterator(Object.entries(shadeList));for(c=a.next();!c.done;c=a.next())d=$jscomp.makeIterator(c.value),c=
d.next().value,d=d.next().value,e=triangulatedSurfacefromVertlist(d.Vertices),e.computeVertexNormals(),shadeList[c].Geometries=e,h=[],d.Vertices.forEach(function(a){h.push(new THREE.Vector3(a[0],a[1],a[2]))}),h.push(h[0]),d=(new THREE.BufferGeometry).setFromPoints(h),shadeList[c].EdgeObjects=new THREE.Line(d,matEdge);renderModel()}function rgbToHex(a){r=parseInt(255*a.r);g=parseInt(255*a.g);b=parseInt(255*a.b);hex=(16777216+(r<<16)+(g<<8)+b).toString(16).slice(1);return"#"+hex}
function hexToRgb(a){hex=a.slice(1);hex=hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,d,e,f){return d+d+e+e+f+f});return(a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex))?{r:parseInt(a[1],16)/255,g:parseInt(a[2],16)/255,b:parseInt(a[3],16)/255}:null}
function add_white_color_rgb(a,c){c=void 0===c?.5:c;h_str="string"==typeof a?a:rgbToHex(a);rgb=hexToRgb(h_str);return Object.fromEntries(Object.entries(rgb).map(function(a){var d=$jscomp.makeIterator(a);a=d.next().value;d=d.next().value;return[a,d*c+(1-c)]}))}function add_white_color_hex(a,c){return rgbToHex(add_white_color_rgb(a,void 0===c?.5:c))}
function add_black_color_rgb(a,c){c=void 0===c?.5:c;h_str="string"==typeof a?a:rgbToHex(a);rgb=hexToRgb(h_str);return Object.fromEntries(Object.entries(rgb).map(function(a){var d=$jscomp.makeIterator(a);a=d.next().value;d=d.next().value;return[a,d*c]}))}function add_black_color_hex(a,c){return rgbToHex(add_black_color_rgb(a,void 0===c?.5:c))}
var matDefault={Adiabatic:new THREE.MeshPhongMaterial({color:"#f24b91",side:THREE.DoubleSide,opacity:.8}),Roof:new THREE.MeshPhongMaterial({color:"#a82525",side:THREE.DoubleSide,opacity:.5}),OuterWall:new THREE.MeshLambertMaterial({color:"#ffe16b",side:THREE.DoubleSide}),InnerSurf:new THREE.MeshPhongMaterial({color:"#444444",side:THREE.DoubleSide,opacity:.5}),Window:new THREE.MeshPhongMaterial({color:"#00eaff",side:THREE.DoubleSide,opacity:.3}),Door:new THREE.MeshPhongMaterial({color:"#1747d4",side:THREE.DoubleSide,
opacity:.5}),Shading:new THREE.MeshPhongMaterial({color:"#624285",side:THREE.DoubleSide,opacity:.7}),Ground:new THREE.MeshLambertMaterial({color:"#555555",side:THREE.DoubleSide}),Disabled:new THREE.MeshPhongMaterial({color:"#bbbbbb",side:THREE.DoubleSide,opacity:.3})},mat;for(mat in matDefault)1>matDefault[mat].opacity&&(matDefault[mat].transparent=!0);
function renderModel(){shadowOn&&scene.add(shadowCatcher);for(var a=[],c=$jscomp.makeIterator(Object.entries(surfList)),d=c.next();!d.done;d=c.next()){var e=$jscomp.makeIterator(d.value);d=e.next().value;e=e.next().value;if(!a.includes(d)){zoneName=e.ZoneName;surfGeom=e.Geometries;var f=matDefault.InnerSurf;switch(e.OutsideBC){case "outdoors":switch(e.SurfaceType){case "wall":f=matDefault.OuterWall;break;case "roof":f=matDefault.Roof}break;case "adiabatic":f=matDefault.Adiabatic;break;case "ground":f=
matDefault.Ground}d.toLowerCase()==e.OutsideBCObj.toLowerCase()&&(f=matDefault.Adiabatic);f=f.clone();if(""!=e.OutsideBCObj){var l=e.OutsideBCObj.toLowerCase(),h=surfList[l].ZoneName;if(zoneList[zoneName].Visible)a.push(l);else if(zoneList[h].Visible){a.push(d);continue}else a.push(l)}zoneList[zoneName].Visible?(transparencyOn||(1>f.opacity&&(f.color=add_white_color_rgb(add_black_color_hex(f.color,f.opacity),1-(1-f.opacity)/2.5),f.opacity=1),f.transparent=!1),f=new THREE.Mesh(surfGeom,f),f.renderOrder=
0,f.layers.enable(1),f.sourceObjName=d,f.sourceObjType="surface",scene.add(f),scene.add(e.EdgeObjects),shadowOn&&null!=e.ShadowObjects&&scene.add(e.ShadowObjects)):(d=new THREE.Mesh(surfGeom,matDefault.Disabled),d.renderOrder=1,d.layers.enable(2),scene.add(d))}}a=[];c=$jscomp.makeIterator(Object.entries(fenList));for(d=c.next();!d.done;d=c.next())if(e=$jscomp.makeIterator(d.value),d=e.next().value,e=e.next().value,!a.includes(d)&&(zoneName=surfList[e.SurfaceName].ZoneName,zoneList[zoneName].Visible)){""!=
e.OutsideBCObj&&a.push(e.OutsideBCObj.toLowerCase());fenGeom=e.Geometries;f=matDefault.Window;switch(e.SurfaceType){case "door":f=matDefault.Door}f=f.clone();transparencyOn||(1>f.opacity&&(f.color=add_white_color_rgb(add_black_color_hex(f.color,f.opacity),1-(1-f.opacity)/2.2),f.opacity=1),f.transparent=!1);f=new THREE.Mesh(fenGeom,f);f.layers.enable(1);f.sourceObjName=d;f.sourceObjType="fenestration";scene.add(f);scene.add(e.EdgeObjects)}if(shadingOn)for(a=$jscomp.makeIterator(Object.entries(shadeList)),
c=a.next();!c.done;c=a.next()){d=$jscomp.makeIterator(c.value);c=d.next().value;d=d.next().value;shadeGeom=d.Geometries;e=matDefault.Shading;switch(d.SurfaceType){case "door":e=matDefault.Door}e=e.clone();transparencyOn||(1>e.opacity&&(e.color=add_white_color_rgb(add_black_color_hex(e.color,e.opacity),1-(1-e.opacity)/2.2),e.opacity=1),e.transparent=!1);e=new THREE.Mesh(shadeGeom,e);e.layers.enable(1);e.sourceObjName=c;e.sourceObjType="shading";scene.add(e);scene.add(d.EdgeObjects)}debugOn&&(scene.add(axisXObject),
scene.add(axisYObject),scene.add(axisZObject),scene.add(axisTrueNorthObject));updateCamera()}
function changeBackgroundColor(a,c){a=void 0===a?-1:a;c=void 0===c?null:c;Array.from(document.getElementsByClassName("changeBackgroundColorBtn")).forEach(function(a){a.classList.remove("changeBgColorBtnHighlighted");a.disabled=!1});c.classList.add("changeBgColorBtnHighlighted");c.disabled=!0;switch(a){case -1:CanvasContainer.style.backgroundColor="";objectDisplay.className="transparentmode";console.log('Background changed to "transparent"');break;case 0:CanvasContainer.style.backgroundColor="black";
objectDisplay.className="blackmode";console.log('Background changed to "black"');break;case 1:CanvasContainer.style.backgroundColor="white",objectDisplay.className="whitemode",console.log('Background changed to "white"')}}var commandListener=document.getElementById("CommandListener");commandListenerVisibility(0);
function commandListenerVisibility(a){switch(void 0===a?0:a){case 0:commandListener.style.visibility="hidden";commandListener.style.opacity=0;commandListener.classList.remove("fadein");commandListener.classList.add("fadeout");break;case 1:commandListener.innerHTML="",commandListener.style.visibility="visible",commandListener.style.opacity=1,commandListener.classList.remove("fadeout"),commandListener.classList.add("fadein"),commandListener.classList.remove("CommandFail"),commandListener.classList.remove("CommandSuccess")}}
var lastCommand="";
function runCommand(a){lastCommand=a=void 0===a?"":a;commandListener.classList.add("CommandSuccess");switch(a){case "test":console.log("TEST!");break;case "help":commandPanelVisibility(1);break;default:if(a.includes(" ")){log=a.match(/(\S+)\s+(\S+)/);a=log[1];var c=log[2];lastCommand=a;switch(a){case "test":console.log("TEST! -",c);break;case "camerafar":c=parseFloat(c);1E3>c&&(c=1E3);camera.far=c;camera.updateProjectionMatrix();updateCamera();break;case "maxzoom":c=parseFloat(c);950>c&&(c=950);maxZoom=
c;camera.far=c+50;camera.updateProjectionMatrix();updateCamera();break;case "shadowalt":c=parseFloat(c);shadowOffset[0]=c;updateCamera();break;case "shadowazm":c=parseFloat(c);shadowOffset[1]=c;updateCamera();break;case "shadowmapsize":c=parseInt(c);lightShadow.shadow.mapSize.width=c;lightShadow.shadow.mapSize.height=c;lightShadow.shadow.map.dispose();lightShadow.shadow.map=null;updateCamera();break;case "shadowradius":c=parseFloat(c);lightShadow.shadow.radius=c;lightShadow.shadow.map.dispose();lightShadow.shadow.map=
null;updateCamera();break;case "shadowheight":c=parseFloat(c);shadowCatcher.translateZ(c-shadowCatcher.position.z);updateCamera();break;default:lastCommand="",commandListener.classList.remove("CommandSuccess"),commandListener.classList.add("CommandFail")}}else lastCommand="",commandListener.classList.remove("CommandSuccess"),commandListener.classList.add("CommandFail")}};