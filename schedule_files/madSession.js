function madRandomSessionValue(){
var randomnumber = Math.floor(Math.random()*6); // integer between 0 and 5
randomnumber = String.fromCharCode(randomnumber+97);
return randomnumber;
}

function getAdSessionCookie(){
var localMadisonSessionCode;
if(!document.cookie.match("adSess=")){
      localMadisonSessionCode = setAdSessionCookie();
}
else{
      var madSessDC=document.cookie;
      var madSessPrefix = "adSess=";
      var madSessBegin = madSessDC.indexOf(madSessPrefix);
      localMadisonSessionCode = unescape(madSessDC.substring(madSessBegin + 7, madSessBegin + 8));
}
return localMadisonSessionCode;
}

function getFirstpageCookie(){
if(!document.cookie.match("adfirstpage=")){
     return setFirstpageCookie(1);
}
else{
     return setFirstpageCookie(0);
}
}

function setFirstpageCookie(firstpageValue){
     document.cookie = "adfirstpage=" + firstpageValue + ";path=/";
     return firstpageValue;
}

function setAdSessionCookie(){
var madSessNewValue = madRandomSessionValue();
document.cookie = "adSess="+madSessNewValue + ";path=/";
return madSessNewValue;
}

var MadisonSessionCode = getAdSessionCookie();
var adFirstpage = getFirstpageCookie();
