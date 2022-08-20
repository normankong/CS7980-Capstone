

# export DOCKER_IMAGE_NAME=$1
# export DOCKER_EXHAUSTED_LIMIT=$2

# echo Starting recovery agent for : $DOCKER_IMAGE_NAME with $DOCKER_EXHAUSTED_LIMIT
# npm start

export DOCKER_IMAGE_NAME=resource_docs
export DOCKER_EXHAUSTED_LIMIT=99999

echo Starting recovery agent for : $DOCKER_IMAGE_NAME with $DOCKER_EXHAUSTED_LIMIT
npm start

