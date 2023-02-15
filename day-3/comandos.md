## Comandos Dia-3

- kind create cluster --name elysium --config .\create_cluster.yaml
- kind delete cluster --name elysium


- minikube version
- choco install minikube
- minikube start
- minikube stop
- minikube delete
- choco install kind
- cd .\descomplicando-kubernetes\day-1\
- kind create cluster --name elysium --config .\create_cluster.yaml
- ls
- cd .\kind\
- kind create cluster --name elysium --config .\create_cluster.yaml
- cd ..
- git add .
- git commit -m "dia 3"
- git push origin main
- cd .\day-3\
- ls
- cd .\deployment\
- kubectl apply -f .\deployment.yaml
- kubectl apply -f .\deployment.yaml
- kubectl create namespace elysium
- kubectl delete namespace elysium
- kubectl config get-contexts
- kubectl create namespace elysium
- kubectl apply -f .\deployment.yaml
- kubectl get deployment
- kubectl get deployments
- kubectl config set-context --current --namespace=elysium
- kubectl get deployments
- kubectl get pods
- kubectl get deployments -o yaml
- kubectl get pods -l app=nginx-deployment
- kubectl get replicasets
- kubectl describe deployments.apps deploy-nginx-deployment
- kubectl create deployment --image nginx --replicas 3 nginx-deployment --dry-run=client -o yaml
- kubectl create deployment --image nginx --replicas 3 nginx-deployment --dry-run=client -o yaml > temp2.yaml
- kubectl apply -f .\temp2.yaml
- kubectl delete -f .\temp2.yaml
- kubectl exec -it deploy-nginx-deployment-6c645ccd66-2gwfj -- bash
* cat /proc/1/cmdline

- kubectl exec -it deploy-nginx-deployment-6c87d47484-2fdjc -- nginx -v
* nginx version: nginx/1.16.0
- kubectl rollout status deployment -n elysium deploy-nginx-deployment

- kubectl exec -it deploy-nginx-deployment-6c87d47484-2fdjc -- nginx -v
- kubectl get po
- kubectl exec -it deploy-nginx-deployment-6ffb954b9c-7c87x -- nginx -v
- kubectl describe deployments.apps deploy-nginx-deployment
- kubectl rollout undo deployment -n elysium deploy-nginx-deployment
- kubectl get po
- kubectl exec -it deploy-nginx-deployment-97d65b9c-6djmx -- nginx -v 
- kubectl rollout history deployment -n elysium deploy-nginx-deployment
- kubectl rollout history deployment -n elysium deploy-nginx-deployment --revision 13
- kubectl rollout undo deployment -n elysium deploy-nginx-deployment --to-revision 13
- kubectl rollout restart deployment -n elysium deploy-nginx-deployment
- kubectl rollout pause deployment -n elysium deploy-nginx-deployment
- kubectl rollout resume deployment -n elysium deploy-nginx-deployment
- kubectl scale deployment -n elysium  --replicas 10 deploy-nginx-deployment


