.PHONY: build test lint run smoke

build: ## Build for production
	npx next build

test: ## Run smoke tests
	./smoke-test.sh

smoke: test ## Alias for test

lint: ## Lint and check formatting
	npx eslint .
	npx prettier --check .

run: ## Start Next.js dev server
	npx next dev
