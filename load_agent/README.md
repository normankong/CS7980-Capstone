# Load Agent
## This is the agent that open a Socket connection and wait for incoming worker node registration

## Build
docker build . -t load_agent

docker run \
--rm \
--name LoadAgent \
-e REDIS_CONNECTION_URL="redis://host.docker.internal:6379" \
-p 3000:3000 \
-d load_agent
