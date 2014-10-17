// DF1.1 :: domFunction 
// *****************************************************
// DOM scripting by brothercake -- http://www.brothercake.com/
// GNU Lesser General Public License -- http://www.gnu.org/licenses/lgpl.html
//******************************************************

function domFunction(f, a) {
	
	var n = 0;
	var t = setInterval(function() {
		
		var c = true;
		n++;
	
		if(typeof document.getElementsByTagName != 'undefined' && (document.getElementsByTagName('body')[0] != null || document.body != null)) {
			
			c = false;
			
			if(typeof a == 'object') {
				for(var i in a) {
					if 
					(
						(a[i] == 'id' && document.getElementById(i) == null)
						||
						(a[i] == 'tag' && document.getElementsByTagName(i).length < 1)
					) 
					{ 
						c = true;
						break; 
					}
				}
			}

			if(!c) { f(); clearInterval(t); }
		}
		
		if(n >= 60) {
			clearInterval(t);
		}
		
	}, 250);
};


// DOMREADY - https://code.google.com/p/domready/
// DomReady.ready(function(){ /*do something */ });
if (typeof window.DomReady == "undefined") {
(function(){var i=window.DomReady={};var h=navigator.userAgent.toLowerCase();var c={version:(h.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[])[1],safari:/webkit/.test(h),opera:/opera/.test(h),msie:(/msie/.test(h))&&(!/opera/.test(h)),mozilla:(/mozilla/.test(h))&&(!/(compatible|webkit)/.test(h))};var d=false;var e=false;var g=[];function a(){if(!e){e=true;if(g){for(var j=0;j<g.length;j++){g[j].call(window,[])}g=[]}}}function f(j){var k=window.onload;if(typeof window.onload!="function"){window.onload=j}else{window.onload=function(){if(k){k()}j()}}}function b(){if(d){return}d=true;if(document.addEventListener&&!c.opera){document.addEventListener("DOMContentLoaded",a,false)}if(c.msie&&window==top){(function(){if(e){return}try{document.documentElement.doScroll("left")}catch(k){setTimeout(arguments.callee,0);return}a()})()}if(c.opera){document.addEventListener("DOMContentLoaded",function(){if(e){return}for(var k=0;k<document.styleSheets.length;k++){if(document.styleSheets[k].disabled){setTimeout(arguments.callee,0);return}}a()},false)}if(c.safari){var j;(function(){if(e){return}if(document.readyState!="loaded"&&document.readyState!="complete"){setTimeout(arguments.callee,0);return}if(j===undefined){var k=document.getElementsByTagName("link");for(var l=0;l<k.length;l++){if(k[l].getAttribute("rel")=="stylesheet"){j++}}var m=document.getElementsByTagName("style");j+=m.length}if(document.styleSheets.length!=j){setTimeout(arguments.callee,0);return}a()})()}f(a)}i.ready=function(k,j){b();if(e){k.call(window,[])}else{g.push(function(){return k.call(window,[])})}};b()})();
}


var createIFramePlayer = function(obj) {



    var defaults = {
        element: null,
        debug: false,
        code_ver: 2,
        embed_player: '/vp/single-player/v',
        aspect: '16x9',
        player_id: 'cbsiamvideoembed_' + Math.random().toString().slice(2),
        player_width: '100%',
        player_width: '100%',
        maxWidth: false,
        fullDomain: false,
        allowMobileOverride: true
    };

    defaults.embed_player += defaults.code_ver + '/';

    for (var key in obj) {
        defaults[key] = obj[key];
    }

    // netitor needs a full url
    if (window.location.href.indexOf("netitor.com") > -1) defaults.debug = true;

    // debug needs a full url
    if (defaults.debug) defaults.embed_player = 'http://onlyfans.cstv.com/scripts/video/single-player/v' + defaults.code_ver + '/';

    // add fullDomain in case this is an external site or microsite with /vp/ directory. 
    if (defaults.fullDomain) {
        if (defaults.fullDomain.substring(defaults.fullDomain.length-1) == "/") defaults.fullDomain = defaults.fullDomain.substring(0,defaults.fullDomain.length-1);
        defaults.embed_player = defaults.fullDomain + '/vp/single-player/v' + defaults.code_ver + '/';
    }

    // provide 16x9 or 4x3 (default to 16x9)
    var aspectRatio = (defaults.aspect.split('x')[1] / defaults.aspect.split('x')[0]) * 100;


    // OAS WAP should limit to 300px wide
    if (window.mobile_oas && defaults.allowMobileOverride) { 
        obj.width = false; 
        defaults.maxWidth = 300;
    }

    if (!document.getElementById('cbsiamvideoembed')) {
        var head = document.getElementsByTagName('head')[0];
        var css = ' .cbsiamvideoembed-embed { width: 100%; position: relative; height: auto; padding-bottom: 56.25%;} .cbsiamvideoembed-embed iframe {position: absolute; top:0; left:0; width: 100%; height: 100%}';
        var style = document.createElement('style');
        style.setAttribute("id", "cbsiamvideoembed");
        style.innerHTML =  css;
        head.appendChild(style);
    }


    // set a width provided as the max width
    if (obj.width) {
        defaults.maxWidth = false;
    } else {
        //no max width so use 100 and default max Width
        defaults.width = defaults.player_width;
        defaults.height = defaults.player_height;
    }




    var maxWidth = '';

    if (typeof defaults.width == 'string' && defaults.width.match(/%/)) {
        // width is something like "75%"
        defaults.width = parseInt(defaults.width.split('%')[0]);
        if (defaults.width > 100) defaults.width = 100;
        maxWidth = defaults.width + '%';
    } else { 
        // case is 100, or '100px'
        // no %, try to conver to plain integeer for the max width
        try { defaults.width = defaults.width.split('px')[0]; } catch (e) {}
        maxWidth = parseInt(defaults.width) + 'px';
    }


    // didn't specify a width, so use our default width
    if (defaults.maxWidth) {
        maxWidth = defaults.maxWidth + "px";
    }




    // add the % to the padding value, if it isn't 56.25%
    if (typeof aspectRatio != 'string') aspectRatio += "%";
    if (aspectRatio != "56.25%")  {
        aspectRatio = 'style="padding-bottom: ' + aspectRatio + ';"';
    } else {
        aspectRatio = "";
    }


    

    // function to create the JSON string to pass to the iFrame
    var jsonString = (function() {
        var json = '{';
        var first = true;

        for (var k in defaults) {
            if (!first) json += ",";
            json += '"' + k + '":"' + defaults[k] + '"';
            if (first) first = false;
        }

        json += '}';

        return encodeURIComponent(json);
    })();

    var iframeCode = '<iframe src="' + defaults.embed_player + '?j=' + jsonString + '" scrolling="no" frameborder="0" allowtransparency="true" seamless></iframe>';

    var player = '<div class="cbsiamvideoembed-wrap"><div class="cbsiamvideoembed-embed" id="' + defaults.player_id + '" ' + aspectRatio + '>' + iframeCode + '</div></div>'

    if (defaults.element) {
        DomReady.ready(function(){ 
            var ele = defaults.element;
            var plyr = player;
            var max = maxWidth;
            var pid = defaults.player_id;
            document.getElementById(ele).innerHTML = plyr;
            document.getElementById(pid).parentNode.style.maxWidth = max;
        });
    } else { 
        document.write(player);
        document.getElementById(defaults.player_id).parentNode.style.maxWidth = maxWidth;
    }   
};