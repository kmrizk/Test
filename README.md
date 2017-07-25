# Geeny HelloWorld Application in Node.js

## Introduction

The Geeny HelloWorld Application is a sample application that allows developers to explore the Geeny API and start developing Geeny Applications in their local environments. Its primary purpose is to demonstrate how to consume data through the Geeny API.

Data is sent to the platform over message-type streams, which are distributed in shards. A shard is a uniquely identified group of messages, stored in the systemas JSON objects. Messages are consumed per-shard through [polling](https://en.wikipedia.org/wiki/Polling_(computer_science)).

The Geeny HelloWorld Application consists of the following parts:

-  **Frontend UI** ([React](https://facebook.github.io/react/)): A web interface that emulates a terminal and exposes a set of commands to retrieve data from the backend part via REST API.
-  **Backend app** ([Node.js](https://nodejs.org), [swagger-express](https://github.com/fliptoo/swagger-express)): A proxy to the Geeny Application Broker which exposes an HTTP API similar to [Kinesis](https://docs.aws.amazon.com/kinesis/latest/APIReference/Welcome.html).
-  **Geeny Application Broker** (Docker container): A mock data store which provides endpoints for applications to use to consume data from the Geeny platform.
-  **Geeny Connect** (Docker container): A set of mock API endpoints for authenticating Geeny Applications with the Geeny Application Broker.

The terminal commands demonstrate the flow of how an application could consume data from Geeny: discovering message-type streams and then pulling messages by shard and message amount.

## Requirements

To run the HelloWorld application, you must have [Docker](https://www.docker.com/) installed.

This repository includes a Docker image for running the application. If you would prefer to run it manually (i.e., for local development) then you must have [node.js](https://nodejs.org) installed as well.

## Setup & configuration

Application setup and configuration is managed by environment variables and Docker.

The default environment variables are defined in `docker-compose.yml` and `app/config/env.js` if the backend app is being run locally. All environment variables can be overwritten by Docker CLI if necessary.

If you are running the backend app manually, then you should set the environment variables and install the dependencies. To do so:

1.  Go to the `app/` folder.
2.  Run `npm install`.
3.  Install the Swagger npm package globally by running `npm install -g swagger`.

List of available environment variables:

```
export NODE_PORT=8080
export APP_NAME=example
export GEENY_APPBROKER=http://subscription-service:1319/app
export GEENY_CONNECT=http://authentication-service:3000
export GEENY_CONNECT_KEY=PUB.KEY
```

## Running the application

To get the application up and running, simply execute `docker-compose up`.

If you want to run the application manually, then you must start the Geeny Application Broker and the backend app separately:

1.  Run `docker-compose up authentication-service subscription-service` to start the Geeny Application Broker and Geeny Connect.
2.  Go to the `app/` directory.
3.  Run `npm start` to start the backend app.

## Frontend UI

This application includes a frontend UI served locally by a Node.js backend.

To access the UI, go to `http://localhost:8080` in a web browser.

![Screenshot of the UI](Screenshot.png)

You will be able to perform the following commands:

-  `help` - Prints a list of commands.
-  `clear` - Clears the terminal.
-  `login` - Retrieves an authentication token to be used in later commands.
-  `describe <messageType>` - Describes message-type stream. The available message types for this application are `fitness` (sample fitness data) and `helloworld` (generic data).
-  `messages ` - pulls messages from a message-type by a shard in given amount

Available message-type streams are: "fitness" and "helloworld".

Result of command execution is JSON. Exceptions are `help`, `clear` and `login` commands.

## Local API

This application includes a local API described in the format of [Swagger](https://swagger.io/).
The API description file can be found here: [app/api/swagger/swagger.yaml](app/api/swagger/swagger.yaml)

When running the application, you can access the file from your web browser at: `http://localhost:8080/api/swagger`

Here is a sample call to the local API that will fetch 3 messages from a stream of type `helloworld`:

`curl -v -H 'Authorization: eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lQGdlZW55LmlvIiwiZXhwIjoxNTAwMzg0NTk0LCJvcmlnX2lhdCI6MTUwMDM4NDI5NCwidXNlcl9pZCI6IjUwY2IyOGJjLWRkNTAtNDUyNC01MmNkLTliYWQ1ODk2ZmQyZiIsInVzZXJuYW1lIjoibWVAZ2VlbnkuaW8ifQ.TWaAai5zZ2CJVrc6LlwdXH4rsLYV5YsHHppGVwf2LqimZa4C-mLfejhFbEwNRui2QqDN2YJp_mGgx6rr0604Na00Vdemxm1iDaIOfMVLgqjtmLDNXfXUmk5NaNZ8JGQh30KKrOjHuIdRohmdxSo-JpHJNPSYASbpd7_dVcJPi7mDkXrHzFyDILWAUmPsgyfYVeLIWipLILrRC8t8cxVNX-GdsZQoOPSET3ANcJdtWNhrdgDeZGJ-hyv4roQoKl3Lm7ikgGqSpaiVKxUUBWZyPAX2mD6w_oZuLARg-qWqY4gitvNHUt90pieJsBf131Z1ITui_8nzJGk4E8ieQahAYw' 'http://localhost:8080/api/helloworld/data%2Fexample%2Fhelloworld.json/messages?amount=3' --compressed`

The results will look something like this:

```
{
  "messages":[
    {
      "sequenceNumber":"0",
      "payload":"{\"data\":{\"foo\":\"bar\",\"summary\":\"Payload could be anything\"}}",
      "thingId":"1",
      "messageId":"1",
      "userId":"1"
    },
    {
      "sequenceNumber":"1",
      "payload":"\"I am a string payload\"",
      "thingId":"1",
      "messageId":"2",
      "userId":"1"
    },
    {
      "sequenceNumber":"2",
      "payload":1337,
      "thingId":"1",
      "messageId":"3",
      "userId":"1"
    }
  ]
}
```

Messages consist of the following properties:

-  `sequenceNumber`: Sequence position of the message in the shard.
-  `payload`: The contents of the message.
-  `thingId`: UUID of the data source that sent the message to the platform.
-  `messageId`: UUID of the message itself.
-  `userId`: UUID of the user who owns the data source.

### Swagger

The application comes with [Swagger Editor](http://editor.swagger.io/) for testing the local API.
To access it, run `swagger project edit` in the `app` directory.

## Mock data

The data loaded in the frontend UI is a JSON data file in the `data` directory. There is one JSON file for each of the message types, namely, `helloworld` and `fitness`. These are example message-types containing some sample data from an IoT-connected device.

Fitness data contains data recorded by a wearable fitness device, such as activity type, steps, calories, etc.

Helloworld data contains arbitrary JSON data.

If you want to add a new message-type, then create a new `.json` file in `data/example/` folder. Add the messages in the following format:

```
[
  {
    "messageId":"<id>",
    "thingId":"<id>",
    "userId":"<id>",
    "payload":any type
  },
  {
    ...
  }
]
```

## License

Copyright (C) 2017 Telefónica Germany Next GmbH, Charlottenstrasse 4, 10969 Berlin.

This project is licensed under the terms of the [Mozilla Public License Version 2.0](LICENSE.md).

Inconsolata font is copyright (C) 2006 The Inconsolata Project Authors. This Font Software is licensed under the [SIL Open Font License, Version 1.1](OFL.txt).