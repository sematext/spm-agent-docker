# Setup SPM on CoreOS

This directory provides fleet units to install SPM on CoreOS
- spm-agent.service 

	- spm-agent.service starts SPM Agent for Docker on all hosts 
	- It takes the SPM and Logsene App Tokens and the TCP port for the logging gateway from etcd
	- It starts on every CoreOS host (global unit)
	
- logsene.service

	- It forwards logs from journald to that logging gateway running as part of spm-agent-docker 
	- All fields stored in the journal are then available in Logsene.


# Install SPM on an existing Cluster

## Quickstart - get up and running in 5 minutes

1. Get a free account [apps.sematext.com](https://apps.sematext.com/users-web/register.do)  
2. [Create an SPM App of type “Docker”](https://apps.sematext.com/spm-reports/registerApplication.do) to obtain the SPM Application Token
3. Create a [Logsene](http://www.sematext.com/logsene/) App to obtain the Logsene Token
3. Run the install script on one of your CoreOS machines

```
wget wget https://raw.githubusercontent.com/sematext/spm-agent-docker/master/coreos/install_spm.sh
chmod +x install_spm.sh
./install_spm.sh YOUR_SPM_TOKEN YOUR_LOGSENE_TOKEN 9000
```


## Step by Step - understand whats going on ...

### Preparation:

1. Get a free account [apps.sematext.com](https://apps.sematext.com/users-web/register.do)  
2. [Create an SPM App of type “Docker”](https://apps.sematext.com/spm-reports/registerApplication.do) to obtain the SPM Application Token
3. Create a [Logsene](http://www.sematext.com/logsene/) App to obtain the Logsene Token
4. Store the configuration in etcd, the Logsene Gateway Port is 9000 by default. 

```
etcdctl set /sematext.com/myapp/spm/token SPM_TOKEN
etcdctl set /sematext.com/myapp/logsene/token LOGSENE_TOKEN
etcdctl set /sematext.com/myapp/logsene/gateway_port LOGSENE_GATEWAY_PORT
```

5. Download the service files and install it with fleet

### Installation on existing clusters

```
# INSTALLATION
# Download the unit file for SPM
wget https://raw.githubusercontent.com/sematext/spm-agent-docker/master/coreos/spm-agent.service
# Start SPM Agent in the whole cluster
fleetctl load spm-agent.service
fleetctl start spm-agent.service
# Download the unit file for Logsene
wget https://raw.githubusercontent.com/sematext/spm-agent-docker/master/coreos/logsene.service
# Start the log forwarding service
fleetctl load logsene.service
fleetctl start logsene.service
```

### Installation using cloud config

In this case include the unit files in your cloud config. 
An example is provided here

# Contributions are welcome

If you see a way to improve the setup, make things easier or discovered a bug submit a pull requests.  


