PYGMENTS_MIN_DIR = static/css/pygments.min
PYGMENTS_SOURCE = ${wildcard static/css/pygments/*.css}
PYGMENTS = ${subst /pygments/,/pygments.min/,${patsubst %.css,%.min.css,${PYGMENTS_SOURCE}}}
HERMIT_JS_DIR = static/hermit/assets/script

all: compress

compress: static/css/niu2.min.css static/js/niu2.min.js static/font-icons/style.min.css static/js/jquery.lazyload.min.js ${PYGMENTS} ${HERMIT_JS_DIR}/hermit.min.js

static/js/niu2.min.js: static/js/niu2.js
	yui-compressor -o $@ $<

static/css/niu2.min.css: static/css/niu2.css
	yui-compressor -o $@ $<

static/font-icons/style.min.css: static/font-icons/style.css
	yui-compressor -o $@ $<

static/js/jquery.lazyload.min.js: static/js/jquery.lazyload.js
	yui-compressor -o $@ $<

${HERMIT_JS_DIR}/hermit.min.js: ${HERMIT_JS_DIR}/hermit.js
	yui-compressor -o $@ $<

${PYGMENTS}: static/css/pygments.min/%.min.css: static/css/pygments/%.css
	@[ -d ${PYGMENTS_MIN_DIR} ] || mkdir -p ${PYGMENTS_MIN_DIR}
	yui-compressor -o $@ $<

clean:
	rm -rf static/js/niu2.min.js static/css/niu2.min.css static/js/jquery.lazyload.min.js ${PYGMENTS_MIN_DIR} ${HERMIT_JS_DIR}/hermit.min.js static/font-icons/style.min.css

.PHONY: all compress pygments.min clean

