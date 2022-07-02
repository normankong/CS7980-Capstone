# Load Balancer
This is the internal facing application that receive client request, then apply resource awareness routing algorithm to dispatch to best available worker node.

## Resource Awareness Routing Algorithm (RARA)
This algorithm will first retrieve all the active worker nodes information, base on the incoming request QOS class, find the best node that available resource with range between 10%-20%. If there is no "Best fit" node, then assign the highest usage node to handle the request.

## Build
```
# Build the Image
docker build . -t load_balancer

# Run the Docker Container
docker run \
-e REDIS_HOST=host.docker.internal \
-e REDIS_PORT=6379 \
-p 8080:8080 \
--name LoadBalancer \
--network capstone \
-d load_balancer
```