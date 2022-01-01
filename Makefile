default: clean npm elm elm-build typescript

npm:
	npm install -g npm@8.3.0
	npm install
	
elm: npm
	npm install -g elm@0.19.1-3

elm-build:
	# add target for `npm install uglify-js` or -g?
	npx elm@0.19.1-3 make src/elm/StateMachineVSC.elm --output=out/elm/StateMachineVSC.js --optimize
	npx uglify-js@3.14.5 --output out/elm/StateMachineVSC.js --mangle --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' -- out/elm/StateMachineVSC.js

elm-debug:
	npx elm@0.19.1-3 make src/elm/StateMachineVSC.elm --output=out/elm/StateMachineVSC.js

typescript:
	npm run compile
	
graph:
	# make graph (svg) of architecture
	mkdir -p ./.madge
	npx madge@5.0.1 --exclude '(^test*|Atom)' --image ./.madge/graph.svg ./out

test:
	npx elm-test@0.19.1-revision2
	npm test

package:
	vsce package

newestpackage:=$(shell ls -snew jumpy2*vsix | head -1 | cut -d" " -f14)

install: package
	code --install-extension $(newestpackage)

clean:
	rm -rf "node_modules" ".coverage" ".nyc_output" ".vscode-test"
	# NOTE: intentionally not deleting .vsix files

count:
	# *** needs work for vs code ***
	rg --files | grep -v \.js$ | grep -v out | grep -v \.png$ | grep -v \.gif$ | grep -v package-lock.json | xargs wc -l | sort -n
