SHELL := /bin/bash
PYGMENTS_MIN_DIR=static/css/pygments.min

compress: static/css/niu2.min.css static/js/niu2.min.js

all: compress pygments.min

static/js/niu2.min.js: static/js/niu2.js
	yui-compressor -o $@ $<

static/css/niu2.min.css: static/css/niu2.css
	yui-compressor -o $@ $<

pygments.min: static/css/pygments
	mkdir -p ${PYGMENTS_MIN_DIR}
	@for f in `ls -1 $< | grep "\.css"`; do \
		cmd="yui-compressor -o ${PYGMENTS_MIN_DIR}/$${f/.css/.min.css} $</$${f}"; \
		echo $${cmd}; \
		`$${cmd}`; \
	done

clean:
	rm -rf static/js/niu2.min.js static/css/niu2.min.css ${PYGMENTS_MIN_DIR}

.PHONY: all compress pygments.min clean

