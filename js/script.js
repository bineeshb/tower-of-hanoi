var isMoveable = false,
	containerPositions = [],
	$disks, $containers,
	$btnReset = selectElId("js-btn-reset"),
	$inputNumOfDisks = selectElId("js-ip-num-of-disks"),
	$outputNumOfDisks = selectElId("js-op-num-of-disks"),
	noOfMoves = 0,
	$noOfMoves = selectElId("js-no-of-moves");

var jsStyles = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    // WebKit hack
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style;
})();

function selectElId(id) {
	return document.getElementById(id);
}

function selectElClass(className) {
	return document.getElementsByClassName(className);
}

function renderElements() {
	var containerStyle, numOfDisks = 4, maxNoOfDisks = 7, diskMinWidth = 34, diskHeight = 31;

	if($inputNumOfDisks) {
		numOfDisks = parseInt($inputNumOfDisks.value, 10);
	}
	$outputNumOfDisks.innerHTML = numOfDisks;

	for(var i = jsStyles.sheet.cssRules.length - 1; i > -1; i--) {
		jsStyles.sheet.deleteRule(i);
	}

	$containers = selectElClass("js-container");

	for(var i = 0; i < $containers.length; i++) {
		$containers[i].addEventListener("dragenter", dragEnter, false);
		$containers[i].addEventListener("dragleave", dragLeave, false);
		$containers[i].addEventListener("dragover", function(e) { e.preventDefault(); }, false);
		$containers[i].addEventListener("drop", dropped, false);

		$containers[i].innerHTML = "";
	}

	for(var i = 1, diskWidth = diskMinWidth; i <= numOfDisks; i++, diskWidth += 20) {
		var $disk = document.createElement("div"), diskStyle, diskLabelStyle, diskPositionStyle;

		$disk.setAttribute("id", "disk-" + i);
		$disk.setAttribute("draggable", false);
		$disk.setAttribute("data-weightage", i);

		if (i % 2 == 0) {
			$disk.setAttribute("class", "disk js-move-disk disk-variant-2");
		} else {
			$disk.setAttribute("class", "disk js-move-disk disk-variant-1");
		}

		diskStyle = "#disk-" + i + "{" +
			"width: " + diskWidth + "px;" +
		"}";
		jsStyles.sheet.insertRule(diskStyle, 0);

		diskLabelStyle = "#disk-" + i + "::after {" +
			"content: " + "\"" + i + "\";" +
		"}";
		jsStyles.sheet.insertRule(diskLabelStyle, 0);

		selectElId('js-container-left').appendChild($disk);

		$disk.addEventListener("dragstart", startDrag, false);
		$disk.addEventListener("dragend", function(e) { e.preventDefault(); }, false);
		$disk.addEventListener("touchstart", startDrag, false);
		$disk.addEventListener("touchmove", startDrag, false);
	}

	containerStyle = ".container {" +
		"height: " + ((maxNoOfDisks + 1) * diskHeight) + "px;" +
	"}";
	jsStyles.sheet.insertRule(containerStyle, 0);

	$disks = selectElClass("js-move-disk");
	
	noOfMoves = 0;
	$noOfMoves.innerHTML = noOfMoves;

	for(var i = 0; i < $containers.length; i++) {
		var positionLeft = $containers[i].offsetLeft, positionTop = $containers[i].offsetTop;

		containerPositions.push({
			elemId: $containers[i].id,
			xLeft: positionLeft,
			xRight: positionLeft + $containers[i].offsetWidth,
			yTop: positionTop,
			yBottom: positionTop + $containers[i].offsetHeight
		});
	}

	checkContainers();
}

function init() {
	$inputNumOfDisks.addEventListener("change", function(e) {
		renderElements();
	}, false);

	$btnReset.addEventListener("click", function(e) {
		renderElements();
	}, false);

	renderElements();
}

function startDrag(e) {
	var targetEl, touch;

	if(!e.target.previousElementSibling) {
		if(e.type === "dragstart") {
			e.dataTransfer.dropEffect = "move";
			e.dataTransfer.setData('Text', e.target.getAttribute('id'));
		} else if(e.targetTouches && e.targetTouches.length > 0) {
			touch = e.targetTouches[0];
			targetEl = e.target;
			if(targetEl.nextElementSibling) {
				targetEl.nextElementSibling.style.marginTop = "auto";
			}
			targetEl.style.position = "fixed";
			targetEl.style.top = touch.clientY - (targetEl.offsetHeight/2) + "px";
			targetEl.style.left = touch.clientX - (targetEl.offsetWidth/2) + "px";

			for(var i = 0; i < containerPositions.length; i++) {
				var betweenLeftRight = containerPositions[i].xLeft <= touch.clientX && touch.clientX <= containerPositions[i].xRight,
					betweenTopBottom = containerPositions[i].yTop <= touch.clientY && touch.clientY <= containerPositions[i].yBottom,
					containerEl = selectElId(containerPositions[i].elemId);
				
				if(betweenLeftRight && betweenTopBottom) {
					containerEl.style.borderTopStyle = 'dotted';
					containerEl.style.borderBottomStyle = 'dotted';
				} else {
					containerEl.style.borderTopStyle = 'solid';
					containerEl.style.borderBottomStyle = 'solid';
				}
			}
		}

		isMoveable = true;
	} else {
		isMoveable = false;
	}
}

function dragEnter(e) {
	var targetEl;
	e.preventDefault();
	
	if(e.type === "dragenter") {
		targetEl = e.target;
	}

	if(isContainer(targetEl) && isMoveable) {
		targetEl.style.borderTopStyle = 'dotted';
		targetEl.style.borderBottomStyle = 'dotted';
	}
}

function dragLeave(e) {
	e.preventDefault();

	if(isContainer(e.target)) {
		e.target.style.borderTopStyle = 'solid';
		e.target.style.borderBottomStyle = 'solid';
	}
}

function dropped(e) {
	e.preventDefault();
	var isMoveValid = false, firstDiscWeightage, currentDiscWeightage, elemId, children;

	elemId = e.dataTransfer.getData('Text');

	if(elemId && selectElId(elemId)) {
		currentDiscWeightage = parseInt(selectElId(elemId).getAttribute("data-weightage"), 10);
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
			e.target.insertBefore(selectElId(elemId), e.target.firstChild);
			$noOfMoves.innerHTML = ++noOfMoves;
		}
		e.target.style.borderTopStyle = 'solid';
		e.target.style.borderBottomStyle = 'solid';
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
