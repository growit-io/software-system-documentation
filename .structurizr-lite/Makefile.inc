# The output directory is interpreted relative to the directory of the original
# Makefile which includs this fragment.
STRUCTURIZR_LITE_OUTPUT ?= docs/diagrams

# Whether to define the build, start, stop, goals for Structurizr Lite, or not.
USE_STRUCTURIZR_LITE_DEFAULT_GOALS ?= yes

CURL ?= curl
DOCKER ?= docker
OPEN ?= open

__STRUCTURIZR_LITE_DIR = $(__MAKEFILE_DIR)
__STRUCTURIZR_LITE_DOCKER_COMPOSE = $(DOCKER) compose -f '$(__STRUCTURIZR_LITE_DOCKER_COMPOSE_FILE)'
__STRUCTURIZR_LITE_DOCKER_COMPOSE_FILE = $(__STRUCTURIZR_LITE_DIR)/docker-compose.yml
__STRUCTURIZR_LITE_URL = http://localhost:8080
__STRUCTURIZR_LITE_OUTPUT = $(__STRUCTURIZR_LITE_DIR)

__MAKEFILE_DIR := $(patsubst %/,%,$(dir $(lastword $(MAKEFILE_LIST))))



structurizr-lite-export:
	$(__STRUCTURIZR_LITE_DOCKER_COMPOSE) pull --quiet
	$(__STRUCTURIZR_LITE_DOCKER_COMPOSE) run puppeteer
	mkdir -p '$(STRUCTURIZR_LITE_OUTPUT)'
	rm -f '$(STRUCTURIZR_LITE_OUTPUT)'/structurizr-*
	mv -f '$(__STRUCTURIZR_LITE_OUTPUT)'/structurizr-* '$(STRUCTURIZR_LITE_OUTPUT)'

structurizr-lite-start:
	$(__STRUCTURIZR_LITE_DOCKER_COMPOSE) pull --quiet structurizr-lite
	$(__STRUCTURIZR_LITE_DOCKER_COMPOSE) up -d structurizr-lite

# We use --retry-all-errors instead of --retry-connrefused since, at least on
# macOS, this also catches the transient "Empty reply from server" reported by
# curl while the Docker container is starting up.
structurizr-lite-open:
	$(CURL) -Ss --head -X GET --retry 15 --retry-all-errors --retry-delay 1 '$(__STRUCTURIZR_LITE_URL)'
	$(OPEN) '$(__STRUCTURIZR_LITE_URL)'

structurizr-lite-stop:
	$(__STRUCTURIZR_LITE_DOCKER_COMPOSE) down

structurizr-lite-clean: structurizr-lite-stop
	rm -f '$(STRUCTURIZR_LITE_OUTPUT)'/structurizr-*


ifeq ($(USE_STRUCTURIZR_LITE_DEFAULT_GOALS),yes)

export: structurizr-lite-export
start: structurizr-lite-start
open: structurizr-lite-open
stop: structurizr-lite-stop
clean: structurizr-lite-clean

endif
