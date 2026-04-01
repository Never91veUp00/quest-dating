#!/bin/bash
URL="https://questdating.ru"
BOT_TOKEN="$(grep TELEGRAM_BOT_TOKEN /home/questdating/.env | cut -d= -f2)"
CHAT_ID="$(grep TELEGRAM_CHAT_ID /home/questdating/.env | cut -d= -f2)"
STATUS_FILE="/tmp/questdating_monitor_status"

HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 "$URL")

if [ "$HTTP_CODE" != "200" ]; then
    LAST_STATUS=$(cat "$STATUS_FILE" 2>/dev/null)
    if [ "$LAST_STATUS" != "DOWN" ]; then
        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
            -d "chat_id=${CHAT_ID}" \
            -d "text=🚨 questdating.ru НЕДОСТУПЕН! HTTP код: ${HTTP_CODE}" > /dev/null
        echo "DOWN" > "$STATUS_FILE"
    fi
else
    LAST_STATUS=$(cat "$STATUS_FILE" 2>/dev/null)
    if [ "$LAST_STATUS" = "DOWN" ]; then
        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
            -d "chat_id=${CHAT_ID}" \
            -d "text=✅ questdating.ru снова работает!" > /dev/null
    fi
    echo "UP" > "$STATUS_FILE"
fi
