DESTDIR := /usr/local/bin
BINARY := farpy
BUILD_DIR := $(PWD)/bin
BUILD_PATH := $(BUILD_DIR)/$(BINARY)

all: build install

build:
	@echo "Compilando o projeto..."
	deno run compile

install: build
	@echo "Instalando o binário em $(DESTDIR)..."
	@sudo cp $(BUILD_PATH) $(DESTDIR)

# clean:
# 	@echo "Limpando arquivos gerados..."
# 	@rm -rf $(BUILD_DIR)
