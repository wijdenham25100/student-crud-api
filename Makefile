.PHONY: install run dev migrate test clean help

help:
	@echo "make install/migrate/run/dev/test/clean"

install:
	npm install

migrate:
	node src/db/migrate.js

run:
	node src/server.js

dev:
	npx nodemon src/server.js

test:
	npm test

clean:
	rm -rf node_modules
