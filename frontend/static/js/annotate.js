var $canvasDiv = $("#img-viewer-div");
var $canvas = $("#img-viewer");
var canvas = $canvas.get(0);
var context = canvas.getContext('2d');
var img = null;
var displaySize = null;

var $annotationAddDiv = $("#annotation-add-div");
var $annotationSelect = $("#annotation-select");
var annotationSelect = $annotationSelect.get(0);

var $commentForm = $("#comment-form");
var commentForm = $commentForm.get(0);

var $spinner;

var dx = null;
var dy = null;

var csrf = $("html").data("csrf");
var imgpk = $canvas.data("img-pk");

function coordsInCanvas(x, y) {
    dx = $canvas.offset().left;
    dy = $canvas.offset().top;
    return {x: x - dx, y: y - dy};
}

var MAX_WIDTH = 600;
var MAX_HEIGHT = 400;

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
        getAnnotations();
        $spinner.addClass("hide");
    }
    img.src = $canvas.data("img-src");

    $spinner = $("#spinner");
    var x = $(window).width() / 2 - $spinner.width() / 2;
    console.log($canvasDiv.offset().top);
    var y = $canvasDiv.offset().top + $spinner.height() / 2;
    $spinner.css({
        left: x + "px",
        top: y + "px"
    })
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
            annotations = [];
            $annotationSelect.empty();
            for (var i = 0; i < data.length; i++) {
                var o = data[i];
                var fields = o.fields;
                var r = {
                    height: fields.height,
                    width: fields.width,
                    x: fields.x,
                    y: fields.y,
                    name: fields.name,
                    pk: o.pk,
                };
                annotations.push(r);
                $annotationSelect.append($('<option value="' + r.name + '">' + r.name + '</option>'));
                redraw();
            }
            annotationSelect.selectedIndex = data.length - 1;
            setFormAction();
        },
    });
}


function setFormAction() {
    if (annotationSelect.selectedIndex == -1) {
        return;
    }
    var name = annotationSelect.options[annotationSelect.selectedIndex].label;
    var ann = null;
    annotations.forEach(function (e) {
        e.selected = false;
        if (e.name == name) {
            ann = e;
        }
    });

    if (!ann) {
        return;
    }

    ann.selected = true;
    redraw();

    commentForm.action = "/comment/add/" + imgpk + "/" + ann.pk;
    $("#current-annotation")[0].innerHTML = ann.name;
}
$annotationSelect.on("change", setFormAction);

$canvas.on("mousedown", function (e) {
    mouseIsDown = true;
    drawedRect = false;
    var coords = coordsInCanvas(e.clientX, e.clientY);
    startX = coords.x;
    startY = coords.y;
});

$canvas.on("mouseup", function (e) {
    mouseIsDown = false;
    if (drawedRect) {
        drawedRect = false;
        var coords = coordsInCanvas(e.clientX, e.clientY);
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
                    getAnnotations();
                },
            });
        });
        $("#annotation-cancel-btn").on("click", function(e) {
            var $annotationAddInput = $("#annotation-add-input");
            var input = $annotationAddInput.get(0);
            input.value = "";
            $annotationAddDiv.addClass("hide");
            getAnnotations();
        });
    }
})

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, displaySize.width, displaySize.height);

    for (var i = 0; i < annotations.length; i++) {
        var r = annotations[i];
        if (r.selected) {
            context.strokeStyle = "red";
            context.strokeRect(r.x, r.y, r.width, r.height);
        }
    }
}

$canvas.on("mousemove", function(e) {
    if (!mouseIsDown) {
        return;
    }
    drawedRect = true;

    redraw();

    var coords = coordsInCanvas(e.clientX, e.clientY);
    context.strokeStyle = "red";
    context.strokeRect(startX, startY, coords.x - startX, coords.y - startY);
})

showImage();
