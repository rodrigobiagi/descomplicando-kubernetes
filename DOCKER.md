# Docker Commands

<< docker login -u rodrigobiagi >>
dckr_pat_-c7I5vA8WdQ26905ShLlIcf79t4

docker build -t nginx:1.17.0 .
docker tag nginx:1.17.0 rodrigobiagi/nginx:1.17.0
docker push rodrigobiagi/nginx:1.17.0




kubectl expose deployment deploy-nginx-deployment --type=NodePort --port=80 --target-port=80



helm install --namespace kube-system nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx



NAME: nginx
LAST DEPLOYED: Sat Mar 18 13:58:41 2023
NAMESPACE: kube-system
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
The ingress-nginx controller has been installed.
It may take a few minutes for the LoadBalancer IP to be available.
You can watch the status by running 'kubectl --namespace kube-system get services -o wide -w nginx-ingress-nginx-controller'

An example Ingress that makes use of the controller:
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: example
    namespace: foo
  spec:
    ingressClassName: nginx
    rules:
      - host: www.example.com
        http:
          paths:
            - pathType: Prefix
              backend:
                service:
                  name: exampleService
                  port:
                    number: 80
              path: /
    # This section is only required if TLS is to be enabled for the Ingress
    tls:
      - hosts:
        - www.example.com
        secretName: example-tls

If TLS is enabled for the Ingress, a Secret containing the certificate and key must also be provided:

  apiVersion: v1
  kind: Secret
  metadata:
    name: example-tls
    namespace: foo
  data:
    tls.crt: <base64 encoded cert>
    tls.key: <base64 encoded key>
  type: kubernetes.io/tls