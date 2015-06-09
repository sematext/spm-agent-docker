
[SPM performance monitoring by Sematext](http://sematext.com/spm/) - this is the Docker monitoring agent for SPM.

Following information is collected and transmitted to SPM (Cloud or On-Premises version):

- OS Metrics of the Host machine (CPU / Mem / Swap) 
- Stats from containers
	- CPU Usage
	- Memory Usage
	- Network Stats
	- Disk I/O Stats
- Aggregations/ Filters by 
  - hostname
  - image name
  - container id
  - name tag 

## Status

Relased for public beta. Stay tuned on our [blog](http://blog.sematext.com).

## Installation 

1. Get a free account [www.sematext.com](https://apps.sematext.com/users-web/register.do)  
2. [Create an SPM App of type “Docker”](https://apps.sematext.com/spm-reports/registerApplication.do) and copy the SPM Application Token  
3. Pull the docker image
	```
	docker pull sematext/spm-agent-docker
	```

4. Run it on your docker host and pass the SPM Application Token, the docker socket and the hostname as parameters

	```
	docker run -d -e SPM_TOKEN=YOUR_APP_TOKEN -e HOSTNAME=$HOSTNAME -v /var/run/docker.sock:/var/run/docker.sock sematext/spm-agent-docker
	```

# Building your own spm-agent-docker image 

If you want to run the node.js implementation e.g. to buid an updated docker image, you need to install it from this sources. 

```
npm i sematext/spm-agent-docker -g 
```

Please note this module is not published on npm, because it should be used with the docker image. 

## Running the node.js agent 

```
spm-docker YOUR-SPM-APP-TOKEN-HERE
```

## Permissions and security

spm-docker needs access to the docker unix socket (default: /var/run/docker.sock).

```
sudo spm-docker YOUR-SPM-APP-TOKEN-HERE
```

We recommend to run spm-docker on a user account, belonging to the 'docker' group. 
Please refer to the instructions for your operating system, e.g.:
The docker install instructions for Debian: https://docs.docker.com/installation/debian/

```
# Add the docker group if it doesn't already exist.
$ sudo groupadd docker

# Add the connected user "${USER}" to the docker group.
# Change the user name to match your preferred user.
# You may have to logout and log back in again for
# this to take effect.
$ sudo gpasswd -a ${USER} docker

# Restart the Docker daemon.
$ sudo service docker restart
```

## Building the docker image from sources
The source directory contains the "Dockerfile" and the runner script "run.sh"

```
sudo docker build -t sematext/spm-agent-docker-local .
```

## Running SPM Agent for Docker as docker container

```
docker run  -d -e SPM_TOKEN=76349b1d-XXXX-XXXX-XXXX-812f0fe85699 -e HOSTNAME=$HOSTNAME -v /var/run/docker.sock:/var/run/docker.sock sematext/spm-agent-docker-local
```


