.PHONY: doc compile coverage polyfilled scaffold watch test

all: doc compile

doc:
	esdoc -c esdoc.json 
		 
compile:
	@mkdir -p out/routes
	@babel lib\
		--optional runtime\
		--out-dir out\
	 	--source-maps true
		 
polyfilled:
	babel-node lib/Compiler.js

watch:
	watch-run -i -p "lib/**.js" -- make compile

clean:
	rm -rf out/ doc/
