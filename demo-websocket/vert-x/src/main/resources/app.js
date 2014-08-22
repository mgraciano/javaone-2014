"use strict";

var vertx = require('vertx');
var container = require("vertx/container");
var eventBus = require('vertx/event_bus');
var http = require("vertx/http");
var matcher = new http.RouteMatcher();

matcher.noMatch(function(req) {
    if (req.method() === "HEAD") {
        req.response.end();
    } else {
        var fileName = req.path() === "/" ? "web/index.html" : "web" + req.path();
        req.response.sendFile(fileName);
    }
});

var MDB_ADDRESS = "notification-service";

function registerClient(socketId, tenantId, handler) {
    eventBus.sendWithTimeout(MDB_ADDRESS, {action: "register", socket: socketId, tenant: tenantId}, 5000, handler);
}

function unregisterClient(socketId, handler) {
    eventBus.sendWithTimeout(MDB_ADDRESS, {action: "unregister", socket: socketId}, 5000, handler);
}

var webSocketHandler = function(websocket) {
    if (websocket.path() === '/vertx') {
        websocket.closeHandler(function() {
            unregisterClient(websocket.textHandlerID(), function(cause, result) {
                if (!cause) {
                    container.logger.info("Socket " + websocket.textHandlerID() + " unregistered");
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
                        websocket.writeTextFrame(JSON.stringify({status: "success"}));
                        container.logger.info("Socket " + websocket.textHandlerID() + " registered");
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

var port = container.config["port"] || 8090;
var server = http.createHttpServer()
        .requestHandler(matcher)
        .websocketHandler(webSocketHandler)
        .listen(port);
container.logger.info("Server listening on port " + port);