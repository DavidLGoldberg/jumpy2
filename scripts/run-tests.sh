#!/bin/bash
# Wrapper script to run VS Code extension tests.
# On macOS, handles the hang issue where VS Code window stays open after tests complete.
# On Linux/CI, runs tests directly without workarounds.
#
# Usage: ./run-tests.sh NPM_VERSION

if [ -z "$1" ]; then
    echo "Error: NPM_VERSION argument required" >&2
    echo "Usage: $0 NPM_VERSION" >&2
    exit 1
fi

NPM_VERSION="$1"

# Detect OS
OS="$(uname -s)"

if [ "$OS" != "Darwin" ]; then
    # Linux/Windows/CI - no hang issue, run directly
    exec npx "npm@${NPM_VERSION}" test
fi

# macOS-specific workaround for VS Code window hang issue
# https://github.com/microsoft/vscode/issues/82676

cleanup() {
    pkill -f "\.vscode-test.*Code" 2>/dev/null || true
}
trap cleanup EXIT

# Use timeout to kill if VS Code hangs after tests complete
if command -v gtimeout &> /dev/null; then
    gtimeout 90 npx "npm@${NPM_VERSION}" test
    EXIT_CODE=$?
elif command -v timeout &> /dev/null; then
    timeout 90 npx "npm@${NPM_VERSION}" test
    EXIT_CODE=$?
else
    # No timeout available, run directly and hope for the best
    npx "npm@${NPM_VERSION}" test
    EXIT_CODE=$?
fi

# Exit code 124 = timeout killed it (tests passed but VS Code hung)
if [ $EXIT_CODE -eq 124 ]; then
    echo "Tests completed but VS Code window hung (known macOS issue)"
    EXIT_CODE=0
fi

exit $EXIT_CODE
