#!/usr/bin/env bash

while true; do
    node --use-strict index.js config/config.json
    echo "bot died, restarting in 30 seconds"
    sleep 30
done
