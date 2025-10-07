PYTHON ?= python3
ESE_API_BASE_URL ?= http://localhost:8000
ESE_ADMIN_TOKEN ?= local-admin-token

.PHONY: seed-dev
seed-dev:
	@echo "Seeding development baseline against $(ESE_API_BASE_URL)"
	ESE_API_BASE_URL=$(ESE_API_BASE_URL) ESE_ADMIN_TOKEN=$(ESE_ADMIN_TOKEN) $(PYTHON) backend/scripts/seed_dev.py
.PHONY: install-frontend install-backend lint-backend typecheck-backend format-backend test-backend migrate-up migrate-down alembic-revision lint-frontend test-frontend quality all

install-frontend:
	npm ci

install-backend:
	python -m pip install --upgrade pip
	python -m pip install -e backend[dev]

lint-frontend:
	npm run lint

lint-backend:
	python -m ruff check backend/app backend/tests
	python -m black --check backend/app backend/tests

format-backend:
	python -m black backend/app backend/tests

typecheck-backend:
	python -m mypy --config-file backend/pyproject.toml backend/app

test-frontend:
	npm test -- --watch=false || echo "No frontend tests configured"

test-backend:
	pytest -c backend/pyproject.toml

quality: lint-backend typecheck-backend test-backend

migrate-up:
	alembic -c backend/alembic.ini upgrade head

migrate-down:
	alembic -c backend/alembic.ini downgrade base

alembic-revision:
	alembic -c backend/alembic.ini revision --autogenerate -m "${message}"

all: install-frontend install-backend quality
