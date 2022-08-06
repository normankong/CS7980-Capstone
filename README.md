# Capstone 
This repository is for Research Topic - High Availability Study

## Repository
| # | Component     | Usage                      |
|---|---------------|----------------------------|
|1  | Load Agent    | Record Resource Agent resource metrics and notify Recovery Agent if any resource agent crashed |
|2  | Load Balancer | Customer facing application to redirect to resource agent based on Resource Awareness Routing Algorithm |
|3  | Recovery Agent| Perform Resource Agent Eviction and Recovery once receive Load Agent recovery notification |
|4  | Resource Agent| Sample Application to run a workload, with a embedded resource agent to connect to Load Agent for status update|

## Testing 
ali http://localhost:8080 -d 0 -r 1