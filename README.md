
[SPM performance monitoring by Sematext](http://sematext.com/spm/) - this is the Docker monitoring agent for SPM.

Following information is collected and transmitted to SPM (Cloud or On-Premises version):

- OS Metrics of the Host machine (CPU / Mem / Swap) 
- Stats from containers
	- CPU Usaage
	- Memory Usage
	- Network Stats
	- Disk I/O Stats
- Aggregations/ Filters by 
  - image name
  - container id
  - name tag 

# Status

Currently only for internal use by Sematext - test release for the integration with SPM. 
Stay tuned on our [blog](http://blog.sematext.com).

# Installation 

```
npm i sematext/spm-agent-docker -g 
```

Please note this module is not yet published on npm 

# Usage

1. Get a free account and create a Node.js API token at [www.sematext.com](https://apps.sematext.com/users-web/register.do)
2. Run it on your docker host machine and pass the SPM Application Token as parameter

```
spm-docker SPM_TOKEN
```


# TODO
- Wrap it into a container ...
- Show stats on terminal
