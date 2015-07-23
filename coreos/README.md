# Setup SPM on CoreOS

This directory provides fleet units to install [SPM](http://sematext.com/spm/integrations/coreos-monitoring.html) on CoreOS
- [spm-agent.service](https://github.com/sematext/spm-agent-docker/blob/master/coreos/spm-agent.service)

	- spm-agent.service starts SPM Agent for Docker on all hosts 
	- It takes the SPM and Logsene App Tokens and the TCP port for the logging gateway from etcd
	- It starts on every CoreOS host (global unit)
	
- [logsene.service](https://github.com/sematext/spm-agent-docker/blob/master/coreos/spm-agent.service)

	- It forwards logs from journald to the logging gateway running as part of spm-agent-docker 
	- All fields stored in the journal are then available in [Logsene](http://www.sematext.com/logsene/index.html)
	
- [cloud-config.example.yml](https://github.com/sematext/spm-agent-docker/blob/master/coreos/cloud-config.example.yml) an example, which integrates spm-agent.service and logsene.service in a cloud config file for deployments on new cluster nodes

Read more about [Centralized Log Management and Monitoring for CoreOS Clusters](http://blog.sematext.com/2015/07/21/coreos-clusters-centralized-log-management-and-monitoring/)  


# Quickstart - get up and running in 5 minutes

1. Get a free account [apps.sematext.com](https://apps.sematext.com/users-web/register.do)  
2. [Create an SPM App of type “Docker”](https://apps.sematext.com/spm-reports/registerApplication.do) to obtain the SPM Application Token
3. Create a [Logsene](http://www.sematext.com/logsene/) App to obtain the Logsene Token
4. Run the install script on one of your CoreOS machines

```
wget https://raw.githubusercontent.com/sematext/spm-agent-docker/master/coreos/install_spm.sh -O install_spm.sh
chmod +x install_spm.sh
./install_spm.sh YOUR_SPM_TOKEN YOUR_LOGSENE_TOKEN 9000
```

Parameters for install_spm.sh:

1. SPM Token
2. Logsene Token
3. Port for the Logging Gateway (exposed TCP port in spm-agent) e.g. 9000

# Installation Step by Step - understand what's going on ...

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

```
# INSTALLATION
# Download the unit file for SPM
wget https://raw.githubusercontent.com/sematext/spm-agent-docker/master/coreos/spm-agent.service -O spm-agent.service
# Start SPM Agent in the whole cluster
fleetctl load spm-agent.service
fleetctl start spm-agent.service
# Download the unit file for Logsene
wget https://raw.githubusercontent.com/sematext/spm-agent-docker/master/coreos/logsene.service -O logsene.service
# Start the log forwarding service
fleetctl load logsene.service
fleetctl start logsene.service
```

# Installation using cloud config

An example is provided here [cloud-config.example.yml](https://github.com/sematext/spm-agent-docker/blob/master/coreos/cloud-config.example.yml). Please don't forget to set the App Tokens in etcd!

```
etcdctl set /sematext.com/myapp/spm/token SPM_TOKEN
etcdctl set /sematext.com/myapp/logsene/token LOGSENE_TOKEN
etcdctl set /sematext.com/myapp/logsene/gateway_port LOGSENE_GATEWAY_PORT
```

# Contributions are welcome

If you see a way to improve the setup, make things easier or discovered a bug - please submit a pull request.  



