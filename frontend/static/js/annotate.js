var $canvas = $("#img-viewer");
var canvas = $canvas.get(0);
var context = canvas.getContext('2d');
var img = null;

var $annotationAddDiv = $("#annotation-add-div");

var dx = $canvas.offset().left;
var dy = $canvas.offset().top;

function coordsInCanvas(x, y) {
    return {x: x - dx, y: y - dy};
}

var MAX_WIDTH = 800;
var MAX_HEIGHT = 800;

function newSize(width, height) {
    var ratio;
    if (width > height) {
        ratio = MAX_WIDTH / width;
    } else {
        ratio = MAX_HEIGHT / height;
    }
    return {width: width * ratio, height: height * ratio};
}

function showImage() {
    img = new Image();
    img.onload = function () {
        displaySize = newSize(img.width, img.height);
        canvas.height = displaySize.height;
        canvas.width = displaySize.width;
        context.drawImage(img, 0, 0, displaySize.width, displaySize.height);
    }
    img.src = $canvas.data("img-src");
}

var mouseIsDown = false;
var drawedRect = false;
var startX = null;
var startY = null;

var annotations = [];

$canvas.on("mousedown", function (e) {
    mouseIsDown = true;
    var coords = coordsInCanvas(e.pageX, e.pageY);
    startX = coords.x;
    startY = coords.y;
});

$canvas.on("mouseup", function (e) {
    mouseIsDown = false;
    if (drawedRect) {
        var coords = coordsInCanvas(e.pageX, e.pageY);
        var rect = {
            x: startX,
            y: startY,
            width: coords.x - startX,
            height: coords.y - startY,
        };

        $annotationAddDiv.toggleClass("hide");

        var x = $(window).width() / 2 - $annotationAddDiv.width() / 2;
        var y = $(window).height() / 2 - $annotationAddDiv.height() / 2;
        $annotationAddDiv.css({
            left: x + "px",
            top: y + "px"
        })

        $("#annotation-add-btn").on("click", function (e) {
            var $annotationAddInput = $("#annotation-add-input");
            var input = $annotationAddInput.get(0);
            var name = input.value;
            rect.name = name;
            annotations.push(rect);
            input.value = "";
            $annotationAddDiv.addClass("hide");

            // now send to server
        });
    }
})

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, displaySize.width, displaySize.height);

    for (var i = 0; i < annotations.length; i++) {
        var r = annotations[i];
        context.strokeStyle = "red";
        context.strokeRect(r.x, r.y, r.width, r.height);
    }
}

$canvas.on("mousemove", function(e) {
    if (!mouseIsDown) {
        return;
    }
    drawedRect = true;

    redraw();

    var coords = coordsInCanvas(e.pageX, e.pageY);
    context.strokeStyle = "red";
    context.strokeRect(startX, startY, coords.x - startX, coords.y - startY);
})

showImage();
