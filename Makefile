SRC_DIR=src
MAIN_FILE=main.ts
OUTPUT_BIN=bin/farpy

BIN_DIR=/home/fernandodev/farpyscript/bin
DEST_DIR=/usr/local/bin
BASHRC=$(HOME)/.bashrc
ZSHRC=$(HOME)/.zshrc

TS_FILES=$(shell find $(SRC_DIR) -type f -name "*.ts" -o -name "*.tsx")

.PHONY: all compile install

all: compile install

compile:
	@if [ ! -d "$(SRC_DIR)" ]; then \
		echo "Error: The directory '$(SRC_DIR)' was not found!"; \
		exit 1; \
	fi
	@if [ ! -f "$(MAIN_FILE)" ]; then \
		echo "Error: Main file '$(MAIN_FILE)' not found!"; \
		exit 1; \
	fi
	deno compile --allow-read --allow-net --allow-env --allow-run $(TS_FILES:%=--include=%) -o "$(OUTPUT_BIN)" "$(MAIN_FILE)"
	@echo "Compilation completed! The binary is located at: ./$(OUTPUT_BIN)"

install:
	@if [ ! -d "$(BIN_DIR)" ]; then \
		echo "The binary directory does not exist: $(BIN_DIR)"; \
		exit 1; \
	fi
	@if sudo mv "$(BIN_DIR)"/* "$(DEST_DIR)"/ 2>/dev/null; then \
		echo "Binary successfully moved to $(DEST_DIR)!"; \
	else \
		echo "Could not move the binary to $(DEST_DIR). Adding to PATH instead..."; \
		if [ -f "$(BASHRC)" ]; then \
			echo "export PATH=\"$(BIN_DIR):\$$PATH\"" >> "$(BASHRC)"; \
			echo "Added to PATH in $(BASHRC)"; \
		fi; \
		if [ -f "$(ZSHRC)" ]; then \
			echo "export PATH=\"$(BIN_DIR):\$$PATH\"" >> "$(ZSHRC)"; \
			echo "Added to PATH in $(ZSHRC)"; \
		fi; \
		echo "Run 'source ~/.bashrc' or 'source ~/.zshrc' to apply the changes."; \
	fi
