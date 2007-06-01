##
## Js makefile
##
## @author BrendonCrawford
##

all: clean lint compress
	@echo "Done."

lint:
	@echo "Running lint tests..."
	@js ./util/jslint-check.js ./src/nomouse.user.js

compress:
	@echo "Compressing js files..."
	@yui-compressor --charset=UTF-8 --type=js --preserve-semi --line-break=1000 -o ./dist/nomouse.user.js ./src/nomouse.user.js

install:
	@echo "Installing nomouse..."
	@cp -fr ./dist/nomouse.user.js ~/.mozilla/firefox/*.default/gm_scripts/nomouse/nomouse.user.js

clean:
	@echo "Cleaning..."
	@rm -fr ./dist/nomouse.user.js

