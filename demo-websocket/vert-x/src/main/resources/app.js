"use strict";

var vertx = require('vertx');
var container = require("vertx/container");
var eventBus = require('vertx/event_bus');
var http = require("vertx/http");
var matcher = new http.RouteMatcher();
var UUID = Java.type("java.util.UUID"); //If throws error, you're not running on Nashorn

matcher.noMatch(function(req) {
    if (req.method() === "HEAD") {
        req.response.end();
    } else {
        var fileName = req.path() === "/" ? "web/index.html" : "web" + req.path();
        req.response.sendFile(fileName);
    }
});

var MDB_ADDRESS = "notification-service";
var INSTANCE_ID = UUID.randomUUID().toString();

function registerClient(socketId, tenantId, handler) {
    eventBus.sendWithTimeout(MDB_ADDRESS, {action: "register", socket: socketId, tenant: tenantId, instance: INSTANCE_ID}, 5000, handler);
}

function unregisterClient(socketId, handler) {
    eventBus.sendWithTimeout(MDB_ADDRESS, {action: "unregister", socket: socketId}, 5000, handler);
}

var webSocketHandler = function(websocket) {
    if (websocket.path() === '/vertx') {
        websocket.closeHandler(function() {
            unregisterClient(websocket.textHandlerID(), function(cause, result) {
                if (!cause) {
                    container.logger.info("Socket " + websocket.textHandlerID() + " unregistered\n" + result);
                } else {
                    container.logger.error("Error while unregistering socket "
                            + websocket.textHandlerID() + "!\nCause: " + cause);
                }
            });
        });

        websocket.dataHandler(function(buffer) {
            var data = JSON.parse(buffer);
            if (data.tenant) {
                registerClient(websocket.textHandlerID(), data.tenant, function(cause, result) {
                    if (!cause) {
                        websocket.writeTextFrame(JSON.stringify({status: "success", tenant: data.tenant}));
                        container.logger.info("Socket " + websocket.textHandlerID() + " registered\n" + result);
                    } else {
                        websocket.writeTextFrame(JSON.stringify({status: "error"}));
                        container.logger.error("Error while registering socket "
                                + websocket.textHandlerID() + "\nCause: " + cause);
                    }
                });
            }
        });
    } else {
        websocket.reject();
    }
};

eventBus.registerHandler(INSTANCE_ID, function(message, replier) {
    container.logger.info("Got message: " + JSON.stringify(message));
    eventBus.sendWithTimeout(message.socket, JSON.stringify({status: "message", message: message.message}), 5000, function(cause) {
        if (!cause) {
            container.logger.info("Message sent to socket " + message.socket + "!");
        } else {
            container.logger.error("Error while sending message to socket "
                    + message.socket + "\nCause: " + cause);
        }
    });
    if (replier) {
        replier("Got your message: " + message);
    }
});
container.logger.info("Registering handler for instance " + INSTANCE_ID);

var port = container.config["port"] || (Math.floor(Math.random() * (8080 - 8000) + 8000));
var server = http.createHttpServer()
        .requestHandler(matcher)
        .websocketHandler(webSocketHandler)
        .listen(port);
container.logger.info("Server listening on port " + port);