up: 
	@docker-compose up -d --build --scale node-app=3

down: 
	@docker-compose down -v

list:
	@docker ps

# bash:
# 	@docker exec -it node-app bash

# logs:
# 	@docker logs -f node-app

clean:
	@echo "Cleaning directory..."
	@rm -rf ./node_modules