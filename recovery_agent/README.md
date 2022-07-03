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

This instance cannot run in docker mode