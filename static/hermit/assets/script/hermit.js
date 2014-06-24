/**
 * @name Hermit
 * @version 1.1.0
 * @create 2014.2.7
 * @lastmodified 2014-04-20 12:02
 * @description Hermit Plugin
 * @author MuFeng (http://mufeng.me)
 * @url http://mufeng.me/hermit-for-wordpress.html
 *
 * 2014-06-01 Modified by mawenbao to work with the pelican niu-x2-sidebar theme and niux2_hermit_player plugin.
 **/
(function (A, I, f) {
    var G = soundManager,
        H = null,
        E = null,
        z = 100,
        F = [],
        J = {},
        B, y = -1;
    if ("Microsoft Internet Explorer" == navigator.appName) {
        var n = navigator.userAgent,
            l = /MSIE ([0-9]{1,}[.0-9]{0,})/;
        null != l.exec(n) && (y = parseFloat(RegExp.$1))
    } else {
        "Netscape" == navigator.appName && (n = navigator.userAgent, l = /Trident\/.*rv:([0-9]{1,}[.0-9]{0,})/, null != l.exec(n) && (y = parseFloat(RegExp.$1)))
    }
    B = y;
    var D = "createTouch" in I || "ontouchstart" in A,
        C = D ? "touchstart" : "click",
        b = D ? "touchstart" : "mousedown",
        d = D ? "touchmove" : "mousemove",
        c = D ? "touchend" : "mouseup";
    G.url = hermit.url;
    G.debugMode = hermit.debugMode || false;
    G.debugFlash = hermit.debugFlash || false;
    G.preferFlash = hermit.preferFlash || (5 < B ? !0 : !1);
    G.flashVersion = hermit.flashVersion || 8;
    //G.debugMode = !1;
    //G.preferFlash = 5 < B ? !0 : !1;
    J.init = function () {
        this.fn.getjson()
    };
    J.fn = {
        handleHash: {},
        bind: I.addEventListener ? function (g, a, e) {
            a.addEventListener(g, function () {
                e.apply(this, arguments);
                J.fn.handleHash[g] = J.fn.handleHash[g] || [];
                J.fn.handleHash[g].push(arguments.callee)
            }, !1)
        } : I.attachEvent ? function (g, a, e) {
            a.attachEvent("on" + g, function () {
                e.apply(this, arguments);
                J.fn.handleHash[g] = J.fn.handleHash[g] || [];
                J.fn.handleHash[g].push(arguments.callee)
            })
        } : void 0,
        unbind: I.removeEventListener ? function (h, a) {
            if (J.fn.handleHash[h]) {
                var g = 0,
                    e = J.fn.handleHash[h].length;
                for (g; e > g; g += 1) {
                    a.removeEventListener(h, J.fn.handleHash[h][g], !1)
                }
            }
        } : I.detachEvent ? function (h, a) {
            if (J.fn.handleHash[h]) {
                var g = 0,
                    e = J.fn.handleHash[h].length;
                for (g; e > g; g += 1) {
                    a.detachEvent("on" + h, J.fn.handleHash[h][g])
                }
            }
        } : void 0,
        rclass: /[\n\t]/g,
        rspaces: /\s+/,
        arraify: function (g) {
            var e = [];
            try {
                e = Array.prototype.slice.call(g, 0)
            } catch (i) {
                for (var h, e = [], j = 0; h = g[j++];) {
                    e.push(h)
                }
            }
            return e
        },
        hasClass: function (e, a) {
            return 0 <= (" " + e.className + " ").replace(J.fn.rclass, " ").indexOf(" " + a + " ") ? !0 : !1
        },
        addClass: function (o, a) {
            if (a && "string" == typeof a) {
                var k = (a || "").split(J.fn.rspaces);
                if (1 === o.nodeType) {
                    if (o.className) {
                        for (var i = " " + o.className + " ", m = o.className, j = 0, h = k.length; h > j; j++) {
                            0 > i.indexOf(" " + k[j] + " ") && (m += " " + k[j])
                        }
                        o.className = J.fn.trim(m)
                    } else {
                        o.className = a
                    }
                }
            }
        },
        removeClass: function (m, a) {
            if (a && "string" == typeof a || void 0 === a) {
                var k = (a || "").split(J.fn.rspaces);
                if (1 === m.nodeType && m.className) {
                    if (a) {
                        for (var i = (" " + m.className + " ").replace(J.fn.rclass, " "), j = 0, h = k.length; h > j; j++) {
                            i = i.replace(" " + k[j] + " ", " ")
                        }
                        m.className = J.fn.trim(i)
                    } else {
                        m.className = ""
                    }
                }
            }
        },
        getById: function (e) {
            return I.getElementById(e)
        },
        getByTagName: function (e, a) {
            return a = a || I, J.fn.arraify(a.getElementsByTagName(e))
        },
        getByClassName: function (h, a, g) {
            if (a = a || I, a.getElementsByClassName) {
                return J.fn.arraify(a.getElementsByClassName(h))
            }
            for (var h = h.replace(/\-/g, "\\-"), e = [], a = J.fn.getByTagName(g || "*", a), g = a.length, h = RegExp("(^|\\s)" + h + "(\\s|$)"); g--;) {
                h.test(a[g].className) && e.push(a[g])
            }
            return e.reverse(), e
        },
        each: function (g, e) {
            if (f != g.length) {
                for (var i = 0, h = g.length; h > i && !1 !== e.call(g[i], i, g[i]); i++) {}
            } else {
                for (name in g) {
                    e.call(g[name], name, g[name])
                }
            }
        },
        index: function (g, e) {
            var i, h = e.length;
            for (i = 0; h > i; i++) {
                if (g == e[i]) {
                    return i
                }
            }
            return -1
        },
        trim: function (e) {
            return e.replace(/^(\s|\u00A0)+/, "").replace(/(\s|\u00A0)+$/, "")
        },
        getjson: function () {
            var e = J.fn.getByClassName("hermit"),
                a = e.length - 1;
            J.fn.each(e, function (k) {
                var i = this;
                var h = i.getAttribute("xiami");
                var g = i.getAttribute("netease");
                var result = {
                    collect_id: 12345,
                    songs: []
                };
                // parse additional songs first
                jQuery(".hermit-add-song").each(function(i, e) {
                    result.songs.push({
                        name: jQuery(e).data("title"),
                        url: jQuery(e).data("url"),
                        artists: jQuery(e).data("author"),
                    });
                });
                var musicParams = h ? h : g
                var provider = h ? "xiami" : "netease"
                var j = musicParams.split(":");
                J.fn.ajaxp({
                        url: "http://app.atime.me/music-api-server/",
                        param: {
                            p: provider,
                            t: j[0],
                            i: j[1]
                        },
                        after: function (e) {
                            for (var xiamik in e.songs) {
                                result.songs.push(e.songs[xiamik]);
                            }
                            J.fn.createPlayListUI.call(i, result, k);
                            k == a && J.fn.autoPlay()
                        }
                });
                if (! h && !g) {
                    J.fn.createPlayListUI.call(i, result, k);
                    k == a && J.fn.autoPlay()
                }
            });
        },
        create: function (e) {
            var a = this;
            E = null != e ? e : 0;
            H = null != H ? H : 0;
            J.sound && (J.sound.destruct(), H == F[E].length && (H = 0));
            G.onready(function () {
                J.sound = G.createSound({
                    id: "goXiami",
                    url: F[E][H].src,
                    volume: z,
                    autoLoad: !1,
                    ondataerror: function () {
                        console.log("fuck")
                    },
                    onconnect: function () {
                        console.log("connect")
                    },
                    onload: function () {
                        3 > this.readyState && (J.fn.getByClassName("hermit-detail", a, "div")[0].innerHTML = "\u97f3\u4e50\u64ad\u653e\u5668\u521d\u59cb\u5316\u5931\u8d25!")
                    },
                    whileloading: function () {
                        J.fn.getByClassName("hermit-loaded", a, "div")[0].style.width = 100 * (this.bytesLoaded / this.bytesTotal) + "%"
                    },
                    whileplaying: function () {
                        var k = J.fn.getByClassName("hermit-duration", a, "div")[0],
                            i = J.fn.getByClassName("hermit-prosess-bar", a, "div")[0],
                            j = 100 * (this.position / this.duration) + "%",
                            h = J.fn.parseTime(this.position / 1000) + "/" + J.fn.parseTime(this.duration / 1000);
                        !J.moving && (i.style.width = j);
                        k.innerHTML = h
                    },
                    onplay: function () {
                        var h = J.fn.getByClassName("hermit-song", a, "div"),
                            g = J.fn.getByClassName("hermit-detail", a, "div")[0];
                        J.fn.each(h, function () {
                            J.fn.removeClass(this, "selected")
                        });
                        J.fn.addClass(h[H], "selected");
                        g.innerHTML = J.fn._expect(h[H].innerHTML, 0, 40, "...") + "  (" + (H + 1) + "/" + F[E].length + ")"
                    },
                    onpause: function () {},
                    onfinish: function () {
                        if (H++, J.sound.resume(), H < F[E].length) {
                            J.fn.create.call(a, E)
                        } else {
                            if (parseInt(a.getAttribute("loop"), 10)) {
                                J.fn.getByClassName("hermit-song", a, "div")[0].click()
                            } else {
                                var j = J.fn.getByClassName("hermit-prosess-bar", a, "div")[0],
                                    g = J.fn.getByClassName("hermit-button", a, "div")[0],
                                    h = J.fn.getByClassName("hermit-duration", a, "div")[0],
                                    i = J.fn.getByClassName("hermit-song", a, "div");
                                J.fn.each(i, function () {
                                    J.fn.removeClass(this, "selected")
                                });
                                j.style.width = 0;
                                E = H = null;
                                J.sound = null;
                                h.innerHTML = "";
                                J.fn.removeClass(g, "playing")
                            }
                        }
                    }
                });
                J.sound.play()
            })
        },
        createPlayListUI: function (j, a) {
            var i = J.fn.getByClassName("hermit-list", this, "div")[0],
                g = "";
            if (F[a] = [], j.album_id || j.collect_id) {
                j = j.songs, J.fn.each(j, function () {
                    null != this && (F[a].push({
                        src: this.url
                    }), g += '<div class="hermit-song">' + this.name + " - " + this.artists + "</div>")
                })
            } else {
                var h = this.getAttribute("xiami").split(":")[1],
                    h = h.split(",");
                J.fn.each(h, function () {
                    null != j[this] && (F[a].push({
                        src: j[this].url
                    }), g += '<div class="hermit-song">' + j[this].name + " - " + j[this].artists + "</div>")
                })
            }
            i.innerHTML = g;
            J.fn.playEvent.call(this)
        },
        playEvent: function () {
            var r = this,
                s = J.fn.getByClassName("hermit-button", r, "div")[0],
                q = J.fn.getByClassName("hermit-volume", r, "div")[0],
                o = J.fn.getByClassName("hermit-listbutton", r, "div")[0],
                p = J.fn.getByClassName("hermit-list", r, "div")[0],
                j = J.fn.getByClassName("hermit-song", p, "div"),
                a = (parseInt(J.fn._getStyle(j[0], "height")) + 1) * j.length,
                m = J.fn.getByClassName("hermit-prosess", r, "div")[0],
                g = J.fn.getByClassName("hermit-prosess-after", m, "div")[0],
                a = 360 >= a ? a : 360,
                a = a + "px";
            p.style.height = a;
            J.fn.each(j, function () {
                var e = J.fn.index(r, J.fn.getByClassName("hermit"));
                J.fn.bind(C, this, function () {
                    var t = J.fn.index(this, j);
                    if (E == e) {
                        t == H ? s.click() : function() {
                            var k = J.fn.getByClassName("hermit")[E],
                                i = J.fn.getByClassName("hermit-button", k, "div")[0];
                            if (!J.fn.hasClass(i, "playing")) {
                                J.fn.addClass(i, "playing");
                            }
                            H = t;
                            J.fn.create.call(r, e);
                        }();
                    } else {
                        if (J.sound) {
                            var k = J.fn.getByClassName("hermit")[E],
                                i = J.fn.getByClassName("hermit-button", k, "div")[0],
                                k = J.fn.getByClassName("hermit-song", k, "div")[H];
                            J.fn.removeClass(i, "playing");
                            J.fn.removeClass(k, "selected");
                            J.sound.resume()
                        }
                        H = t;
                        J.fn.addClass(s, "playing");
                        J.fn.create.call(r, e)
                    }
                })
            });
            J.fn.bind(C, s, function () {
                var k = J.fn.index(r, J.fn.getByClassName("hermit"));
                if (J.fn.hasClass(s, "playing")) {
                    J.fn.removeClass(s, "playing"), J.sound.pause()
                } else {
                    if (J.fn.addClass(s, "playing"), J.sound && E == k) {
                        J.sound.play()
                    } else {
                        if (J.sound) {
                            var i = J.fn.getByClassName("hermit")[E],
                                h = J.fn.getByClassName("hermit-button", i, "div")[0],
                                i = J.fn.getByClassName("hermit-song", i, "div")[H];
                            H = null;
                            J.fn.removeClass(h, "playing");
                            J.fn.removeClass(i, "selected")
                        }
                        J.fn.create.call(r, k)
                    }
                }
            });
            J.fn.bind(C, o, function () {
                J.fn.hasClass(r, "unexpand") ? (J.fn.removeClass(r, "unexpand"), p.style.height = a) : (J.fn.addClass(r, "unexpand"), p.style.height = 0)
            });
            J.fn.bind(C, q, function () {
                var e = J.fn.getByClassName("hermit-volume", null, "div");
                J.fn.hasClass(q, "muted") ? (J.fn.each(e, function () {
                    J.fn.removeClass(this, "muted")
                }), z = 100, J.sound && J.sound.setVolume(100)) : (J.fn.each(e, function () {
                    J.fn.addClass(this, "muted")
                }), z = 0, J.sound && J.sound.setVolume(0))
            });
            J.fn.bind(C, m, function (i) {
                if (J.sound) {
                    var e = parseInt(J.fn._getStyle(m, "width")),
                        h = J.fn._offset(m).left,
                        i = J.fn._pageEvent(i).pageX - h,
                        i = i / e * J.sound.duration;
                    J.sound.setPosition(i)
                }
            });
            J.fn.bind(b, g, J.fn._bind(J.fn._start, r))
        },
        autoPlay: function () {
            var a = J.fn.getByClassName("hermit");
            J.fn.each(a, function () {
                if (parseInt(this.getAttribute("auto"), 10)) {
                    return J.fn.getByClassName("hermit-button", this, "div")[0].click(), !1
                }
            })
        },
        _pageEvent: function (g) {
            if (g = g || A.event, D && g.touches.length) {
                g.pageX = g.touches.item(0).pageX, g.pageY = g.touches.item(0).pageY
            } else {
                if ("undefined" == typeof g.pageX) {
                    var e = I.documentElement,
                        h = I.body;
                    g.pageX = g.clientX + (e && e.scrollLeft || h && h.scrollLeft || 0) - (e && e.clientLeft || h && h.clientLeft || 0);
                    g.pageY = g.clientY + (e && e.scrollTop || h && h.scrollTop || 0) - (e && e.clientTop || h && h.clientTop || 0)
                }
            }
            return g
        },
        _expect: function (h, g, j, i) {
            return i = h.length > j - g ? i : "", h = h.slice(g, j), h + i
        },
        _offset: function (g) {
            var e = g.getBoundingClientRect(),
                h = g.ownerDocument,
                g = h.body,
                h = h.documentElement;
            return {
                top: e.top + (self.pageYOffset || h.scrollTop || g.scrollTop) - (h.clientTop || g.clientTop || 0),
                left: e.left + (self.pageXOffset || h.scrollLeft || g.scrollLeft) - (h.clientLeft || g.clientLeft || 0)
            }
        },
        _getStyle: function (g, e) {
            return 5 < B && 9 > B ? (e = e.replace(/^(\w)/g, function (h, i) {
                return i.toUpperCase()
            }), g["client" + e]) : I.defaultView.getComputedStyle(g, null).getPropertyValue(e)
        },
        _bind: function (g, e) {
            return function () {
                return g.apply(e, arguments)
            }
        },
        _start: function () {
            J.moving = !0;
            J.fn.bind(d, I, J.fn._bind(J.fn._move, this));
            J.fn.bind(c, I, J.fn._bind(J.fn._end, this));
            J.fn.bind("touchcancel", I, J.fn._bind(J.fn._end, this))
        },
        _move: function (g) {
            event = J.fn._pageEvent(g);
            var a = J.fn.getByClassName("hermit-prosess", this, "div")[0],
                g = J.fn.getByClassName("hermit-prosess-bar", a, "div")[0],
                e = parseInt(J.fn._getStyle(a, "width")),
                a = J.fn._offset(a).left,
                a = event.pageX - a,
                e = a / e;
            g.style.width = 100 * (1 < e ? 1 : e) + "%"
        },
        _end: function () {
            J.fn.getByClassName("hermit-prosess-after", this, "div")[0];
            if (J.sound) {
                var g = J.fn.getByClassName("hermit-prosess", this, "div")[0],
                    a = J.fn.getByClassName("hermit-prosess-bar", g, "div")[0],
                    g = parseInt(J.fn._getStyle(g, "width")),
                    a = parseInt(J.fn._getStyle(a, "width")),
                    a = a / g,
                    a = (1 < a ? 1 : a) * J.sound.duration;
                J.sound.setPosition(a)
            }
            J.fn.unbind(d, I);
            J.fn.unbind(c, I);
            J.fn.unbind("touchcancel", I);
            try {
                delete J.moving
            } catch (e) {
                J.moving = f
            }
            J.fn.handleHash = {}
        },
        ajaxp: function (a) {
            setTimeout(function () {
                var e = (new Date).valueOf(),
                    g = I.createElement("script");
                body = I.documentElement;
                head = body.getElementsByTagName("head")[0];
                callbackName = "hermit" + parseInt(999999 * Math.random());
                a.param.c = callbackName;
                a.param._ = e;
                A[callbackName] = function (h) {
                    a.after.call(this, h);
                    head.removeChild(g)
                };
                g.src = a.url + "?" + J.fn.serialize(a.param);
                head.appendChild(g)
            }, 0)
        },
        _loadScript: function (e, a) {
            setTimeout(function () {
                var g = I.createElement("script");
                g.src = e;
                g.readyState ? J.fn.bind("readystatechange", g, function () {
                    ("loaded" === g.readyState || "complete" === g.readyState) && (a && a(), J.fn.unbind("readystatechange", g))
                }) : J.fn.bind("load", g, function () {
                    a && a();
                    J.fn.unbind("load", g)
                });
                I.getElementsByTagName("head")[0].appendChild(g)
            }, 0)
        },
        serialize: function (g) {
            var e = [];
            for (key in g) {
                key = [key, g[key]].join("="), e.push(key)
            }
            return e.join("&")
        },
        parseTime: function (g) {
            if (!isFinite(g) || 0 > g) {
                return "--:--"
            }
            var e = Math.floor(g / 60),
                g = Math.floor(g) % 60;
            return (10 > e ? "0" + e : e) + ":" + (10 > g ? "0" + g : g)
        }
    };
    J.init()
})(window, document);
