
install:
	npm install
publish:
	npm publish
test:
	DEBUG=page-loader:* npm run test
	# npm run test
build:
	rm -rf dist
	npm run build
lint:
	npm run eslint .