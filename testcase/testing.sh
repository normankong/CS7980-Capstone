#!/bin/zsh

while [ true ]
do
    echo `date +%T` : `curl -s http://localhost:8080 | grep Node`
    sleep 0.01
done
