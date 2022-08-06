echo Build the Image
docker build . -t resource_agent

echo Generate Random Instance Name
NODE_NAME=NodeAgent-$RANDOM

echo Run Docker
docker run \
-e NODE_PORT=8080 \
-e NODE_NAME=${NODE_NAME} \
-e EXTERNAL_HOST=${NODE_NAME} \
-e EXTERNAL_PORT=8080 \
-e FAIL_LIMIT=99999999 \
-e EXHAUSTED_LIMIT=600 \
-e LOAD_AGENT_URL='http://LoadAgent:3000' \
-e ELK_INDEX=capstone \
-e ELK_URL=https://host.docker.internal:9200 \
-e ELK_USERNAME=elastic \
-e ELK_PASSWORD="0IsTKlK0XIHTEHgtS2Rv" \
-e ELK_KEY=./http_ca.crt \
--name ${NODE_NAME} \
--network capstone \
-d resource_agent