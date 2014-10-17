// This script is called by school inner sched dropdown page
// e.g. /www/docs/www.fansonly.com/schools/taco/data/taco-m-basebl-sched-dropdown.html
// which is included in the school sched page
// e.g. /www/docs/www.fansonly.com/schools/taco/sports/m-basebl/sched/taco-m-basebl-sched.html
// usefulSchoolInfo is defined in the school inner sched page
// e.g. /www/docs/www.fansonly.com/schools/taco/data/taco-m-basebl-sched-2012.html
// 2012/09 --Alyssa Chen

//set the selected season
$(function(){
  var sched = usefulSchoolInfo.school + "-" + usefulSchoolInfo.sport + "-sched-" + usefulSchoolInfo.year;
  $('#Q_SEASON').val( sched ).attr('selected',true);
});

// When dropdown selection changed, load the new inner sched page
function loadNewSeason(season) {
  //set up tracking
  var track = document.getElementById("track_dropdown_change");
  if (track) {
    track.src = "http://secure-us.imrworldwide.com/cgi-bin/m?ci=us-cstvclicks&cg=hist_sched&si=http://" + document.domain + "_switch_season_" + season + "&rnd=" + Math.random();
  }

  //load the new season schedule
  var inc = $(".sched_year");
  if (inc) {
    var new_data = "data/" + season + ".html";

    inc.load(new_data);
  }
};
