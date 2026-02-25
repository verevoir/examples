EXAMPLES := examples/react examples/nextjs

.PHONY: build test lint run install help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for all examples
	@for dir in $(EXAMPLES); do \
		echo "Installing $$dir..."; \
		(cd $$dir && npm install); \
	done

build: ## Build all examples
	@for dir in $(EXAMPLES); do \
		echo "Building $$dir..."; \
		$(MAKE) -C $$dir build; \
	done

test: ## Run tests for all examples
	@echo "No tests configured for examples."

lint: ## Lint all examples
	@for dir in $(EXAMPLES); do \
		echo "Linting $$dir..."; \
		$(MAKE) -C $$dir lint; \
	done

run: ## Start all examples (use individual Makefiles for single example)
	@echo "Run examples individually:"
	@echo "  cd examples/react && make run"
	@echo "  cd examples/nextjs && make run"
