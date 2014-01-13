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

function getHtmlHeaders() {
    if (!window.gHtmlHeaders) {
        window.gHtmlHeaders = $(':header');
        var commentsNode = $('#content-comments')[0];
        if (commentsNode) {
            window.gHtmlHeaders.push(commentsNode);
        }
    }
    return window.gHtmlHeaders;
}

function locateTocInViewport() {
    if (!window.gEnableTocStatusUpdate) {
        return;
    }
    var headerList = getHtmlHeaders();
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
        var cLink = $(lelem);
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
    var activeChilds = active.children();
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
        function(target) { return target.offset().top; },
        400,
        function() { window.gEnableTocStatusUpdate = true; locateTocInViewport(); }
    );
}

function initFootnote() {
    initFootnoteBackRefLinks();

    initMouseXYRecord();
    initFootnoteRefPopover();
    initFootnoteRefAnimation();
}

function updateFootnoteStatus() {
    unhighlightFootnote();
    highlightFootnote();
}

function highlightElement(obj) {
    obj.addClass('alert-success');
}

function unhighlightElement(obj) {
    obj.removeClass('alert-success');
}

function highlightSubBackref(obj) {
    obj.addClass('activeSubBackref');
}

function unhighlightSubBackref(obj) {
    obj.removeClass('activeSubBackref');
}

function getFootnoteHlIndex() {
    // the first element in footnote list li
    // is <p>, the valid footnote
    return 0;
}

function highlightFtSubBackrefs(ftLiNode) {
    if (null != window.gCurrFootnoteRefPos) {
        var currBackref = $(ftLiNode.children('.backref-span').children('.sub-backref-link').children()[window.gCurrFootnoteRefPos]);
        if (currBackref[0]) {
            highlightSubBackref(currBackref);
            window.gHlFootnoteSubBackref = currBackref;
        }
    }
}

function highlightFootnote() {
    var ftHlId = window.location.hash.substring(1);
    // highlight footnote ref link
    if (null != window.gCurrFootnoteHlPos) {
        var currSupNodes = $(getFootnoteRefs().parent().filter('[id="' + ftHlId + '"]'));
        if (currSupNodes.length > window.gCurrFootnoteHlPos) {
            window.gHlFootnoteRef = $(currSupNodes[window.gCurrFootnoteHlPos]);
            highlightElement(window.gHlFootnoteRef);
            return;
        }
    }

    // highlight footnote and current sub-backref link
    getFootnoteLis().each(function(i, e) {
        var currLi = $(e);
        if (currLi.attr('id') == ftHlId) {
            highlightElement($(currLi.children()[getFootnoteHlIndex()]));
            highlightFtSubBackrefs(currLi);
            window.gHlFootnote = currLi;
            return false;
        }
    });
}

function unhighlightFootnote() {
    if (window.gHlFootnoteRef) {
        if ('#' + window.gHlFootnoteRef.attr('id') == window.location.hash) {
            return false;
        }
        unhighlightElement(window.gHlFootnoteRef);
        window.gHlFootnoteRef = null;
        return;
    }

    if (window.gHlFootnote) {
        if ('#' + window.gHlFootnote.attr('id') == window.location.hash) {
            return false;
        }
        var currP = $(window.gHlFootnote.children()[getFootnoteHlIndex()])
        if ('' != currP.attr('class')) {
            unhighlightElement(currP);
            window.gHlFootnote = null;
        }
    }

    if (window.gHlFootnoteSubBackref) {
        unhighlightSubBackref(window.gHlFootnoteSubBackref);
        return;
    }
}

function getFootnoteRefs() {
    if (!window.gFootnoteRefs) {
        window.gFootnoteRefs = $('.footnote-ref');
    }
    return window.gFootnoteRefs;
}

// currently, the python markdown footnote extension may
// generate multiple footnote reference links with the
// same id
function getFootnoteRefMap(ftId) {
    if (!window.gFootnoteIdMap) {
        window.gFootnoteIdMap = {};
        getFootnoteRefs().each(function(i, e) {
            var refNode = $(e);
            var supNode = refNode.parent();
            // footnote => {ref link id, [footnote ref link offset]}
            var footnoteId = refNode.attr('href').substring(1);
            if (!window.gFootnoteIdMap[footnoteId]) {
                window.gFootnoteIdMap[footnoteId] = {};
                window.gFootnoteIdMap[footnoteId].id = supNode.attr('id');
                window.gFootnoteIdMap[footnoteId].offsets = [];
            }
            window.gFootnoteIdMap[footnoteId].offsets.push(supNode.offset());
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

// add a backref span to footnote ref
function initFootnoteBackRefLinks() {
    // create backref links
    getFootnoteLis().each(function(i, e) {
        var ftLiNode = $(e);
        var ftLiNodeId = ftLiNode.attr('id');
        var ftRefLinksMap = getFootnoteRefMap(ftLiNode.attr('id'));
        var ftRefLinksNum = ftRefLinksMap.offsets.length;
        var backrefSpan = '<span class="backref-span">';
        if (1 == (ftRefLinksNum)) {
            backrefSpan += '<a class="footnote-backref" title="jump back" href="#' +
                ftRefLinksMap.id + '" data-source="' + ftLiNodeId + 
                '"><i class="fa fa-angle-up"></i></a>';
        } else {
            backrefSpan += '<i class="fa fa-angle-up"></i><span class="sub-backref-link">';
            for (var i = 0; i < ftRefLinksNum; i++) {
                // starts with ascii character a(97)
                backrefSpan += '<a class="footnote-backref" href="#' +
                    ftRefLinksMap.id + '" data-source="' + ftLiNodeId +
                    '">' + String.fromCharCode(97 + i) + '</a> ';
            }
            backrefSpan += '</span>';
        }
        backrefSpan += '</span>';
        ftLiNode.append(backrefSpan);
    }); 

    // init backref links animation
    initScrollAnimation(
        getFootnoteBackRefs(),
        function(target, source) {
            var ftRefLinksMap = getFootnoteRefMap(source.attr('data-source'));
            if (1 == ftRefLinksMap.offsets.length) {
                return ftRefLinksMap.offsets[0].top - window.gFixedHeaderHeight;
            } else {
                // starts with ascii character a(97)
                return ftRefLinksMap.offsets[source.text().charCodeAt(0) - 97].top - window.gFixedHeaderHeight;
            }
        },
        400,
        function(source) {
            if ("" != source.text()) {
                window.gCurrFootnoteHlPos = source.text().charCodeAt(0) - 97;
            } else {
                window.gCurrFootnoteHlPos = 0;
            }
            alert('wokao:' + window.gCurrFootnoteHlPos);
            updateFootnoteStatus();
            window.gEnableTocStatusUpdate = true;
            locateTocInViewport();
        }
    );
}

function initFootnoteRefAnimation() {
    // footnote ref link click event
    initScrollAnimation(
        getFootnoteRefs(),
        function(target) { return target.offset().top - 100 - window.gFixedHeaderHeight; },
        400,
        function(source) {
            // find current sub-backref link
            var currFtSups = getFootnoteRefs().parent().filter('[id="' + source.parent().attr('id') + '"]');
            currFtSups.each(function(i, e) {
                if (source[0] == $(e).children()[0]) {
                    window.gCurrFootnoteRefPos = i;
                    return false;
                }
            });
            updateFootnoteStatus();
            window.gEnableTocStatusUpdate = true;
            locateTocInViewport();
        }
    );
}

function initFootnoteRefPopover() {
    getFootnoteRefs().each(function(i, e) {
        var ftRefLink = $(e);
        var ftLiNode = $(document.getElementById(ftRefLink.attr('href').substring(1)));
        var ftNode = $(ftLiNode.children()[getFootnoteHlIndex()]);
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
            var currRefLink = $(this);
            // close previous popover first
            if (window.gFootnotePopoverLink && window.gFootnotePopoverLink[0] != currRefLink[0]) {
                hideFootnotePopover();
            }
            var ftPopoverNode = $('.popover')[0];
            if (ftPopoverNode) {
                window.gEnableMouseXYRecord = true;
                window.gFootnotePopoverLink = currRefLink;
                var popoverXY = ftPopoverNode.getBoundingClientRect();
                var refLinkXY = e.getBoundingClientRect();

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
    var ftRefLink = window.gFootnotePopoverLink;
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

function initScrollAnimation(targets, calcHeightFunc, speed, callback) {
    targets.each(function(i, e) {
        $(e).click(function(ev) {
            ev.preventDefault();
            var anchor = $(e).attr('href').substring($(e).attr('href').indexOf('#') + 1);
            // update url anchor
            if (window.location.hash != anchor) {
                window.history.pushState('toc change', anchor, '#' + anchor);
            }
            window.gEnableTocStatusUpdate = false;
            $('body, html').animate(
                { scrollTop: calcHeightFunc($(document.getElementById(anchor)), $(this)) },
                speed, 
                callback($(this))
            );
        });
    });
}

function showToc(tocs) {
    tocs.each(function(i, elem) {
        var toc = $(elem);
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

