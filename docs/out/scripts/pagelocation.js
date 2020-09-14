'use strict';

$(document).ready(function () {
    var currentSectionNav, target;

    // If an anchor hash is in the URL highlight the menu item
    highlightActiveHash();
    // If a specific page section is in the URL highlight the menu item
    highlightActiveSection();

    // If a specific page section is in the URL scroll that section up to the top
    currentSectionNav = $('#' + getCurrentSectionName() + '-nav');

    if (currentSectionNav.position()) {
        $('nav').scrollTop(currentSectionNav.position().top);
    }

    // function to scroll to anchor when clicking an anchor linl
    $('a[href*="#"]:not([href="#"])').click(function () {
        /* eslint-disable no-invalid-this */
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            let hash = this.hash.replace('~', '').replace('.', '');
            target = $(hash.replace('~', ''));
            target = target.length ? target : $('[name=' + hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
            }
        }
        /* eslint-enable no-invalid-this */
    });

    $('a[href*="#"]:not([href="#"])').mouseover(function () {
        let navmember = this.parentElement.parentElement.parentElement;
        if (navmember !== undefined) {
            if (navmember.classList.contains('active')) {
                if (this.parentElement.classList.contains('active')) {
                    this.parentElement.classList.add('ignore');
                }
                else {
                    this.parentElement.classList.add('active');
                }
            }
        }
    });

    $('a[href*="#"]:not([href="#"])').mouseout(function () {
        let navmember = this.parentElement.parentElement.parentElement;
        if (navmember !== undefined) {
            if (navmember.classList.contains('active')) {
                if (this.parentElement.classList.contains('ignore')) {
                    this.parentElement.classList.remove('ignore');
                }
                else {
                    this.parentElement.classList.remove('active');
                }
            }
        }
    });
});

// If a new anchor section is selected, change the hightlighted menu item
$(window).bind('hashchange', function (event) {
    highlightActiveHash(event);
});

function highlightActiveHash(event) {
    var oldUrl, oldSubSectionElement;

    // check for and remove old hash active state
    if (event && event.originalEvent.oldURL) {
        oldUrl = event.originalEvent.oldURL;

        if (oldUrl.indexOf('#') > -1) {
            oldSubSectionElement = $('#' + getCurrentSectionName() + '-' + oldUrl.substring(oldUrl.indexOf('#') + 1).replace('~', '').replace('.', '') + '-nav');
            if (oldSubSectionElement) {
                oldSubSectionElement.removeClass('active');
                oldSubSectionElement.removeClass('ignore');
            }
        }
    }

    if (getCurrentHashName()) {
        $('#' + getCurrentSectionName() + '-' + getCurrentHashName().replace('~', '').replace('.', '') + '-nav').addClass('active');
        $('#' + getCurrentSectionName() + '-' + getCurrentHashName().replace('~', '').replace('.', '') + '-nav').addClass('ignore');
    }
}

function highlightActiveSection() {
    var pageId = getCurrentSectionName();
    $('#' + pageId + '-nav').addClass('active');
}

function getCurrentSectionName() {
    var path = window.location.pathname;
    var pageUrl = path.split('/').pop();

    var sectionName = pageUrl.substring(0, pageUrl.indexOf('.'));

    // remove the wodr module- if its in the url
    sectionName = sectionName.replace('module-', '');

    return sectionName;
}

function getCurrentHashName() {
    var pageSubSectionId;
    var pageSubSectionHash = window.location.hash;

    if (pageSubSectionHash) {
        pageSubSectionId = pageSubSectionHash.substring(1).replace('.', '');

        return pageSubSectionId;
    }

    return false;
}
