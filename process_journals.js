// Copyright (c) 2013 Mike Smit


//var resultString = '<div class="gs_r" style="z-index:400"><div class="gs_ggs gs_fl"><button type="button" id="gs_ggsB0" class="gs_btnFI gs_in_ib gs_btn_half"><span class="gs_wr"><span class="gs_bg"></span><span class="gs_lbl"></span><span class="gs_ico"></span></span></button><div class="gs_md_wp gs_ttss" id="gs_ggsW0"><a href="{0}"><span class="gs_ggsL"><span class=gs_ctg2>'+ chrome.extension.getURL("/logo.png") + '</span></a></div></div><div class="gs_ri"><h3 class="gs_rt"><a href="{0}">{1}</a></h3><div class="gs_a">{2}</a> - See GRAND Forum for further details - forum.grand-nce.ca</div><div class="gs_rs">This paper is reported to be associated with the following projects: {3}</div></div></div>';

function createResult(url, title, authors, venue, date, projects) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.class = 'gs_r';
    temp.style = 'z-index:400';
    temp.innerHTML = '<div class="gs_r" style="z-index:400"><div class="gs_ggs gs_fl"><button type="button" id="gs_ggsB0" class="gs_btnFI gs_in_ib gs_btn_half"><span class="gs_wr"><span class="gs_bg"></span><span class="gs_lbl"></span><span class="gs_ico"></span></span></button><div class="gs_md_wp gs_ttss" id="gs_ggsW0"><a href="{0}"><span class="gs_ggsL"><span class=gs_ctg2><img height="40" src="{1}"></span></a></div></div><div class="gs_ri"><h3 class="gs_rt"><a href="{0}">{2}</a></h3><div class="gs_a">{3}</a> - {4}, {5} - forum.grand-nce.ca</div><div class="gs_rs">This paper is reported to be associated with the following projects: {6}</div></div></div>'.format(url, chrome.extension.getURL("/logo.png"), title, authors, venue, date, projects);
	//console.log(temp.innerHTML);
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

//
// 0 = url
// 1 = title
// 2 = authors
// 3 = projects

//doProcessing(false);

var results = document.querySelector("#gs_hdr_frm_in_txt");

loadMatchingPapers(results.value, processResponse);


function doProcessing(checkBibtex) {

	if (typeof(document.querySelectorAll) != "function") {
		console.log('Browser not supported.');
		return;
	}
	
	
	
	var results = document.querySelectorAll(".gs_r");

	if (typeof(results) === 'undefined') {
		return;
	}
	
	
	
		console.log(results);
	// this shit gets crazy.
	for (var key = 0; key < results.length; key++) {
		//console.log(results[key]);
		for (var childkey = 0; childkey < results[key].children.length; childkey++) {
			if (results[key].children[childkey].className == "gs_ri") {
				result = results[key].children[childkey];
				for (var i = 0; i < result.children.length; i++) {
					if (!checkBibtex && result.children[i].className == "gs_a") {
						var myString = result.children[i].innerHTML;
						if (processJournalText(results[key], myString)) {
							break;
						} 
						// only check bibtext if I can't already block
					} else if (checkBibtex && result.children[i].className == "gs_fl") {
					    var bar = result.children[i];
						for (var aindex = 0; aindex < bar.children.length; aindex++) {
							if (bar.children[aindex].innerText == "Import into BibTeX") {
								setTimeout(loadScholarBibtex, (key * 500) + Math.floor(Math.random()*500), bar.children[aindex].href, processResponse, results[key]);

								//console.log("Loading " + bar.children[aindex].href);
								//
							}
						}
					}
				}
				
				//
			}
		}
	}
	//loadScholarBibtex("http://scholar.google.ca/scholar.bib?q=info:aOdBHj98CBwJ:scholar.google.com/&output=citation&hl=en&as_sdt=0,5&ct=citation&cd=0",
	//processResponse, results[0]);
// based on Mozilla sample code: https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Synchronous_and_Asynchronous_Requests

}

function loadMatchingPapers (keywords, callback, loose) {
  //var args = arguments.slice(2);
  url = "http://grand.cs.ualberta.ca/~msmit/grand_forum/index.php?action=api.getPublicationSearch&keywords=" + encodeURIComponent(keywords);
  if (loose == true) {
    url += "&loose";
  }
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (xhr.readyState === 4) { 
      if (xhr.status === 200) {
        // mess with the this pointer. ah, ecmascript.
        console.log(xhr);
        callback.call(xhr);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send(null);
}

function processJournalText(nodeRef, inputText) {
	var text = inputText.replace(/(<([^>]+)>)/ig,"").toLowerCase();
	for (var jindex = 0; jindex < blacklist.length; jindex++) {
		if (text.indexOf(blacklist[jindex]) !== -1) {
			console.log(text + " matched " + blacklist[jindex]);
			nodeRef.style.background = "#dddddd";
			nodeRef.style.opacity = "0.4";
			nodeRef.style.filter = "alpha(opacity=40)";
			return true;
		}
	}
	return false;
}
						
function processResponse () {
	response = JSON.parse(this.responseText);
	console.log(response.messages);
	var nodes = document.querySelectorAll('.gs_r');
	var insertpoint = nodes[nodes.length - 1];

	for (i = 0; i < response.data.matched.length; i++) {
	    result = response.data.matched[i];
	    newNode = createResult(result.url, result.title, result.authors, result.venue, result.date, result.projects);
	    //console.log(newNode);
	    // seriously, no "insertAfter" in plain old javascript?
	    insertpoint.parentNode.insertBefore(newNode, insertpoint.nextSibling);

		//console.log(myresultstring);
	}
//	processJournalText(nodeRef, this.responseText);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.execute == "checkbibtex") {
      var results = document.querySelector("#gs_hdr_frm_in_txt");
	  loadMatchingPapers(results.value, processResponse, true);
    }
  });
  

//"{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
// from http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}



