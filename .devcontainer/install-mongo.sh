#!/bin/bash
set -e

echo "=== Установка MongoDB ==="

# Импортируем публичный ключ MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Добавляем репозиторий MongoDB
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Обновляем список пакетов и устанавливаем MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Создаём директорию для данных и запускаем MongoDB
sudo mkdir -p /data/db
sudo chown -R $(whoami) /data/db

echo "=== MongoDB установлена ==="
