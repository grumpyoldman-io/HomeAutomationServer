# Home Automation Server

[![Hippocratic License HL3-FULL](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-FULL&labelColor=5e2751&color=bc8c3d)](https://firstdonoharm.dev/version/3/0/full.html)
[![CI](https://github.com/grumpyoldman-io/HomeAutomationServer/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/grumpyoldman-io/HomeAutomationServer/actions/workflows/ci.yml)

## Description

A simple home automation server built using [Nest](https://github.com/nestjs/nest).
It allows you to create WiFi connected push buttons in your home that can switch
your Hue lights on and off all within your network.

## Installation

Create a .env.local file with the correct vars and

```bash
# install dependencies
$ yarn install
```

## How it works

prerequisites:

1. A network with a Hue bridge
2. A valid user and ip of the Hue bridge ([more here](https://github.com/peter-murray/node-hue-api#discover-and-connect-to-the-hue-bridge-for-the-first-time)).

The server will connect to your local Hue Bridge on startup, and will expose the following endpoints:

- (get) /lights -> Show status of all connected lights
- (get) /lights/[name] -> Show status of light with specific name
- (get) /lights/[name]/toggle -> Will switch a light on/off

You can also check out the OpenApi specs on `/docs` or `/docs-json` when running the server

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Hygiene

```bash
# lint project files with ESLint
$ yarn lint

# check formatting using Prettier
$ yarn format

# validate project files using Typescript
$ yarn validate
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## License

Home Automation Server is [HL3-FULL licensed](LICENSE).
