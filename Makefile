default: elm typescript

elm:
	# add target for `npm install uglify-js` or -g?
	node_modules/elm/bin/elm make src/elm/StateMachineVSC.elm --output=out/elm/StateMachineVSC.js --optimize
	node_modules/uglify-js/bin/uglifyjs out/elm/StateMachineVSC.js --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' | node_modules/uglify-js/bin/uglifyjs --mangle --output=out/elm/StateMachineVSC.js
	node_modules/elm-test/bin/elm-test

elm-debug:
	node_modules/elm/bin/elm make src/elm/StateMachineVSC.elm --output=out/elm/StateMachineVSC.js
	# add target for `npm install -g elm-test` or not -g?
	node_modules/elm-test/bin/elm-test

typescript:
	# *** needs work for vs code ***
	npm install
	# for now typescript gets built with atom-typescript.

graph:
	# make graph (svg) of architecture
	npx madge --image ./.madge/graph.svg ./out

test:
	node_modules/elm-test/bin/elm-test
	# TODO: Test vs code side

count:
	# *** needs work for vs code ***
	rg --files | grep -v \.js$ | grep -v out | grep -v \.png$ | grep -v \.gif$ | grep -v package-lock.json | xargs wc -l | sort -n
