function setWAPCookie(wapVar){
    document.cookie='wappref='+wapVar+';path=/'; 
}
var wapUserAgent = navigator.userAgent;
var wapDestURL = window.location.href;
var wapMobileURL = wapDestURL;
if (wapMobileURL.match(/cstvauctions/)) {
  //noop 
}
else if(wapMobileURL.match(/cstv/)){
	wapMobileURL = wapMobileURL.replace(/.cstv/,"");
	wapMobileURL = wapMobileURL.replace(/http:\/\//,"http://m.");
}
else{
	wapMobileURL = wapMobileURL.replace(/www\./,"m.");
}
if(wapDestURL.match(/wappref=wap/)){
        setWAPCookie('wap');
}
else if(wapDestURL.match(/wappref=std/)){
        setWAPCookie('std');
}
var wapAllcookies = document.cookie;

function testForWap(){
if (wapMobileURL.match(/wireless/)){return;}
if (wapMobileURL.match(/cstvauctions/)){return;}
testForWap2();
}
function testForWap2(){
    //document.write('<!-- ran testForWAP -->');
//    if("wapExempt" in window && wapExempt == 1){return}; // SET wapExempt ON THE PAGE BEFORE LOADING THIS SCRIPT TO CIRCUMVENT WAP BEHAVIOR
    if(wapAllcookies.match(/wappref=std/)){
            // noop - just serve the page quietly
       // document.write('<!-- std WAP pref detected -->');
    }
    else if( // no cookie
       (wapUserAgent.match(/iPhone/i)) ||
	(wapUserAgent.match(/iPod/i)) ||
        (wapUserAgent.match(/Android/i) && wapUserAgent.match(/Mobile/i)) ||
        (wapUserAgent.match(/Windows Phone OS 7/i)) ||
        (wapUserAgent.match(/BlackBerry/i)) ||
        (wapUserAgent.match(/Palm OS/i)) ||
        (wapUserAgent.match(/Windows CE/i)) ||
        (wapUserAgent.match(/NetFront/i)) ||
        (wapUserAgent.match(/Blazer/i)) ||
        (wapUserAgent.match(/Elaine/i)) ||
        (wapUserAgent.match(/Plucker/i)) ||
        (wapUserAgent.match(/AvantGo/i)) 
         ) { 
		wapMobileURL = wapMobileURL.replace(/body/,"mobile"); // REDIRECTS SPORT BODY PAGE
		wapMobileURL = wapMobileURL.replace(/-mtt.html/,"-mtt-mobile.html");
		wapMobileURL = wapMobileURL.replace(/index-main.html/,"index-mobile.html");
	//	wapMobileURL = wapMobileURL.replace(/cstv.com/,"mo2do.net"); // FIX CSTV DOMAINS SHORT TERM
                window.location=wapMobileURL;
    }
}
if (window.location.href.indexOf('http://m.') == -1) {
//    testForWap2();
}
