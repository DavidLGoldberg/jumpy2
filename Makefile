NODE_VERSION = 20.14.0 # set in the azure-pipelines.yml
NPM_VERSION = 10.8.1
ELM_VERSION = latest-0.19.1
ELM_TEST_VERSION = 0.19.1-revision9
UGLIFY_VERSION = 3.14.5
MADGE_VERSION = 5.0.1

STATE_MACHINE_SRC = src/elm/StateMachineVSC.elm
STATE_MACHINE_OUT = out/elm/StateMachineVSC.js

default: clean npm elm-build typescript

npm:
	npm install npm@$(NPM_VERSION)
	npm install

elm-local-install: npm
	npm install elm@$(ELM_VERSION) --save-exact --save-dev

elm-debug: elm-local-install
	npx elm@0.19.1-3 make $(STATE_MACHINE_SRC) --output=$(STATE_MACHINE_OUT)

elm-build:
	npm_config_yes=true npx elm@$(ELM_VERSION) make $(STATE_MACHINE_SRC) --output=$(STATE_MACHINE_OUT) --optimize
	npm_config_yes=true npx uglify-js@$(UGLIFY_VERSION) --output $(STATE_MACHINE_OUT) --mangle --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' -- $(STATE_MACHINE_OUT)

typescript:
	npm run compile

graph:
	# make graph (svg) of architecture
	mkdir -p ./.madge
	npx madge@$(MADGE_VERSION) --exclude '(^test*|Atom)' --image ./.madge/graph.svg ./out

test: default
	npm_config_yes=true npx elm-test@$(ELM_TEST_VERSION)
	npm test

package:
	# uses npm's vscode:prepublish target
	npm_config_yes=true npx vsce package

install: package
	code --install-extension `ls -snew jumpy2*vsix | head -1 | awk '{ print $$NF }'`

clean:
	rm -rf "node_modules" ".coverage" ".nyc_output" ".vscode-test" "out" "dist"
	# NOTE: intentionally not deleting .vsix files

count:
	rg --files | grep -v \.js$ | grep -v out | grep -v \.png$ | grep -v \.gif$ | grep -v package-lock.json | xargs wc -l | sort -n

# For Husky:
# npm set-script prepare "npx husky install"
# npm run prepare
# npx husky add .husky/pre-commit "npm test"
# git add .husky/pre-commit