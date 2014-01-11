/*
 * Depends on jquery 1.10
 */

window.gEnableTocStatusUpdate = true;
window.gFixedHeaderHeight = 32;
window.gFootnotePopoverMaxWidth = 300;

$(document).ready(function() {
    initGoogleCSEAnimation();
});

function onArticleLoaded() {
    $(window).scroll(function() {
        toggleSidebarTocFixed();
        locateTocInViewport();
    });
    window.setInterval(updateFootnoteStatus, 500);
    updateFootnoteStatus();
    initTocLinkScrollAnimation();
    initFootnote();
}

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
        if (elem.getBoundingClientRect().top >= window.gFixedHeaderHeight) {
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

function getSidebarTocLinks() {
    if (!window.gSidebarTocLinks) {
        window.gSidebarTocLinks = $('#niu2-sidebar-toc-list a');
    }
    return window.gSidebarTocLinks;
}

function updateTocLinkStatus(anchor) {
    closeAllTocList();
    getSidebarTocLinks().each(function(li, lelem) {
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

// toc scroll anamation
function initTocLinkScrollAnimation() {
    initScrollAnimation(
        getSidebarTocLinks(),
        0,
        400,
        function() { window.gEnableTocStatusUpdate = true; locateTocInViewport(); }
    );
}

function initFootnote() {
    initFootnoteBackRefLinks();

    initMouseXYRecord();
    initFootnoteRefPopover();
    initFootnoteScrollAnimation();
}

function updateFootnoteStatus() {
    unhighlightFootnote();
    highlightFootnote();
}

function highlightElement(obj) {
    obj.attr('class', 'alert-success');
}

function unhighlightElement(obj) {
    obj.attr('class', '');
}

function getFootnoteHlIndex() {
    // the first element in footnote list li
    // is <p>, the valid footnote
    return 0;
}

function highlightFootnote() {
    footnoteRef = $(document.getElementById(window.location.hash.substring(1)));
    if (footnoteRef[0]) {
        footnoteRefLink = $(footnoteRef.children()[0]);
        if (footnoteRefLink[0] && 'footnote' == footnoteRefLink.attr('rel')) {
            highlightElement(footnoteRef);
            window.gHlFootnoteRef = footnoteRef;
            return;
        }
    }

    getFootnoteLis().each(function(i, e) {
        currLi = $(e);
        if ('#' + currLi.attr('id') == window.location.hash) {
            highlightElement($(currLi.children()[getFootnoteHlIndex()]));
            window.gHlFootnote = currLi;
            return false;
        }
    });
}

function unhighlightFootnote() {
    if (window.gHlFootnoteRef) {
        unhighlightElement(window.gHlFootnoteRef);
        window.gHlFootnoteRef = null;
        return;
    }

    if (window.gHlFootnote) {
        if ('#' + window.gHlFootnote.attr('id') == window.location.hash) {
            return false;
        }
        currP = $(window.gHlFootnote.children()[getFootnoteHlIndex()])
        if ('' != currP.attr('class')) {
            unhighlightElement(currP);
            window.gHlFootnote = null;
            return;
        }
    }
}

function getFootnoteRefs() {
    if (!window.gFootnoteRefs) {
        window.gFootnoteRefs = $('.footnote-ref');
    }
    return window.gFootnoteRefs;
}

function getFootnoteRefId(ftId) {
    if (!window.gFootnoteIdMap) {
        window.gFootnoteIdMap = {};
        getFootnoteRefs().each(function(i, e) {
            refNode = $(e);
            window.gFootnoteIdMap[refNode.attr('href').substring(1)] = refNode.parent().attr('id');
        });
    } 
    return window.gFootnoteIdMap[ftId];
}

function getFootnoteBackRefs() {
    if (!window.gFootnoteBackRefs) {
        window.gFootnoteBackRefs = $('.footnote-backref');
    }
    return window.gFootnoteBackRefs;
}

function getFootnoteLis() {
    if (!window.gFootnoteList) {
        window.gFootnoteList = $('.footnote li');
    }
    return window.gFootnoteList;
}

// add a backref link to footnote ref
function initFootnoteBackRefLinks() {
    // create backref links
    getFootnoteLis().each(function(i, e) {
        ftLiNode = $(e);
        //ftLiNode.prepend('<a class="footnote-backref" href="#' + getFootnoteRefId(ftLiNode.attr('id')) + '">^</a>');
        ftLiNode.append('<a class="footnote-backref" href="#' + getFootnoteRefId(ftLiNode.attr('id')) + '">^</a>');
    }); 

    // init backref links animation
    initScrollAnimation(
        getFootnoteBackRefs(),
        -32,
        400,
        function() {
            updateFootnoteStatus();
            window.gEnableTocStatusUpdate = true;
            locateTocInViewport();
        }
    );
}

function initFootnoteScrollAnimation() {
    // footnote ref link click event
    initScrollAnimation(
        getFootnoteRefs(),
        -32,
        400,
        function() {
            updateFootnoteStatus();
            window.gEnableTocStatusUpdate = true;
            locateTocInViewport();
        }
    );
}

function initFootnoteRefPopover() {
    getFootnoteRefs().each(function(i, e) {
        ftRefLink = $(e);
        ftLiNode = $(document.getElementById(ftRefLink.attr('href').substring(1)));
        ftNode = $(ftLiNode.children()[getFootnoteHlIndex()]);
        ftRefLink.popover({
            'trigger': 'hover',
            'placement': 'auto top',
            'html': true,
            'container': 'body',
            'content': ftNode.html()
        });
        // do not hide popover
        ftRefLink.on('hide.bs.popover', function() {
            if (window.gFootnotePopoverLink) {
                return false;
            }
            return true;
        });

        ftRefLink.mouseleave(function() {
        });

        // record mouse position on footnote ref hover
        ftRefLink.mouseenter(function() {
            currRefLink = $(this);
            // close previous popover first
            if (window.gFootnotePopoverLink && window.gFootnotePopoverLink[0] != currRefLink[0]) {
                hideFootnotePopover();
            }
            ftPopoverNode = $('.popover')[0];
            if (ftPopoverNode) {
                window.gEnableMouseXYRecord = true;
                window.gFootnotePopoverLink = currRefLink;
                popoverXY = ftPopoverNode.getBoundingClientRect();
                refLinkXY = e.getBoundingClientRect();

                window.gPopoverXY = {}
                window.gPopoverXY.top = popoverXY.top < refLinkXY.top ? popoverXY.top : refLinkXY.bottom;
                window.gPopoverXY.bottom = popoverXY.top < refLinkXY.top ? refLinkXY.top : popoverXY.bottom;
                window.gPopoverXY.left = popoverXY.left < refLinkXY.left ? popoverXY.left : refLinkXY.left;
                window.gPopoverXY.right = popoverXY.right < refLinkXY.right ? refLinkXY.right : popoverXY.right;

                window.gRefLinkXY = {}
                window.gRefLinkXY.top = refLinkXY.top;
                window.gRefLinkXY.bottom = refLinkXY.bottom;
                window.gRefLinkXY.left = refLinkXY.left - 10;
                window.gRefLinkXY.right = refLinkXY.right + 10;
            }
        });
    });    
}

function hideFootnotePopover() {
    ftRefLink = window.gFootnotePopoverLink;
    window.gFootnotePopoverLink = null;
    window.gEnableFootnotePopover = false;
    ftRefLink.popover('hide');
}

function isPositionInRect(x, y, rect) {
    if (x >= rect.left &&  x <= rect.right &&
            y >= rect.top && y <= rect.bottom) {
        return true;
    }
    return false;
}

// hide footnote popover
function initMouseXYRecord() {
    $(document).mousemove(function(e) {
        if (window.gEnableMouseXYRecord && window.gPopoverXY && window.gRefLinkXY) {
            if (!isPositionInRect(e.clientX, e.clientY, window.gPopoverXY) &&
                    !isPositionInRect(e.clientX, e.clientY, window.gRefLinkXY)) {
                // hide footnote popover now
                window.gEnableMouseXYRecord = false;
                hideFootnotePopover();
            }
        }
    });
}

function initScrollAnimation(targets, heightOffset, speed, callback) {
    targets.each(function(i, e) {
        $(e).click(function(ev) {
            ev.preventDefault();
            anchor = $(e).attr('href').substring($(e).attr('href').indexOf('#') + 1);
            // update url anchor
            if (window.location.hash != anchor) {
                window.history.pushState('toc change', anchor, '#' + anchor);
            }
            window.gEnableTocStatusUpdate = false;
            $('body, html').animate(
                { scrollTop: $(document.getElementById(anchor)).offset().top + heightOffset },
                speed, 
                callback
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

