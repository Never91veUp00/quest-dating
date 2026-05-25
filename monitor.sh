#!/bin/bash
# Мониторинг доступности questdating.ru
# Проверяет: главную страницу + /health endpoint (с проверкой БД)
# При проблеме шлёт алерт в Telegram, не спамит при повторах

URL="https://questdating.ru"
HEALTH_URL="http://127.0.0.1:5001/health"
BOT_TOKEN="$(grep TELEGRAM_BOT_TOKEN /home/questdating/.env | cut -d= -f2)"
CHAT_ID="$(grep TELEGRAM_CHAT_ID /home/questdating/.env | cut -d= -f2)"
STATUS_FILE="/tmp/questdating_monitor_status"

send_alert() {
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -d "chat_id=${CHAT_ID}" \
        -d "text=${message}" > /dev/null
}

# 1. Проверка главной страницы (внешний доступ)
MAIN_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 "$URL")

# 2. Проверка health-endpoint (прямо в backend, минуя nginx + кэш)
HEALTH_RESPONSE=$(curl -s --max-time 10 "$HEALTH_URL")
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL")

# 3. Проверка, что health вернул db:connected
DB_OK="false"
if [ "$HEALTH_CODE" = "200" ] && echo "$HEALTH_RESPONSE" | grep -q '"db":"connected"'; then
    DB_OK="true"
fi

# Решение: всё ли в порядке?
if [ "$MAIN_CODE" = "200" ] && [ "$DB_OK" = "true" ]; then
    STATUS="UP"
else
    STATUS="DOWN"
fi

LAST_STATUS=$(cat "$STATUS_FILE" 2>/dev/null)

if [ "$STATUS" = "DOWN" ] && [ "$LAST_STATUS" != "DOWN" ]; then
    REASON=""
    [ "$MAIN_CODE" != "200" ] && REASON="${REASON}Главная: HTTP ${MAIN_CODE}. "
    [ "$HEALTH_CODE" != "200" ] && REASON="${REASON}Health: HTTP ${HEALTH_CODE}. "
    [ "$HEALTH_CODE" = "200" ] && [ "$DB_OK" = "false" ] && REASON="${REASON}БД не отвечает (health не вернул db:connected). "
    send_alert "🚨 questdating.ru НЕДОСТУПЕН! ${REASON}"
    echo "DOWN" > "$STATUS_FILE"
elif [ "$STATUS" = "UP" ] && [ "$LAST_STATUS" = "DOWN" ]; then
    send_alert "✅ questdating.ru снова работает!"
    echo "UP" > "$STATUS_FILE"
else
    echo "$STATUS" > "$STATUS_FILE"
fi
