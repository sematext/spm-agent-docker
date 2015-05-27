FROM iojs:onbuild
RUN npm i sematext/spm-agent-docker -g
ADD ./run.sh /run.sh
RUN chmod +x /run.sh
CMD /run.sh