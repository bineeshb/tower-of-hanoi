var isMoveable = false,
	$disks, $containers, $inputNumOfDisks = $id("js-num-of-disks");

var jsStyles = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    // WebKit hack
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style;
})();

function $id(id) {
	return document.getElementById(id);
}

function $class(className) {
	return document.getElementsByClassName(className);
}

function renderElements() {
	var containerStyle, numOfDisks = 4, maxNoOfDisks = 7, diskMinWidth = 34, diskHeight = 31;

	if($inputNumOfDisks) {
		numOfDisks = parseInt($inputNumOfDisks.value, 10);
	}

	for(var i = jsStyles.sheet.cssRules.length - 1; i > -1; i--) {
		jsStyles.sheet.deleteRule(i);
	}

	$containers = $class("js-container");

	for(var i = 0; i < $containers.length; i++) {
		$containers[i].addEventListener("dragenter", dragEnter, false);
		$containers[i].addEventListener("dragleave", dragLeave, false);
		$containers[i].addEventListener("dragover", function(e) { e.preventDefault(); }, false);
		$containers[i].addEventListener("drop", dropped, false);

		$containers[i].innerHTML = "";
	}

	for(var i = 1, diskWidth = diskMinWidth; i <= numOfDisks; i++, diskWidth += 20) {
		var disk = document.createElement("div"), diskStyle, diskLabelStyle, diskPositionStyle;

		disk.setAttribute("id", "disk-" + i);
		disk.setAttribute("class", "disk js-move-disk");
		disk.setAttribute("draggable", false);
		disk.setAttribute("data-weightage", i);

		diskStyle = "#disk-" + i + "{" +
			"width: " + diskWidth + "px;" +
			"margin-left: " + -(diskWidth + 4)/2 + "px;" +
		"}";
		jsStyles.sheet.insertRule(diskStyle, 0);

		diskLabelStyle = "#disk-" + i + "::after {" +
			"content: " + "\"" + i + "\";" +
		"}";
		jsStyles.sheet.insertRule(diskLabelStyle, 0);

		diskPositionStyle = ".container > .disk:nth-last-child(" + i + ") {" +
			"bottom: " + (((diskHeight - 1) * (i - 1)) + 1) + "px;" +
		"}";
		jsStyles.sheet.insertRule(diskPositionStyle, 0);

		$id('js-container-left').appendChild(disk);

		disk.addEventListener("dragstart", startDrag, false);
		disk.addEventListener("dragend", function(e) { e.preventDefault(); }, false);
	}

	containerStyle = ".container {" +
		"width: " + (diskMinWidth + (maxNoOfDisks * 20)) + "px;" +
		"height: " + ((numOfDisks + 1) * diskHeight) + "px;" +
	"}";
	jsStyles.sheet.insertRule(containerStyle, 0);

	$disks = $class("js-move-disk");

	checkContainers();
}

function init() {
	$inputNumOfDisks.addEventListener("change", function(e) {
		renderElements();
	}, false);

	renderElements();
}

function startDrag(e) {
	if(!e.target.previousElementSibling) {
		e.dataTransfer.dropEffect = "move";
		e.dataTransfer.setData('Text', e.target.getAttribute('id'));
		isMoveable = true;
	} else {
		isMoveable = false;
	}
}

function dragEnter(e) {
	e.preventDefault();

	if(isContainer(e.target) && isMoveable) {
		e.target.style.borderStyle = 'dotted';
	}
}

function dragLeave(e) {
	e.preventDefault();

	if(isContainer(e.target)) {
		e.target.style.borderStyle = 'solid';
	}
}

function dropped(e) {
	e.preventDefault();
	var isMoveValid = false, firstDiscWeightage, currentDiscWeightage, elemId, children;

	elemId = e.dataTransfer.getData('Text');

	if(elemId && $id(elemId)) {
		currentDiscWeightage = parseInt($id(elemId).getAttribute("data-weightage"), 10);
	}

	children = e.target.children;

	if(children && children[0]) {
		firstDiscWeightage = parseInt(children[0].getAttribute("data-weightage"), 10);
		isMoveValid = currentDiscWeightage < firstDiscWeightage;
	} else {
		isMoveValid = elemId && children.length === 0;
	}

	if(isContainer(e.target)) {
		if(isMoveValid) {
			e.target.insertBefore($id(elemId), e.target.firstChild);
		}
		e.target.style.borderStyle = 'solid';
	}

	checkContainers();
}

function isContainer(elem) {
	return elem && elem.hasAttribute('class') && elem.getAttribute('class').indexOf("js-container") !== -1;
}

function checkContainers() {
	var children;
	for(var i = 0; i < $containers.length; i++) {
		children = $containers[i].children;

		if(children && children.length > 0) {
			children[0].setAttribute("draggable", true);

			for(var j = 1; j < children.length; j++) {
				children[j].setAttribute("draggable", false);
			}
		}
	}
}

window.addEventListener("load", init, false);
