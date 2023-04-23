FROM nginx:1.17.0

RUN apt-get update && apt-get install -y \
	curl gnupg2 apt-transport-https debconf-utils tcptraceroute dnsutils vim

EXPOSE 8080:80

CMD ["nginx", "-g", "daemon off;"]
