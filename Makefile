.PHONY: help dev dev-build dev-up dev-down dev-logs build test test-e2e lint clean docker-up docker-down

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: dev-build dev-up ## Build and start all services with Docker (development mode)

dev-build: ## Build Docker images for development
	@echo "Building Docker images..."
	docker-compose -f docker-compose.dev.yml build

dev-up: ## Start all services with Docker
	@echo "Starting all services..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Services are starting..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:8080"
	@echo "Database: localhost:5432"

dev-down: ## Stop all Docker services
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## Show logs from all services
	docker-compose -f docker-compose.dev.yml logs -f

dev-logs-backend: ## Show backend logs only
	docker-compose -f docker-compose.dev.yml logs -f backend

dev-logs-frontend: ## Show frontend logs only
	docker-compose -f docker-compose.dev.yml logs -f frontend


dev-restart: ## Restart all services
	docker-compose -f docker-compose.dev.yml restart

dev-restart-backend: ## Restart backend only
	docker-compose -f docker-compose.dev.yml restart backend

dev-restart-frontend: ## Restart frontend only
	docker-compose -f docker-compose.dev.yml restart frontend

build: ## Build all projects for production
	@echo "Building backend..."
	docker-compose build backend
	@echo "Building frontend..."
	docker-compose build frontend

test: ## Run all tests
	@echo "Running backend tests..."
	docker-compose -f docker-compose.dev.yml exec backend go test -v -cover ./...
	@echo "Running frontend tests..."
	docker-compose -f docker-compose.dev.yml exec frontend npm run test

test-e2e: ## Run E2E tests with Playwright
	@echo "Running E2E tests..."
	@echo "Make sure services are running (make dev)"
	cd e2e && npm test

test-e2e-ui: ## Run E2E tests with Playwright UI
	@echo "Opening Playwright UI..."
	cd e2e && npm run test:ui

lint: ## Run linters
	@echo "Linting backend..."
	docker-compose -f docker-compose.dev.yml exec backend golangci-lint run || true
	@echo "Linting frontend..."
	docker-compose -f docker-compose.dev.yml exec frontend npm run lint

lint-fix: ## Fix linting issues
	@echo "Fixing backend linting issues..."
	docker-compose -f docker-compose.dev.yml exec backend sh -c "gofmt -w . && go mod tidy"
	@echo "Fixing frontend linting issues..."
	docker-compose -f docker-compose.dev.yml exec frontend npm run lint:fix

docker-up: ## Start production Docker containers
	docker-compose up -d

docker-down: ## Stop production Docker containers
	docker-compose down

clean: ## Clean build artifacts and containers
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	rm -rf backend/bin
	rm -rf backend/tmp
	rm -rf frontend/dist

db-migrate: ## Run database migrations
	docker-compose -f docker-compose.dev.yml exec backend ./server migrate

db-seed: ## Seed database with test data
	docker-compose -f docker-compose.dev.yml exec backend ./server seed

shell-backend: ## Open shell in backend container
	docker-compose -f docker-compose.dev.yml exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose -f docker-compose.dev.yml exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d one_hour_hero
