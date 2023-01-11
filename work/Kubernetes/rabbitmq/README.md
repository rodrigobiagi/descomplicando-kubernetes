# Deploy Rabbitmq

## Create Namespace

- kubectl create namespace rabbitmq-dev

## Install RabbitMQ

- helm repo add bitnami https://charts.bitnami.com/bitnami
- helm install rabbitmq-dev bitnami/rabbitmq --version 11.1.5 --namespace rabbitmq-dev

## Create Secret Certificate

- kubectl apply -f secret.tls

## Create Ingress

- kubectl apply -f ingress.yaml
