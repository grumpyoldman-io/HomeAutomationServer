# Home Automation Server

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

- /lights -> Show status of all connected lights
- /lights/[name] -> Show status of light with specific name
- /lights/[name]/toggle -> Will switch a light on/off

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

Home Automation Server is [MIT licensed](LICENSE).
