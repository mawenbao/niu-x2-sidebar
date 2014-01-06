/*
 * Depends on jquery 1.10
 */

window.gEnableTocStatusUpdate = true;

$(document).ready(function() {
    $(window).scroll(function() {
        toggleSidebarTocFixed();
        locateTocInViewport();
    });
    
    initGoogleCSEAnimation();
    initTocLinkScrollAnimation();
});

function toggleSidebarTocFixed() {
    var sidebarToc = $('#niu2-sidebar-toc');
    var sidebarMeta = $('#niu2-sidebar-meta');
    var vtop = $(window).scrollTop();
    var vpos = sidebarMeta.offset().top + sidebarMeta.height() - 55;
    if (vtop > vpos && 'niu2-sidebar' == sidebarToc.attr('class')) {
        sidebarToc.attr('class', 'niu2-sidebar niu2-sidebar-toc-fixed');
    } else if (vtop <= vpos && 'niu2-sidebar' != sidebarToc.attr('class')) {
        sidebarToc.attr('class', 'niu2-sidebar');
    }
}

// toggle the google cse input box
function showCSE() {
    if (!$("#niu2-cse-search-input").is(":visible")) {
        $("#niu2-cse-search-input").val("");
        $("#niu2-cse-search-input").show(300, function() {
            $("#niu2-cse-search-input").focus();
        });
        $("#niu2-cse-search-image").hide(300);
    }
}

function hideCSE() {
    if ($("#niu2-cse-search-input").is(":visible")) {
        $("#niu2-cse-search-input").hide(300);
        $("#niu2-cse-search-image").show(300);
    }
}

function toggleTopIcon() {
    $(this).children(":first").toggleClass("niu2-top-icon-hidden");
}

function initGoogleCSEAnimation() {
    $("#niu2-cse-ctrl-box").click(showCSE);
    $("#niu2-cse-ctrl-box").focus(showCSE);
    $("#niu2-cse-search-input").hide();
    $("#niu2-cse-search-input").focusout(hideCSE);
    $(document).keyup(function(e) {
        e = e || window.event;
        if (e.keyCode == 27) {
            hideCSE();
        }
    });
}

function locateTocInViewport() {
    if (!window.gEnableTocStatusUpdate) {
        return;
    }
    var headerList = $(':header');
    headerList.push($('#content-comments')[0]);
    var tocFound = false;
    for (var i = 0; i < headerList.length; i++) {
        var elem = headerList[i];
        // 30px is the height of fixed head bar
        if (elem.getBoundingClientRect().top > 30) {
            if (i > 0) {
                elem = headerList[i - 1];
            }
            tocFound = true;
            updateTocLinkStatus(elem.id);
            break;
        }
    }
    if (!tocFound) {
        updateTocLinkStatus(headerList.last().attr('id'));
    }
}

function updateTocLinkStatus(anchor) {
    closeAllTocList();
    $('#niu2-sidebar-toc-list a').each(function(li, lelem) {
        cLink = $(lelem);
        if (anchor == cLink.attr('href').substr(cLink.attr('href').indexOf('#') + 1)) {
            cLink.attr('class', 'niu2-active-toc');
            openActiveTocList(cLink.parent());
        } else if ('' != cLink.attr('class')) {
            cLink.attr('class', '');
        }
    });
}

function openActiveTocList(active) {
    // show next level tocs
    activeChilds = active.children();
    if (activeChilds.length > 1 && $(activeChilds[1]).is('ol')) {
        showToc($(activeChilds[1]));  // show ol
        showToc($(activeChilds[1]).children()); // show ol li
    }

    // show active toc and his sibling tocs
    showToc(active);
    showToc(active.siblings());

    // show active toc's parent toc and the parent toc's sibling tocs(only the top level)
    active.parents().each(function(i, elem) {
        if ('niu2-sidebar-toc-list' == elem.id) {
            return false;
        }
        showToc($(elem));
        if ($(elem).is('li')) {
            showToc($(elem).siblings());
        }
    });
}

function closeAllTocList() {
    hideToc($('#niu2-sidebar-toc-list ol li'));
}

function initTocLinkScrollAnimation() {
    // toc scroll anamation
    $('#niu2-sidebar-toc-list a').each(function(i, e) {
        $(e).click(function(ev) {
            ev.preventDefault();
            anchor = $(e).attr('href').substring($(e).attr('href').indexOf('#'))
            // update url anchor
            if (window.location.hash != anchor) {
                window.history.pushState('toc change', anchor, anchor);
            }
            window.gEnableTocStatusUpdate = false;
            $('body, html').animate(
                {scrollTop: $(anchor).offset().top},
                400,
                function() { window.gEnableTocStatusUpdate = true; locateTocInViewport(); }
            );
        });
    });
}

function showToc(tocs) {
    tocs.each(function(i, elem) {
        toc = $(elem);
        if (toc.is('li')) {
            toc.attr('style', 'display:list-item;');
        } else if (toc.is('ol')) {
            toc.attr('style', 'display:block;');
        }
    });
}

function hideToc(tocs) {
    tocs.each(function(i, elem) {
        $(elem).attr('style', 'display:none;');
    });
}

