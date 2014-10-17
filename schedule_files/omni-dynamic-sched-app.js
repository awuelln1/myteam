/////////////////////
var MAX_WINDOW_WIDTH = 767;
var USE_MOBILE_SCHED = false;
if (typeof oas_site_config != "undefined" && oas_site_config.responsive && window.innerWidth < MAX_WINDOW_WIDTH) USE_MOBILE_SCHED = true;

if (USE_MOBILE_SCHED) {
	var stable = document.getElementById("schedtable");
	var nextlast = document.createElement("div");
	nextlast.setAttribute("id", "evt-next-last");
	nextlast.innerHTML = '<div id="evt-last"></div>';
	stable.parentNode.insertBefore(nextlast, stable);

	document.getElementsByTagName('body')[0].className += ' use-mobile-schedule';
}



// fix for schedules with a small height
document.write('<style>#mainfloat{min-height:250px !important;}</style>');


/* This function prototype extends the built-in Date object
 * and returns a Boolean telling whether daylight savings time
 * is in effect for the Date object. It works by comparing two
 * dates to this date: one which is never in daylight savings,
 * and one which always is for zones that have daylight savings.
 * jeff keys 10/12/2007
*/
function Date_isDaylightSavings() {
	var StTime = new Date("January 1, 2007");
	var DtTime = new Date("July 1, 2007");
	var DOffset = StTime.getTimezoneOffset() - DtTime.getTimezoneOffset();
	var ThisOffset = this.getTimezoneOffset() - StTime.getTimezoneOffset();
	return Boolean(DOffset * ThisOffset);
}
Date.prototype.isDaylightSavings = Date_isDaylightSavings;

/*
created by david parnell
copyright College Sports Online, Inc.
no part of this application may be used, duplicated or accessed without permission
*/

function loadXMLDoc(url) {
	var r = new Date();
	var req = new XMLHttpRequest();
	if(req) {
		req.onreadystatechange = function(){processReqChange(req,url)};
		req.open("GET","/data/xml/events/"+usefulSchoolInfo.sport+"/"+usefulSchoolInfo.year+"/"+url+".xml?"+r.getTime(), true);
		req.send("");
	}
}

function processReqChange(req,url) {
	// only if req shows "loaded"
	if (req.readyState == 4) {
		// only if "OK"
		if (req.status == 200) {
			// ...processing statements go here...

			/*  Grab & Direct XML */
			//xmlResp = req.responseXML.documentElement;
			//document.getElementById(url).xmlBlock = new buildDisplay(url,req.responseXML.documentElement);
			if(req.responseXML != null){
				new buildDisplay(url,req.responseXML.documentElement);
			}
			/*  Grab & Direct XML */
		} else {
			alert("There was a problem retrieving the XML data:\n" + req.statusText);
		}
	}
}




///////////////////////////////////////////////// END AJAX /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////// BEGIN Queue //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var initTimer;
var checkForBoxHeight;
var nextAvailEvt;
var adate, datecomponents;
var lastxmltimer;
var qi = 0;
var j = 0;
var timeDiff = 0;
var xyzi = 0;
var decrVal = 6;
var appendTo = "initdisplay";
var sched_User_Prompt = "( Click on an event for complete event information )";
var lastevtclicked = appendTo;
var imgPath = "http://graphics.fansonly.com/graphics/teams/icons/";

var endOfSeason = false;
var readySec = false;
var schedclick = false;
var wasRestored = false;
var q =[];
var q_lastevt = [];
var linkWrap = [];
var linkIcons = [];
var linkAlign = [];

var schedCurtop = 0;
var schedMarkertop = 0;
var schedoffset = schedCurtop;
var schedmarkeroffset = schedMarkertop;
var orighschedoffset = schedCurtop;

////// FLOAT VARS /////////////////
var isAllowedToFloat = false;
var schedTargetY = 0
var schedCurrentY = 0;
var marker2 =0;
var endMarkerOffset = 2;
var currBoxH = 0;
/////////////////////////////////////
var schedStickyHeight = 0;
var schedSticky;
var schedOffsetTop = document.getElementById("maincontainer").offsetTop;
if (typeof DomReady != "undefined") {

	DomReady.ready(function(){

		schedSticky = document.getElementById("sticky-header") ? document.getElementById("sticky-header")  : false;

		if (!schedSticky && document.getElementById("stickybar")) {
			schedSticky = document.getElementById("stickybar");
		}

		if (schedSticky) schedStickyHeight = schedSticky.offsetHeight; // use sticky-header next

	});

}



if (document.getElementById("pos")){document.getElementById("pos").style.display = 'none';}

/////////// SETUP Media links for Gametracker/Audio/Video
	linkIcons["audio"] = ["media-icon-audio-65x11-off.gif","media-icon-audio-65x11-on.gif"];
	linkIcons["video"] = ["media-icon-video-60x11-off.gif","media-icon-video-60x11-on.gif"];
	linkIcons["livestats"] = ["media-icon-live-60x11-off.gif","media-icon-live-60x11-on.gif"];
	linkIcons["fanslive"] = ["media-icon-gt-90x20-off.gif","media-icon-gt-90x20-on.gif"];
	linkIcons["photo"] = ["media-icon-photogallery.gif","media-icon-photogallery.gif"];

	linkAlign["audio"] = "";
	linkAlign["video"] = "";
	linkAlign["livestats"] = "";
	linkAlign["fanslive"] = "right"

	linkWrap["audio"] = ["",""];
	linkWrap["video"] = ["",""];
	linkWrap["livestats"] = ["",""];
	linkWrap["fanslive"] = ["javascript:window.open('","','GameTrackerv3',''); void(0);"];
	for (icon in linkIcons){
		linkIcons[icon].img = new Image();
		linkIcons[icon].img.src = imgPath+linkIcons[icon][1];
	}
///////////////////////////////////////////////

function setQ(table){
	var currentDate = new Date();

// uses the prototype function to determine the offset for comparison
// to the scheduled event start time.  -- jkeys 10/12/2007
	timeDiff = currentDate.getTimezoneOffset()/60 - 5 + currentDate.isDaylightSavings();

	var trlist = document.getElementById(table).getElementsByTagName("tr");
	/////// test for future date
	for (i=0; i < trlist.length; i++) {
		if (trlist[i].id && trlist[i].title){
			if(trlist[i].className){trlist[i].origClass = trlist[i].className;}
			q_lastevt.push(trlist[i]); // add all found tr events in cast only last evt is needed
			datecomponents = trlist[i].title.split(",");
			adate = Date.UTC(datecomponents[0],datecomponents[1],datecomponents[2],(datecomponents[3]-timeDiff),datecomponents[4],datecomponents[5]);
			//j.push(i);
			if(adate > mmm){
				q.push(trlist[i]);
				/////// if future date was found, check for a previous date
				if(trlist[j].id && trlist[j].title){
							q.push(trlist[j])
				}

				break;

			}
			j= i;
		}
	}

	//////////// if no future dates were found, use the last date found
	if (i == trlist.length) {
		q.push(q_lastevt[q_lastevt.length-1]);
		var hdr = addTitle("Next Event");
		var fc = document.getElementById("endofseasondisplay")
					fc.insertBefore(hdr,fc.childNodes[0]);
		initView("endofseasondisplay",1);
		endOfSeason = true;
	}

	document.getElementById(table).origQ = q;
////// send the event URL to be fetched
	loadXMLDoc(q[0].id);
	if (q[1]) {
		initTimer = setInterval(function(){
			if ((readySec == true)) {
				schedclick = false;
				appendTo = "initdisplay";
				loadXMLDoc(q[1].id);
				clearInterval(initTimer);
			}
		},55);
	}
////// send the event URL to be fetched

////// initialize TR mouseover controls
	setTRList(table);
////// initialize TR mouseover controls

}

function setTRList(table){
	var trlist = document.getElementById(table).getElementsByTagName("tr");

	for (i=0; i < trlist.length; i++) {
		if(trlist[i].id && trlist[i].title){

			trlist[i].onclick = function(){
				if (USE_MOBILE_SCHED) {
					document.getElementById("evt-next-last").style.display = "none";
					var obj = this;
					//scroll to the element so we are jumping up and down!
					//setTimeout(function() {
						//var trid = obj.getAttribute("id");
						//document.getElementById(trid).scrollIntoView();
					//}, 100);
				}

				this.last = lastevtclicked;
				lastevtclicked = this;

				appendTo = "eventdisplay";
				//////////////////////
				if(this.last.id != this.id){
					clearInterval(this.last.timer);
					loadXMLDoc(this.id);
				}
				if(wasRestored){
					loadXMLDoc(this.id);
					wasRestored = false;
				}
				//////////////////////
				if(this.last.origClass){this.last.className = this.last.origClass; } else{this.last.className = "";}
				this.last.onmouseover = function(){ this.className = "tr-hilite"; };
				this.last.onmouseout = function(){this.className = ""; };
				schedclick = true; //// set assumption that CLICKs are now in use
				this.className = "tr-selected";
				this.onmouseover = function(){this.className = "tr-selected";};
				this.onmouseout = function(){this.className = "tr-selected";};
				initView("initdisplay",0);
				initView("endofseasondisplay",0);
				initView("restoredisplay",1);
			}
			trlist[i].onmouseover = function(){ this.className = "tr-hilite"; };
			trlist[i].onmouseout = function(){this.className = ""; };
		}
	}

}


///////////////////////////////////////////////// END Queue ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initView(obj,state){
	var view = ["none","block"];
	try {
		document.getElementById(obj).style.display = view[state];
	} catch(e) {
		if (console) {
			console.log(obj + " style set fail")
		}
	}
}

function restore(obj){
	wasRestored = true;

	document.getElementById("eventdisplay").childNodes[0].style.display = "none";
	initView("initdisplay",1);
	initView("restoredisplay",0);

	lastevtclicked.className = "";
	lastevtclicked.onmouseover = function(){ this.className = "tr-hilite"; };
	lastevtclicked.onmouseout = function(){this.className = ""; };

	if (endOfSeason) {
			initView("endofseasondisplay",1);
	} else {
			initView("endofseasondisplay",0);
	}

}

function addHeadToHead(home,opp,atvs){
	var br = document.createElement("BR");
	var ele = document.getElementById("h2h_clone").cloneNode(true);
	var td = ele.getElementsByTagName('TD');
	var imgs = ele.getElementsByTagName('IMG');


	ele.id = "";
	td['vs_insert_clone'].appendChild(document.createTextNode(atvs));
	var icon = new Image();
	var homeCode = home[0].getAttribute("code");
	var oppCode = opp[0].getAttribute("code");
	if(usefulSchoolInfo.sport.match(/w-/)){
		if(homeCode == 'tenn'){
			homeCode = 'tennw';
		}
		if(oppCode == 'tenn'){
			oppCode = 'tennw';
		}
	}
	//icon.src = "http://grfx.cstv.com/graphics/school-logos/"+homeCode+"-lg.png"
	icon.src = "http://graphics.collegesports.com/graphics/teams/team-logo-"+homeCode+".gif";
	imgs["icon_clone_1"].src = icon.src;
	var icon = new Image();
	//icon.src = "http://grfx.cstv.com/graphics/school-logos/"+oppCode+"-lg.png";
	icon.src = "http://graphics.collegesports.com/graphics/teams/team-logo-"+oppCode+".gif";
	imgs["icon_clone_2"].src = icon.src;
	return ele;
}


function addOutcome(string){
	var f_flag = 0;
	if (string.match(/\&/) ) {
		f_flag = 1;
	}

	var dv = document.createElement("DIV");
	var sp = document.createElement("SPAN");
	var stingChomp = string.split("(");

	var oDetail = '';
	dv.className = "evt-outcome";
	if(stingChomp[1]){
		var str = stingChomp[1];
		if(f_flag) {
			var div = document.createElement('div');
			div.innerHTML = stingChomp[1];
			str = div.firstChild.nodeValue;
		}

		oDetail = "("+str;
		sp.className = "evt-outcome-extra";
		sp.appendChild(document.createTextNode(oDetail));
		dv.appendChild(document.createTextNode(stingChomp[0]));
		dv.appendChild(sp);
	}
	else if(f_flag) {
		var forfeit = string.split("&");
		if(forfeit[1]) {
			var str = "&"+forfeit[1];

			var div = document.createElement('div');
			div.innerHTML = str;
			str = div.firstChild.nodeValue;

			oDetail = str;
			sp.className = "evt-outcome-extra";
			sp.appendChild(document.createTextNode(oDetail));
			dv.appendChild(document.createTextNode(forfeit[0]));
			dv.appendChild(sp);
		}
	}else{
		dv.appendChild(document.createTextNode(string));
	}
	return dv;
}

///////////////////////////////////////////////////////////////
function addTourney(t,h,a,av,usevs,matchupOn){ //// tourney, truehome, trueaway, atvs, vsFlag, matchup "showing" Flag
	var dv = document.getElementById("tourname_clone").cloneNode(true);
	dv.id = '';
	dv.appendChild(document.createTextNode("("+t+")"));
	return dv;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function compare(a,b){

	return b - a; // large to small
	// return a - b; //small to large

}



///////////////////////////////////////////////////////////////


function addDetails(detail,hide_date){
	var dv = document.getElementById("details_clone").cloneNode(true);
	var displayOrder = ["day","date","location","time"];
	var td, tr, oText, oCap;
	var dq = [];
	var tb = document.createElement("TBODY");
	dv.id = '';
	//var tdTag = (document.all) ? '<td valign="top">' : "TD";
	var tdTag = "TD";

	for(i=0; i < detail[0].attributes.length;i++) {
		if(displayOrder[i]){
			if (hide_date && displayOrder[i] != "location") {
				continue;
			}

			tr = document.createElement("TR");


			td = document.createElement(tdTag);
			td.className = "evt-detail-title";
			td.setAttribute("valign","top");
			td.setAttribute("width","30%");

			oText = displayOrder[i];
			oCap = oText.charAt(0);
			oCap = oCap.toUpperCase();
			td.appendChild(document.createTextNode(oCap+oText.substr(1)+": "));
			tr.appendChild(td);

			td = document.createElement(tdTag);
			td.className = "evt-detail-gutter";
			td.appendChild(document.createTextNode(" "));
			tr.appendChild(td);

			td = document.createElement(tdTag);
			td.className = "evt-detail-text";
			td.setAttribute("valign","top");
			td.valign = "top";
			td.appendChild(document.createTextNode(detail[0].getAttribute([displayOrder[i]])));
			tr.appendChild(td);

			tb.appendChild(tr);

			///////////////////middle column space
		}
	}

	dv.appendChild(tb);

	return dv;

}

function addTickets(ticket_url) {

		ticket_link = document.createElement('a');
		ticket_link.setAttribute('class', 'evt-detail-text');
		ticket_link.setAttribute('href', ticket_url);
		ticket_link.setAttribute('target', '_blank');

		if (typeof ticket_icon_url == 'undefined'){
			ticket_icon_url = 'http://grfx.cstv.com/schools/taco/graphics/auto/buy-tickets-sched.gif';
		}

		ticket_link.innerHTML = '<img src="' + ticket_icon_url + '">';

		var td, tr;
		var tb = document.createElement("TABLE");
		tb.setAttribute("align","center");

		var tdTag = "TD";

		tr = document.createElement("TR");

		td = document.createElement(tdTag);
		td.className = "evt-detail-text";
		td.setAttribute("align","center");
		td.valign = "center";
		td.appendChild(ticket_link);
		tr.appendChild(td);

		tb.appendChild(tr);

		return tb;
}

///////////////////////////////////////////////////////////////
function addFullCoverage(relatedLinksXml,id){
	var fullc;
	var dv = document.createElement("DIV");

	fullc = document.getElementById("fullcov_link_clone").cloneNode(true);
	fullc.id = id+"_fullc_link";
	fullc.tgle = (schedclick)? 1:0;
	fullc.tgleState = (schedclick)? 1:0;
	fullc.boxState = ["none","block"];
	fullc.indicator = ["More Information [ + ]","Collapse [ - ] "];
	fullc.getElementsByTagName('span')[0].innerHTML = fullc.indicator[fullc.tgle];
	fullc.box = id+"_box";
	/*
	////////////////////////////////////////
	//// DETAILS for ONLCLICK FUNCTION (BELOW)
	//  1. Uses alternating 0 or 1 to select:
	//          a. +/- icon
	//          b. display state block/none
	//    2. Uses reference (next sibling) do determine which FULL COVERAGE box to open/close
	//
	////////////////////////////////////////
	 */
	//fullc.href = "javascript:function(){ this.tgleState++; this.tgle= this.tgleState%2;this.getElementsByTagName('span')[0].innerHTML = this.indicator[this.tgle];this.nextSibling.style.display = this.boxState[this.tgle];void(0);/return false;};

	fullc.onclick = function(){

		this.tgleState++;
		this.tgle= this.tgleState%2;
		//var t =document.createTextNode(this.indicator[this.tgle]);
		//this.getElementsByTagName('span')[0].removeChild(this.getElementsByTagName('span')[0].childNodes[0]);
		this.getElementsByTagName('span')[0].innerHTML = this.indicator[this.tgle];
		document.getElementById(id+"_full_box").style.display = this.boxState[this.tgle];
		void(0);//return false;
	};

	/*
		 dv.onclick = function(){
		 var a8667 = this.getElementsByTagName("A");
		 a8667[0].tgleState++;
		 a8667[0].tgle= a8667[0].tgleState%2;
	//var t =document.createTextNode(this.indicator[this.tgle]);
	//this.getElementsByTagName('span')[0].removeChild(this.getElementsByTagName('span')[0].childNodes[0]);
	a8667[0].getElementsByTagName('span')[0].innerHTML = a8667[0].indicator[a8667[0].tgle];
	document.getElementById(id+"_full_box").style.display = a8667[0].boxState[a8667[0].tgle];
	void(0);//return false;
	};
				 */
	//fullc.onclick = new Function("this.tgleState++; this.tgle= this.tgleState%2; var t =document.createTextNode(this.indicator[this.tgle]); this.getElementsByTagName('span')[0].removeChild(this.getElementsByTagName('span')[0].childNodes[0]);this.getElementsByTagName('span')[0].appendChild(t); this.nextSibling.style.display = this.boxState[this.tgle]; alert(this.nextSibling.id)");

	///////////////////////
	dv.appendChild(fullc);
	return dv;
}
///////////////////////

function addTitle(text,sport){
	var dv = document.getElementById("title_clone").cloneNode(true);
	dv.id = '';
	dv.appendChild(document.createTextNode(text));
	/*if(appendTo != "initdisplay"){
		dv.appendChild(document.createElement("BR"));
		dv.appendChild(document.createTextNode(sport));
		}
	 */
	return dv;

}
///////////////////////
function addSubHeading(titletext){
	var dv = document.createElement("H3");
	dv.className = "evt-sub-heading";
	dv.appendChild(document.createTextNode(titletext));
	return dv;
}

///////////////////////
function addRelatedLinks(relatedLinksXml){

	var links = relatedLinksXml.getElementsByTagName("link");
	var rl,a;
	rl = document.createElement("DIV");
	rl.className = "evt-sub-fullcoverage-box";
	//rl.appendChild(addSubHeading("Related Links"));

	for(i=0; i<links.length;i++) {
				a = document.createElement("A");
				a.className = "evt-related-link";
				a.href = links[i].getAttribute("url");
				a.appendChild(document.createTextNode(links[i].getAttribute("value")));
				rl.appendChild(a);
	}
	return rl;
}///////////////////////
function addGalleryLinks(relatedLinksXml){

	var links = relatedLinksXml.getElementsByTagName("gallery");
	var rl,a;
	rl = document.createElement("DIV");
	rl.className = "evt-sub-gallery-box";
	//rl.appendChild(addSubHeading("Related Links"));

	var unnamed = 0;
	for(i=0; i<links.length;i++) {
		if (!links[i].getAttribute("link_text")) {
			unnamed++;
		}
	}

	for(i=0; i<links.length;i++) {
		var j = i+1;
		var cntr = document.createElement("DIV");
		cntr.className = "evt-sub-gallery-link-container";
		a = document.createElement("A");
		a.className = "evt-related-link";
		a.href = "javascript:"+links[i].getAttribute("popup_js")+" void(0);";
		//a.appendChild(document.createTextNode(links[i].getAttribute("title")));
		a.appendChild(document.createTextNode(links[i].getAttribute("link_text") || "Photo Gallery" + (unnamed>1 ? ' '+j : '') ));
		cntr.appendChild(a);

		// JF added (camera icon):
		var img = document.createElement("IMG");
		// img.className = "evt-sub-gallery-box-img";
		img.src = imgPath+linkIcons["photo"][1];
		cntr.appendChild(img);

		rl.appendChild(cntr);
	}
	return rl;
}
///////////////////////
///////////////////////
function addCoverage(coverageXml){
	//alert(33);
	var cv = coverageXml.getElementsByTagName("coverage");
	var table = document.getElementById("tvcoverage_clone").cloneNode(true);
	var tr;
	var tb = document.createElement("TBODY");
	var td;
	td = table.getElementsByTagName("TD");
	table.id = '';

	for(i=0; i<cv.length;i++) {
		tr = table.getElementsByTagName("TR")[0].cloneNode(true);
		tr.getElementsByTagName("TD")[0].appendChild(document.createTextNode(cv[i].getAttribute("label")+": "));
		tr.getElementsByTagName("TD")[2].appendChild(document.createTextNode(cv[i].getAttribute("value")));
		tb.appendChild(tr);
		//table.getElementsByTagName("TD")["tv_value_clone"].appendChild(document.createTextNode(cv[i].getAttribute("value")));
	}

	table.appendChild(tb);
	//table.removeChild(table.getElementsByTagName("TR")[0]);//rl.appendChild(table);
	return table;
}
///////////////////////

//javascript:window.open('http://livestats.themwc.collegesports.com/livestats/data/m-footbl/430092/','GameTrackermfootbl','toolbar=no,resizeable=no,scrollbars=no,width=780,height=540'); void('');

function addMedia(mediaLinksXML){
	var media = mediaLinksXML.getElementsByTagName("media");
	var rl,a,dv;
	var displayOrder = ["fanslive","video","audio","livestats"];
	var img;

	rl = document.createElement("DIV");
	rl.className = "evt-sub-fullcoverage-box";
	for(i=0; i<media.length;i++) {
		var media_url = media[i].getAttribute("url");
		// The following replacement fixes a bug in Safari 2's encoded ampersand handling.
		// JIRA TECH-3126. 11/09/2007 Jeff Keys
		media_url = media_url.replace(/&#38;/g,"%26");
		//alert(media_url);
		dv = document.createElement("DIV");
		dv.className = "evt-media-linkbox";
		dv.appendChild(document.createTextNode(" "));
		a = document.createElement("A");

		if(media[i].getAttribute("type") == "livestats") {
			a.href = media_url;
			a.appendChild(document.createTextNode(media[i].getAttribute("title")));
			a.className = "evt-related-link";
		} else {
			a.className = "evt-related-icon";
			a.href = linkWrap[media[i].getAttribute("type")][0]+media_url+linkWrap[media[i].getAttribute("type")][1];
			/*
				 if(media[i].getAttribute("type") == "fanslive"){
				 a.href = "#nogo";
				 a.onclick = function(){window.open(media_url,'GameTrackermfootbl','toolbar=no,resizeable=no,scrollbars=no,width=780,height=540'); void(0);};
			//linkWrap["fanslive"] = ["javascript:window.open('","','GameTrackermfootbl','toolbar=no,resizeable=no,scrollbars=no,width=780,height=540'); void(0);"];

			}
			 */
			a.ongrx = linkIcons[media[i].getAttribute("type")][1];
			a.offgrx = linkIcons[media[i].getAttribute("type")][0];
			a.onmouseover = function(){this.getElementsByTagName("IMG")[0].src = imgPath+this.ongrx;}
			a.onmouseout = function(){this.getElementsByTagName("IMG")[0].src = imgPath+this.offgrx;}
			a.setAttribute("oncontextmenu","document.getElementById('mainfloat').style.top = document.getElementById('mainfloat').offsetTop + 50;");
			img = document.createElement("IMG");
			img.src = imgPath+linkIcons[media[i].getAttribute("type")][0];
			img.name = media[i].getAttribute("type")+mynow.getTime();
			img.border = "0";
			img.setAttribute("border","0");
			a.appendChild(img);
		}

		if(media[i].getAttribute("new_window") == "1"){
			a.setAttribute("target","_blank");
		}
		dv.appendChild(a);
		if(media[i].getAttribute("type") == "fanslive" && rl.childNodes[0]) {
			rl.insertBefore(dv, rl.childNodes[0]);
		}else {
			rl.appendChild(dv);
		}
	}
	return rl;
}

function addExtraInfo(xtrainfoXML){
	var table = document.getElementById("extra_clone").cloneNode(true);
	table.id = '';
	table.getElementsByTagName("TD")[0].innerHTML = xtrainfoXML;
	return table;

}


function addOpponent(string){
	var dv = document.getElementById("opponent_clone").cloneNode(true);
	dv.id = '';
	dv.appendChild(document.createTextNode(string));
	return dv;

}

function addAdvertisement(xtrainfoXML){
	var table = document.getElementById("extra_clone").cloneNode(true);
	table.id = '';
	table.getElementsByTagName("TD")[0].innerHTML = xtrainfoXML;
	table.getElementsByTagName("TD")[0].style.textAlign = "center";
	table.getElementsByTagName("TD")[0].setAttribute("align","center");
	return table;
}



function addRecapStory(storyxml){
	var table = document.getElementById("story_clone").cloneNode(true);
	var lnth;
	table.id = '';
	if(storyxml.getAttribute("photo")){
		table.img = new Image();
		table.img.src = storyxml.getAttribute("photo");
		table.getElementsByTagName("IMG")["photo_clone"].src = table.img.src;
	}else{
		//table.removeChild(table.getElementsByTagName("IMG")["photo_clone"]);
		table.getElementsByTagName("TD")[2].style.display = 'none';
		table.getElementsByTagName("IMG")["photo_clone"].style.display = 'none';
		table.getElementsByTagName("IMG")["photo_clone"].style.width = '1px';
		table.getElementsByTagName("IMG")["photo_clone"].style.height = '1px';

	}
	//table.getElementsByTagName("DIV")["story_pubdate_clone"].appendChild(document.createTextNode(storyxml.getAttribute("date")));

	table.a = table.getElementsByTagName("A")["storyheadline_clone"];
	table.a.appendChild(document.createTextNode(storyxml.getAttribute("headline")));
	table.a.href = storyxml.getAttribute("url");

	table.syn = decode_html(storyxml.getAttribute("teaser"));
	lnth = (table.syn.length < 150)? table.syn.length : 150;
	table.synopsis = table.syn.substring(0,lnth);
	table.getElementsByTagName("TD")["content_clone"].appendChild(document.createTextNode(table.synopsis));
	return table;
}

//
//
// Since we're reading the data from XMLs symbols are encoded.  This is a quick and dirty way to decode entities.
//
function decode_html(str) {
    var txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}

/////////////////////////////////////////////////// BUILD CALL ///////////////////////////////////////////////////////////////////////
/*
created by david parnell
copyright College Sports Online, Inc.
no part of this application may be used, duplicated or accessed without permission
*/

function buildDisplay(url,xml){

	var dv = document.getElementById(url);
	var adate, datecomponents, fullcoveragebox, oText, eventMarquee, eventDetails, vs, usevs;
	var openClose = new Array(2);
	var br = document.createElement("br");
	var vertTag = document.createElement("div");
	var h2h_shown = false;

	openClose[true] = "evt-related-open";
	openClose[false] = "evt-related-closed";

	vertTag.className = "fivevert";
	br.setAttribute("clear","all");
	//// create the event div (container node)
	var evtdv = document.createElement("div");
	evtdv.id = url+"event"+appendTo;
	evtdv.className = "evt-display-box";
	evtdv.start = 0;

	if (!USE_MOBILE_SCHED) {

		eval("d"+xyzi+ "= setInterval(new Function('try{obj = document.getElementById(\""+evtdv.id+"\"); if(obj.start > 100){clearInterval(d"+xyzi+")} obj.start += 5;if (document.all){obj.filters[\"alpha\"].opacity = obj.start;}else{obj.style.opacity= obj.start/100;} }catch(e){}'),45);");
		dv.timer = eval("d"+xyzi);
		xyzi++;

		if(document.all && document.getElementById) {
			evtdv.style.width = "98%";
			evtdv.style.filter = "alpha(opacity = 0)";
			evtdv.setAttribute("style","filter:alpha(opacity=0); width:100%");
		}else{
			evtdv.setAttribute("style","opacity: 0; width:100%");
		}

	}


	dv.tree           = xml;
	dv.id             = dv.tree.getAttribute('event_id');
	dv.recap          = dv.tree.getAttribute('flag');
	dv.schoolcode     = dv.tree.getAttribute('school');
	dv.timestamp      = dv.tree.getAttribute('time_stamp');
	////GROUP//////////////////////////////////////
	dv.h2h                  = dv.tree.getElementsByTagName('headtohead');
	dv.atvs                 = (dv.h2h[0].getAttribute('vs')) ? dv.h2h[0].getAttribute('vs'): "";
	///////////////////////////////////////////////
	dv.home           = dv.tree.getElementsByTagName('home');
	dv.away           = dv.tree.getElementsByTagName('away');
	dv.outcome        = dv.tree.getElementsByTagName('outcome_score');
	dv.tournament     = dv.tree.getElementsByTagName('tournament');
	dv.detail         = dv.tree.getElementsByTagName('detail');
	dv.story          = dv.tree.getElementsByTagName('story');
	dv.release        = dv.tree.getElementsByTagName('release');
	dv.coverages      = dv.tree.getElementsByTagName('coverages');
	dv.extrainfo      = dv.tree.getElementsByTagName('extra_info');
	dv.promo          = dv.tree.getElementsByTagName('promotion');
	dv.ad             = dv.tree.getElementsByTagName('advertise');
	dv.medias         = dv.tree.getElementsByTagName('medias');
	dv.related        = dv.tree.getElementsByTagName('related');
	dv.galleries            = dv.tree.getElementsByTagName('galleries');
	dv.truehome       = false;
	dv.trueopponent         = false;
	dv.hide_date            = dv.tree.getAttribute("hide_date");

	var ticket_url;
	dv.ticket_info          = dv.tree.getElementsByTagName('ticket_info');
	if(dv.ticket_info.length){
		ticket_url = dv.ticket_info[0].getAttribute('ticket_url');
	}

	if(dv.home.length){
		dv.truehome       = (dv.tree.getAttribute('school') == dv.home[0].getAttribute('code'))? dv.home : dv.away;
		dv.trueopponent = (dv.tree.getAttribute('school') == dv.home[0].getAttribute('code'))? dv.away : dv.home;
	}
	if(dv.home.length && dv.tree.getAttribute('event_name')){
		dv.trueopponent[0].setAttribute("opp",dv.tree.getAttribute('event_name'));
	}

	/////////// FIRST PRESENTATION FORMAT -- NO recap or score found
	var addvs = (dv.atvs)? dv.atvs+" "      : "";
	if(appendTo == "initdisplay") {
		datecomponents = dv.title.split(",");
		adate = Date.UTC(datecomponents[0],datecomponents[1],datecomponents[2],(datecomponents[3]-timeDiff),datecomponents[4],datecomponents[5]);

		//alert("adate is: "+adate+"\nmmm  is: "+mmm);
		oText = (adate > mmm)? "Next Event" : "Last Event";
		evtdv.appendChild(addTitle(oText));
	} else {
		//oText = dv.getElementsByTagName("TD")[1].childNodes[0].nodeValue;
		oText = (dv.truehome) ? dv.truehome[0].getAttribute("opp") : (dv.tree.getAttribute("event_name"))? dv.tree.getAttribute("event_name"): "";
		if (!dv.hide_date) {
			evtdv.appendChild(addTitle(dv.detail[0].getAttribute("date")));
		}
	}

	// NEED THE DATES TO SEE IF WE SHOULD PUT A TICKET ICON IN
	if(appendTo == "eventdisplay"){
		datecomponents = dv.title.split(",");
		adate = Date.UTC(datecomponents[0],datecomponents[1],datecomponents[2],(datecomponents[3]-timeDiff),datecomponents[4],datecomponents[5]);
	}


	////////// validate for head to head display
	if((dv.home.length != "0") && (!dv.recap)){//&& (dv.outcome.length != "0")
		if(dv.h2h[0].getAttribute("flag") == "yes" && !(dv.recap || dv.home[0].getAttribute('score'))&& dv.tree.getAttribute('logo') == "yes")//// /// ADD THIS BACK into if beyond testing
		{
			if( (dv.outcome[0].getAttribute("data") != "Postponed") && (dv.outcome[0].getAttribute("data") != "Cancelled") && (dv.outcome[0].getAttribute("data") != "NTS")){

				usevs = addvs;
				if(dv.tree.getAttribute('neutral_site') == "yes") {
					usevs = "vs.";
				}

				if(dv.home[0].getAttribute("code") == dv.tree.getAttribute('school')) {
					if(dv.tree.getAttribute('neutral_site') == "yes") {
						evtdv.appendChild(addHeadToHead(dv.truehome,dv.trueopponent,usevs));
					} else {
						evtdv.appendChild(addHeadToHead(dv.trueopponent,dv.truehome,usevs));
					}
				}else{
					evtdv.appendChild(addHeadToHead(dv.truehome,dv.trueopponent,usevs));
				}
				h2h_shown = true;
			}
		}
	}

	////////// validate for Opponent
	var oppText = (dv.home.length != "0") ? dv.trueopponent[0].getAttribute("opp"): dv.tree.getAttribute("event_name");
	var insertVs = dv.atvs+" ";
	if(h2h_shown){
		insertVs = "";
	}
	evtdv.appendChild(addOpponent(insertVs+oppText));
	////////// validate Tournament or Marquee

	if(dv.tournament.length != "0"){
		if(dv.tournament[0].getAttribute("flag") == "yes" ){
			evtdv.appendChild(addTourney(dv.tournament[0].getAttribute("name")));
		}
	}
	////////// validate Outcome
	if(dv.outcome.length != "0"){
		if(typeof dv.outcome[0].getAttribute("data") == "string"){
			evtdv.appendChild(addOutcome(dv.outcome[0].getAttribute("data")));
		}
	}

	////////// validate Details
	if(dv.detail.length != "0"){
		//evtdv.appendChild(vertTag.cloneNode(true));
		evtdv.appendChild(addDetails(dv.detail,dv.hide_date));
		//evtdv.appendChild(vertTag.cloneNode(true));
	}

	////////// validate Details
	if(ticket_url != null ){  // IF A DATE IS NEEDED && adate > mmm
		evtdv.appendChild(addTickets(ticket_url));
	}

	////////// validate Advertisement
	if(document.getElementById("ad_block_clone")) {
		//fullcoveragebox.appendChild(addSubHeading("Advertisement"));
		//var dv_adv = document.getElementById("ad_block_clone").cloneNode(true);
		var vRunning = navigator.appVersion;
		vRunning = vRunning.toLowerCase()
		//if(!(vRunning.indexOf("safari") != -1)){
		if(document.all || (vRunning.indexOf("safari") != -1)){
			var dv_adv = document.createElement("DIV");
			dv_adv.innerHTML = document.getElementById("ad_block_clone").innerHTML;
		}else{
			var dv_adv = document.getElementById("ad_block_clone").cloneNode(true);
			dv_adv.id = '';
		}

		dv_adv.className = 'evt-ad-clone-box';

		evtdv.appendChild(dv_adv);
		//alert("apple")
		///}
	}
	////////// validate advertisement
	if(dv.ad.length != "0"){
		//evtdv.appendChild(vertTag.cloneNode(true));
		//evtdv.appendChild(addSubHeading("Advertisement"));
		evtdv.appendChild(addExtraInfo(dv.ad[0].getAttribute("data")));
		//evtdv.appendChild(vertTag.cloneNode(true));
	}

	////////// validate Recap & Story
	/// get recap if there's one
	if (dv.recap == "recap" && dv.story) {
		evtdv.appendChild(addRecapStory(dv.story[0]));
		evtdv.appendChild(br.cloneNode(true));
	}
	/// else get the weekly release/game note if there's no score yet (since this is a preview)
	else if (dv.recap == "release" && dv.release) {
		if ( dv.outcome.length == "0" || !dv.outcome[0].getAttribute("data") ) {
			evtdv.appendChild(addRecapStory(dv.release[0]));
			evtdv.appendChild(br.cloneNode(true));
		}
	}

	////////// CREATE FULL COVERAGE BOX Recap OR Story
	// the following is an empty "if" statement
	if(dv.related[0].getElementsByTagName("link").length || dv.galleries.length != "0" || dv.medias[0].getElementsByTagName("media").length || dv.extrainfo.length) {
		//if(appendTo != "eventdisplay" && oText.toLowerCase() != "next event"){evtdv.appendChild(addFullCoverage(dv.related[0],dv.id));}
	}
	fullcoveragebox = document.getElementById("related_clone").cloneNode(true);
	fullcoveragebox.id = dv.id+"_full_box";
	fullcoveragebox.className = openClose[schedclick];
	////exception
	fullcoveragebox.className = "evt-related-open"
	//    openClose[true] = "evt-related-open";
	//openClose[false] = "evt-related-closed";
	evtdv.appendChild(fullcoveragebox);
	////////// validate Related Sub Header
	var addedGallery = false;
	if(dv.related[0].getElementsByTagName("link").length && addedGallery != true) {

		fullcoveragebox.appendChild(addSubHeading("Related Links"));
		addedGallery = true;
	}

	if(dv.galleries.length != "0") {
		if(dv.galleries[0].getElementsByTagName("gallery").length && addedGallery != true) {
			fullcoveragebox.appendChild(addSubHeading("Related Links"));
		}
	}


	////////// validate Related Links
	if(dv.related[0].getElementsByTagName("link").length) {
		fullcoveragebox.appendChild(addRelatedLinks(dv.related[0]));
	}

	////////// validate Gallery Links
	if(dv.galleries.length != "0") {
		if(dv.galleries[0].getElementsByTagName("gallery").length){
			fullcoveragebox.appendChild(addGalleryLinks(dv.galleries[0]));
		}
	}

	////////// validate Coverage
	if(dv.coverages[0].getElementsByTagName("coverage").length || dv.medias[0].getElementsByTagName("media").length){
		fullcoveragebox.appendChild(addSubHeading("Coverage"));
	}
	if(dv.coverages[0].getElementsByTagName("coverage").length) {
		fullcoveragebox.appendChild(addCoverage(dv.coverages[0]));
	}
	////////// validate Media Links
	if(dv.medias[0].getElementsByTagName("media").length) {
		fullcoveragebox.appendChild(addMedia(dv.medias[0]));
	}

	////////// validate Promotions
	if(dv.promo.length) {
		fullcoveragebox.appendChild(addSubHeading("Special Promotions"));
		fullcoveragebox.appendChild(addExtraInfo(dv.promo[0].getAttribute("data")));
	}


	////////// validate Additional Information
	if(dv.extrainfo.length) {
		fullcoveragebox.appendChild(addSubHeading("Additional Information"));
		fullcoveragebox.appendChild(addExtraInfo(dv.extrainfo[0].getAttribute("addlink")));
	}
	/////// check/assume TR Click for display to eventdisplay
	if (appendTo == "initdisplay" && USE_MOBILE_SCHED) {

		if (adate > mmm) {
			if (document.getElementById("evt-next")) document.getElementById("evt-next").appendChild(evtdv);
		} else  {
			if (document.getElementById("evt-last")) document.getElementById("evt-last").appendChild(evtdv);
		}
		readySec = true;
		return;
	}
	if(appendTo != "initdisplay" && !USE_MOBILE_SCHED) {
		document.getElementById(appendTo).removeChild(document.getElementById(appendTo).lastChild);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////
	///// Insert the new Content into Display Area
	//////////////////////////////////////////////////////////////////////////////////////////////


	if (!USE_MOBILE_SCHED) {

		//document.getElementById("evt-next-last").style.display = "none";
		document.getElementById(appendTo).appendChild(evtdv);

	} else {


		var rows = document.getElementById("schedtable").getElementsByTagName("tr");
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].getAttribute("id") && rows[i].getAttribute("id").indexOf('-info') > 0) {
						rows[i].parentNode.removeChild(rows[i]);
			}
		}

		var row = document.createElement("tr");
		row.setAttribute("id", dv.id + "-info")
		var cell = document.createElement("td");
		cell.setAttribute("colspan", "4");
		cell.appendChild(evtdv);

		row.appendChild(cell);

		//document.getElementById(dv.id + "-info").appendChild(evtdv);

		insertAfter(document.getElementById(dv.id), row);
	}


	//////////////////////////////////////////////////////////////////////////////////////////////
	readySec = true; //// allow second initial event to begin processing if exist

} /// end buildDisplay

if (!USE_MOBILE_SCHED) {
	document.getElementById("schedtable").parentNode.style.width = "68%";
	document.getElementById("schedtable").parentNode.style.styleFloat = "left";
	document.getElementById("schedtable").parentNode.style.cssFloat = "left";
} else {
	document.getElementById("mainfloat").style.display = "none";
}

function insertAfter(referenceNode, newNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


///////////// FLOAT ///////////////////////

function schedNuDrift(nuObj,hover){

	if (document.all && typeof document.getElementById("maincontainer") != "undefined") {
		orighschedoffset = document.getElementById("maincontainer").offsetTop;
	}

	schedChaseObj = document.getElementById(nuObj);
	adjustSchedDisplayBox()
	marker2 = document.getElementById("end-sched-marker").offsetTop;

	if(document.all) {
				if(document.documentElement.scrollTop) {
							schedTargetY = document.documentElement.scrollTop;
				} else {
							schedTargetY = document.body.scrollTop;
				}
	} else {
				schedTargetY = window.pageYOffset;
	}

	//schedTargetY = (document.all) ? document.body.scrollTop: window.pageYOffset;
	schedCurrentY = (!document.layers) ? eleY(nuObj) : browser(nuObj).pageY ;
	currBoxH = schedChaseObj.offsetHeight;

	var difference = parseInt(schedCurrentY) - schedTargetY - hover;

	var decrement = Math.round(difference / decrVal);

	// sticky header changes
	/*

	if((schedTargetY) > (marker2 - endMarkerOffset)){  return }



	if (schedOffsetTop - schedTargetY > 0) {
				//schedOffsetTop = (schedTargetY > 0) ? schedOffsetTop - schedTargetY : schedOffsetTop;
	}
	var newPos = schedStickyHeight + schedTargetY - schedOffsetTop;



	if (schedTargetY > schedStickyHeight && newPos > 0)  {

				if (schedTargetY > schedOffsetTop) { newPos += 10; }

				schedChaseObj.style.top = newPos + "px";

	} else {

				schedChaseObj.style.top = "0px";

	}


	return;

	/*
	*/

	isAllowedToFloat = false;

	//////// DO NOT ALLOW FLOAT BEYOND THIS POINT
	if((schedTargetY) > (marker2 - endMarkerOffset)){ return }
	//////// DO NOT ALLOW FLOAT BEYOND THIS POINT

	var newPos = schedChaseObj.offsetTop - decrement;

	if (newPos > 0) {
				schedChaseObj.style.top = newPos +"px";
	} else {
				schedChaseObj.style.top = "0px";
	}

	isAllowedToFloat = true;

	var data = "";

	var mywindowLimit = (document.all)? document.body.clientHeight : document.documentElement.clientHeight;

	decrVal = 6;
	schedoffset = 10;
	if (schedSticky) {
				schedoffset += schedStickyHeight;
	}

	/*if(orighschedoffset - schedTargetY > 0){
				decrVal = 10;
				schedoffset = 10; //(schedTargetY > 0) ? orighschedoffset - schedTargetY : orighschedoffset;
	}else{
				decrVal = 10;
				schedoffset = 10;

				if (schedTargetY > schedOffsetTop) {
							schedoffset += schedStickyHeight;
				}

	}
	*/

}
////////////////////////////////////////////////////////////////

///////////// Set Float Hover ///////////////////////

function adjustSchedDisplayBox(){

	if (USE_MOBILE_SCHED) return;

	var mywindowLimit = (document.all)? document.body.clientHeight : document.documentElement.clientHeight;
	var endDiff =  0;//(mywindowLimit - marker);
	var dopercent = (document.all)? (mywindowLimit  - schedoffset )*.90 : (self.innerHeight - schedoffset )*.90;

	if(!document.all && document.getElementById){
		adjustDivs(22);
	}

	if(isAllowedToFloat){
		document.getElementById("mainfloat").style.height = (((marker2 - endMarkerOffset) - schedCurrentY) > endMarkerOffset) ? ( (marker2 - endMarkerOffset) - schedCurrentY)+"px" : document.getElementById("mainfloat").offsetHeight+"px";
		//document.getElementById("mainfloat").style.height = Math.abs( ((marker2 - endMarkerOffset) - schedCurrentY) );
	}
}
///////////// Event Listener for init end position ///////////////////////
function addEvent(obj, evType, fn){
	if (obj.addEventListener){
		obj.addEventListener(evType, fn, false);
		return true;
	} else if (obj.attachEvent){
		var r = obj.attachEvent("on"+evType, fn);
		return r;
	} else {
		return false;
	}
}

//////////////////////////////////////////////////////////////////////
function findPos() {
	var offsetP = document.getElementById("maincontainer");
	while (offsetP) {
		schedCurtop += offsetP.offsetTop;
		offsetP = offsetP.offsetParent;
	}

	schedoffset = schedCurtop;
	orighschedoffset = schedCurtop;
	document.getElementById("mainfloat").style.height = "200px";
	if( !((navigator.userAgent.indexOf("Netscape") != -1) && (navigator.userAgent.indexOf("7") != -1) )){
		masterFloatTimer = window.setInterval("schedNuDrift('mainfloat',schedoffset)", 55);
	}

}

///////////////////////////////////

function adjustDivs(num){
	var divObj = ["endofseasondisplay","initdisplay","eventdisplay","restoredisplay"];
	var i = divObj.length - 1;
	var dv;
	do{
		dv = document.getElementById(divObj[i]);
		dv.style.width = (document.getElementById('mainfloat').offsetWidth - num)+"px";
		//dv.style.width = (Math.round(document.getElementById('mainfloat').offsetWidth*.98))+"px";
	}while(i--);
}

///////////// set hover details /////////////////////
if(document.all){
	window.onload = findPos;

}else{
	schedoffset = document.getElementById("maincontainer").offsetTop;
	orighschedoffset = schedoffset;
	if( !((navigator.userAgent.indexOf("Netscape") != -1) && (navigator.userAgent.indexOf("7") != -1) )){
		masterFloatTimer = window.setInterval("schedNuDrift('mainfloat',schedoffset)", 55);
	}
}
adjustSchedDisplayBox();
///////////////////////
if(!document.all && document.getElementById){
	adjustDivs(12);
}

addEvent(window, 'resize', adjustSchedDisplayBox);


//////////////////////////////////////////////////////////////////////////////////////////////
///// Get today's date in UTC
//////////////////////////////////////////////////////////////////////////////////////////////

mynow = new Date();
dpy =  mynow.getFullYear();
dpm =  mynow.getMonth();
dpd =  mynow.getDate();
dph =  mynow.getHours();
dpmm =  mynow.getMinutes();
dpmm_delay_29 = dpmm - 29; // delay rollover to "Last Event" by 29 minutes
dps =  mynow.getSeconds();
//alert(dpy +"\n"+dpm +"\n"+dpd +"\n"+dph +"\n"+dpmm+"\n"+dps );
//alert(dpy +"\n"+dpm +"\n"+dpd +"\n"+dph +"\n"+dpmm5+"\n"+dps );
mmm = Date.UTC(dpy,dpm,dpd,dph,dpmm_delay_29,dps);
//alert("mmm is "+mmm);

if(document.getElementsByTagName && document.getElementById("schedtable")){
	document.getElementById("selection-prompt").removeChild(document.getElementById("selection-prompt").childNodes[0]);
	document.getElementById("selection-prompt").style.display = "block";
//    document.getElementById("selection-prompt").appendChild(document.createTextNode(sched_User_Prompt));
	setQ("schedtable");
}else{
	document.getElementById("selection-prompt").removeChild(document.getElementById("selection-prompt").childNodes[0]);
	document.getElementById("selection-prompt").style.display = "none";
	document.getElementById("selection-prompt").appendChild(document.createTextNode(" "));
}
if( (navigator.userAgent.indexOf("Netscape") != -1) && (navigator.userAgent.indexOf("7") != -1)){
	document.getElementById("mainfloat").style.overflow = "visible";
	//alert(navigator.appVersion+"\n"+navigator.appVersion+"\n"+navigator.userAgent);
}
/*
created by david parnell
copyright College Sports Online, Inc.
no part of this application may be used, duplicated or accessed without permission
*/
