# Production
FROM amd64/php:8.3-apache AS production
RUN a2enmod rewrite
COPY http/apache.conf /etc/apache2/sites-available/000-default.conf
COPY webroot/ /var/www/html/

# Development
FROM php:8.3-apache AS development
RUN a2enmod rewrite
COPY http/apache.conf /etc/apache2/sites-available/000-default.conf
