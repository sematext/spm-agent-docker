set -e 

if [ -n "${HOSTNAME_LOOKUP_URL}" ]; then 
	echo Hostname lookup: ${HOSTNAME_LOOKUP_URL}
	export HOSTNAME=$(curl -s $HOSTNAME_LOOKUP_URL)
	echo $HOSTNAME
fi

spm-docker ${SPM_TOKEN} 