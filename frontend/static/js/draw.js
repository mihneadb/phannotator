var drag = false;
var topMargin = 50;
var leftMargin = 50;
var buttonWidth = 46;
var buttonHeight = 18;
var scaleFactor = 0.9;
var img = "http://www.photoshopwebsite.com/wp-content/uploads/2009/12/image80.png";
var tagColor = "rgba(100, 150, 240, 0.3)";
var imgWidth, imgHeight;
var annotations = new Array();


function draw() {
    var imageObj = new Image();
    var width, height;

    imageObj.onload = function() {
        imgWidth = this.width * scaleFactor;
        imgHeight = this.height * scaleFactor;
        resizeFieldset();
        newContainer("background", 0, leftMargin, topMargin, imgWidth, imgHeight);
        var cvs = document.getElementById("background");
        var ctx = cvs.getContext("2d");
        ctx.drawImage(imageObj, 0, 0, imgWidth, imgHeight);
    };
    imageObj.src = img;

}

function resizeFieldset() {
    var fieldset = document.getElementById("annotations");
    fieldset.style.width = "300px";
    fieldset.style.height = imgHeight + "px";
    fieldset.style.top = (topMargin-10) + "px";
    fieldset.style.left = (leftMargin + imgWidth + 20) + "px";
    fieldset.removeAttribute("hidden");
}

///////////////////////////////////////
// Constructors ///////////////////////
///////////////////////////////////////

function newAnnotation(tag, info) {
    this.tag = tag;
    this.info = info;
}

function newTag(id, x, y, fill) {
    this.id = id;
    this.startX = x;
    this.startY = y;
    this.left = x + leftMargin;
    this.top = y + topMargin;
    this.width = 0;
    this.height = 0;
    this.container = new newContainer("cvs"+id, id, this.left, this.top, this.width, this.height, fill);
}

// vom crea un canvas ale caror marimi vor fi modificate dinamic
function newContainer(id, zindex, left, top, width, height, fill) {
    this.fill = fill;
    this.canvas = document.createElement('canvas');
    this.canvas.id = id;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.zIndex = zindex;
    this.canvas.style.position = "absolute";
    this.canvas.style.border = "1px solid grey";
    this.canvas.style.left = left + "px";
    this.canvas.style.top = top + "px";
    document.body.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
}

function newInfo(id) {
    this.checkbox = document.createElement("input");
    this.checkbox.type = "checkbox";
    this.checkbox.id = "box" + id;
    this.checkbox.value = "show";
    this.checkbox.checked = true;
    this.checkbox.setAttribute("onclick", "hide(id)");

    this.textarea = document.createElement("textarea");
    this.textarea.id = "ann" + id;
    this.textarea.rows = 2;
    this.textarea.cols = 26;

    this.save = document.createElement("button");
    this.save.id = "sav" + id;
    this.save.type = "button";
    this.save.setAttribute("onclick", "saveTag(id);");
    this.save.innerHTML = "Save";
    this.save.style.width = buttonWidth + "px";
    this.save.style.height = buttonHeight + "px";

    this.del = document.createElement("button");
    this.del.id = "del" + id;
    this.del.type = "button";
    this.del.setAttribute("onclick", "deleteTag(id);");
    this.del.innerHTML = "Delete";
    this.del.style.width = buttonWidth + "px";
    this.del.style.height = buttonHeight + "px";

    var table = document.getElementById("ftable");
    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    var btable = document.createElement("table");
    var btr1 = document.createElement("tr");
    var btr2 = document.createElement("tr");
    btr1.appendChild(this.save);
    btr2.appendChild(this.del);
    btable.appendChild(btr1);
    btable.appendChild(btr2);
    td1.appendChild(this.checkbox);
    td2.appendChild(this.textarea);
    td3.appendChild(btable);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    table.appendChild(tr);

    this.textarea.focus();
}

function resizeContainer(container, left, top, width, height) {
    container.canvas.width = width;
    container.canvas.height = height;
    container.canvas.style.left = left + "px";
    container.canvas.style.top = top + "px";
    container.context.fillStyle = container.fill
    container.context.fillRect(0, 0, width, height);
}


///////////////////////////////////////
// mouse actions //////////////////////
///////////////////////////////////////

function mouseDown(event) {
    if (event.pageX > imgWidth || event.pageY > imgHeight) {
        drag = false;
        return;
    }
    var id = annotations.length+1;
    var tag = new newTag(id, event.pageX, event.pageY, tagColor);
    console.log("start: (" + tag.startX + ", " + tag.startY + ")");
    drag = true;
    var annot = new newAnnotation(tag, null);
    annotations.push(annot);
}

function mouseDrag(event) {
    if (!drag)
        return;
    var x = event.pageX;
    var y = event.pageY;
    var tag = annotations[annotations.length - 1].tag;
    tag.left = Math.min(x, tag.startX);
    tag.top = Math.min(y, tag.startY);

    //must be within the image
    tag.width = Math.abs(x-tag.startX);
    tag.height = Math.abs(y-tag.startY);

    if (tag.width + tag.left > imgWidth + leftMargin)
        tag.width = imgWidth + leftMargin - tag.left;
    if (tag.height + tag.top > imgHeight + topMargin)
        tag.height = imgHeight + topMargin - tag.top;
    if (tag.left < leftMargin)
        tag.left = leftMargin;
    if (tag.top < topMargin)
        tag.top = topMargin;

    resizeContainer(tag.container, tag.left, tag.top, tag.width, tag.height);

    document.onmouseup = function(event){
        mouseUp(event);
        document.onmousemove = function(){};
    }
}

function mouseUp(event) {
    if (!drag) {
        console.log("unclick no drag");
        return;
    }
    drag = false;
    console.log("end: (" + event.pageX + ", " + event.pageY + ")");
    //destroy tags that are very small
    var ann = annotations.pop();
    if (ann.tag.width < 20 && ann.tag.height < 20) {
        console.log("remove last tag");
        document.body.removeChild(ann.tag.container.canvas);
    } else {
        ann.info = new newInfo(ann.tag.id);
        annotations.push(ann);
    }
}



///////////////////////////////////////
// button actions /////////////////////
///////////////////////////////////////

function keyPress(event) {

}

function hide(id) {
    var number = parseInt(id.substring(3, id.length));
    var canvas = document.getElementById("cvs"+number);
    if (document.getElementById(id).checked == false) {
        canvas.setAttribute("hidden", "");
    } else {
        canvas.removeAttribute("hidden");
    }
}

function saveTag(id) {
    console.log("save " + id);
    var number = parseInt(id.substring(3, id.length));
    var textarea = document.getElementById("ann"+number);
    textarea.readOnly = true;
    textarea.disabled = true;
    var save = document.getElementById("sav"+number);
    save.id = "edt" + number;
    save.innerHTML = "Edit";
    save.setAttribute("onclick", "editTag(id)");
}

function editTag(id) {
    console.log("edit " + id);
    var number = parseInt(id.substring(3, id.length));
    var textarea = document.getElementById("ann"+number);
    textarea.readOnly = false;
    textarea.disabled = false;
    var edit = document.getElementById("edt"+number);
    edit.innerHTML = "Save";
    edit.setAttribute("onclick", "saveTag(id)");
}

function deleteTag(id) {
    console.log("del " + id);
    var number = parseInt(id.substring(3, id.length));
    var canvas = document.getElementById("cvs"+number);
    canvas.parentNode.removeChild(canvas);
    var textarea = document.getElementById("ann"+number);
    var tr = textarea.parentNode.parentNode;
    tr.parentNode.removeChild(tr);
    if (annotations.length >= number) {
        annotations.splice(number-1, 1);
    } else {
        console.log("somewhere, something went wrong!");
    }
}
