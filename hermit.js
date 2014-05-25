;
(function (p, e, u) {
    var h = soundManager,
        g = null,
        j = null,
        q = 100,
        i = [],
        a = {},
        o, r = -1;
    if ("Microsoft Internet Explorer" == navigator.appName) {
        var s = navigator.userAgent,
            t = /MSIE ([0-9]{1,}[.0-9]{0,})/;
        null != t.exec(s) && (r = parseFloat(RegExp.$1))
    } else "Netscape" == navigator.appName && (s = navigator.userAgent, t = /Trident\/.*rv:([0-9]{1,}[.0-9]{0,})/, null != t.exec(s) && (r = parseFloat(RegExp.$1)));
    o = r;
    var k = "createTouch" in e || "ontouchstart" in p,
        m = k ? "touchstart" : "click",
        x = k ? "touchstart" : "mousedown",
        v = k ? "touchmove" : "mousemove",
        w = k ?
        "touchend" : "mouseup";
    h.url = hermit.url;
    h.debugMode = !1;
    h.preferFlash = 5 < o ? !0 : !1;
    a.init = function () {
        this.fn.getjson()
    };
    a.fn = {
        handleHash: {},
        bind: e.addEventListener ? function (c, b, d) {
            b.addEventListener(c, function () {
                d.apply(this, arguments);
                a.fn.handleHash[c] = a.fn.handleHash[c] || [];
                a.fn.handleHash[c].push(arguments.callee)
            }, !1)
        } : e.attachEvent ? function (c, b, d) {
            b.attachEvent("on" + c, function () {
                d.apply(this, arguments);
                a.fn.handleHash[c] = a.fn.handleHash[c] || [];
                a.fn.handleHash[c].push(arguments.callee)
            })
        } : void 0,
        unbind: e.removeEventListener ?
            function (c, b) {
                if (a.fn.handleHash[c]) {
                    var d = 0,
                        f = a.fn.handleHash[c].length;
                    for (d; f > d; d += 1) b.removeEventListener(c, a.fn.handleHash[c][d], !1)
                }
        } : e.detachEvent ? function (c, b) {
            if (a.fn.handleHash[c]) {
                var d = 0,
                    f = a.fn.handleHash[c].length;
                for (d; f > d; d += 1) b.detachEvent("on" + c, a.fn.handleHash[c][d])
            }
        } : void 0,
        rclass: /[\n\t]/g,
        rspaces: /\s+/,
        arraify: function (a) {
            var b = [];
            try {
                b = Array.prototype.slice.call(a, 0)
            } catch (d) {
                for (var f, b = [], n = 0; f = a[n++];) b.push(f)
            }
            return b
        },
        hasClass: function (c, b) {
            return 0 <= (" " + c.className +
                " ").replace(a.fn.rclass, " ").indexOf(" " + b + " ") ? !0 : !1
        },
        addClass: function (c, b) {
            if (b && "string" == typeof b) {
                var d = (b || "").split(a.fn.rspaces);
                if (1 === c.nodeType)
                    if (c.className) {
                        for (var f = " " + c.className + " ", n = c.className, e = 0, g = d.length; g > e; e++) 0 > f.indexOf(" " + d[e] + " ") && (n += " " + d[e]);
                        c.className = a.fn.trim(n)
                    } else c.className = b
            }
        },
        removeClass: function (c, b) {
            if (b && "string" == typeof b || void 0 === b) {
                var d = (b || "").split(a.fn.rspaces);
                if (1 === c.nodeType && c.className)
                    if (b) {
                        for (var f = (" " + c.className + " ").replace(a.fn.rclass,
                            " "), e = 0, g = d.length; g > e; e++) f = f.replace(" " + d[e] + " ", " ");
                        c.className = a.fn.trim(f)
                    } else c.className = ""
            }
        },
        getById: function (a) {
            return e.getElementById(a)
        },
        getByTagName: function (c, b) {
            return b = b || e, a.fn.arraify(b.getElementsByTagName(c))
        },
        getByClassName: function (c, b, d) {
            if (b = b || e, b.getElementsByClassName) return a.fn.arraify(b.getElementsByClassName(c));
            for (var c = c.replace(/\-/g, "\\-"), f = [], b = a.fn.getByTagName(d || "*", b), d = b.length, c = RegExp("(^|\\s)" + c + "(\\s|$)"); d--;) c.test(b[d].className) && f.push(b[d]);
            return f.reverse(), f
        },
        each: function (a, b) {
            if (u != a.length)
                for (var d = 0, f = a.length; f > d && !1 !== b.call(a[d], d, a[d]); d++);
            else
                for (name in a) b.call(a[name], name, a[name])
        },
        index: function (a, b) {
            var d, f = b.length;
            for (d = 0; f > d; d++)
                if (a == b[d]) return d;
            return -1
        },
        trim: function (a) {
            return a.replace(/^(\s|\u00A0)+/, "").replace(/(\s|\u00A0)+$/, "")
        },
        getjson: function () {
            var c = a.fn.getByClassName("hermit"),
                b = c.length - 1;
            a.fn.each(c, function (c) {
                var f = this;
                var xiamiAlbum = f.getAttribute("xiami");
                var neteaseAlbum = f.getAttribute("netease");
                if (neteaseAlbum) {
                    window.gAjaxProxy.ready(function() {
                        jQuery.ajax({
                            type: "GET",
                            url: "http://app.atime.me/163music-ajax-proxy.php?route=api/playlist/detail",
                            data: { id: neteaseAlbum}
                        }).done(function(msg) {
                            alert(msg);
                        });
                    });
                };
                if (xiamiAlbum) {
                    e = xiamiAlbum.split("#:");
                    a.fn.ajaxp({
                        url: "http://goxiami.duapp.com/",
                        param: {
                            type: e[0],
                            id: e[1]
                        },
                        after: function (e) {
                            a.fn.createPlayListUI.call(f, e, c);
                            c == b && a.fn.autoPlay()
                        }
                    })
                }
            })
        },
        create: function (c) {
            var b = this;
            j = null != c ? c : 0;
            g = null != g ? g : 0;
            a.sound && (a.sound.destruct(), g == i[j].length && (g = 0));
            h.onready(function () {
                a.sound = h.createSound({
                    id: "goXiami",
                    url: i[j][g].src,
                    volume: q,
                    autoLoad: !1,
                    onload: function () {
                        3 > this.readyState && (a.fn.getByClassName("hermit-detail", b, "div")[0].innerHTML = "\u97f3\u4e50\u64ad\u653e\u5668\u521d\u59cb\u5316\u5931\u8d25!")
                    },
                    whileloading: function () {
                        a.fn.getByClassName("hermit-loaded",
                            b, "div")[0].style.width = 100 * (this.bytesLoaded / this.bytesTotal) + "%"
                    },
                    whileplaying: function () {
                        var c = a.fn.getByClassName("hermit-duration", b, "div")[0],
                            f = a.fn.getByClassName("hermit-prosess-bar", b, "div")[0],
                            e = 100 * (this.position / this.duration) + "%",
                            g = a.fn.parseTime(this.position / 1E3) + "/" + a.fn.parseTime(this.duration / 1E3);
                        !a.moving && (f.style.width = e);
                        c.innerHTML = g
                    },
                    onplay: function () {
                        var c = a.fn.getByClassName("hermit-song", b, "div"),
                            f = a.fn.getByClassName("hermit-detail", b, "div")[0];
                        a.fn.each(c, function () {
                            a.fn.removeClass(this,
                                "selected")
                        });
                        a.fn.addClass(c[g], "selected");
                        f.innerHTML = a.fn._expect(c[g].innerHTML, 0, 40, "...") + "  (" + (g + 1) + "/" + i[j].length + ")"
                    },
                    onpause: function () {},
                    onfinish: function () {
                        if (g++, a.sound.resume(), g < i[j].length) a.fn.create.call(b, j);
                        else if (parseInt(b.getAttribute("loop"), 10)) a.fn.getByClassName("hermit-song", b, "div")[0].click();
                        else {
                            var c = a.fn.getByClassName("hermit-prosess-bar", b, "div")[0],
                                f = a.fn.getByClassName("hermit-button", b, "div")[0],
                                e = a.fn.getByClassName("hermit-duration", b, "div")[0],
                                y = a.fn.getByClassName("hermit-song",
                                    b, "div");
                            a.fn.each(y, function () {
                                a.fn.removeClass(this, "selected")
                            });
                            c.style.width = 0;
                            j = g = null;
                            a.sound = null;
                            e.innerHTML = "";
                            a.fn.removeClass(f, "playing")
                        }
                    }
                });
                a.sound.play()
            })
        },
        createPlayListUI: function (c, b) {
            var d = a.fn.getByClassName("hermit-list", this, "div")[0],
                f = "";
            if (i[b] = [], c.album_id || c.collect_id) c = c.songs, a.fn.each(c, function () {
                null != this && (i[b].push({
                    src: this.song_src
                }), f += '<div class="hermit-song">' + this.song_title + " - " + this.song_author + "</div>")
            });
            else {
                var e = this.getAttribute("songs").split("#:")[1],
                    e = e.split(",");
                a.fn.each(e, function () {
                    null != c[this] && (i[b].push({
                        src: c[this].song_src
                    }), f += '<div class="hermit-song">' + c[this].song_title + " - " + c[this].song_author + "</div>")
                })
            }
            d.innerHTML = f;
            a.fn.playEvent.call(this)
        },
        playEvent: function () {
            var c = this,
                b = a.fn.getByClassName("hermit-button", c, "div")[0],
                d = a.fn.getByClassName("hermit-volume", c, "div")[0],
                f = a.fn.getByClassName("hermit-listbutton", c, "div")[0],
                e = a.fn.getByClassName("hermit-list", c, "div")[0],
                i = a.fn.getByClassName("hermit-song", e, "div"),
                l = (parseInt(a.fn._getStyle(i[0],
                    "height")) + 1) * i.length,
                h = a.fn.getByClassName("hermit-prosess", c, "div")[0],
                k = a.fn.getByClassName("hermit-prosess-after", h, "div")[0],
                l = 360 >= l ? l : 360,
                l = l + "px";
            e.style.height = l;
            a.fn.each(i, function () {
                var d = a.fn.index(c, a.fn.getByClassName("hermit"));
                a.fn.bind(m, this, function () {
                    var e = a.fn.index(this, i);
                    if (j == d) e == g ? b.click() : (g = e, a.fn.create.call(c, d));
                    else {
                        if (a.sound) {
                            var f = a.fn.getByClassName("hermit")[j],
                                h = a.fn.getByClassName("hermit-button", f, "div")[0],
                                f = a.fn.getByClassName("hermit-song", f, "div")[g];
                            a.fn.removeClass(h, "playing");
                            a.fn.removeClass(f, "selected");
                            a.sound.resume()
                        }
                        g = e;
                        a.fn.addClass(b, "playing");
                        a.fn.create.call(c, d)
                    }
                })
            });
            a.fn.bind(m, b, function () {
                var d = a.fn.index(c, a.fn.getByClassName("hermit"));
                if (a.fn.hasClass(b, "playing")) a.fn.removeClass(b, "playing"), a.sound.pause();
                else if (a.fn.addClass(b, "playing"), a.sound && j == d) a.sound.play();
                else {
                    if (a.sound) {
                        var e = a.fn.getByClassName("hermit")[j],
                            f = a.fn.getByClassName("hermit-button", e, "div")[0],
                            e = a.fn.getByClassName("hermit-song", e, "div")[g];
                        g = null;
                        a.fn.removeClass(f, "playing");
                        a.fn.removeClass(e, "selected")
                    }
                    a.fn.create.call(c, d)
                }
            });
            a.fn.bind(m, f, function () {
                a.fn.hasClass(c, "unexpand") ? (a.fn.removeClass(c, "unexpand"), e.style.height = l) : (a.fn.addClass(c, "unexpand"), e.style.height = 0)
            });
            a.fn.bind(m, d, function () {
                var c = a.fn.getByClassName("hermit-volume", null, "div");
                a.fn.hasClass(d, "muted") ? (a.fn.each(c, function () {
                    a.fn.removeClass(this, "muted")
                }), q = 100, a.sound && a.sound.setVolume(100)) : (a.fn.each(c, function () {
                        a.fn.addClass(this, "muted")
                    }), q =
                    0, a.sound && a.sound.setVolume(0))
            });
            a.fn.bind(m, h, function (c) {
                if (a.sound) {
                    var b = parseInt(a.fn._getStyle(h, "width")),
                        d = a.fn._offset(h).left,
                        c = a.fn._pageEvent(c).pageX - d,
                        c = c / b * a.sound.duration;
                    a.sound.setPosition(c)
                }
            });
            a.fn.bind(x, k, a.fn._bind(a.fn._start, c))
        },
        autoPlay: function () {
            var c = a.fn.getByClassName("hermit");
            a.fn.each(c, function () {
                if (parseInt(this.getAttribute("auto"), 10)) return a.fn.getByClassName("hermit-button", this, "div")[0].click(), !1
            })
        },
        _pageEvent: function (a) {
            if (a = a || p.event, k && a.touches.length) a.pageX =
                a.touches.item(0).pageX, a.pageY = a.touches.item(0).pageY;
            else if ("undefined" == typeof a.pageX) {
                var b = e.documentElement,
                    d = e.body;
                a.pageX = a.clientX + (b && b.scrollLeft || d && d.scrollLeft || 0) - (b && b.clientLeft || d && d.clientLeft || 0);
                a.pageY = a.clientY + (b && b.scrollTop || d && d.scrollTop || 0) - (b && b.clientTop || d && d.clientTop || 0)
            }
            return a
        },
        _expect: function (a, b, d, e) {
            return e = a.length > d - b ? e : "", a = a.slice(b, d), a + e
        },
        _offset: function (a) {
            var b = a.getBoundingClientRect(),
                d = a.ownerDocument,
                a = d.body,
                d = d.documentElement;
            return {
                top: b.top +
                    (self.pageYOffset || d.scrollTop || a.scrollTop) - (d.clientTop || a.clientTop || 0),
                left: b.left + (self.pageXOffset || d.scrollLeft || a.scrollLeft) - (d.clientLeft || a.clientLeft || 0)
            }
        },
        _getStyle: function (a, b) {
            return 5 < o && 9 > o ? (b = b.replace(/^(\w)/g, function (a, c) {
                return c.toUpperCase()
            }), a["client" + b]) : e.defaultView.getComputedStyle(a, null).getPropertyValue(b)
        },
        _bind: function (a, b) {
            return function () {
                return a.apply(b, arguments)
            }
        },
        _start: function () {
            a.moving = !0;
            a.fn.bind(v, e, a.fn._bind(a.fn._move, this));
            a.fn.bind(w, e, a.fn._bind(a.fn._end,
                this));
            a.fn.bind("touchcancel", e, a.fn._bind(a.fn._end, this))
        },
        _move: function (c) {
            event = a.fn._pageEvent(c);
            var b = a.fn.getByClassName("hermit-prosess", this, "div")[0],
                c = a.fn.getByClassName("hermit-prosess-bar", b, "div")[0],
                d = parseInt(a.fn._getStyle(b, "width")),
                b = a.fn._offset(b).left,
                b = event.pageX - b,
                d = b / d;
            c.style.width = 100 * (1 < d ? 1 : d) + "%"
        },
        _end: function () {
            a.fn.getByClassName("hermit-prosess-after", this, "div")[0];
            if (a.sound) {
                var c = a.fn.getByClassName("hermit-prosess", this, "div")[0],
                    b = a.fn.getByClassName("hermit-prosess-bar",
                        c, "div")[0],
                    c = parseInt(a.fn._getStyle(c, "width")),
                    b = parseInt(a.fn._getStyle(b, "width")),
                    b = b / c,
                    b = (1 < b ? 1 : b) * a.sound.duration;
                a.sound.setPosition(b)
            }
            a.fn.unbind(v, e);
            a.fn.unbind(w, e);
            a.fn.unbind("touchcancel", e);
            try {
                delete a.moving
            } catch (d) {
                a.moving = u
            }
            a.fn.handleHash = {}
        },
        ajaxp: function (c) {
            setTimeout(function () {
                var b = (new Date).valueOf(),
                    d = e.createElement("script");
                body = e.documentElement;
                head = body.getElementsByTagName("head")[0];
                callbackName = "hermit" + parseInt(999999 * Math.random());
                c.param.callback = callbackName;
                c.param._ = b;
                p[callbackName] = function (a) {
                    c.after.call(this, a);
                    head.removeChild(d)
                };
                d.src = c.url + "?" + a.fn.serialize(c.param);
                head.appendChild(d)
            }, 0)
        },
        _loadScript: function (c, b) {
            setTimeout(function () {
                var d = e.createElement("script");
                d.src = c;
                d.readyState ? a.fn.bind("readystatechange", d, function () {
                    ("loaded" === d.readyState || "complete" === d.readyState) && (b && b(), a.fn.unbind("readystatechange", d))
                }) : a.fn.bind("load", d, function () {
                    b && b();
                    a.fn.unbind("load", d)
                });
                e.getElementsByTagName("head")[0].appendChild(d)
            }, 0)
        },
        serialize: function (a) {
            var b = [];
            for (key in a) key = [key, a[key]].join("="), b.push(key);
            return b.join("&")
        },
        parseTime: function (a) {
            if (!isFinite(a) || 0 > a) return "--:--";
            var b = Math.floor(a / 60),
                a = Math.floor(a) % 60;
            return (10 > b ? "0" + b : b) + ":" + (10 > a ? "0" + a : a)
        }
    };
    a.init()
})(window, document);
