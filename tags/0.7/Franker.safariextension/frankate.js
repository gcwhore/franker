// ==== Message Management ====

function handleMessage(msgEvent) {
	if (msgEvent.name == "frankateSelection") {
		frankateSelection();
	} else if (msgEvent.name == "frankateSelectionResponse") {
		injectTranslationForSelection(msgEvent);
	} else if (msgEvent.name == "frankatePage") {
		frankatePage();
	// } else if (msgEvent.name == "transformGoogleTranslationBlocks") {
	// 	transformGoogleTranslationBlocks();
	} else if (msgEvent.name == "shortcutFrankateSelectionValue") {
		setFrankateSelectionShortcut(msgEvent);
	} else if (msgEvent.name == "shortcutFrankatePageValue") {
		setFrankatePageShortcut(msgEvent);
	}
}

// ==== Shortcuts ====

function setFrankateSelectionShortcut(msgEvent) {
	//console.log(document.location.href);
	//console.log("Setting shortcut: " + msgEvent.message);
	var values = msgEvent.message.split(":");
	if (values.length > 1) {
		shortcut.remove(values[1]);
	}
	shortcut.remove(values[0]); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(values[0], function() {
		frankateSelection();
	},{
			'type':'keydown',
			'propagate':false,
			'disable_in_input':true,
			'target':document
	});
}

function setFrankatePageShortcut(msgEvent) {
	//console.log(document.location.href);
	//console.log("Setting shortcut: " + msgEvent.message);
	var values = msgEvent.message.split(":");
	if (values.length > 1) {
		shortcut.remove(values[1]);
	}
	shortcut.remove(values[0]); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(values[0], function() {
		frankatePage();
	},{
			'type':'keydown',
			'propagate':false,
			'disable_in_input':true,
			'target':document
	});
}

// ==== Whole Page ====

function frankatePage() {
	safari.self.tab.dispatchMessage("frankatePageRequest", "");
}

function transformGoogleTranslationBlocks() {
	if (document.location.href.indexOf("translate.googleusercontent.com", 0) < 0) {
		console.log("Not transforming google translation blocks, wrong page URL: " + document.location.href);
		return;
	}
	var spans = document.getElementsByTagName('span');
	var i;
	for (i = 0; i < spans.length; i++) {
		if (spans[i].getAttribute('onmouseover')) {
			var dstSpan = spans[i];
			var srcSpan = spans[i+1];
			dstSpan.removeAttribute('style');
			dstSpan.setAttribute('class', 'google-dst-text');
			
			dstSpan.removeAttribute('onmouseover');
			dstSpan.setAttribute('onclick', '_tipon(this)');

			//// uncomment if want tooltip not hide on mouseout
			//spans[i].removeAttribute('onmouseout');

			//// moving the source text's span out of the current span (not required now)
			dstSpan.parentNode.insertBefore(srcSpan, dstSpan);
			//spans[i].removeChild(spans[i+1]);
			
			// wrapping current sentence in para (separate sentences)
			//var separator = document.createElement('p');
			//spans[i].parentNode.insertBefore(separator,spans[i]);
			//separator.appendChild(spans[i]);
			
			//// alternative separation strategies
			//var separator0 = document.createElement('br');
			//spans[i].parentNode.insertBefore(separator0,spans[i]);
			//var separator1 = document.createElement('br');
			//spans[i].parentNode.insertBefore(separator1,spans[i]);
			
			//// uncomment you if want original and translated text to be separated by linefeed
			//var separator2 = document.createElement('br');
			//spans[i].insertBefore(separator2,spans[i+1].nextSibling);
			
			var left = document.createTextNode('(');
			var right = document.createTextNode(')');
			dstSpan.insertBefore(left, dstSpan.firstChild);
			dstSpan.appendChild(right);
			
		}
	}
}

// ==== Selection ====

function getSelectedText() {
	var txt = '';
	if (window.getSelection) {
		txt = window.getSelection();
	} else if (document.getSelection) {
		txt = document.getSelection();
	} else if (document.selection) {
		txt = document.selection.createRange().text;
	}
	return txt;
}

function frankateSelection() {
	var text = getSelectedText();
	if (text + "" != "") {
		//console.log(document.location.href);
		//console.log("selected: " + text);
		safari.self.tab.dispatchMessage("frankateSelectionRequest", text + "");
	}
}

function injectTranslationForSelection(msgEvent) {
	//console.log(document.location.href);
	//console.log("translated:" + msgEvent.message);
	var text = getSelectedText();
	if (text + "" != "") {
		var translationText = document.createTextNode("(" + msgEvent.message + ")");
		var translationNode = document.createElement("span");
		translationNode.setAttribute("class", "google-dst-text");
		translationNode.appendChild(translationText);
		if (text.baseNode.nextSibling) {
			text.baseNode.parentNode.insertBefore(translationNode, text.baseNode.nextSibling);
		} else {
			text.baseNode.parentNode.appendChild(translationNode);
		}
	}
}

// ==== Initial ====

safari.self.addEventListener("message", handleMessage, false);

safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
safari.self.tab.dispatchMessage("shortcutFrankatePageRequest", "");

transformGoogleTranslationBlocks();
