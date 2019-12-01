deps:
	docker-compose up

clean-deps:
	@docker-compose rm --force --stop && echo "Dependencies Killed"
	@rm -rf ./docker-data
	@echo "Dependencies data removed"

clean: clean-deps
	@echo "Cleaned"

psql:
	PGPASSWORD=bandmate_password psql -h localhost -p 5430 -U bandmate_user -d bandmate