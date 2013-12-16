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
var setAnnotation = false;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

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
        redraw();
        selectAnnotation();
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

/* Changing the annotation label does:
 * - redraw corresponding rectangle over image
 * - load the comments from selected annotation
 */
function selectAnnotation() {
    if (annotationSelect.selectedIndex == -1)
        return;

    // get the new selected option
    var $op = $(annotationSelect.options[annotationSelect.selectedIndex]);
    if (!$op)
        return;

    // get the comments from API
    $.ajax({
       type: "GET",
       url: "/comment/get/" + $op.attr("data-pk"),
       success: function (comments, status) {
            $("#comments-container").html("");
            for (var i = 0; i < comments.length; ++i) {
                $("#comments-container").append('<div class="comment panel"><p>' +
                comments[i].fields.text + '</p><p class="text-right">by ' + comments[i].fields.author + '</p></div>');
            }

            commentForm.action = "/comment/add/" + $op.attr('data-img_pk') + "/" + $op.attr('data-pk');
            $("#current-annotation")[0].innerHTML = $op.get(0).label;
        },
    });
}
$annotationSelect.on("change", selectAnnotation);

function deleteAnnotation() {
    if (annotationSelect.selectedIndex == -1) {
        return;
    }
    var name = annotationSelect.options[annotationSelect.selectedIndex].label;
    $.ajax({
        type: "POST",
            url: "/api/annotations/delete",
            data: {
                csrfmiddlewaretoken: csrf,
                state: "inactive",
                imgpk: imgpk,
                name: name,
            },
        success: function (data, status) {
            // reload page after delete, so we refetch all existing annotations
            location.reload(true);
        },
    });
}
$("#annotation-delete-btn").on("click", deleteAnnotation);

$canvas.on("mousedown", function (e) {
    if (setAnnotation == true)
        return;
    mouseIsDown = true;
    drawedRect = false;
    var coords = coordsInCanvas(e.clientX, e.clientY);
    startX = coords.x;
    startY = coords.y;
});

$canvas.on("mouseup", function (e) {
    if (setAnnotation == true)
        return;
    setAnnotation = true;
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

        if (rect.width < 20 && rect.height < 20) {
            redraw();
            return;
        }

        var x = $(window).width() / 2 - $annotationAddDiv.width() / 2;
        var y = $(window).height() / 2 - $annotationAddDiv.height() / 2;
        $annotationAddDiv.css({
            left: x + "px",
            top: y + "px"
        })
        var annotationClick = true;
        $("#annotation-add-btn").on("click", function (e) {
            setAnnotation = false;
            var $annotationAddInput = $("#annotation-add-input");
            var input = $annotationAddInput.get(0);
            var name = input.value;
            rect.name = name;

            // now send to server
            if(annotationClick){
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
                        // hack: refresh page as new annotations were added.
                        location.reload(true);
                    },
                });
            }
        });
        $("#annotation-cancel-btn").on("click", function(e) {
            setAnnotation = false;
            var $annotationAddInput = $("#annotation-add-input");
            var input = $annotationAddInput.get(0);
            input.value = "";
            $annotationAddDiv.addClass("hide");
            annotationClick = false;
            redraw();
        });
    }
})

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, displaySize.width, displaySize.height);

    var selectedIndex = annotationSelect.selectedIndex;
    if (isNumber(selectedIndex)) {
        $op = $(annotationSelect.options[selectedIndex]);
        if (!$op)
            return;
        context.strokeStyle = "red";
        context.strokeRect($op.attr("data-x"), $op.attr("data-y"),
                           $op.attr("data-width"), $op.attr("data-height"));
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
