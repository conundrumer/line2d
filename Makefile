NAME=line2d
BIN=./node_modules/.bin
TSC=$(BIN)/tsc
BROWSERIFY=$(BIN)/browserify
SRC=./src
BUILD=./build
OUT=./dist

.PHONY: clean

all:
	$(TSC) --declaration --target ES5 -m commonjs --outDir $(BUILD) $(SRC)/$(NAME)
	$(BROWSERIFY) $(BUILD)/$(NAME).js -s Line2D -o $(OUT)/$(NAME).js
	cp $(BUILD)/$(NAME).d.ts $(OUT)

clean:
	rm -rf $(BUILD)
	rm -rf $(OUT)
	mkdir $(OUT)
