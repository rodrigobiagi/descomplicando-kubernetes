https://github.com/cetic/helm-nifi
===================================================================
kubectl delete namespace apachenifi-dev
kubectl create namespace apachenifi-dev
kubectl config set-context --current --namespace=apachenifi-dev
cd cert
kubectl create secret tls tls-tecnobank --cert=tecnobank.crt --key=tecnobank-decripted.key
cd ..
helm repo add cetic https://cetic.github.io/helm-charts
helm repo update
helm install --namespace=apachenifi-dev apachenifi-dev cetic/nifi --values dev-values.yaml
kubectl apply -f .\dev-ingress.yaml
 
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Nifi - DEV
ClientId
	batch-dataflow
Secret 
	vxbboVCsnAhhmXnPyLWMal2gUSIItjzs
Endpoint
	http://auth-hml.tecnobank.com.br/auth/realms/dev-tecnobank/.well-known/openid-configuration

https://dev-batch-dataflow.tecnobank.com.br/
===================================================================

kubectl delete namespace apachenifi-tst
kubectl create namespace apachenifi-tst
kubectl config set-context --current --namespace=apachenifi-tst
cd cert
kubectl create secret tls tls-tecnobank --cert=tecnobank.crt --key=tecnobank-decripted.key
cd ..
helm repo add cetic https://cetic.github.io/helm-charts
helm repo update
helm install --namespace=apachenifi-tst apachenifi-tst cetic/nifi --values tst-values.yaml
kubectl apply -f .\tst-ingress.yaml

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Nifi - TST
ClientId
	batch-dataflow
Secret 
	Om2t2HUCo0VZqFjeyWBWBSOUDqfBsMhh
Endpoint
	http://auth-hml.tecnobank.com.br/auth/realms/tst-tecnobank/.well-known/openid-configuration

https://tst-batch-dataflow.tecnobank.com.br/
===================================================================
kubectl delete namespace apachenifi-hml
kubectl create namespace apachenifi-hml
kubectl config set-context --current --namespace=apachenifi-hml
cd cert
kubectl create secret tls tls-tecnobank --cert=tecnobank.crt --key=tecnobank-decripted.key
cd ..
helm repo add cetic https://cetic.github.io/helm-charts
helm repo update
helm install --namespace=apachenifi-hml apachenifi-hml cetic/nifi --values hml-values.yaml
kubectl apply -f .\hml-ingress.yaml

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Nifi - HML
ClientId
	batch-dataflow
Secret 
	aiwp01ghZBOgulHrIlaW6H6MUC5FPeoA
Endpoint
	http://auth-hml.tecnobank.com.br/auth/realms/hml-tecnobank/.well-known/openid-configuration

https://hml-batch-dataflow.tecnobank.com.br/
===================================================================
kubectl delete namespace apachenifi-prd
kubectl create namespace apachenifi-prd
kubectl config set-context --current --namespace=apachenifi-prd
cd cert
kubectl create secret tls tls-tecnobank --cert=tecnobank.crt --key=tecnobank-decripted.key
cd ..
helm repo add cetic https://cetic.github.io/helm-charts
helm repo update
helm install --namespace=apachenifi-prd apachenifi-prd cetic/nifi --values prd-values.yaml
kubectl apply -f .\prd-ingress.yaml
 
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Nifi - PRD
ClientId
	batch-dataflow
Secret 
	yGWyFjLzKG7gtUSUM48vFbSvtf4FyWjR
Endpoint
	http://auth.tecnobank.com.br/auth/realms/tecnobank/.well-known/openid-configuration

https://batch-dataflow.tecnobank.com.br/