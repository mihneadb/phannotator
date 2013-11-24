var $canvas = $("#img-viewer");
var canvas = $canvas.get(0);
var context = canvas.getContext('2d');
var img = null;
var displaySize = null;

var $annotationAddDiv = $("#annotation-add-div");

var dx = $canvas.offset().left;
var dy = $canvas.offset().top;

var csrf = $("html").data("csrf");
var imgpk = $canvas.data("img-pk");

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

function getAnnotations() {
    $.ajax({
        type: "GET",
        url: "/api/annotations/get/" + imgpk,
        success: function (data, status) {
            for (var i = 0; i < data.length; i++) {
                var o = data[i];
                var fields = o.fields;
                var r = {
                    height: fields.height,
                    width: fields.width,
                    x: fields.x,
                    y: fields.y,
                    name: fields.name,
                    pk: fields.pk,
                };
                annotations.push(r);
                redraw();
            }
        },
    });
}

getAnnotations();

$canvas.on("mousedown", function (e) {
    mouseIsDown = true;
    drawedRect = false;
    var coords = coordsInCanvas(e.pageX, e.pageY);
    startX = coords.x;
    startY = coords.y;
});

$canvas.on("mouseup", function (e) {
    mouseIsDown = false;
    if (drawedRect) {
        drawedRect = false;
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
            $.ajax({
                type: "POST",
                url: "/api/annotations/add",
                data: {
                    csrfmiddlewaretoken: csrf,
                    state: "inactive",
                    imgpk: imgpk,
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    name: rect.name,
                },
                success: function (data, status) {
                },
            });
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
