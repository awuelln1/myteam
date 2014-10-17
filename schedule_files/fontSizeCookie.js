/* file edited on 12/3 by Oscar*/
function getFontSizeCookie(font_cookie_name) {
	if (document.cookie.length>0) {
		font_cookie_start=document.cookie.indexOf(font_cookie_name + "=");
		if (font_cookie_start!=-1) { 
			font_cookie_start=font_cookie_start + font_cookie_name.length+1; 
			font_cookie_end=document.cookie.indexOf(";",font_cookie_start);
			if (font_cookie_end==-1) font_cookie_end=document.cookie.length;
			return unescape(document.cookie.substring(font_cookie_start,font_cookie_end));
		} 
	}
	return "";
}

function setFontSizeCookie(font_cookie_name,value,expiredays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=font_cookie_name+ "=" +escape(value)+((expiredays==null) ? "" : "; expires="+exdate.toGMTString()) + ";path=/";
}

function checkFontSizeCookie() {
	s=getFontSizeCookie(fontSizeCookieName);
	if (s!=null && s!="") {
		try { 
			document.getElementById(element_ID_adjusted).style.fontSize = s+"px";
		} catch(e) {}
	}
}

function increaseFontSize() {
	var div = document.getElementById(element_ID_adjusted);
	if (document.getElementById(element_ID_adjusted).style.fontSize) {
		var s = parseInt(document.getElementById(element_ID_adjusted).style.fontSize.replace("px",""));
	} else {
		var s = 12;
	}
	if (s!=max) {
		s += 1;
	}
	document.getElementById(element_ID_adjusted).style.fontSize = s+"px"
	setFontSizeCookie(fontSizeCookieName,s,365);
}

function decreaseFontSize() {
	var div = document.getElementById(element_ID_adjusted);
	if(document.getElementById(element_ID_adjusted).style.fontSize) {
		 var s = parseInt(document.getElementById(element_ID_adjusted).style.fontSize.replace("px",""));
	} else {
		 var s = 12;
	}
	if(s!=min) {
		 s -= 1;
	}
	document.getElementById(element_ID_adjusted).style.fontSize = s+"px"
	setFontSizeCookie(fontSizeCookieName,s,365);
}   