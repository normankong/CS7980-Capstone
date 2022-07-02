# Resource Agent
This is a pluggable agent that embedded in node application to achieve hight availability standard. When the main applicaiton include this module, it will start a persistent socket.io connection to the Load Agent, then post status update information to the Load Agent regularly. In case this node was crashed, Load Agent will receive socket termination event, which will trigger recovery action.


### Local Development
```
export NODE_PORT=8021
export NODE_NAME=NodeAgentA
export EXTERNAL_HOST=localhost
export EXTERNAL_PORT=8021
export LOAD_AGENT_URL=http://localhost:3000
export FAIL_LIMIT=1000
node index.js 

export NODE_PORT=8022
export NODE_NAME=NodeAgentB
export EXTERNAL_HOST=localhost
export EXTERNAL_PORT=8022
export LOAD_AGENT_URL=http://localhost:3000
export FAIL_LIMIT=1000
node index.js 

export NODE_PORT=8023
export NODE_NAME=NodeAgentB
export EXTERNAL_HOST=localhost
export EXTERNAL_PORT=8023
export LOAD_AGENT_URL=http://localhost:3000
export FAIL_LIMIT=1000
node index.js 
```

### Manual command to start the worker node
```
# Build the Docker Image
docker build . -t resource_agent

# Generate Random Instance Name
NODE_NAME=NodeAgent-$RANDOM

# Run Docker
docker run \
-e NODE_PORT=8080 \
-e NODE_NAME=${NODE_NAME} \
-e EXTERNAL_HOST=${NODE_NAME} \
-e EXTERNAL_PORT=8080 \
-e FAIL_LIMIT=1000 \
-e LOAD_AGENT_URL='http://LoadAgent:3000' \
--name ${NODE_NAME} \
--network capstone \
-d resource_agent


### Reference Command
```
# Inspect Image
docker inspect resource_agent

# Check the Container ID
docker ps --format '{{.ID}}' --filter name=Worker

# Check all Container Information
docker ps --format 'CONTAINER ID : {{.ID}} | Name: {{.Names}} | Image:  {{.Image}} |  Ports: {{.Ports}}'

# Inspect individual container status
docker container inspect --format '{{.State.Running}}' 0a1185277266b48b5859fa2ef8a2aef94e30b4fed465c2c7569c07c7b73eaf94

# Stop Container gracefully
docker stop 0ab461d10c997a827943786a011ea7fcab9c46cfc80fdc5071eb07db3cb46d07

# Kill Container immediately
docker kill 0ab461d10c997a827943786a011ea7fcab9c46cfc80fdc5071eb07db3cb46d07

# Kill Container that match name
docker kill `docker ps --format '{{.ID}}' --filter name=Node`
```