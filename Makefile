PROJECT_ROOT := $(CURDIR)
BUNDLE := $(PROJECT_ROOT)/.venv/bin/bundle _2.4.22_
PORT ?= 4000

export GEM_HOME := $(PROJECT_ROOT)/.venv/ruby-tools
export GEM_PATH := $(PROJECT_ROOT)/.venv/ruby-tools
export BUNDLE_PATH := $(PROJECT_ROOT)/.venv/bundle
export BUNDLE_USER_HOME := $(PROJECT_ROOT)/.venv/bundle-home

.PHONY: all preview build clean

all: preview

preview:
	$(BUNDLE) exec jekyll serve --port $(PORT)

build:
	JEKYLL_ENV=production $(BUNDLE) exec jekyll build

clean:
	$(BUNDLE) exec jekyll clean
