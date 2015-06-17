FROM iojs:onbuild
RUN npm i spm-agent-docker -g
ADD ./run.sh /run.sh
RUN chmod +x /run.sh
CMD /run.sh
