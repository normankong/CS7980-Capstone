# Load Agent
This is the agent that open a Socket connection and wait for incoming worker node registration. When any worker node is started, it will start a persistent connection to Load Agent, then periodically send update to Load Agent with the resource metrics (CPU/Memory/NetworkIO).
When worker node crash, the socket connection will be terminated and Load Agent will remove the registration information from Cache. Then Load Agent will notify recovery agent to recover the node (By re-provision a new container)

## Build
```
# Build the Image
docker build . -t load_agent

# Run the Docker Container
docker run \
-e REDIS_HOST=host.docker.internal \
-e REDIS_PORT=6379 \
-e REDIS_SCOPE=RQ \
-e ELK_INDEX=capstone \
-e ELK_URL=https://host.docker.internal:9200 \
-e ELK_USERNAME=elastic \
-e ELK_PASSWORD="jBRAGOfKdcuA-yB1QSma" \
-e ELK_KEY=./http_ca.crt \
-p 3000:3000 \
--name LoadAgent \
--network capstone \
-d load_agent 
```