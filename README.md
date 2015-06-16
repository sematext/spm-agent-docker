# SPM for Docker

[SPM performance monitoring by Sematext](http://sematext.com/spm/integrations/docker-monitoring.html) - this is the  monitoring agent for Docker.

Following information is collected and transmitted to SPM (Cloud or On-Premises version):

- OS Metrics of the Host machine (CPU / Mem / Swap) 
- Stats from containers
	- CPU Usage
	- Memory Usage
	- Network Stats
	- Disk I/O Stats
- Aggregations / Filters by 
  - host name
  - image name
  - container id
  - name tag 


## Status

Public Beta. Stay tuned on [blog.sematext.com](http://blog.sematext.com).
Or follow us on twitter [![twitter](http://i.imgur.com/wWzX9uB.png) @sematext  ](https://twitter.com/sematext/) 


## Installation 

1. Get a free account [apps.sematext.com](https://apps.sematext.com/users-web/register.do)  
2. [Create an SPM App of type “Docker”](https://apps.sematext.com/spm-reports/registerApplication.do) and copy the SPM Application Token  
3. Pull the docker image
	```
	docker pull sematext/spm-agent-docker
	```

4. Run it on your docker host and pass following parameters: 
	- SPM_TOKEN - SPM Application Token
	- HOSTNAME - name of the docker host
	- Path to the docker socket using "-v"

	```
	docker run -d -e SPM_TOKEN=YOUR_APP_TOKEN -e HOSTNAME=$HOSTNAME -v /var/run/docker.sock:/var/run/docker.sock sematext/spm-agent-docker
	```
	You’ll see your Docker metrics in SPM after about a minute.
	
5. Watch metrics, use anomaly detection for alerts, create e-mail reports and much more ...

![](https://sematext.files.wordpress.com/2015/06/docker-overview-2.png)

![](https://sematext.files.wordpress.com/2015/06/docker-network-metrics.png)

# Support

1. Please check the [SPM for Docker Wiki](https://sematext.atlassian.net/wiki/display/PUBSPM/SPM+for+Docker)
2. If you have questions about SPM for Docker, chat with us in the [SPM user interface](https://apps.sematext.com/users-web/login.do) or drop an e-mail to support@sematext.com
3. Open an issue [here](https://github.com/sematext/spm-agent-docker/issues) 


# Installation on CoreOS Linux

1. Get a free account apps.sematext.com
2. Create an SPM App of type “Docker” and copy the SPM Application Token
3. Set the value of the SPM access token in etcd

	```
	etcdctl set /SPM_TOKEN fe31fc3a-xxxx-xxxx-xxxx-be376bf58554
	```

4. Start SPM Agent 

	```
	docker run -d --name spm-agent -e SPM_TOKEN=`etcdctl get SPM_TOKEN` -e HOSTNAME=$HOSTNAME -v /var/run/docker.sock:/var/run/docker.sock sematext/spm-agent-docker
	```

If you like to run the agent using systemd / fleet unit file please change this template to your needs
	
```
	[Unit]
	Description=SPM Docker Agent
	After=docker.service
	Requires=docker.service
	
	[Service]
	Environment="SPM_TOKEN=fe31fc3a-4660-47c6-b83c-be376bf58554"
	TimeoutStartSec=0
	ExecStartPre=-/usr/bin/docker kill spm-agent
	ExecStartPre=-/usr/bin/docker rm spm-agent
	ExecStartPre=/usr/bin/docker pull sematext/spm-agent-docker
	ExecStart=/usr/bin/docker run -d --name spm-agent -e SPM_TOKEN=`etcdctl get SPM_TOKEN` -e HOSTNAME=$HOSTNAME -v /var/run/docker.sock:/var/run/docker.sock semate
	xt/spm-agent-docker
	ExecStop=/usr/bin/docker stop spm-agent
	
	[X-Fleet]
	Global=true
```

For systemd copy the file to /etc/systemd/system/spm-agent.service the run 
```
systemctl enable /etc/systemd/spm-agent.service
systemctl start spm-agent
```


# Contributing

First off, thanks for taking the time to contribute! 

We encourage users to open issues, because it's impossible to test everything on all platforms - so please let us know if something goes wrong or if you need enhancements. 

If you are developer and like to contribute to this repository, please fork it and create a pull request. 

The following section provides information to setup the test environment (assuming you know already git, node.js and Docker).

## Building your own spm-agent-docker image 

SPM for Docker is implemented in node.js and this package provides an executable "spm-docker".
It could run directly on the Docker host, for example to test a new version during development. 
We like to make deployment easy and wrap node.js (actually io.js) and the scripts from this repository into a docker image (see Dockerfile and run.sh in this repository) - published on docker hub labeled as [sematext/spm-agent-docker](https://registry.hub.docker.com/u/sematext/spm-agent-docker/).

To install spm-docker use
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

## Build the docker image from sources

The source directory contains the [Dockerfile](https://github.com/sematext/spm-agent-docker/blob/master/Dockerfile) and the runner script [run.sh](https://github.com/sematext/spm-agent-docker/blob/master/run.sh)

```
sudo docker build -t sematext/spm-agent-docker-local .
```

## Running SPM Agent for Docker as docker container

```
docker run  -d -e SPM_TOKEN=76349b1d-XXXX-XXXX-XXXX-812f0fe85699 -e HOSTNAME=$HOSTNAME -v /var/run/docker.sock:/var/run/docker.sock sematext/spm-agent-docker-local
```


