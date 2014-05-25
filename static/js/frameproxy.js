/*
Copyright (c) 2011 Benjamin Eidelman <@beneidel>

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/*
 	-- FrameProxy --
 	 
 Requirements:
 	- jQuery 1.5+     
 */

(function($){

    var frameproxy = {};
    
    var count = 0;
    
    frameproxy.functions = [
			"jQuery.ajax",
			"jQuery.get",
			"jQuery.post",
			"jQuery.getJSON"
    ];
    
    frameproxy.global = window || global;
    
    frameproxy.ppath = function(root, expr, value){
		if (typeof root == 'string') {
			value = expr;
			expr = root;
			root = frameproxy.global;
			if (!frameproxy.global) {
				throw 'window not defined, specify frameproxy.global';
			}
		}
		var parts = expr.split('.'), cur = root;
		
		if (typeof value == 'undefined') {
			// get value
			for (var pi = 0; pi < parts.length - 1; pi++) {
				if (typeof cur !== 'object') {
					cur = null;
					break;
				}
				cur = cur[parts[pi]];
			};
			return cur ? {
				obj: cur,
				value: cur[parts[parts.length - 1]],
				name: parts[parts.length - 1]
			} : {};
		}
		else {
			// set value
			for (var pi = 0; pi < parts.length; pi++) {
				if (typeof cur == 'undefined' || cur === null) {
					break;
				}
				cur[parts[pi]] = (pi == parts.length - 1 ? value : {});
				cur = cur[parts[pi]];
			};
		}
	};

    frameproxy.stripFunctions = function(obj){
		var res = obj;
        if (typeof obj == 'object') {
            if (obj instanceof Array) {
				res = [];
				for (var i = obj.length; i >= 0; i--) {
					if (typeof obj[i] == 'function') {
						res[i] = null;
					}
					else 
						if (typeof obj[i] == 'object') {
							res[i] = frameproxy.stripFunctions(obj[i]);
						}
				}
			}else{
				res = {};
			}
			for (var prop in obj) {
				if (typeof obj[prop] != 'function') {
					if (typeof obj[prop] == 'object') {
						res[prop] = frameproxy.stripFunctions(obj[prop]);
					}else {
						res[prop] = obj[prop];
					}
				}
			}
        }
        return res;
    }
    
    frameproxy.message = {
        pack: function(msg, options){
            return frameproxy.stripFunctions(msg);
        },
        unpack: function(msg, options){
            return msg;
        }
    }
    
    /**
     * Creates a new ProxyClient
     * @param {String|DOMWindow} target an url to a proxy client page (to open in a hidden iframe), or a DOMWindow to post messages to
     */
    frameproxy.ProxyClient = function ProxyClient(target, password){
        if (!window.postMessage) {
            throw 'window.postMessage not supported on this browser';
        }
        if (typeof jQuery == 'undefined') {
            throw 'jQuery is required';
        }
        else {
        
            this.password = password;
            this.deferreds = {};
            this.proxyWindow = null;
            
            if (typeof target == 'object' && typeof target.postMessage == 'function') {
                // use already loaded window
                this.proxyWindow = target;
                (function(proxy){
                    jQuery(function(){
                        console.log('frameproxy client ready');
                        jQuery(proxy).trigger('ready');
                    });
                })(this);
            }
            else {
                // prepare iframe
                this.iframe = document.createElement('iframe');
                this.iframe.src = target;
                this.iframe.style.display = 'none';
                
                // insert iframe
                (function(iframe, proxy){
                    jQuery(function(){
                        jQuery(iframe).load(function(){
                            proxy.proxyWindow = iframe.contentWindow;
                            console.log('frameproxy client ready');
                            jQuery(proxy).trigger('ready');
                        });
                        jQuery('body').append(iframe);
                    });
                })(this.iframe, this);
            }
                        
            // listen proxy responses
            (function(proxy){
                window.addEventListener("message", function(e){
                
                    if (e.source !== proxy.proxyWindow) {
                        return;
                    }
                    
                    var id, deferred;
                    try {
                    
                        var data = frameproxy.message.unpack(e.data);
                        
                        if (data.id && (deferred = proxy.deferreds[data.id])) {
                            if (data.error) {
                                deferred.reject.apply(deferred, data.args);
                            }
                            else {
                                if (typeof data.result != 'undefined') {
                                    deferred.resolve.apply(deferred, [data.result]);
                                }
                                else {
                                    deferred.resolve.apply(deferred, data.args);
                                }
                            }
                        }
                    } 
                    catch (err) {
                        if (!deferred.isRejected()) {
                            deferred.reject(err);
                        }
                    }
                    finally {
                        if (id) {
                            delete proxy.deferreds[id];
                        }
                    }
                });
            })(this);
        }
    };
    
    frameproxy.ProxyClient.prototype.remote = function(expr, args){
            
        count++;
        var id = '_' + count, deferred = this.deferreds[id] = jQuery.Deferred();
        
        var msg = frameproxy.message.pack({
            id: id,
            expr: expr,
            args: args
        });
        if (this.password) {
            msg.password = this.password;
        }
        
        this.proxyWindow.postMessage(msg, '*');
        
        return deferred.promise();
        
    };
	
	frameproxy.ProxyClient.prototype.ready = function(handler){
		$(this).bind('ready', handler);
		return this;
	}
	    
    frameproxy.ProxyClient.prototype.wrapAll = function(){
		var args = Array.prototype.slice.apply(arguments);
		args.push.apply(args, frameproxy.functions);
		return this.wrap.apply(this,args);
    };
    
	frameproxy.ProxyClient.prototype.wrap = function(replace){
    
        var makeRemote = function(proxy, expr){
            return function(){
                return proxy.remote(expr, Array.prototype.slice.apply(arguments));
            };
        };
        var repl = (replace === true);		
        for (var i =0; i< arguments.length; i++) {
        	var expr = arguments[i];
			if (typeof expr == 'string') {
				var rmt = makeRemote(this, expr);
				// define on this proxy (eg: proxy.jQuery.ajax())
				frameproxy.ppath(this, expr, rmt);
				if (repl) {
					var e = frameproxy.ppath(expr);
					if (e.obj) {
							// replace local by remote 
							e.obj[e.name] = rmt;
					}
				}
			}
        }
        return this;
    };
    
	
    frameproxy.ProxyServer = function ProxyServer(options){
    
        if (!window.postMessage) {
            throw 'window.postMessage not supported on this browser';
        }
        if (typeof jQuery == 'undefined') {
            throw 'jQuery is required';
        }
        
        this.options = jQuery.extend(true, {}, frameproxy.ProxyServer.options, options);
        
    };
    
    frameproxy.ProxyServer.options = {
        // a domain string, regex, filter function, or '*' for any
        domain: document ? (document.location.protocol + '//' + document.location.host) : 'http://localhost',
        // a uri string, regex, filter function, or '*' for any
        uri: '*',
        // for security, generate a random password, overwrite this when creating a ProxyServer
        password: null,
		// expressions/functions allowed (string, regex, or functions)
		expressions: Array.prototype.slice.apply(frameproxy.functions)
    };
    
    frameproxy.ProxyServer.prototype.listen = function(){
    
		var stringIsAllowed = function(str, filters){
			if (!filters){
				return true;
			}
			var f = (filters instanceof Array ? filters: [filters]);  
			for (var i =0; i< f.length; i++){
				var filter = f[i];
				if (filter === '*'){
					return true;
				}
				if (filter instanceof RegExp){
					if (filter.test(str)){
						return true;
					}
				}else if (typeof filter == 'function'){
					if (filter(str)){
						return true;
					}
				}else if (filter === str){
					return true;
				}
			}
			return false;
		};
	
        (function(options){
            window.addEventListener("message", function(e){
            
                var id = -1;
                try {
                
                    var data = frameproxy.message.unpack(e.data);
                    
                    if (options.password) {
                        if (e.data.password !== options.password) {
                            throw 'request rejected: invalid password';
                        }
                    }
					if (!stringIsAllowed(e.domain, options.domain)){
                        throw 'request rejected: invalid domain "' + e.domain + '"';
					}
					if (!stringIsAllowed(e.uri, options.uri)){
                        throw 'request rejected: invalid domain "' + e.domain + '"';
					}
                                        
                    if (typeof data.id == 'undefined') {
                        throw 'no id specified';
                    }                                        
                    if (!data.expr) {
                        throw 'no expr specified';
                    }
					
                    var valid = false, id = data.id;
                    
					if (!stringIsAllowed(data.expr, options.expressions)){
                        throw 'request rejected: invalid expr "' + data.expr + '"';
					}
                                        
					var result;
					
					var p = frameproxy.ppath(data.expr);
                    if (p.obj) {
						if (typeof p.value == 'function') {
							result = p.value.apply(p.obj, data.args);
						} else {
							result = p.value;
						}
                    }
                    
                    if (result && typeof result.then == 'function') {
                    
                        var done = function(id){
                            return function(){
                                // done
                                var msg = frameproxy.message.pack({
                                    ok: true,
                                    id: id,
                                    args: Array.prototype.slice.apply(arguments)
                                });
                                e.source.postMessage(msg, '*');
                            }
                        }(id);
                        var fail = function(id){
                            return function(){
                                // fail
                                var msg = frameproxy.message.pack({
                                    error: 'deferred failed',
                                    id: id,
                                    args: Array.prototype.slice.apply(arguments)
                                });
                                e.source.postMessage(msg, '*');
                            }
                        }(id);
                        result.then(done, fail);
                    }
                    else {
                        var msg = frameproxy.message.pack({
                            ok: true,
                            id: id,
                            result: typeof result == 'undefined' ? null : result
                        });
                        e.source.postMessage(msg, '*');
                    }
                } 
                catch (err) {
                    console.error('error processing remote call: ' + err);
                    var msg = frameproxy.message.pack({
                        id: id,
                        error: err
                    });
                    e.source.postMessage(msg, '*');
                }
            });
            
        })(this.options);
        
        console.log('frameproxy server listening');
        $(this).trigger('ready');
		
		return this;
    };
    		
	frameproxy.ProxyServer.prototype.ready = function(handler){
		$(this).bind('ready', handler);
		return this;
	}
    
    if (typeof window !== 'undefined') {
        window.frameproxy = frameproxy;
    }
    else 
        if (typeof exports != 'undefined') {
            exports.frameproxy = frameproxy;
        }
    
})(jQuery);
