// ==UserScript==
// @name			Andrew's Facebook Tagged Photos Downloader
// @include			https://www.facebook.com/*/allactivity?privacy_source=activity_log&log_filter=cluster_200
// @require			http://code.jquery.com/jquery-1.7.1.min.js
// @grant			none
// @version			1.3
// @description		Download all Facebook photos that you are tagged in.
// ==/UserScript==

/*
 * For jQuery Conflicts.
 */
this.$ = this.jQuery = jQuery.noConflict(true);

// Variables
var fbname = document.title;
var firstrun = false;
var retry = 0;
var retries = 10;

// Inject buttons into page
$(document).ready(function() {
    $('#pagelet_main_column_personal div [class="_2o3t fixed_elem"] div[class="clearfix uiHeaderTop"]').append('<input type="button" id="andrewfbdl" value="Download Photos">');
    $('#andrewfbdl').click(triggerdl);
});
jQuery.fn.simulateClick = function() {
    return this.each(function() {
        if('createEvent' in document) {
            var doc = this.ownerDocument,
                evt = doc.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.dispatchEvent(evt);
        } else {
            this.click();
        }
    });
};
function triggerdl() {
	if (confirm('Are you sure you wish to continue? Chrome may tell you that this page is attempting to download multiple files: please click on Allow.')) {
		inited = false;
		firstrun = false;
		retry = 0;
		andrewhandler();
	}
}

// Behold: the master function.
function andrewhandler() {
	if (!firstrun) {
		scrollTo(0, 0);
		firstrun = true;
	}
	if (retry < retries) {
		if ($('iframe.picdl').length && $('iframe.picdl').length > 5) {
			$('iframe.picdl:first').remove();
		}
		if (!$("#fbTimelineLogBody div._5shk:not(.fbprocessed)").length) {
			scrollTo(0, 10000);
			setTimeout(function() { andrewhandler(); }, 1000);
			retry++;
			console.log('Seems to be done. '+retry+'/'+retries);
		} else {
			retry = 0;
			contents = $("#fbTimelineLogBody div._5shk:not(.fbprocessed):first div._42ef").text();
			if (contents.indexOf(fbname+' was tagged in') != -1 && contents.indexOf(' photo.') != -1) {
				dlphoto();
			} else {
				//console.log('> Not a relevant activity, skipping.');
				$("#fbTimelineLogBody div._5shk:not(.fbprocessed):first").addClass('fbprocessed');
				andrewhandler();
			}
		}
	} else {
		alert('Done!');
	}
}

function dlphoto() {
    code = $("#fbTimelineLogBody div._5shk:not(.fbprocessed):first td._5ep6 a").attr('href');
	regexp = /\?fbid=([0-9]+)&/g;
	match = regexp.exec(code);
	if (match[1]) {
		$("body").append("<iframe class='picdl' src='https://www.facebook.com/photo/download/?fbid="+match[1]+"'></iframe>");
	}
    $("#fbTimelineLogBody div._5shk:not(.fbprocessed):first").addClass('fbprocessed');
    setTimeout(andrewhandler, 1500);
}