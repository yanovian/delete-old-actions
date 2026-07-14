.PHONY: install lint build test check release-major release-minor release-patch

PNPM := pnpm

install: ## Install dependencies
	$(PNPM) install

lint: ## Lint the code
	$(PNPM) lint

build: ## Build dist/index.js from src
	$(PNPM) build

test: ## Run the test suite
	$(PNPM) test

check:
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "Working tree is not clean. Commit or stash changes first."; \
		exit 1; \
	fi

release-patch: check ## Bump patch version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version patch -m "Release v%s"
	git push origin HEAD --follow-tags

release-minor: check ## Bump minor version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version minor -m "Release v%s"
	git push origin HEAD --follow-tags

release-major: check ## Bump major version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version major -m "Release v%s"
	git push origin HEAD --follow-tags
