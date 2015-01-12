/*!
 * @author: mwenbao@gmail.com
 * @license: see LICENSE.txt
 * @depend: jquery 1.10+
 * @issues: Chrome39 behaves weird when showing/hiding fixed sidebar toc list.
 *          Search `@TODO check Chrome39+' for detailed comments on this problem.
 *
 */

// set theme path, got from http://stackoverflow.com/questions/8523200/javascript-get-current-filescript-path
(function() {
    var scriptEls = document.getElementsByTagName('script');
    var thisScriptEl = scriptEls[scriptEls.length - 1];
    var scriptPath = thisScriptEl.src;
    window.gThemePath = scriptPath.substr(0, scriptPath.lastIndexOf('/js/'));
})();

window.gEnableTocStatusUpdate = true;
window.gEnableTocListAutoScroll = true;
window.gMouseInSidebarTocList = false;
window.gToolbarHidden = true;
window.gToolbarAnimationEnabled = true;
window.gFixedHeaderHeight = 32;
window.gFixedTocListOffsetTop = 111;
window.gFootnotePopoverMaxWidth = 300;
window.gAutoScrollDuration = 400;
window.gActiveTocClass = 'niu2-active-toc';
window.gCurrHighlightedElem = null;
window.gCurrHighlightedBackref = null;
window.gCurrTocId = '';
window.gSidebarCtrlButtonEnabled = true;
window.gMousePositionX = 0;
window.gMousePositionY = 0;

$(document).ready(function() {
    initGoogleCSEAnimation();
});

function onContentLoaded() {
    initPygments();
    initHermitPlayer();
    initLazyLoad();
    initFootnote();
    initHeaderAnchors();
    $(window).scroll(function() {
        toggleSidebarTocFixed();
        locateTocInViewport();
    });
    //window.setInterval(updateFootnoteStatus, 500);
    updateFootnoteStatus();

    // detach toc list before inserting many
    // toc index <span>, for performance reason
    getTocList().detach();
    initTocListIndex(getTocList());
    getTocList().appendTo(getSidebarToc());

    setSidebarTocWidth();
    setTocOverflowedTitle();

    initTocLinkScrollAnimation();
    initAllTocsCtrl();
    locateTocInViewport();

    initToolbar();
}

function initPygments() {
    if ($('pre')[0]) {
        appendCssFileToHead('/css/pygments.min/' + $('#niu2-pygments').data('theme') + '.min.css');
    }
}

function initHermitPlayer() {
    if ($('.hermit')[0]) {
        appendCssFileToHead('/hermit/assets/style/hermit.min.css');
        window.hermit = {
            'url': window.gThemePath + '/soundmanager2/swf'
            //'debugMode': true,
            //'debugFlash': true,
            //'flashVersion': 9,
            //'preferFlash': true
        }; // hermit should be global
        appendJsFileToBody('/soundmanager2/script/soundmanager2.min.js');
        appendJsFileToBody('/hermit/assets/script/hermit.min.js');
    }
}

function initToolbar() {
    if (getToolbar()) {
        window.gToolbarLeftPos = $(getToolbar()).css('left');
        var rightContainers = $('.niu2-right-container');
        var showSidebarTitle = $('#niu2-toolbar-showsidebar').data('title');
        var hideSidebarTitle = $('#niu2-toolbar-ctrlsidebar').attr('title');

        var docPath = window.location.pathname.replace(/html$/, 'md');
        if (-1 == docPath.replace(/^\//, '').search('/')) {
            // is a page
            docPath = '/pages' + docPath;
        }

        // init raw link and revision link
        var githubRepo = $('#niu2-toolbar-github').data('repo').replace(/\/+$/g, '');
        var bitbucketRepo = $('#niu2-toolbar-bitbucket').data('repo').replace(/\/+$/g, '');
        if ('' != githubRepo) {
            // a github repository
            $('#niu2-toolbar-revhistory').attr('href', 'https://github.com/' + githubRepo + '/commits/master/content' + docPath);
            $('#niu2-toolbar-viewsource').attr('href', 'https://raw.githubusercontent.com/' + githubRepo + '/master/content' + docPath);
        } else if ('' != bitbucketRepo) {
            // a bitbucket repository
            $('#niu2-toolbar-revhistory').attr('href', 'https://bitbucket.org/' + bitbucketRepo + '/history-node/master/content' + docPath);
            $('#niu2-toolbar-viewsource').attr('href', 'https://bitbucket.org/' + bitbucketRepo + '/raw/master/content' + docPath);
        }

        // init loading overly
        var tbLoadingOverlyIconClass = $('#niu2-toolbar-load').data('loading-icon');
        $('<div id="niu2-loading-overly" style="display:none;"><i id="niu2-loading-icon" class="' + tbLoadingOverlyIconClass + '"></i></div>').appendTo('body');

        var leftContainer = $('#niu2-left-container');
        var footer = $('#body-footer');
        var ctrlIcon = $('#niu2-toolbar-ctrlsidebar i');
        var ctrlSidebar = $('#niu2-toolbar-ctrlsidebar');
        var leftCSlideDuration = 300;
        var loadingOverly = $('#niu2-loading-overly');

        // init sidebar controller
        window.gSidebarCtrlButtonColor = $('#niu2-toolbar-ctrlsidebar').css('color');
        $('#niu2-toolbar-ctrlsidebar').click(function(e) {
            e.preventDefault();
            if (!window.gSidebarCtrlButtonEnabled) {
                return;
            }
            loadingOverly.show();
            disableSidebarCtrlButton();
            if (!rightContainers.is(':hidden')) {
                markVerticalPosition();
                rightContainers.fadeOut('fast');
                leftContainer.removeClass('with-right-border');
                leftContainer.animate({width: '67%'}, leftCSlideDuration, complete=function() {
                    restoreVerticalPosition(function() {
                        enableSidebarCtrlButton();
                        ctrlIcon.attr('class', 'icon-3x icon-show-sidebar');
                        ctrlSidebar.attr('title', showSidebarTitle);
                        loadingOverly.hide();
                        // must reset cached objects of footnote refs and backrefs
                        resetFootnoteCache();
                    });
                });
                footer.animate({width: '67%'}, leftCSlideDuration);
            } else {
                markVerticalPosition();
                leftContainer.animate({width: '50%'}, leftCSlideDuration, complete=function() {
                    var sidebarElems = $('.niu2-right-container');
                    var sidebarParent = sidebarElems.parent();
                    // @TODO: check Chrome39+
                    // We have to detach fixed sidebar before doing the fadein animation,
                    // otherwise Chrome39 will behave weird(showing duplicate sidebar toc).
                    sidebarElems.detach();
                    leftContainer.addClass('with-right-border');
                    window.gEnableTocStatusUpdate = false;
                    rightContainers.fadeIn('fast', complete=function() {
                        sidebarElems.appendTo(sidebarParent);
                        toggleSidebarTocFixed();
                    });
                    restoreVerticalPosition(function() {
                        enableSidebarCtrlButton();
                        ctrlIcon.attr('class', 'icon-3x icon-hide-sidebar');
                        ctrlSidebar.attr('title', hideSidebarTitle);
                        window.gEnableTocStatusUpdate = true;
                        locateTocInViewport();
                        loadingOverly.hide();
                        // must reset cached objects of footnote refs and backrefs
                        resetFootnoteCache();
                    });
                });
                footer.animate({width: '50%'}, leftCSlideDuration);
            }
        });
    }
}

function initLazyLoad() {
    var imageNodes = $('#niu2-main-content img.lazy');
    var imgLazyLoadData = $('#niu2-lazy-load');
    if (0 != imageNodes.length && imgLazyLoadData.length != 0) {
        // add lazyload js file
        appendJsFileToBody('/js/jquery.lazyload.min.js');
        // add colorbox js/css file
        appendCssFileToHead('/colorbox/colorbox.min.css');
        appendJsFileToBody('/colorbox/jquery.colorbox.min.js');
        // find all the images and prepare for lazyload.js
        var imgWidthLimit = getMainContent().getBoundingClientRect().width;
        var imgHoverText = imgLazyLoadData.data('loading-txt');
        var imgHoverIconClass = imgLazyLoadData.data('loading-icon');
        imageNodes.each(function(i, elem) {
            var imgRealWidth = parseInt($(elem).data('width'));
            var imgRealHeight = parseInt($(elem).data('height'));
            var imgHeightLimit = (imgRealWidth > imgWidthLimit) ? (imgWidthLimit / imgRealWidth * imgRealHeight) : imgRealHeight;
            imgHeightLimit = imgHeightLimit.toFixed();
            $(elem).attr('height',  imgHeightLimit + 'px');
            // show loading text
            $(elem).parent().addClass('image-cover-box');
            var imgCover = $('<span class="image-cover">' + imgHoverText + '<i class="' + imgHoverIconClass + '"></i></span>').insertAfter($(elem));
            imgCover.css('top', ((imgHeightLimit - imgCover.height()) / 2 - 3) + 'px');
            imgCover.css('width', (imgWidthLimit > imgRealWidth ? imgRealWidth : imgWidthLimit) + 'px');
        });
        // enable lazy load
        imageNodes.lazyload({
            threshold : 0,
            effect : 'fadeIn',
            load: function() {
                var img = $(this);
                var imgOverly = img.next('.image-cover');
                var par = img.parent();
                // before detaching the img node, we should reserve
                // the image's vertical space for its parent node
                par.css('height', img.css('height'));
                img.detach();
                // reset height after image loaded
                img.css('height', 'auto');
                img.attr('height', '');
                // remove hover text
                par.removeClass('image-cover-box');
                imgOverly.hide();
                // init colorbox
                var imageLink = $('<a href="' + img.attr('src') + ' " title="' + img.attr('alt') + '"></a>');
                img.appendTo(imageLink);
                imageLink.colorbox({
                    href: img.attr('src'),
                    returnFocus: false,
                    scalePhotos: true,
                    maxWidth: '95%',
                    maxHeight: '100%',
                });
                imageLink.appendTo(par);
                // reset parent node's height
                par.css('height', 'auto');
            }
        });
    }
}

function appendCssFileToHead(path) {
    $('<link rel="stylesheet" href="' + window.gThemePath + path + '" type="text/css"/>').appendTo($('head'));
}

function appendJsFileToBody(path) {
    $('<script src="' + window.gThemePath + path + '" type="text/javascript"></script>').appendTo($('body'));
}

function initHeaderAnchors() {
    getMainContentHeaders().each(function(i, elem) {
        $('<a class="niu2-header-anchor" href="#' + $(elem).attr('id') + '">¶</a>').appendTo($(elem));
    });
    initHeaderScrollAnimation(getMainContentHeaders().children('.niu2-header-anchor'));
}

function getMainContentHeaders() {
    if (window.gMainContentHeaders == undefined) {
        window.gMainContentHeaders = $('#niu2-main-content').find(':header');
    }
    return window.gMainContentHeaders;
}

function setSidebarTocWidth() {
    var tocMaxWidth = getSidebarToc().width();
    getSidebarToc().attr('style', 'max-width:' + tocMaxWidth + 'px');
}

function resetSidebarToc() {
    var sidebarToc = $('#niu2-sidebar-toc');
}

function toggleSidebarTocFixed() {
    var sidebarToc = $('#niu2-sidebar-toc');
    var sidebarMeta = $('#niu2-sidebar-meta');
    if (sidebarToc.length == 0 || sidebarMeta.length == 0) {
        return;
    }
    var vtop = $(window).scrollTop();
    var vpos = sidebarMeta.offset().top + sidebarMeta.height() - 55;
    if (!sidebarToc.is(':hidden') && vtop > vpos && 'niu2-sidebar' == sidebarToc.attr('class')) {
        var sidebarParent = sidebarToc.parent();
        // @TODO: check Chrome39+
        // We have to detach sidebar toc before setting its position to fixed,
        // otherwise Chrome39 will behave weird(showing duplicate sidebar toc).
        sidebarToc.detach();
        sidebarToc.attr('class', 'niu2-sidebar niu2-sidebar-toc-fixed');
        sidebarToc.appendTo(sidebarParent);
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

function disableSidebarCtrlButton() {
    window.gSidebarCtrlButtonEnabled = false;
    $('#niu2-toolbar-ctrlsidebar').attr('style', 'color: ' + window.gSidebarCtrlButtonColor);
}

function enableSidebarCtrlButton() {
    window.gSidebarCtrlButtonEnabled = true;
    $('#niu2-toolbar-ctrlsidebar').attr('style', '');
}

function markVerticalPosition() {
    window.gCurrElemInViewport = null;
    var currTocElem = $('#' + window.gCurrTocId);
    if (currTocElem[0].getBoundingClientRect().top == 0) {
        window.gCurrElemInViewport = currTocElem;
        window.gCurrElemTopInViewport = 0;
        return;
    }
    var followingElems;
    if (window.gCurrTocId == 'content-heading') {
        followingElems = $('#niu2-main-content').children();
    } else if (window.gCurrTocId == 'content-comments') {
        // only support duoshuo comment service for now
        var duoshuoMain = $('#ds-reset');
        if (duoshuoMain.length == 0) {
            return;
        }
        followingElems = duoshuoMain.children().first().nextUntil('.ds-comments').andSelf().add('.ds-comments');
    } else {
        followingElems = currTocElem.nextAll();
    }
    var numFollowingElems = followingElems.length;
    followingElems.each(function(i, e) {
        var currSib = $(e);
        var currSibTop = e.getBoundingClientRect().top;
        if (currSibTop > 0) {
            window.gCurrElemInViewport = currSib.prev();
            if (window.gCurrElemInViewport.length == 0) {
                window.gCurrElemInViewport = null;
                return false;
            }
            window.gCurrElemHeightInViewport = window.gCurrElemInViewport.height();
            window.gCurrElemTopInViewport = window.gCurrElemInViewport[0].getBoundingClientRect().top;
            return false;
        }
        if (i + 1 == numFollowingElems) {
            window.gCurrElemInViewport = currSib;
            window.gCurrElemHeightInViewport = window.gCurrElemInViewport.height();
            window.gCurrElemTopInViewport = window.gCurrElemInViewport[0].getBoundingClientRect().top;
        }
    });
}

function restoreVerticalPosition(complete) {
    if (window.gCurrElemInViewport == null) {
        complete();
        return;
    }
    var currElemTop = 0;
    if (window.gCurrElemTopInViewport != 0) {
        var currElemHeight = window.gCurrElemInViewport.height();
        currElemTop = currElemHeight / window.gCurrElemHeightInViewport * -1 * window.gCurrElemTopInViewport;
    }
    currElemScrollTop = currElemTop + window.gCurrElemInViewport.offset().top;
    window.gEnableTocListAutoScroll = false;
    $('body, html').animate(
        { scrollTop: currElemScrollTop },
        window.gAutoScrollDuration,
        function() { window.gEnableTocListAutoScroll = true; complete(); }
    );
}

function setTocOverflowedTitle() {
    getSidebarTocLinks().each(function(i, e) {
        $(e).mouseenter(function() {
            var currLink = $(this);
            if (isOverflowed(this) && !currLink.attr('title')) {
                currLink.attr('title', currLink.text());
            }
        });
    });
}

function isOverflowed(elem) {
    if (elem.scrollHeight > elem.offsetHeight || elem.scrollWidth > elem.offsetWidth) {
        return true;
    }
    return false;
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

function getToolbar() {
    if (!window.gToolbar) {
        window.gToolbar = $('#niu2-toolbar')[0];
    }
    return window.gToolbar;
}

function getMainContent() {
    if (!window.gMainContent) {
        window.gMainContent = $('#niu2-main-content')[0];
    }
    return window.gMainContent;
}

function getHtmlHeaders() {
    if (!window.gHtmlHeaders) {
        window.gHtmlHeaders = $(':header');
        
        if (getFootnoteRefs().length > 0) {
            window.gHtmlHeaders.push($('#content-references')[0]);
        }

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
    var currTocId;
    for (var i = 0; i < headerList.length; i++) {
        var elem = headerList[i];
        if (elem.getBoundingClientRect().top >= window.gFixedHeaderHeight) {
            if (i > 0) {
                elem = headerList[i - 1];
            }
            currTocId = elem.id;
            break;
        }
    }
    if (!currTocId) {
        currTocId = headerList.last().attr('id');
    }

    window.gCurrTocId = currTocId;
    resetTocListHeight();
    updateTocLinkStatus(currTocId);
    autoscrollTocList();
}

function getSidebarTocLinks() {
    if (!window.gSidebarTocLinks) {
        window.gSidebarTocLinks = $('#niu2-sidebar-toc-list a');
    }
    return window.gSidebarTocLinks;
}

function getSidebarToc() {
    if (!window.gSidebarToc) {
        window.gSidebarToc = $('#niu2-sidebar-toc');
    }
    return window.gSidebarToc;
}

function getTocList() {
    if (!window.gTocList) {
        window.gTocList = $('#niu2-sidebar-toc-list');
        window.gTocListType = window.gTocList[0].tagName.toLowerCase();
    }
    return window.gTocList;
}

function initTocListIndex(list, baseIndex) {
    if (baseIndex && '' != baseIndex) {
        baseIndex += '.';
    } else {
        baseIndex = '';
    }

    // iterate on list
    list.children().each(function(i, e) {
        var li = $(e);
        // prepend a index span in front of each <a> of <li>
        var liIndex = baseIndex + (i + 1);
        li.prepend('<span class="niu2-sidebar-toc-index">' + liIndex + '.</span>');

        // recursion on child list
        var subLiChildren = li.children();
        if (2 < subLiChildren.length) {
            initTocListIndex($(subLiChildren[2]), liIndex);
        }
    });
}

function unhighlightActiveToc() {
    var activeToc = $('.' + window.gActiveTocClass).first();
    if (activeToc.length != 0) {
        activeToc.attr('class', '');
    }
}

function updateTocLinkStatus(anchor) {
    if (isAllTocsClosed()) {
        closeAllTocs();
    }
    getSidebarTocLinks().each(function(li, lelem) {
        var cLink = $(lelem);
        if (anchor == cLink.attr('href').substr(cLink.attr('href').indexOf('#') + 1)) {
            cLink.attr('class', window.gActiveTocClass);
            if (isAllTocsClosed()) {
                openActiveTocList(cLink.parent());
            }
        } else if ('' != cLink.attr('class')) {
            cLink.attr('class', '');
        }
    });
}

function resetTocListHeight() {
    var tocListHeight = $(window).height() - window.gFixedTocListOffsetTop + 20;
    if (getTocList().height() >= tocListHeight) {
        getTocList().attr('style', 'height: ' + tocListHeight + 'px;');
    } else {
        getTocList().attr('style', '');
    }
}

function autoscrollTocList() {
    if (!window.gEnableTocListAutoScroll || window.gMouseInSidebarTocList) {
        return;
    }

    var activeToc = $('.' + window.gActiveTocClass).first();
    if (activeToc.length == 0) {
        return;
    }
    var activeTocXY = activeToc[0].getBoundingClientRect();
    var tocListXY = getTocList()[0].getBoundingClientRect();

    var scrollHeight = activeTocXY.top - (tocListXY.top + tocListXY.bottom) / 2;
    var heightSign = (scrollHeight > 0) ? 1 : -1;
    scrollHeight += heightSign * tocListXY.height / 5;

    if (activeTocXY.top < tocListXY.top + 15 || activeTocXY.bottom > tocListXY.bottom - 15) {
        window.gEnableTocListAutoScroll = false;
        getTocList().animate(
                { scrollTop: getTocList().scrollTop() + scrollHeight },
                window.gAutoScrollDuration,
                function() { window.gEnableTocListAutoScroll = true; }
        );
    }
}

function openActiveTocList(activeLi) {
    // show next level tocs
    var activeChilds = activeLi.children();
    var currActiveChild = $(activeChilds[2]);
    if (activeChilds.length > 2 && (currActiveChild.is('ol') || currActiveChild.is('ul'))) {
        showToc(currActiveChild);  // show ol/ul
        showToc(currActiveChild.children()); // show ol/ul li
    }

    // show active toc and his sibling tocs
    showToc(activeLi);
    showToc(activeLi.siblings());

    // show active toc's parent toc and the parent toc's sibling tocs(only the top level)
    activeLi.parents().each(function(i, elem) {
        if ('niu2-sidebar-toc-list' == elem.id) {
            return false;
        }
        showToc($(elem));
        if ($(elem).is('li')) {
            showToc($(elem).siblings());
        }
    });
}

function closeAllTocs() {
    hideToc($('#niu2-sidebar-toc-list ' + window.gTocListType + ' li'));
    hideToc($('#niu2-sidebar-toc-list li ' + window.gTocListType));
}

function openAllTocs() {
    showToc($('#niu2-sidebar-toc-list ' + window.gTocListType + ' li'));
    showToc($('#niu2-sidebar-toc-list li ' + window.gTocListType));
}

function initHeaderScrollAnimation(targets) {
    initScrollAnimation(
        targets,
        function(target) { return target.offset().top; },
        window.gAutoScrollDuration,
        function() {
            updateFootnoteStatus();
            window.gEnableTocStatusUpdate = true;
            locateTocInViewport();
        }
    );
}

// toc scroll anamation
function initTocLinkScrollAnimation() {
    initHeaderScrollAnimation(getSidebarTocLinks());
}

function initFootnote() {
    // insert footnote title node
    if (getFootnoteRefs().length > 0) {
        var ftTitle = '脚注';
        getTocList().children(':last').before('<li><a href="#content-references">' + ftTitle + '</a></li>');
        $('.footnote').before('<h2 id="content-references">' + ftTitle + '</h2>');
    }

    initFootnoteBackRefLinks();
    initFootnoteBackRefAnimation();
    initMouseXYRecord();
    initFootnoteRefPopover();
    initFootnoteRefAnimation();
}

function updateFootnoteStatus() {
    unhighlightFootnote();
    highlightFootnote();
}

function unhighlightCurrHighlighted() {
    if (window.gCurrHighlightedElem) {
        unhighlightElement(window.gCurrHighlightedElem);
    }
    if (window.gCurrHighlightedBackref) {
        unhighlightSubBackref(window.gCurrHighlightedBackref);
    }
}

function highlightElement(obj) {
    obj.addClass('alert-success');
    window.gCurrHighlightedElem = obj;
}

function unhighlightElement(obj) {
    obj.removeClass('alert-success');
}

function highlightSubBackref(obj) {
    obj.addClass('activeSubBackref');
    window.gCurrHighlightedBackref = obj;
}

function unhighlightSubBackref(obj) {
    obj.removeClass('activeSubBackref');
}

function getFootnoteHlIndex() {
    // the second element in footnote list li
    // is <p>, the valid footnote, while the
    // first one is the footntoe backref link.
    return 1;
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
            unhighlightCurrHighlighted();
            highlightElement(window.gHlFootnoteRef);
            return;
        }
    }

    // highlight footnote and current sub-backref link
    getFootnoteList().each(function(i, e) {
        var currLi = $(e);
        if (currLi.attr('id') == ftHlId) {
            unhighlightCurrHighlighted();
            highlightElement($(currLi));
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
        var currP = $(window.gHlFootnote);
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

function resetFootnoteCache() {
    resetFootnoteRefs();
    resetFootnoteBackRefs();
    resetFootnoteRefMap();
}

function resetFootnoteRefs() {
    window.gFootnoteRefs = $('.footnote-ref');
}

function getFootnoteRefs() {
    if (!window.gFootnoteRefs) {
        resetFootnoteRefs();
    }
    return window.gFootnoteRefs;
}

function resetFootnoteRefMap() {
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

// currently, the python markdown footnote extension may
// generate multiple footnote reference links with the
// same id
function getFootnoteRefMap(ftId) {
    if (!window.gFootnoteIdMap) {
        resetFootnoteRefMap();
    } 
    return window.gFootnoteIdMap[ftId];
}

function resetFootnoteBackRefs() {
    window.gFootnoteBackRefs = $('.footnote-backref');
}

function getFootnoteBackRefs() {
    if (!window.gFootnoteBackRefs) {
        resetFootnoteBackRefs();
    }
    return window.gFootnoteBackRefs;
}

function getFootnoteList() {
    if (!window.gFootnoteList) {
        window.gFootnoteList = $('.footnote li');
    }
    return window.gFootnoteList;
}

// add a backref span to footnote ref
function initFootnoteBackRefLinks() {
    // create backref links
    getFootnoteList().each(function(i, e) {
        var ftLiNode = $(e);
        var ftLiNodeId = ftLiNode.attr('id');
        var ftRefLinksMap = getFootnoteRefMap(ftLiNode.attr('id'));
        var ftRefLinksNum = ftRefLinksMap.offsets.length;
        var backrefSpan = '<span class="backref-span">';
        if (1 == (ftRefLinksNum)) {
            backrefSpan += '<a class="footnote-backref" href="#' +
                ftRefLinksMap.id + '" data-source="' + ftLiNodeId + 
                '"><i class="icon-angle-up"></i></a>';
        } else {
            backrefSpan += '<i class="icon-angle-up"></i><span class="sub-backref-link">';
            for (var i = 0; i < ftRefLinksNum; i++) {
                backrefSpan += '<a class="footnote-backref" href="#' + ftRefLinksMap.id +
                    '" data-source="' + ftLiNodeId + '">' + (i + 1) + '</a> ';
            }
            backrefSpan += '</span>';
        }
        backrefSpan += '</span>';
        ftLiNode.prepend(backrefSpan);
    }); 

}

function initFootnoteBackRefAnimation() {
    // init backref links animation
    initScrollAnimation(
        getFootnoteBackRefs(),
        function(target, source) {
            var ftRefLinksMap = getFootnoteRefMap(source.attr('data-source'));
            if (1 == ftRefLinksMap.offsets.length) {
                return ftRefLinksMap.offsets[0].top - window.gFixedHeaderHeight;
            } else {
                return ftRefLinksMap.offsets[parseInt(source.text()) - 1].top - window.gFixedHeaderHeight;
            }
        },
        window.gAutoScrollDuration,
        function(source) {
            if ("" != source.text()) {
                window.gCurrFootnoteHlPos = parseInt(source.text()) - 1;
            } else {
                window.gCurrFootnoteHlPos = 0;
            }
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
        window.gAutoScrollDuration,
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

// mouse position related events
function initMouseXYRecord() {
    $(document).mousemove(function(e) {
        window.gMousePositionX = e.clientX;
        window.gMousePositionY = e.clientY;

        // footnote popover
        if (window.gEnableMouseXYRecord && window.gPopoverXY && window.gRefLinkXY) {
            if (!isPositionInRect(e.clientX, e.clientY, window.gPopoverXY) &&
                    !isPositionInRect(e.clientX, e.clientY, window.gRefLinkXY)) {
                // hide footnote popover now
                window.gEnableMouseXYRecord = false;
                hideFootnotePopover();
            }
        }

        // sidebar toc list scroll
        if (isPositionInRect(e.clientX, e.clientY, getTocList()[0].getBoundingClientRect())) {
            window.gMouseInSidebarTocList = true;
        } else {
            window.gMouseInSidebarTocList = false;
        }

        // toggle toolbar
        var mainErea = getMainContent().getBoundingClientRect();
        if (getToolbar() && e.clientY > mainErea.bottom - mainErea.height) {
            if (!window.gToolbarAnimationEnabled) {
                return;
            }
            var hideToolbarAnimationFunc = function() {
                $(getToolbar()).animate({left: window.gToolbarLeftPos}, 500, complete=function() {
                    window.gToolbarAnimationEnabled = true;
                    window.gToolbarHidden = true;
                });
            }
            if (window.gToolbarHidden && e.clientX < mainErea.left) {
                window.gToolbarAnimationEnabled = false;
                $(getToolbar()).animate({left: '0px'}, 500, complete=function() {
                    window.gToolbarAnimationEnabled = true;
                    window.gToolbarHidden = false;
                    if (window.gMousePositionX > mainErea.left) {
                        hideToolbarAnimationFunc();
                    }
                });
            } else if (!window.gToolbarHidden && e.clientX > mainErea.left) {
                window.gToolbarAnimationEnabled = false;
                hideToolbarAnimationFunc();
            }
        }
    });
}

function initScrollAnimation(targets, calcHeightFunc, duration, callback) {
    targets.each(function(i, e) {
        $(e).click(function(ev) {
            ev.preventDefault();
            var href = $(e).attr('href');
            var anchor = href.substring(href.indexOf('#') + 1);
            // update url anchor
            if (window.location.hash != anchor && window.history.pushState) {
                window.history.pushState('toc change', anchor, '#' + anchor);
            }
            window.gEnableTocStatusUpdate = false;
            target = $(document.getElementById(anchor));
            source = $(this);
            $('body, html').animate(
                { scrollTop: calcHeightFunc(target, source) },
                duration, 
                function() { callback(source); }
            );
        });
    });
}

function showToc(tocs) {
    tocs.each(function(i, elem) {
        var toc = $(elem);
        if (toc.is('li')) {
            toc.attr('style', 'display:list-item;');
        } else if (toc.is('ol') || toc.is('ul')) {
            toc.attr('style', 'display:block;');
        }
    });
}

function hideToc(tocs) {
    tocs.each(function(i, elem) {
        $(elem).attr('style', 'display:none;');
    });
}

function initAllTocsCtrl() {
    if (isAllTocsClosed()) {
        closeAllTocs();
    } else {
        openAllTocs();
    }
    getSidebarTocCtrl().click(function() {
        toggleAllTocs();
    });
}

function toggleAllTocs() {
    if (isAllTocsClosed()) {
        getSidebarToc().data('status', 'open');
        getSidebarTocCtrl().attr('class', 'icon-close-tocs');
        openAllTocs();
    } else {
        getSidebarToc().data('status', 'closed');
        getSidebarTocCtrl().attr('class', 'icon-open-tocs');
        closeAllTocs();
    }
    locateTocInViewport();
}

function isAllTocsClosed() {
    if ('closed' == getSidebarToc().data('status')) {
        return true;
    }
    return false;
}

function getSidebarTocCtrl() {
    if (!window.gSidebarTocCtrl) {
        window.gSidebarTocCtrl = $('#niu2-sidebar-toc-ctrl');
    }
    return window.gSidebarTocCtrl;
}

