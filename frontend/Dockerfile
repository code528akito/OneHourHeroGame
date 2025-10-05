# 開発用Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードのコピー
COPY . .

EXPOSE 5173

# Vite開発サーバーを起動（ホットリロード有効、すべてのインターフェースでリッスン）
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
