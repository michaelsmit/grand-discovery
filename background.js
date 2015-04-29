// Copyright (c) 2013 Mike Smit. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the url of a tab changes.
function injectscript(data) {
	 chrome.pageAction.show(data.tabId);
	 chrome.tabs.executeScript(
			data.tabId, {file: 'process_journals.js', allFrames: true});
	 

//  }
};


// Listen for any changes to the URL of any tab.
chrome.webNavigation.onCompleted.addListener(injectscript,
		{url: [{hostPrefix: 'scholar.google'}]});

chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendMessage(tab.id, {execute: "checkbibtex"});
});




// 
// 
//   // Callback for chrome.history.getVisits().  Counts the number of
//   // times a user visited a URL by typing the address.
//   var processVisits = function(url, visitItems) {
//     for (var i = 0, ie = visitItems.length; i < ie; ++i) {
//       // Ignore items unless the user typed the URL.
//       console.log(visitItems[i]);
//     }
//   };
// url = "http://www.dal.worldcat.org/title/information-technology-for-management-advancing-sustainable-profitable-business-growth/oclc/846521810?ht=edition&referer=br";
//         var processVisitsWithUrl = function(url) {
//           // We need the url of the visited item to process the visit.
//           // Use a closure to bind the  url into the callback's args.
//           return function(visitItems) {
//             processVisits(url, visitItems);
//           };
//         };
//         chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
//         
//         
//         
