<!-- facebook -->
document.writeln('<div id="fb-root"></div>');

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=" + share_facebook_app_id;
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

<!-- twitter -->
//!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

/*
<!-- google plus -->
//document.writeln('<script src="https://apis.google.com/js/plusone.js"></script>');

<!-- pinterest - Please call pinit.js only once per page -->
//(function(d){var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT'); p.type = 'text/javascript'; p.async = true; p.src = '//assets.pinterest.com/js/pinit.js'; f.parentNode.insertBefore(p, f); }(document));

<!-- linkedin -->
//document.writeln('<script src="//platform.linkedin.com/in.js" type="text/javascript">lang: en_US</script>');
*/

//
// We can dig out the article headline and teaser without "Official Athletic Site".
//
var sh_regex = /<span class="StoryHeadline">\s*(.*?)\s*<\/span>/i;
var headlines  = sh_regex.exec(document.body.innerHTML);
var share_title = (headlines != null) ? headlines[1] : document.title;

//
// Display the article image if available in the head section. Don't include spacer.gif.
//
var link_elements = document.getElementsByTagName('link');
var share_image = ''; // only used by pinterest
var si_regex = /spacer\.gif$/i;

for (i=0; i<link_elements.length; i++) {
    if (link_elements[i].rel == 'image_src' && si_regex.test(link_elements[i].href) == false) {
        share_image = encodeURIComponent(link_elements[i].href);
        break;
    }
} 

var share_url = document.URL;

// ADD A callback ARG SO NETITOR KNOWS WHERE ITS COMMING FROM.
/*
if(share_url.match(/\\\?/)){
    share_url = share_url + '&callback=1';
} else {
    share_url = share_url + '?callback=1';
}
share_url = encodeURIComponent(share_url);
*/

(function() {
    window.CBSiApp = window.CBSiApp || {};
    if (!window.CBSiApp.shareBar) {
        window.CBSiApp.shareBar = {
            div: null,
            visible: false,
            loaded:{
                googleplus: false,
                pinterest: false,
                linkedin: false
            },
            loadAdditionalNetworks: function() {

                //load social network scripts only if someone clicks on share icon
                if (share_googleplus && !this.loaded.googleplus) {

                     window.___gcfg = {
                        lang: 'en-US'
                      };

                      (function() {
                        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
                        po.src = 'https://apis.google.com/js/plusone.js';
                        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
                      })();

                      this.loaded.googleplus = true;

                }

                if (share_pinterest && !this.loaded.pinterest) {
                    (function(d){var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT'); p.type = 'text/javascript'; p.async = true; p.src = '//assets.pinterest.com/js/pinit.js'; f.parentNode.insertBefore(p, f); }(document));

                     this.loaded.pinterest = true;
                }

                if (share_linkedin && !this.loaded.linkedin) {
                    (function() {
                        var li = document.createElement('script'); li.type = 'text/javascript'; li.async = true;
                        li.src = '//platform.linkedin.com/in.js';
                        //li.innerHTML = "lang: en_US";
                        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(li, s);
                      })();

                     this.loaded.linkedin = true;
                }

            },
            /*
            show: function() {


                document.getElementById("storyNavBar").className = "share-menu-open";
                this.visible = true;

                this.loadAdditionalNetworks();

            },
            hide: function() {

                document.getElementById("storyNavBar").className = "";
                this.visible = false;

            },
            */
            toggle: function() {


                if (this.visible) {
                    document.getElementById("storyNavBar").className = "";
                    this.visible = false;
                } else {

                    document.getElementById("storyNavBar").className = "share-menu-open";
                    this.visible = true;

                    this.loadAdditionalNetworks();

                }

            },
            init: function($div) {

                this.div = document.getElementById($div);

                if (window.DomReady) {

                    DomReady.ready(function(){ 
                        CBSiApp.shareBar.ready();
                    });

                } else {

                    CBSiApp.shareBar.ready();

                }

                                 
            },
            ready: function() {
        
                    this.createMenu();

                    if (share_linkedin) {
                        var s = document.createElement("script");
                        s.setAttribute("type", "IN/Share");
                        document.getElementById("storyNavBar-type-linkedin").appendChild(s);
                    }  

                    if (share_facebook_share) {
                        this.div.innerHTML += '<div style="vertical-align: top; min-width:87px; height: 25px" class="fb-share-button" data-type="button_count" data-height="20" data-width="107"></div>';
                    }
                    if (share_facebook_like_share) {
                        this.div.innerHTML += '<div style="vertical-align: top;" class="fb-like" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>';
                    }

                    if(share_twitter) { 
                        this.div.innerHTML += '<a href="http://twitter.com/share" class="twitter-share-button" data-text="' + share_title + '">Tweet</a>';

                        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

                    }                
            },
            createMenu: function() {

                var menu = '<ul><li><a onclick="window.CBSiApp.shareBar.toggle(); return false;"><img src="http://grfx.cstv.com/story-nav/icon-share2.png" alt="Share"> <span class="share-lg">More</span></a><ul>';

                if (share_googleplus) {
                    //menu += '<li><g:plusone annotation="none" width="120"></g:plusone></li>';
                    menu += '<li><div class="g-plusone" data-size="medium" data-annotation="bubble"></div></li>';
                }
                if (share_linkedin) {
                    menu += '<li id="storyNavBar-type-linkedin"></li>';
                }
                if (share_pinterest) {
                    menu += '<li><a href="//www.pinterest.com/pin/create/button/?url=' + share_url + '&media=' + share_image + '&description=' + share_title + '" data-pin-do="buttonPin" data-pin-config="none"><img src="//assets.pinterest.com/images/pidgets/pinit_fg_en_rect_gray_20.png" /></a></li>';
                }
                if (share_stumbleupon) {
                    menu += '<li><a class="share-bar-generic-button" target="_blank" href="' + 'http://www.stumbleupon.com/submit?title=' + share_title + '&url=' + share_url + '"><span class="icon-bg" style="background: #f74425"><img src="http://grfx.cstv.com/story-nav/icon-stumbleupon.png"></span> <span class="icon-name">Stumbleupon</span></a></li>';
                }

                menu += '</ul></li></ul>';              
                
                this.div.innerHTML += menu;

            }
        }
    }
})();

