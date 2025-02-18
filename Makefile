DESTDIR := /usr/local/bin
BINARY := farpy
BUILD_DIR := $(PWD)/bin
BUILD_PATH := $(BUILD_DIR)/$(BINARY)

all: build install

build:
	@echo "Compiling the project..."
	deno run compile

install: build
	@echo "Copying the binary to $(DESTDIR)..."
	@sudo cp $(BUILD_PATH) $(DESTDIR)

