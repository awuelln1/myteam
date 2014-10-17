var wholePageCommonOrd = Math.random()*10000000000000000;
var wholePageCommonTile = 0; 
var wholePageCommonPTile = 0;
var dcnv = 'N4177';
var dcTestSite = 0;
var procad_vp_width = 3000;
function procad(tag,isSync,returnCheck) {
// popunder blocks - interstitials call will create them
   if(tag.match(/popunder/)){
	return "";
   }
   if(procad_vp_width == 3000){
	procad_vp_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
   }
   if(procad_vp_width < 768 && (window.oas_site_config && window.oas_site_config.responsive)){
	if(tag.match(/superleader/)){
		tag = tag.replace(/superleader/,"320x50m");
		tag = tag.replace(/970x66,970x90/,"320x50");
	}
   }

   if(isSync){
	tag = addPTile(tag);
   }
   else{
	tag = addTile(tag);
   }
   if(dcTestSite == 1){
        tag = tag.replace(/\/CSTV\.\w+\//,"/TESTN/");
   }
   tag = tag.replace(/doubleclick.net/,"doubleclick.net\/" + dcnv);
   tag = addAdSession(tag);
   tag = addAdFirstpage(tag);
   tag = addDCRef(tag);
   tag = addOrd(tag);
   var nrJumpTag = tag.replace(/\/adj\//, "\/jump\/");
   var nrImageTag = tag.replace(/\/adj\//, "\/ad\/");
   if (returnCheck) {
      return "<a href=\"" + nrJumpTag + "\" target=\"_blank\"><img src=" + nrImageTag + "\"></a>"; 
   } else {
      document.writeln("<SCRIPT SRC=\"" + tag + "\" type=\"text/javascript\" language=\"JavaScript1.1\"></SCRIPT>");
      document.writeln("<noscript><a href=\"" + nrJumpTag + "\" target=\"_blank\"><img src=" + nrImageTag + "\">" );
      document.writeln("</a></noscript>");
   }
}

function addPTile(aPTileTag) {
	if(wholePageCommonPTile == 16){
		return aPTileTag;
		}
	wholePageCommonPTile++;
        var pTileAppend = 'ptile=' + wholePageCommonPTile;
	if(wholePageCommonPTile == 1){
		pTileAppend = pTileAppend + ';dcopt=ist';
		}
	return aPTileTag.replace(/dcopt=ist/g, pTileAppend);
}

function addTile(aTileTag) {
	if(wholePageCommonTile == 16){
		return aTileTag;
		}
	wholePageCommonTile++;
        var tileAppend = 'tile=' + wholePageCommonTile;
	if(wholePageCommonTile == 1){
                tileAppend = tileAppend + ';dcopt=ist';
                }
	return aTileTag.replace(/dcopt=ist/g, tileAppend);
}

function addOrd(everyTag) {
	return everyTag + 'ord=' + wholePageCommonOrd + "?";
}

function addDCRef(everyTag){
	return everyTag + 'dc_ref=' + encodeURIComponent(location.href) + ";";
}

function addAdSession(everyTag) {
        return everyTag + 'session=' + MadisonSessionCode + ";";
}

// madSession.js sets adFirstpage for us
function addAdFirstpage(everyTag){
        return everyTag + 'firstpage=' + adFirstpage + ";";  
}
