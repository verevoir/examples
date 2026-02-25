.PHONY: build test lint run

build: ## Build for production
	npx next build

test: ## No tests configured
	@echo "No tests configured."

lint: ## Lint and check formatting
	npx eslint .
	npx prettier --check .

run: ## Start Next.js dev server
	npx next dev
