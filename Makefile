default: clean npm elm elm-build typescript

npm:
	npm install -g npm@8.3.0
	npm install

elm: npm
	npm install elm@latest-0.19.1 --save-exact --save-dev

elm-build:
	npx elm@latest-0.19.1 make src/elm/StateMachineVSC.elm --output=out/elm/StateMachineVSC.js --optimize
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
	npx elm-test@0.19.1-revision9
	npm test

package:
	# uses npm's vscode:prepublish target
	npx vsce package

install: package
	code --install-extension `ls -snew jumpy2*vsix | head -1 | awk '{ print $$NF }'`

clean:
	rm -rf "node_modules" ".coverage" ".nyc_output" ".vscode-test" "out"
	# NOTE: intentionally not deleting .vsix files

count:
	rg --files | grep -v \.js$ | grep -v out | grep -v \.png$ | grep -v \.gif$ | grep -v package-lock.json | xargs wc -l | sort -n

# For Husky:
# npm set-script prepare "npx husky install"
# npm run prepare
# npx husky add .husky/pre-commit "npm test"
# git add .husky/pre-commit