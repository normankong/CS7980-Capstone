echo Build the Image
docker build . -t load_balancer

echo Run the Docker Container
docker run \
-e REDIS_HOST=host.docker.internal \
-e REDIS_PORT=6379 \
-e ELK_INDEX=capstone \
-e ELK_URL=https://host.docker.internal:9200 \
-e ELK_USERNAME=elastic \
-e ELK_PASSWORD="0IsTKlK0XIHTEHgtS2Rv" \
-e ELK_KEY=./http_ca.crt \
-p 8080:8080 \
--name LoadBalancer \
--network capstone \
-d load_balancer
