FROM phusion/baseimage:0.9.18

MAINTAINER Jason Chavannes <jason.chavannes@gmail.com>

LABEL version="0.1"

RUN apt-get update
RUN apt-get -y upgrade

RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN sudo apt-get -y install nodejs

ADD files/start.sh /start
RUN chmod u+x /start

CMD /start
