all: build generate
build:
	bun run tree-sitter build
generate:
	bun run tree-sitter generate
test: build generate
	bun run tree-sitter parse example.k
