FROM iojs:onbuild
RUN npm i sematext/spm-agent-docker -g
ADD ./run.sh /run.sh
RUN chmod +x /run.sh
EXPOSE 9000
CMD /run.sh
