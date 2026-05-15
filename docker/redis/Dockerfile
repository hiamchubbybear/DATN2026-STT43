FROM redis:7.2-alpine

# Copy custom configuration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Start Redis with the config file
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

EXPOSE 6379
