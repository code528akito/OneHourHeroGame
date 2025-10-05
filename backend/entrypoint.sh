#!/bin/sh

# 依存関係を解決
echo "Resolving Go dependencies..."
go mod download
go mod tidy

# サーバーを起動
echo "Starting server..."
exec go run cmd/server/main.go
