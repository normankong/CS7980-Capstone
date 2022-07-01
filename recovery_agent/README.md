# Recovery Agent
This component wait for notification message triggered by Load Agent. When Load Agent detect socket disconnection from Worker Node, receover agent will be notified to perform the recovery action accordingly:

## Recovery Actions :
1. Detect if the existing container is still running
2. Kill the container if it is still running
3. Reprovision a new container

## Component
1. This agent subscribe to Redis pub/sub topic "recovery"
2. Trigger docker cli to recycle and reprovision new instance

## Development
```code
# To build image 
docker build . -t recovery_agent

# Deploy to Docker
docker run \
-e NODE_PORT=8080 \
-e NODE_PREFIX=WorkerNode- \
-e EXTERNAL_HOST=host.docker.internal \
-e LOAD_AGENT_URL=http://host.docker.internal:3000 \
-e IMAGE_NAME=resource_agent \
-e REDIS_HOST=host.docker.internal \
-e REDIS_PORT=6379 \
-e REDIS_SCOPE=RQ \
-p 3001:3001 \
--name RecoveryAgent \
-d recovery_agent
```