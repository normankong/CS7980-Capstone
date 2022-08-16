#!/bin/bash

execute () {
  echo 'Executing with thread' $1' with '$2
  touch result.csv
  rm result.csv

  mvn exec:java -Dexec.mainClass="client.StressClient" -Dexec.args="$2 10 10 10000 http://localhost:8080/"
  #  mvn exec:java -Dexec.mainClass="client.StressClient" -Dexec.args="$2 10 10 10000 http://albcapstone-2068386907.us-east-1.elb.amazonaws.com/"

  # mkdir -p      analystic/$1/300
  # cp result.csv analystic/$1/300
}

execute node 10