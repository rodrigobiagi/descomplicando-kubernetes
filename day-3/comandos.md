 Id     Duration CommandLine
  --     -------- -----------
   1        0.261 minikube version
   2       10.124 choco install minikube
   3     2:07.135 minikube start
   4       11.837 minikube stop
   5        3.419 minikube delete
   6        1.045 choco install kind
   7        0.006 cd .\descomplicando-kubernetes\day-1\
   8        0.800 kind create cluster --name elysium --config .\create_cluster.yaml
   9        0.234 ls
  10        0.004 cd .\kind\
  11       56.396 kind create cluster --name elysium --config .\create_cluster.yaml
  12        0.008 cd ..
  13        0.007 cd ..
  14        0.024 ls
  15        0.061 ls -la
  16        0.039 ls -l
  17        0.219 git add .
  18        0.203 git commit -m "dia 3"
  19        3.166 git push origin main
  20        0.012 cd .\day-3\
  21        0.223 ls
  22        0.005 cd .\deployment\
  23        0.653 kubectl apply -f .\deployment.yaml
  24        0.290 kubectl apply -f .\deployment.yaml
  25        0.176 kubectl create namespace elysium
  26        5.237 kubectl delete namespace elysium
  27        0.163 kubectl config get-contexts
  28        0.177 kubectl create namespace elysium
  29        0.244 kubectl apply -f .\deployment.yaml
  30        0.197 kubectl get deployment
  31        0.163 kubectl get deployments
  32        0.169 kubectl config set-context --current --namespace=elysium
  33        0.209 kubectl get deployments
  34        0.180 kubectl get pods
  35        0.358 kubectl get deployments -o yaml
  36        kubectl get pods -l app=nginx-deployment
  37        kubectl get replicasets
  38        kubectl describe deployments.apps deploy-nginx-deployment
  39        kubectl create deployment --image nginx --replicas 3 nginx-deployment --dry-run=client -o yaml
  40        kubectl create deployment --image nginx --replicas 3 nginx-deployment --dry-run=client -o yaml > temp2.yaml
  41        kubectl apply -f .\temp2.yaml
  42        kubectl delete -f .\temp2.yaml
  43        kubectl exec -it deploy-nginx-deployment-6c645ccd66-2gwfj -- bash
                cat /proc/1/cmdline
  44        kubectl exec -it deploy-nginx-deployment-6c87d47484-2fdjc -- nginx -v
                nginx version: nginx/1.16.0
  45        kubectl rollout status deployment -n elysium deploy-nginx-deployment
  46    
  47
  48
 100        0.166 kubectl exec -it deploy-nginx-deployment-6c87d47484-2fdjc -- nginx -v
 101        0.165 kubectl get po
 102        0.261 kubectl exec -it deploy-nginx-deployment-6ffb954b9c-7c87x -- nginx -v
 103        0.201 kubectl describe deployments.apps deploy-nginx-deployment
 104        0.220 kubectl rollout undo deployment -n elysium deploy-nginx-deployment
 105        0.170 kubectl get po
 106        0.261 kubectl exec -it deploy-nginx-deployment-97d65b9c-6djmx -- nginx -v  

