build:
	@docker-compose build

push:
	@docker-compose push node-app

pull:
	@docker-compose pull node-app

up-dev: 
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build --scale node-app=3

up-prod:
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale node-app=3

down: 
	@docker-compose down -v

list:
	@docker ps

logs-1:
	@docker logs -f phitauportal_node-app_1

logs-2:
	@docker logs -f phitauportal_node-app_2

logs-3:
	@docker logs -f phitauportal_node-app_3

bash-1:
	@docker exec -it phitauportal_node-app_1 bash

bash-2:
	@docker exec -it phitauportal_node-app_1 bash

bash-3:
	@docker exec -it phitauportal_node-app_1 bash

clean:
	@echo "Cleaning directory..."
	@rm -rf ./node_modules