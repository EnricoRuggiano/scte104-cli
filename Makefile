.PHONY: test tests build install example-client example-server global

tests:
	npm run test
test:
	npm run test
build:
	npm run build
install:
	npm install
example-client:
	npx ts-node examples/client-args.ts --host 127.0.0.1  --port 5167 --dpi-pid-index 2965 --log-level info --pre-roll-time 2000 --auto-return-flag 1 --splice-insert-type 1 --buffer-size 100
example-server:
	npx ts-node examples/server-args.ts --host 127.0.0.1  --port 5167 
global:
	make build
	npm install -g