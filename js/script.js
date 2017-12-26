var numOfDisks = 4,
	noOfMoves = 0,
	isMoveable = false,
	containerPositions = [],
	$disks,
	$containers,
	$touchOverContainer,
	$btnReset = selectElId("js-btn-reset"),
	$inputNumOfDisks = selectElId("js-ip-num-of-disks"),
	$outputNumOfDisks = selectElId("js-op-num-of-disks"),
	$noOfMoves = selectElId("js-no-of-moves");

function selectElId(id) {
	return document.getElementById(id);
}

function selectElClass(className) {
	return document.getElementsByClassName(className);
}

function renderElements() {
	if($inputNumOfDisks) {
		numOfDisks = parseInt($inputNumOfDisks.value, 10);
	}

	$outputNumOfDisks.innerHTML = numOfDisks;
	$containers = selectElClass("js-container");

	for(var i = 0; i < $containers.length; i++) {
		$containers[i].addEventListener("dragenter", dragEnter, false);
		$containers[i].addEventListener("dragleave", dragLeave, false);
		$containers[i].addEventListener("dragover", function(e) { e.preventDefault(); }, false);
		$containers[i].addEventListener("drop", dropped, false);

		$containers[i].innerHTML = "";
		$containers[i].classList.remove("on-over");
	}

	for(var i = 1; i <= numOfDisks; i++) {
		var $disk = document.createElement("div");

		$disk.setAttribute("id", "disk-" + i);
		$disk.setAttribute("data-weightage", i);
		$disk.setAttribute("class", "disk js-move-disk");

		selectElId('js-container-left').appendChild($disk);

		$disk.addEventListener("dragstart", startDrag, false);
		$disk.addEventListener("dragend", function(e) { e.preventDefault(); }, false);
		$disk.addEventListener("touchstart", startDrag, false);
		$disk.addEventListener("touchmove", startDrag, false);
		$disk.addEventListener("touchend", dropped, false);
	}

	$disks = selectElClass("js-move-disk");
	noOfMoves = 0;
	$noOfMoves.innerHTML = noOfMoves;
	checkContainersPositions();
	checkContainers();
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
					containerEl = selectElId(containerPositions[i].containerId);

				if(betweenLeftRight && betweenTopBottom) {
					containerEl.classList.add("on-over");
					$touchOverContainer = containerEl;
				} else {
					containerEl.classList.remove("on-over");
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
		targetEl.classList.add("on-over");
	}
}

function dragLeave(e) {
	e.preventDefault();

	if(isContainer(e.target)) {
		e.target.classList.remove("on-over");
	}
}

function dropped(e) {
	e.preventDefault();
	var isMoveValid = false, firstDiscWeightage, currentDiscWeightage, diskId, containerChildren, $overContainer, $draggedDisk;

	if(e.dataTransfer) {
		diskId = e.dataTransfer.getData('Text');
		$overContainer = e.target;
	} else if(e.type === "touchend" && isMoveable) {
		diskId = e.target.id;
		$overContainer = $touchOverContainer;
	} else {
		return false;
	}

	if($overContainer) {
		containerChildren = $overContainer.children;
		$draggedDisk = selectElId(diskId);
	} else {
		return false;
	}

	if(diskId && $draggedDisk) {
		currentDiscWeightage = parseInt($draggedDisk.getAttribute("data-weightage"), 10);
	}

	if(containerChildren && containerChildren[0]) {
		firstDiscWeightage = parseInt(containerChildren[0].getAttribute("data-weightage"), 10);
		isMoveValid = currentDiscWeightage < firstDiscWeightage;
	} else {
		isMoveValid = diskId && containerChildren.length === 0;
	}

	if(isContainer($overContainer)) {
		if(isMoveValid) {
			$overContainer.insertBefore($draggedDisk, $overContainer.firstChild);
			$noOfMoves.innerHTML = ++noOfMoves;
		}
		$overContainer.classList.remove("on-over");
		$draggedDisk.style.position = "";
		$draggedDisk.style.top = "";
		$draggedDisk.style.left = "";
	}

	checkContainers();
}

function isContainer(elem) {
	return elem && elem.hasAttribute('class') && elem.getAttribute('class').indexOf("js-container") !== -1;
}

function checkContainers() {
	var containerChildren;
	for(var i = 0; i < $containers.length; i++) {
		containerChildren = $containers[i].children;

		if(containerChildren && containerChildren.length > 0) {
			for(var j = 0; j < containerChildren.length; j++) {
				containerChildren[j].setAttribute("draggable", (j === 0));
				containerChildren[j].style.marginTop = "";
			}
		}
	}
}

function checkContainersPositions() {
	var positionLeft, positionTop;
	containerPositions = [];

	for(var i = 0; i < $containers.length; i++) {
		positionLeft = $containers[i].offsetLeft, positionTop = $containers[i].offsetTop;

		containerPositions.push({
			containerId: $containers[i].id,
			xLeft: positionLeft,
			xRight: positionLeft + $containers[i].offsetWidth,
			yTop: positionTop,
			yBottom: positionTop + $containers[i].offsetHeight
		});
	}
}

window.addEventListener("load", renderElements, false);
window.addEventListener("resize", checkContainersPositions, false);
$inputNumOfDisks.addEventListener("change", renderElements, false);
$btnReset.addEventListener("click", renderElements, false);
