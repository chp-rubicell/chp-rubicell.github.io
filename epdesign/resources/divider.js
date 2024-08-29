const container = document.getElementsByClassName('dividerContainer')[0];
const panel1 = document.getElementsByClassName('dividerPanel1')[0];
const panel2 = document.getElementsByClassName('dividerPanel2')[0];
const canvases = document.querySelectorAll('.canvasWrapper canvas');
var viewportSizes = [null, null];
var canvasSizes = [0, 0];

var widthRatio = 0.6;
var heightRatio = 0.5;
const minWidthRatio = 0.3;
const minHeightRatio = 0.3;

const divider = document.getElementById('divider');
let isResizing = false;

function updateDivider() {
    if (window.innerWidth > widthThreshold) {
        //? horizontal (row)
        container.style.flexDirection = 'row';
        panel1.style.height = '100%';
        panel2.style.height = '100%';
        panel1.style.width = `${widthRatio * 100}%`;
        panel2.style.width = `${(1 - widthRatio) * 100}%`;
        // panel1.style.width = `calc(${widthRatio*100}% - ${dividerSize/2}px)`;
        // panel2.style.width = `calc(${(1-widthRatio)*100}% - ${dividerSize/2}px)`;
    }
    else {
        //? vertical (column)
        container.style.flexDirection = 'column';
        panel1.style.width = '100%';
        panel2.style.width = '100%';
        panel1.style.height = `${heightRatio * 100}%`;
        panel2.style.height = `${(1 - heightRatio) * 100}%`;
    }
    for (let canv_idx=0; canv_idx<canvases.length; canv_idx++) {
        var canvas = canvases[canv_idx];
        var wrapper = canvas.parentElement;
        const parentWidth = wrapper.parentElement.clientWidth;
        const parentHeight = wrapper.parentElement.clientHeight;
        var viewportSize = new Vector(parentWidth, parentHeight);
        var canvasSize = Math.max(parentWidth, parentHeight);
        wrapper.style.width = `${canvasSize}px`;
        wrapper.style.height = `${canvasSize}px`;
        viewportSizes[canv_idx] = viewportSize;
        canvasSizes[canv_idx] = canvasSize;
    }
    updateEditorOffset();
    updateViewerOffset();
}
window.onload = updateDivider;

panel1.addEventListener('mousedown', function(e) {
    Building.workingPanelIdx = 0;
});
panel2.addEventListener('mousedown', function(e) {
    Building.workingPanelIdx = 1;
});


divider.addEventListener('mousedown', function(e) {
    isResizing = true;
    document.body.style.userSelect = 'none'; // Prevents text selection during resize
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;

    const containerStyle = window.getComputedStyle(container);
    const flexDirection = containerStyle.flexDirection;

    const containerRect = container.getBoundingClientRect();
    const totalWidth = containerRect.width;
    const totalHeight = containerRect.height;

    if (flexDirection === 'row') {
        const offsetX = e.clientX - containerRect.left;
        // panel1.style.width = `${offsetX}px`;
        // panel2.style.width = `${containerRect.width - offsetX - divider.offsetWidth}px`;
        widthRatio = offsetX / totalWidth;
        widthRatio = clamp(widthRatio, minWidthRatio, 1-minWidthRatio);
    } else {
        const offsetY = e.clientY - containerRect.top;
        // panel1.style.height = `${offsetY}px`;
        // panel2.style.height = `${containerRect.height - offsetY - divider.offsetHeight}px`;
        heightRatio = offsetY / totalHeight;
        heightRatio = clamp(heightRatio, minHeightRatio, 1-minHeightRatio);
    }
    updateDivider();
});

document.addEventListener('mouseup', function() {
    isResizing = false;
    document.body.style.userSelect = 'auto'; // Re-enable text selection after resize
});
var test = null;
// window.addEventListener('wheel', function(e) {
// document.documentElement.onwheel = function(e) {
//     console.log(e.target.tagName.toLowerCase() == 'canvas')
//     if (e.target.tagName.toLowerCase() == 'canvas') {
//         e.preventDefault();
//         e.stopPropagation();
//         return false;
//     }
// };
// window.addEventListener('wheel', function (e) {
//     console.log(e.target.tagName.toLowerCase() == 'canvas')
//     if (e.target.tagName.toLowerCase() == 'canvas') {
//         return false;
//     }
// }, {passive: false});
