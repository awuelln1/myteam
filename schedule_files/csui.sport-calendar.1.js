//Sport csuiCalendar
//requires csui
/* HOW THIS WORKS.....


launch()
    checkFeatures()
    loadXML(*SPORT/SEASON/INDEX.XML*)
        grabInitialData()
            generateSortedScoreboard()
                checkIfScoresAreLoaded()
                createEventLI() -- loops for all events
                findFirstNonExpired()
                    moveItems() -- moves to first non expired
                    fillEvents() -- FOR EACH EVENT VISIBILE....
                        getAndStoreEventXML(*SPORT/SEASON/EVENTID.XML*)
                            parseEventXML()
                                outputEvent()
    generateControls()
    autoUpdate() -- sets timer based on setting
        autoUpdateScores()
            grabGTData(*GTSCORES/SPORT-SCOREBOARD.XML*)
                outputEvent()

*/
var csuiCalendar = function() {
    var data, jcal_cookie_name, jcal_cookie, jcal_urlfix,
        allowAutoUpdates = true,
        jcal_current_score = 0,
        jcal_auto_play_status = true,
        jcal_ani_status = false,
        jcal_auto_update_jcal,
        jcal_events_array = [],
        jcal_sortlist_bydate = [],
        jcal_sorted_writeout = [],
        jcal_events_to_reload = [],
        jcal_obj = this,
        jcal_loading_timer = null,
        jcal_events_shown = 0,
        jcal_event_pos = 0,
        jcal_machine,
        jcal_original_reload,
        jcal_loading_timer,
        jcal_allow_photo = true,
        jcal_allow_video = true,
        jcal_allow_audio = true,
        jcal_allow_gt = true,
        jcal_not_mobile = true,
        sbIE = false,
        jcal_slideAmount = 0,
        foundFirstItem = false,
        xmlDIR = '';

        var movementDetected;
        var touchStart = 0;

    var gameTrackerLive = ['m-basebl','m-baskbl','m-footbl','m-hockey','m-sprintfb','m-volley','w-baskbl','w-fieldh','w-volley','m-lacros','m-soccer','w-lacros','w-soccer','w-softbl'];


    // default jcalOptions
    var jcalOptions = {
        divIDprefix: 'jcal',
        reload: 25000,
        animationSpeed: 600,
        sport: '',
        year: '2014',
        yearOverride: '2014',
        url: window.location.hostname,
        calWidth: 400,
        calHeight: 220,
        eventWidth: 130,
        enableTouch: true
    }

    var inArray = function (arr, obj) {
        for(var i=0; i<arr.length; i++) {
            if (arr[i] == obj) return true;
        }
    };

    var checkFeatures = function() {

        //check for Android/iOS/orientate-able devices
        if (
            typeof window.orientation != 'undefined' ||
            navigator.userAgent.match(/mobile/i) ||
            navigator.userAgent.match(/android/i) ||
            navigator.userAgent.match(/windows phone/i) ||
            navigator.userAgent.match(/blackberry/i) ||
            navigator.userAgent.match(/iphone/i) ||
            navigator.userAgent.match(/ipod/i)  ||
            navigator.userAgent.match(/ipad/i)
        ) {
            jcal_allow_photo = false;
            jcal_allow_video = false;
            jcal_allow_audio = false;
            jcal_allow_gt = false;
            jcal_not_mobile = false;
            return;
        }

    };

    var xmlContainsEvents = function(xml){
      //return true;

      if (xml.getElementsByTagName("event").length > 0) return true;

      return false;


    }

    //LOADS SPORT/SEASON/INDEX.XML
    var loadXML = function (attempt) {

        window.sportCalendar = {
          attempt: attempt
        };

        if (attempt == 4) {
             xmlDIR = "/schools/" + schoolCode + "/data/xml/";
             jcalOptions.year = parseInt(jcalOptions.year) - 1;
         } else if (attempt == 3) {
             xmlDIR = "/schools/" + schoolCode + "/data/xml/";
             jcalOptions.year = parseInt(jcalOptions.year) + 1;//reset year to +1 because we just decreased it the last attempt
         } else if (attempt == 2) {
             //xmlDIR = "/schools/" + schoolCode + "/data/xml/";
             jcalOptions.year = parseInt(jcalOptions.year) - 1;
             xmlDIR = "/data/xml/";
         } else {
             xmlDIR = "/data/xml/";
         }
         var dataFile = 'events/'+jcalOptions.sport+'/'+jcalOptions.year+'/index.xml';
         var jcal_req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXjcal_object("Microsoft.XMLHTTP");
         jcal_req.open('GET', xmlDIR + dataFile + '?src=sprtcal&t=' + new Date().getTime(), true);
         jcal_req.send();
         jcal_req.onreadystatechange = function() {
            if (jcal_req.readyState != 4) { return; }
            if (jcal_req.status == 200) {
                if (xmlContainsEvents(jcal_req.responseXML)) {
                  grabInitialData(jcal_req.responseXML, true);
                } else {
                  if (!window.sportCalendar.attempt) {
                    loadXML(2);
                  } else {
                    loadXml(window.sportCalendar.attempt + 1)
                  }
                }
            }
            if (jcal_req.status != 200) {
                if (attempt == 4 || attempt ==5) {
                    //failed loading out of /schools/dir to next year
                    loadCalendarError();
                    clearTimeout(jcal_auto_update_jcal);
                } else if (attempt == 4) {
                    loadXML(4); //load out of /schools/dir to original year
                } else if (attempt == 4) {
                    loadXML(3); //load one year backk
                } else {
                    loadXML(2);
                }
            }
        };
    }

    // SPORT/SEASON/EVENT_ID.XML
    var parseEventXML = function (xml, parent, callback) {
       var att = xml.attributes;
       for (a = 0; a < att.length; a++) {
           //if (!parent[att[a].nodeName]) {
               parent[att[a].nodeName] = att[a].value;
           //}
       }

       if (xml.getElementsByTagName("medias").length > 0) {
            var element = xml.getElementsByTagName("medias")[0].getElementsByTagName("media");
            parent['medias'] = [];
            for (x = 0; x < element.length; x++) {
                parent['medias'][x] = []
                var att = element[x].attributes;
                for (a = 0; a < att.length; a++) {
                    parent['medias'][x][att[a].nodeName] = att[a].value;
                }
            }
        }

        if (xml.getElementsByTagName("release").length > 0) {
            var element = xml.getElementsByTagName("release");
            parent['release'] = [];
            for (x = 0; x < element.length; x++) {
                parent['release'][x] = []
                var att = element[x].attributes;
                for (a = 0; a < att.length; a++) {
                    parent['release'][x][att[a].nodeName] = att[a].value;
                }
            }
        }

        if (xml.getElementsByTagName("coverages").length > 0) {
            element = xml.getElementsByTagName("coverages")[0].getElementsByTagName("coverage");
            parent['coverage'] = [];
            for (x = 0; x < element.length; x++) {
                parent['coverage'][x] = []
                var att = element[x].attributes;
                for (a = 0; a < att.length; a++) {
                    parent['coverage'][x][att[a].nodeName] = att[a].value;
                }
            }
        }

        if (xml.getElementsByTagName("related").length > 0) {
            element = xml.getElementsByTagName("related")[0].getElementsByTagName("link");
            parent['link'] = [];
            for (x = 0; x < element.length; x++) {
                parent['link'][x] = []
                var att = element[x].attributes;
                for (a = 0; a < att.length; a++) {
                    parent['link'][x][att[a].nodeName] = att[a].value;
                }
            }
        }

        if (xml.getElementsByTagName("galleries").length > 0) {
            element = xml.getElementsByTagName("galleries")[0].getElementsByTagName("gallery");
            parent['gallery'] = [];
            for (x = 0; x < element.length; x++) {
                parent['gallery'][x] = []
                var att = element[x].attributes;
                for (a = 0; a < att.length; a++) {
                    parent['gallery'][x][att[a].nodeName] = att[a].value;
                }
            }
        }

        if (xml.getElementsByTagName("story").length > 0) {
            element = xml.getElementsByTagName("story");
            parent['story'] = [];
            var att = element[0].attributes;
            for (a = 0; a < att.length; a++) {
                parent['story'][att[a].nodeName] = att[a].value;
            }
        }

        element = xml.getElementsByTagName("detail");
        parent['location'] = element[0].getAttribute('location');

        if (xml.getElementsByTagName("outcome_score").length > 0) {
            element = xml.getElementsByTagName("outcome_score");
            var att = element[0].attributes;
            for (a = 0; a < att.length; a++) {
                if (att[a].nodeName == "data") {
                    parent['outcome_scoredata'] = att[a].value;
                }

            }
        }

        if (xml.getElementsByTagName("headtohead").length > 0) {
            element = xml.getElementsByTagName("headtohead");
            var att = element[0].attributes;
            for (a = 0; a < att.length; a++) {
                parent['headtohead'+att[a].nodeName] = att[a].value;
            }
        }

        if (xml.getElementsByTagName("ticket_info").length > 0) {
            element = xml.getElementsByTagName("ticket_info");
            var att = element[0].attributes;
            for (a = 0; a < att.length; a++) {
                parent[att[a].nodeName] = att[a].value;
            }
        }

       if (callback) {
           callback.call();
       }
    };

    // EVENTS/SPORT/SEASON/EVENT_ID.XML
    var getAndStoreEventXML = function(x, eID) {
         var jcal_req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXjcal_object("Microsoft.XMLHTTP");
         jcal_req.open('GET', xmlDIR + "events/" + jcalOptions.sport + '/' + jcalOptions.year + '/' + eID + '.xml?src=sprtcal&t=' + new Date().getTime(), true);
         //jcal_req.open('GET', 'calendar/test' + eID + '.xml?src=sprtcal&t=' + new Date().getTime(), true); //for testing
         jcal_req.send();
         jcal_req.onreadystatechange = function() {
            if (jcal_req.readyState != 4) { return; }
            if (jcal_req.status == 200) {
                var xr = jcal_req.responseXML;
                var jcal_events_data = xr.getElementsByTagName('event');

                parseEventXML(jcal_events_data[0], jcal_events_array[x], function() {
                   outputEvent(eID);
                });

            }
        };
    };

    // ----- INIT -----

    this.launch = function (opts) {

        //override jcalOptions
        for (var item in jcalOptions) {
            if (typeof opts[item] != 'undefined') {
                jcalOptions[item] = opts[item];
            }
        }

        if (jcalOptions.yearOverride) {
            jcalOptions['year'] = jcalOptions.yearOverride;
        }

        checkFeatures(); // checking for flash/ios/android
        var jcal_loading_message = document.createElement("div");
            jcal_loading_message.setAttribute('id', jcalOptions.divIDprefix + '-machine-loading');
            jcal_loading_message.innerHTML = "Loading Calendar...";
        document.getElementById(jcalOptions.divIDprefix + "-machine").appendChild(jcal_loading_message);

        var jcal_machine_slider = document.createElement("ul");
            jcal_machine_slider.setAttribute('id', jcalOptions.divIDprefix + '-machine-slider');
        document.getElementById(jcalOptions.divIDprefix + "-machine").appendChild(jcal_machine_slider);
        jcal_machine = document.getElementById(jcalOptions.divIDprefix + '-machine-slider');
            jcal_machine.style.width = "1000px";

        var jcal_comp = document.createElement("div");
            jcal_comp.setAttribute("id", jcalOptions.divIDprefix + "-composite");
        var jcal_comp_butt = document.createElement("a");
            jcal_comp_butt.setAttribute("id", jcalOptions.divIDprefix + "-composite-button");
            jcal_comp_butt.setAttribute("href", "/scoreboard/");
            jcal_comp_butt.innerHTML  =  "Composite Calendar";
        jcal_comp.appendChild(jcal_comp_butt);
        document.getElementById(jcalOptions.divIDprefix + "-machine").appendChild(jcal_comp);



         document.getElementById(jcalOptions.divIDprefix + '-machine-wrapper').style.height = jcalOptions.calHeight + "px";
            document.getElementById(jcalOptions.divIDprefix + '-machine-wrapper').style.width = jcalOptions.calWidth + "px";
            jcal_machine_slider.style.height = jcalOptions.calHeight + "px";
            jcal_machine_slider.style.width = "50000px";

        jcal_original_reload = jcalOptions.reload;

        loadXML();
        generateControls();


        //if (jcal_not_mobile) {
           autoUpdate();
           //call this to get the live data quicker
           if (jcalOptions.reload > 0) { setTimeout(function(){ autoUpdateScores(true); }, 1500) }
       //}

    };

    var mwSwitch = function (x) {
        x = x.replace("Women's", "W");
        x = x.replace("Men's", "M");
        return x;
    };


    var Date_isDaylightSavings = function() {
        /*
        * jeff keys 10/12/2007
        */
        var cDate = new Date();
        var StTime = new Date("January 1, 2007");
        var DtTime = new Date("July 1, 2007");
        var DOffset = StTime.getTimezoneOffset() - DtTime.getTimezoneOffset();
        var ThisOffset = cDate.getTimezoneOffset() - StTime.getTimezoneOffset();
        return Boolean(DOffset * ThisOffset);
    };

    var logoSwap = function($code) {

        if ($code == "tenn") {
            if (jcalOptions.sport.match(/w-/)) {
                return "tennw";
            }

        }
        return $code;

    };

    // ----- GET SCORES -----

    // GRABBING THE DATA AFTER LOADING SPORT/SEASON/INDEX.XML
    // DATE, EVENT ID, LOCAL TIME, EASTERN TIME, EASTERN DATE AND A FEW OTHER ATTRIBUTES
    var grabInitialData = function(xr, firstRun) {

        var currentDate = new Date();
        var timeDiff=currentDate.getTimezoneOffset()/60 - 5 + Date_isDaylightSavings();

        var jcal_events_data = xr.getElementsByTagName('event');
        jcal_events_array.length = 0;

        for (x = 0; x < jcal_events_data.length; x++) {

            var eID = jcal_events_data[x].getAttribute("id");

            jcal_events_array[x] = [];

            jcal_events_array[x]['written'] = 0;

            //get event_date (parent )
            for (z = 0; z < jcal_events_data[x].parentNode.attributes.length; z++) {
                jcal_events_array[x][jcal_events_data[x].parentNode.attributes[z].nodeName] = jcal_events_data[x].parentNode.attributes[z].value;
            }

            //get info
            for (z = 0; z < jcal_events_data[x].attributes.length; z++) {
                jcal_events_array[x][jcal_events_data[x].attributes[z].nodeName] = jcal_events_data[x].attributes[z].value;
            }

            //get a real date/time
            if (typeof jcal_events_array[x]['eastern_date'] != "undefined") {
                var date_time = jcal_events_array[x]['eastern_date'];
            } else {
                var date_time = jcal_events_array[x]['date'];
            }


            if (jcal_events_array[x]['eastern_time'] == "TBA" || jcal_events_array[x]['eastern_time'] == "TBD" || jcal_events_array[x]['eastern_time'] == "All Day")  {
                 var xtime = "08:00";
            } else {
                 var xtime = jcal_events_array[x]['eastern_time'];
            }


            //all day
            if (jcal_events_array[x]['eastern_time'] == "All Day") {
                jcal_events_array[x]['time'] = 'All Day';
            }

            var xtimesplit = xtime.split(':');

            //var now = new Date();
            var dates = new Date(date_time.substring(0,4), date_time.substring(4,6)-1, date_time.substring(6,8), xtimesplit[0], xtimesplit[1]);
            dates.setHours(dates.getHours()-timeDiff);

            jcal_events_array[x]['fixed_date'] = dates;
        }

        //if (firstRun) {  //REMOVED FOT GT UPDATES--ALWAYS A FIRST RUN NOW
            generateSortedScoreboard(function(){
                for (x = 0; x < jcal_sorted_writeout.length; x++) {
                    createEventLI(x, function() { /* do nothing */ });
                }
                //FIX jcal_slideAmount = Math.floor(jcal_machine.parentNode.offsetWidth/jcal_machine.getElementsByTagName("li")[0].offsetWidth);
                jcal_slideAmount = Math.floor(jcalOptions.calWidth / jcalOptions.eventWidth);
                findFirstNonExpired();
            }, true);
        //}
        /* REMOVED FOR GT UPDATES INSTEAD
        else {
            searchToUpdate();
        }
        */

    };

    // ----- GENERATE -----

    /* REMOVED FOR GT UPDATES
    var searchToUpdate = function() {
       var now = new Date();

        for (x = 0;x < jcal_events_array.length; x++) {
           var diff = (Date.parse(jcal_events_array[x]['fixed_date']) - Date.parse(now));
           diff = diff/1000/60/60;
           if (diff > -6 && diff < 1) {
               getAndStoreEventXML(x, jcal_events_array[x]['id']);
           }
        }
    };

    */

    // CREATE ALL THE LIST ITEMS AT THE START
    // THIS IS DONE FOR PERFORMANCE REASONS
    var createEventLI = function (x, callback) {
        var jcalli = document.createElement("li");
        jcalli.setAttribute("id", "jc-" + jcal_events_array[x]['id']);
        var jcalloading = document.createElement("div");
        jcalloading.className = "jc-loading";
        jcalli.appendChild(jcalloading);
        var now = new Date();
        var event_date = jcal_events_array[x]['fixed_date'];
        var expired_status = (event_date < now) ? "expired" : "upcoming";
        jcalli.className = expired_status;
        jcal_machine.appendChild(jcalli);
        callback.call();
    };

    // IF NO DATA, SHOW THE ERROR
    var loadCalendarError = function () {
        document.getElementById(jcalOptions.divIDprefix + "-machine-loading").style.display = "none";
        var element = document.createElement("div");
        element.setAttribute("id", jcalOptions.divIDprefix + "-error");
        element.innerHTML = 'No Calendar Data Available';
        document.getElementById(jcalOptions.divIDprefix + "-machine").appendChild(element);
        hideItm(jcal_machine);
    };

    var generateSortedScoreboard = function (callback) {
        var s, x;

        jcal_sortlist_bydate.length = 0;

        //remove the error message if it's there
        if (document.getElementById(jcalOptions.divIDprefix + '-error')) {
            var element = document.getElementById(jcalOptions.divIDprefix + "-error");
            element.parentNode.removeChild(element);
        }

        jcal_machine.innerHTML = "";


        if (jcal_events_array.length === 0) { loadCalendarError(); }

        var now = new Date;

        // ======================
        // create sorting list
        var tmp_array = [];

        var jcal_status_check;
        for (x = 0; x < jcal_events_array.length; x++) {
            jcal_sortlist_bydate.push([
                 jcal_events_array[x]['id'],
                 //jcal_events_array[x]['fixed_date'],
                 jcal_events_array[x]['fixed_date'],
                 0, // leftover from generic
                 0, // leftover from generic
                 jcal_events_array[x]['status']
            ]);
        }

        if (jcal_sortlist_bydate.length <= 0) {
            loadCalendarError();
            clearTimeout(jcal_auto_update_jcal);
            //setPlayStatus('pause');
            return;
        }

        // ======================
        //sort the sorting list

        jcal_sortlist_bydate.sort(function(a, b) {
           if (a[1] < b[1]) return -1;
           if (a[1] > b[1]) return 1;
           return 0
        });

        // ======================

        jcal_sorted_writeout.length = 0;

        // hang up?
        for (s = 0; s < jcal_sortlist_bydate.length; s++) {
             jcal_sorted_writeout.push(jcal_sortlist_bydate[s]);
        }

        //FIX jcal_machine.style.width = (parseInt(jcal_machine.style.width) + 1000) + "px";
        jcal_machine.style.width = "50000px";

        checkIfScoresAreLoaded();

        if (callback) { callback.call(); }

    };


    //FILLS THE EVENTS BASED ON HOW MANY SHOULD BE VISIBLE AND THE DIRECTION OF SLIDING
    var fillEvents = function (start, count, dir) {
            if (dir==1) {
                count++;
                var total = jcal_events_array.length;
                var end_at = start+count;
                if (total < end_at) {
                   end_at = total;
                }
                var x = start;
                for (x; x < end_at; x++) {
                    if (jcal_events_array[x]['written'] != 1) {
                        jcal_events_array[x]['written'] = 1;
                        getAndStoreEventXML(x, jcal_events_array[x]['id']);
                    }
                }
            } else {
                var end_at = start-count;
                if (end_at < 0) {
                    end_at = 0;
                }
                var x = start+count;
                var start_to = start;
                if (start_to < 0) {
                    start_to = 0;
                }
                for (x; x >= start_to; x--) {
                    if (jcal_events_array[x]['written'] != 1) {
                        jcal_events_array[x]['written'] = 1;
                        getAndStoreEventXML(x, jcal_events_array[x]['id']);
                    }
                }
            }
       };

    // CHECKS IF WE SHOULD REMOVE THE LOADING MESSAGE
    var checkIfScoresAreLoaded = function () {
        if (jcal_machine.getElementsByTagName("li").length > 0) {
            clearTimeout(jcal_loading_timer);
            hideItm(document.getElementById(jcalOptions.divIDprefix + "-machine-loading"));
        } else {
            jcal_loading_timer = setTimeout(function(){ checkIfScoresAreLoaded(); }, 100);
            return;
        }

    }

    // ----- AUTO UPDATE SCORES ----


    var autoUpdateScores = function (initial) {



        var flagAsUpdateable = false;
        var now = new Date();
        for (x = 0;x < jcal_events_array.length; x++) {
           var diff = (Date.parse(jcal_events_array[x]['fixed_date']) - Date.parse(now));
           diff = diff/1000/60/60;
           //if ((diff > -12 && diff < 2) && jcal_events_array[x]['headtoheadflag'] == 'yes') {
           if ((diff > -12 && diff < 2) && inArray(gameTrackerLive, jcalOptions.sport)) {
               flagAsUpdateable = true;
              // getAndStoreEventXML(x, jcal_events_array[x]['id']);
           }
        }

        if (flagAsUpdateable && allowAutoUpdates) {


             var jgt_req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXjcal_object("Microsoft.XMLHTTP");

             jgt_req.open('GET', '/gametracker/'+jcalOptions.sport+'-scoreboard.xml?src=sprtcal&t=' + new Date().getTime(), true);

             jgt_req.send();
             jgt_req.onreadystatechange = function() {
                if (jgt_req.readyState != 4) { return; }
                if (jgt_req.status == 200) {
                    if (jgt_req.responseText.match(/!DOCTYPE/i)) {
                        allowAutoUpdates = false;
                    } else {
                        grabGTData(jgt_req.responseXML);
                    }

                }
                if (jgt_req.status == 404) {
                   allowAutoUpdates = false;
                }
            }

        }

        if (!initial) {
            autoUpdate();
        }


    };


    var grabGTData = function (xml) {

        var gtData = [];
        var x,z ;
        for (x = 0; x < xml.getElementsByTagName("event").length; x++) {
            var e =  xml.getElementsByTagName("event")[x];
            for (z = 0; z < jcal_events_array.length; z++) {
                je = jcal_events_array[z];

                if (e.getAttribute('event_id') == je['master_event_id']) {
                    je['inning'] = e.getAttribute('inning');
                    je['hs'] = e.getAttribute('hscore');
                    je['vs'] = e.getAttribute('vscore');
                    if (e.getAttribute('started') == "Y") {
                        je['status'] = "I";
                    }
                    if (e.getAttribute("final") == "Y") {
                        je['status'] = "F";
                    }

                    if (e.getAttribute("inning")  && e.getAttribute("inning") != "") {
                            je['inning'] = e.getAttribute("inning");
                    }
                    if (e.getAttribute("period")  && e.getAttribute("period") != "") {
                        je['period'] = e.getAttribute("period");
                    }
                    if (e.getAttribute("quarter")  && e.getAttribute("quarter") != "") {
                            je['quarter'] = e.getAttribute("quarter");
                    }

                    //UPDATE THIS EVENT
                    outputEvent(je['id']);

                    break;
                }
            }

        }

    };


    // -----  OUTPUT / UPDATE THE EVENT -----

    // FUCNTION TO UPDATE THE EVENT's DIV WITH DATA.
    // CALL THIS EVERY TIME TO POPULATE OR UPDATE THE INFO
    // AS IT CLEARS ALL THE HTML BEFORE IT DOES AN INNERHTML FUNCTION
    var outputEvent = function(id) {

        var liveChk,
            hom_team,
            vis_team,
            event_name,
            score_info="",
            gametracker_item = false,
            gtLink,
            x;

        //find row based on event id
        for (x = 0; x < jcal_events_array.length; x++) {
            if (jcal_events_array[x]['id']  == id) { break; }
        }

        //jcal_events_shown++;

        var monthabbrev = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
        var dayabbrev = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        var now = new Date();

        //jcal_events_array[x]['fixed_date'].setDate(jcal_events_array[x]['fixed_date'].getDate() + 150); //TESTING CHANGE THE DATE

        var event_date = jcal_events_array[x]['fixed_date'];

        // setting this date manually because changing the timezone will change the displayed date
        // this is only used to display the day/date at the top of the calendar
        var event_day = new Date();
        event_day.setYear(jcal_events_array[x]['date'].substring(0,4))
        event_day.setMonth(jcal_events_array[x]['date'].substring(4,6)-1)
        event_day.setDate(jcal_events_array[x]['date'].substring(6,8));

        // FIX FOR DATES BEING WRONG!
        event_day = event_date;

        var diff = (Date.parse(jcal_events_array[x]['fixed_date']) - Date.parse(now));
        diff = diff/1000/60/60;


        if (typeof jcal_events_array[x]['status'] == 'undefined') {

            //if event was yesterday
            //var gHours = jcal_events_array[x]['fixed_date'].getHours();
            //if ((diff < 0 && diff > gHours*-1 ) || diff < -24) {
            //    jcal_events_array[x]['status'] = 'F';
            //}

            //setting as Live if no status and within 4 hours
            //if (diff > -4 && diff < 0) {
            //    jcal_events_array[x]['status'] = "I";
            //}
            if (jcal_events_array[x]['time'] == "All Day" && diff > -24 && diff < 0) {
                jcal_events_array[x]['status'] = 'ALLDAY';
            }

        }
        // flash version seems to calculate expired based on content of the xml not the date,
        // but here we're also taking the date/time into account
        var expired_status = (jcal_events_array[x]['status'] == 'F') ? "expired" : "upcoming";
        // overwrite status if it's set to I
        if (jcal_events_array[x]['status'] == 'I' || jcal_events_array[x]['status'] == 'ALLDAY') { expired_status = 'inprogress'; }
        if (jcal_events_array[x]['outcome_score'] || jcal_events_array[x]['outcome_scoredata'] || jcal_events_array[x]['story']) {
            expired_status = 'expired';
            if (jcal_events_array[x]['outcome_scoredata'] == "Postponed") {
              jcal_events_array[x]['status'] = 'P';
            } else if (jcal_events_array[x]['outcome_scoredata'] == "Delayed") {
              jcal_events_array[x]['status'] = 'D';
            } else if (jcal_events_array[x]['outcome_scoredata'] == "Cancelled") {
              jcal_events_array[x]['status'] = 'C';
            } else {
                jcal_events_array[x]['status'] = 'F';
            }
        }



        var score_sheet = document.getElementById('jc-' + id);
        score_sheet.innerHTML = "";
        score_sheet.className = expired_status;

        var score_info = "";

        score_info += '<div class="jc-date">' +  dayabbrev[event_day.getDay()] + ' ' + monthabbrev[event_day.getMonth()] + ' ' + event_day.getDate() +' </div>';

        //Show Final Label
        /*if (jcal_events_array[x]['outcome_scoredata'] && jcal_events_array[x]['headtoheadflag'] == "no") {
            score_info += '<div class="jc-status">' + jcal_events_array[x]['outcome_scoredata'] + '</div>';
        } else
        */

        if (typeof jcal_events_array[x]['status'] != 'undefined' && jcal_events_array[x]['headtoheadflag'] != "ALLDAY") {
            score_info += '<div class="jc-status">';
            switch (jcal_events_array[x]['status']) {
                case "I":
                    var haveStatus = false;
                    if (jcal_events_array[x]['inning']) { score_info += jcal_events_array[x]['inning']; haveStatus = true; }
                    if (jcal_events_array[x]['period']) { score_info += jcal_events_array[x]['period']; haveStatus = true; }
                    if (jcal_events_array[x]['quarter']) { score_info += jcal_events_array[x]['quarter']; haveStatus = true; }
                    if (!haveStatus) { score_info += "IN PROGRESS"; }
                    break;
                case "F":
                    if (jcal_events_array[x]['outcome'] == "Postponed") {
                        score_info += "POSTPONED ";
                    } else if (jcal_events_array[x]['outcome'] == "Cancelled") {
                        score_info += "CANCELLED ";
                    } else {
                        score_info += "FINAL";
                    }
                    break;
                case "C":
                    score_info += "CANCELLED ";
                    break;
                case "S":
                    score_info += " ";
                    break;
                case "D":
                    score_info += "DELAYED ";
                    break;
                case "P":
                    score_info += "POSTPONED ";
                    break;
                default:
                    break;
            }
           // score_info += jcal_events_array[x]['inning'];
            score_info += '</div>';
        }


        // if (event_date <= now) {
        if (typeof jcal_events_array[x]['status'] != 'undefined' && jcal_events_array[x]['status'] != "ALLDAY") {

            vis_team = jcal_events_array[x]['vn'] ;
            hom_team = jcal_events_array[x]['hn'] ;

            event_name = (jcal_events_array[x]['event_name']) ? jcal_events_array[x]['event_name'] : false;

            if (typeof hom_team == 'undefined') { hom_team = event_name; }
            if (typeof vis_team == 'undefined') { vis_team = event_name; }

            if (jcal_events_array[x]['headtoheadflag'] == "no") {
                //COMBINED EVENT
                var ocs = (jcal_events_array[x]['outcome_score']) ? jcal_events_array[x]['outcome_score'] : "";
                score_info += '<div class="jc-eventresults">' + jcal_events_array[x]['event_name'] + '</div><div class="jc-outcome">' + ocs + '</div>';

            } else {

                //HEAD 2 HEAD EVENT
                var visw = ((jcal_events_array[x]['scorea'] || jcal_events_array[x]['vs']) && (parseInt(jcal_events_array[x]['vs']) > parseInt(jcal_events_array[x]['hs']))) ? "" : " theloser";
                var homw = ((jcal_events_array[x]['scoreb'] || jcal_events_array[x]['hs']) && (parseInt(jcal_events_array[x]['hs']) > parseInt(jcal_events_array[x]['vs']))) ? "" : " theloser";

                score_info += '<div class="jc-teama' + visw +'"><div class="jc-teamname">' + vis_team + "</div>";
                    if (jcal_events_array[x]['vs']) { score_info += '<div class="jc-scorea">' + jcal_events_array[x]['vs'] + '</div>' + "\n"; }
                score_info += '</div>' + "\n";


                score_info += '<div class="jc-teamb' + homw +'"><div class="jc-teamname">' + hom_team + "</div>";
                    if (jcal_events_array[x]['hs']) { score_info += '<div class="jc-scoreb">' + jcal_events_array[x]['hs'] + '</div>' + "\n"; }
                score_info += '</div>' + "\n";

            }

        } else {


            vis_team = jcal_events_array[x]['vn'];
            hom_team =  jcal_events_array[x]['hn'];
            vis_teamcode = jcal_events_array[x]['vc'];
            hom_teamcode =  jcal_events_array[x]['hc'];

            visIsThisSchool = (vis_teamcode == schoolCode) ? true : false;

            if (jcal_events_array[x]['headtoheadflag'] == "no") {
                //COMBINED EVENT

                score_info += '<div class="jc-eventname">' + jcal_events_array[x]['event_name'] + '</div>';

                teamImgCode = schoolCode;

            } else {
                //HEAD 2 HEAD EVENT

                if (typeof jcal_events_array[x]["headtoheadvs"] != 'undefined' && jcal_events_array[x]["headtoheadvs"] != '') {

                    score_info += '<div class="jc-vs">' + ((typeof vis_team == 'undefined' || typeof hom_team == 'undefined') ?  jcal_events_array[x]["event_name"] : (jcal_events_array[x]['conf_flag'] && jcal_events_array[x]['conf_flag'] == "yes" ? '' : jcal_events_array[x]["headtoheadvs"]) + ' ' + jcal_events_array[x]["event_name"] ) + '</div>';

                    //score_info += '<div class="jc-vs">' + ((typeof vis_team == 'undefined' || typeof hom_team == 'undefined') ?  jcal_events_array[x]["event_name"] : jcal_events_array[x]["headtoheadvs"] + ' ' + ((visIsThisSchool) ? hom_team : jcal_events_array[x]["event_name"]))+ '</div>';

                } else {
                    score_info += '<div class="jc-vs">'+jcal_events_array[x]["event_name"]+'</div>';
                }

                teamImgCode = (visIsThisSchool) ? hom_teamcode : vis_teamcode;
                if (teamImgCode == 'TBD' || teamImgCode == 'TBA' || (typeof hom_team == "undefined" || typeof vis_team == "undefined")) {
                    teamImgCode = schoolCode;
                }

            }

        }

        // BREAK FOR LOGO
        if (typeof jcal_events_array[x]['status'] == 'undefined' || jcal_events_array[x]['status'] == "ALLDAY") {
            var fadeLogo = (teamImgCode == schoolCode) ? " jc-fadelogo" : "";

            //check for replacement logo
            teamImgCode = logoSwap(teamImgCode);

            score_info += '<div class="jc-logo'+fadeLogo+'"><img src="http://grfx.cstv.com/graphics/school-logos/'+teamImgCode+'-sm.png" /></div>';
        }

            //TIME
            if (typeof jcal_events_array[x]['status'] == 'undefined' || jcal_events_array[x]['status'] == "ALLDAY") {
                score_info += '<div class="jc-time">' + jcal_events_array[x]['local_time'] + '</div>' + "\n";
            }

            // LOCATION
            if ((jcal_events_array[x]['location'] && jcal_events_array[x]['status'] != "F" && typeof jcal_events_array[x]['status'] == 'undefined') || jcal_events_array[x]['status'] == "ALLDAY") {
                score_info += '<div class="jc-location">' + jcal_events_array[x]['location'] + '</div>' + "\n";
            }

            score_info += '<div class="jc-section-noicons">';

            //RECAP
            if (jcal_events_array[x]['story']) {
                score_info += '<div class="jc-recap jc-spacing"><a href="http://' + jcalOptions.url + jcal_events_array[x]['story']['url'] + '">Recap</a></div>' + "\n";
            }


            // LINKS
            if (jcal_events_array[x]['link']) {
                for (var a = 0; a < jcal_events_array[x]['link'].length; a++) {
                    if (jcal_events_array[x]['link'][a]['value']  != "Final Stats") {
                        score_info += '<div class="jc-recap jc-spacing"><a href="'+ jcal_events_array[x]['link'][a]['url'] + '">'+jcal_events_array[x]['link'][a]['value'] +'</a></div>' + "\n";
                    }
                }
            }

            // PHOTO GALLERY
            if (jcal_events_array[x]['gallery']) {
                for (var a = 0; a < jcal_events_array[x]['gallery'].length; a++) {
                    var gName = (jcal_events_array[x]['gallery'][a]['description'] && jcal_events_array[x]['gallery'][a]['description'] != "photos") ? jcal_events_array[x]['gallery'][a]['description'] : "Photo Gallery";
                    score_info += '<div class="jc-recap jc-spacing"><a onclick="'+ jcal_events_array[x]['gallery'][a]['popup_js'] + '">Photo Gallery</a></div>' + "\n";
                }
            }

            score_info += '</div>';
            score_info += '<div class="jc-section-icons">';

            //TICKET URL
            if (jcal_events_array[x]['ticket_url'] && expired_status != "expired") {
                score_info += '<div class="jc-tix jc-spacing"><a target="_blank" href="' + jcal_events_array[x]['ticket_url'] + '"><i class="' + jcalOptions.divIDprefix + '-icon-tix"></i>Tickets</a></div>' + "\n";
            }

            // MEDIAS

            if (jcal_events_array[x]['medias'] && jcal_events_array[x]['medias'].length > 0) {
                for (var a = 0; a < jcal_events_array[x]['medias'].length; a++) {

                    //livestats link
                    if (jcal_events_array[x]['medias'][a]['type']=='livestats' && jcal_events_array[x]['medias'][a]['title']!='Live Audio' && jcal_events_array[x]['medias'][a]['title']!='Tournament Central') {
                        windowChk = (jcal_events_array[x]['medias'][a]['new_window'] == '1') ? 'target="_blank"' : '';
                        score_info += '<div  class="jc-spacing"><a class="jc-spacing" href="' + jcal_events_array[x]['medias'][a]['url'] + '" '+windowChk+'><i class="' + jcalOptions.divIDprefix + '-icon-stats"></i>'+ jcal_events_array[x]['medias'][a]['title'] + '</a></div>' + "\n";
                    }

                    //Video
                    if (jcal_events_array[x]['medias'][a]['type']=='video' && jcal_allow_video) {
                        score_info += '<div class="jc-spacing"><a class="jc-video jc-spacing" href="'+ jcal_events_array[x]['medias'][a]['url'] + '"><i class="' + jcalOptions.divIDprefix + '-icon-video"></i>Watch</a></div>' + "\n";
                    }

                    //live audio link
                    if (jcal_events_array[x]['medias'][a]['title']=='Live Audio' && jcal_allow_audio) {
                        windowChk = (jcal_events_array[x]['medias'][a]['new_window'] == '1') ? 'target="_blank"' : '';
                        score_info += '<div class="jc-spacing"><a class="jc-audio jc-spacing" href="'+ jcal_events_array[x]['medias'][a]['url'] + '" '+windowChk+'><i class="' + jcalOptions.divIDprefix + '-icon-audio"></i>Live Audio</a></div>' + "\n";

                    }

                    // audio link
                    if (jcal_events_array[x]['medias'][a]['type']=='audio' && jcal_allow_audio) {
                        score_info += '<div class="jc-spacing"><a class="jc-audio jc-spacing" href="'+ jcal_events_array[x]['medias'][a]['url'] + '"><i class="' + jcalOptions.divIDprefix + '-icon-audio"></i>Listen</a></div>' + "\n";

                    }

                    //gametracker link - added below
                    if (jcal_events_array[x]['medias'][a]['title']=='Gametracker') {
                        windowChk = 'target="_blank"';
                        gtLink = "window.open('" + jcal_events_array[x]['medias'][a]['url'] + "', 'GameTrackerV3', 'location=no, toolbar=no, top=0, left=0, width="+screen.availWidth+", height="+screen.availHeight+"');";
                        gametracker_item = '<div class="jc-gt"><a href="' + jcal_events_array[x]['medias'][a]['url'] + '" target="_blank" xxonclick="'+gtLink+' return false;"><span>GameTracker</span></a></div>' + "\n";
                    }
                }
            }

            //TV
            if (jcal_events_array[x]['coverage'] && jcal_events_array[x]['coverage'].length > 0) {
                for (z = 0; z < jcal_events_array[x]['coverage'].length; z++) {
                    if (jcal_events_array[x]['coverage'][z]['label'] == 'TV') {
                        score_info += '<div class="jc-tv jc-spacing"><i class="' + jcalOptions.divIDprefix + '-icon-tv"></i> ' + jcal_events_array[x]['coverage'][z]['value'] + '</div>' + "\n";
                    }
                    if (jcal_events_array[x]['coverage'][z]['label'] == 'Radio') {
                        score_info += '<div class="jc-tv jc-spacing"><i class="' + jcalOptions.divIDprefix + '-icon-radio"></i> ' + jcal_events_array[x]['coverage'][z]['value'] + '</div>' + "\n";
                    }
                }
            }

        score_info += '</div>';

        score_info += '<div class="jc-bottom-area">';

        //add GT here
        if (gametracker_item!=false && jcal_allow_gt) { score_info += gametracker_item; }

        //preview link - added below

        //if (jcal_events_array[x]['release'] && jcal_events_array[x]['fixed_date'] >= now) {
        if (jcal_events_array[x]['release'] && diff > -1 && jcal_events_array[x]['release'] != "F") {
            score_info += '<div class="jc-preview"><a href="'+jcal_events_array[x]['release'][0]['url']+'"><span>Preview</span></a></div>' + "\n";
        }


        score_info += '</div>';
        score_info += '<div id="jc-' + jcal_events_array[x]['id'] + '-check"></div>';

        // begin writing the score info
        var element = document.createElement("div");
        element.setAttribute("id", "jc-pos");
        element.innerHTML = score_info;
        score_sheet.appendChild(element);
    };


    // ----- CONTROLS -----


    var generateControls = function () {

        var bdr = document.createElement("div");
            bdr.setAttribute("id", jcalOptions.divIDprefix + "-next");
        var lkr = document.createElement('a');
            lkr.innerHTML = "&raquo;";
        bdr.appendChild(lkr);
        document.getElementById(jcalOptions.divIDprefix + "-machine").parentNode.appendChild(bdr);

        var bdl = document.createElement("div");
            bdl.setAttribute("id", jcalOptions.divIDprefix + "-prev");
        var lkl = document.createElement('a');
            lkl.innerHTML = "&laquo;";
        bdl.appendChild(lkl);
        document.getElementById(jcalOptions.divIDprefix + "-machine").parentNode.appendChild(bdl);

        lkr.onmousedown =  function() {
            if (jcal_ani_status) { return; }
            if (jcal_sorted_writeout.length>0) {
                goNext();
            }
        }

        lkl.onmousedown = function() {
            if (jcal_ani_status) { return; }
            if (jcal_sorted_writeout.length>0) {
                goPrev();
            }
        }

        if (jcalOptions.enableTouch) {
            var touchWin = document.getElementById(jcalOptions.divIDprefix + "-machine");
            touchWin.ontouchstart = function(e) {
                movementDetected = false;
                touchStart = e.touches[0].clientX;
                //obj.stop();
                return true;
            };

            touchWin.ontouchmove = function(e) {
                if (movementDetected == false && Math.abs(e.touches[0].clientX - touchStart) > 20) {
                    if (e.touches[0].clientX > touchStart) {
                        movementDetected = true;
                        //obj.stop(); obj.manualMove(-1 * jcalOptions.direction);
                        if (jcal_ani_status) { return; }
                        if (jcal_sorted_writeout.length>0) {
                            goPrev();
                        }

                    } else if (e.touches[0].clientX < touchStart) {
                        movementDetected = true;
                        //obj.stop(); obj.manualMove(1 * jcalOptions.direction);
                        if (jcal_ani_status) { return; }
                        if (jcal_sorted_writeout.length>0) {
                            goNext();
                        }
                    }
                }
                return false;

            };

            touchWin.ontouchend = function(e) {
                 if (movementDetected==true) {
                     //e.preventDefault();
                      return false;
                 }
                 movementDetected = false;
                 touchStart = 0;
                 return true;
            };
        }
    };


    // ----- MOVEMENT -----
    var goNext = function () {
        if (jcal_ani_status) { return; }
        moveItems("slider", "li", 1);
    };

    var goPrev = function() {
        moveItems("slider", "li", -1);
    };

    var findFirstNonExpired = function() {
        var a = 0;
        var now = new Date;
        for (x = 0; x < jcal_sorted_writeout.length; x++) {
            a = x;
            if (jcal_sorted_writeout[x][1] > now) {
                break;
            }
        }
        if (a > 0) {
            a -= Math.ceil(jcal_slideAmount/2); //jcalOptions.displayAtOnce-2;
            if (a > 0) {
                moveItems("slider", "li", 1, a);
                jcal_event_pos = a;
            }
        }

        if (a < 0) { a = 0; }

        fillEvents(a, jcal_slideAmount, 1);
    };


    var moveItems = function(which, jcal_objType, dir, moveTo) {
        //which is either slider or menu
        //current_pos is local to this function
        //jcal_event_pos is for this jcal
        //jcal_menu_pos is for the menus and reset on loading

        jcal_ani_status = true;
        old_pos = jcal_event_pos;
        slider = jcal_machine;
        current_pos = jcal_event_pos;

        //get current Position
        var widthTo = function (x) {
            var combined_width = 0;
            for (var i = 0; i < x-0; i++) {
                //FIX combined_width += items[i].offsetWidth;
                combined_width += jcalOptions.eventWidth;
            }
            return combined_width;
        };

        //get width of contents
        var el_width = 0;
        var x;
        var items = slider.getElementsByTagName(jcal_objType);

        // reached the end...
        if (dir == 1 && current_pos + jcal_slideAmount > items.length-1) {
            jcal_ani_status = false;
            return;
        }

        if (items.length >= 0) {
            //FIX var movement_width = items[0].offsetWidth;
            var movement_width = jcalOptions.eventWidth;
        } else { return; } // used to verify we have items

        for (x = 0; x < items.length; x++) {
            //FIX el_width+=items[x].offsetWidth;
               el_width+=jcalOptions.eventWidth;
        }
        slider.style.width = (el_width*2)  + "px"; //add a tiny bit extra to make sure they fit


        startingPos = widthTo(current_pos);
        var nextPos;

        if (dir == 1) {
            nextPos = current_pos + jcal_slideAmount;
            jcal_event_pos = nextPos;
        } else {
            nextPos = current_pos - jcal_slideAmount;
            if (nextPos < 0) {
                jcal_ani_status =  false;
                jcal_event_pos = 0;
            } else {
                jcal_event_pos = nextPos;
            }
        }

        // -------------------------------

        //load next
        if (typeof moveTo == 'undefined') {
            fillEvents(nextPos, jcal_slideAmount, dir);
        }

        // -------------------------------

        if (moveTo) {
            slider.style.left = -1 * widthTo(moveTo) + "px";
            jcal_ani_status = false;
        } else {
            if (jcalOptions.animationSpeed == 0) {
                slider.style.left = -1 * widthTo(nextPos) + "px";
                jcal_ani_status = false;
            } else {
                csui.slide(slider, -1 * widthTo(nextPos), jcalOptions.animationSpeed, function() { jcal_ani_status = false; });
            }
        }

    };



    var autoUpdate = function () {
        if (jcalOptions.reload > 0) { jcal_auto_update_jcal = setTimeout(function(){ autoUpdateScores(false); }, jcalOptions.reload); }
    };


    var hideItm = function (item) {
        if (typeof item != 'undefined') {
            item.style.display = "none";
        }
    };

    var showItm = function (item) {
        item.style.display = "block";
    };

}
