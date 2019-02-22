#!/bin/bash -e
docker build -t smpp-gateway smpp
(if  [ $(docker ps -a | grep smpp-gateway | cut -d " " -f1) ]; then \
  echo $(docker rm -f smpp-gateway); \
else \
  echo OK; \
fi;);
docker run --restart always -d --network="host" --name smpp-gateway smpp-gateway:latest

