# Capstone - Study on High Availability and Fault Tolerance application

This repository is for Research Topic on High Availability and Fault Tolerance.
1. [Paper](docs/Capstone%20-%20Research%20Paper.pdf)
2. [Poster](docs/Capstone%20-%20Poster.pdf)
3. [Presentation](https://docs.google.com/presentation/d/1zM7BC2pyncjfbpB4z6IjMrNY1FGUK-rQBcr1a8vmfMg/edit?usp=sharing)

![Capstone Poster](docs/Capstone%20-%20Poster.jpeg)

## Repository
| # | Component     | Usage                      |
|---|---------------|----------------------------|
|1  | Load Agent    | Record Resource Agent resource metrics and notify Recovery Agent if any resource agent crashed |
|2  | Load Balancer | Customer facing application to redirect to resource agent based on Resource Awareness Routing Algorithm |
|3  | Recovery Agent| Perform Resource Agent Eviction and Recovery once receive Load Agent recovery notification |
|4  | Resource Agent| Sample Application to run a workload, with a embedded resource agent to connect to Load Agent for status update|

### Prerequisites docker image
1. Install Redis as caching server
2. Install Elasticsearch as log collector
3. Install Kibana as log viewer
4. Create a docker network for communication between components


#### Create Capstone Network
docker network create capstone --driver bridge

#### Install Redis Docker Image
docker pull redis
docker run --network capstone --name redis -p 6379:6379 redis
docker run --network capstone --name redis-cli --rm -it redis redis-cli -h redis

#### Install ELK Docker Image
1. Elastic Search
```
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.3.1
docker run --name es01 --net capstone -p 9200:9200 -p 9300:9300 -it docker.elastic.co/elasticsearch/elasticsearch:8.3.1
```
2. Kibana
```
docker pull docker.elastic.co/kibana/kibana:8.3.1
docker run --name kib-01 --net capstone -p 5601:5601 docker.elastic.co/kibana/kibana:8.3.1
```
#### Setup the ELK Cluster
1. Reset Elastic user Password
```
docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic
```
2. Generate Kibana Connection Node
```
docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token --scope kibana
```