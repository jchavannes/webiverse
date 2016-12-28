FROM phusion/baseimage:0.9.18

MAINTAINER Jason Chavannes <jason.chavannes@gmail.com>

LABEL version="0.1"

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install apache2 php5 libapache2-mod-php5 php5-mysql

RUN a2enmod php5
RUN a2enmod rewrite

ADD files/apache.conf /etc/apache2/sites-available/000-default.conf

ADD files/start.sh /start
RUN chmod u+x /start

CMD /start
