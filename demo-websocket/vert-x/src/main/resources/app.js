"use strict";

var vertx = require('vertx');
var container = require("vertx/container");
var eventBus = require('vertx/event_bus');
var http = require("vertx/http");
var sharedData = require("vertx/shared_data");

var notificationsMap = sharedData.getMap("notifications");
var socketsSet = sharedData.getSet("sockets");

var matcher = new http.RouteMatcher();

matcher.post("/api/notifications/registry", function (req) {
    req.bodyHandler(function (body) {
        var object = JSON.parse(body);
        container.logger.info("Activated user " + object.user + " (ID: " + object.tenantId + ")");
        notificationsMap.put(object.tenantId, object.user);
    });

    req.response.end();
});

matcher.get("/api/notifications/list", function (req) {
    var subscribers = [];

    notificationsMap.values().stream()
            .map(function (o) {
                return {name: o};
            })
            .forEach(function (o) {
                subscribers.push(o);
            });

    var json = JSON.stringify(subscribers);
    req.response.putHeader("Content-Type", "application/json").end(json);
});

matcher.noMatch(function (req) {
    if (req.method() === "HEAD") {
        req.response.end();
    } else {
        var fileName = req.path() === "/" ? "web/index.html" : "web" + req.path();
        req.response.sendFile(fileName);
    }
});

var webSocketHandler = function (websocket) {
    if (websocket.path() === '/tracker') {
        websocket.closeHandler(function () {
            container.logger.info("ID " + websocket.textHandlerID() + " unregistered");
            socketsSet.remove(websocket.textHandlerID());
        });

        container.logger.info("ID " + websocket.textHandlerID() + " registered");
        socketsSet.add(websocket.textHandlerID());

        container.logger.info("Sending current positions to ID " + websocket.textHandlerID());
        websocket.dataHandler(function (buffer) {

            if (!websocket.writeQueueFull()) {
                websocket.writeTextFrame(buffer);
            } else {
                websocket.pause();

                websocket.drainHandler(function () {
                    websocket.writeTextFrame(buffer);
                    websocket.resume();
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

//INICIO TESTE
/*var notifyMock = {
 androidId: "id",
 user: "Teste",
 beacons: [
 { address: "20:CD:39:A0:84:50", accuracy: 6.0},
 { address: "20:CD:39:A0:84:31", accuracy: 6.0},
 { address: "20:CD:39:A0:84:06", accuracy: 1.0},
 { address: "20:CD:39:A0:80:4D", accuracy: 6.0},
 { address: "20:CD:39:A0:89:DD", accuracy: 6.0}
 ]
 };*/
/*var notifyMock = {
 androidId: "id",
 user: "Teste",
 beacons: [
 {accuracy:3.4719669843956855, address:"20:CD:39:A0:84:50"},
 {accuracy:3.7223404805894793, address:"20:CD:39:A0:80:4D"},
 {accuracy:4.502603168722758, address:"20:CD:39:A0:89:DD"}
 ]
 };
 
 notifyMap.put("id", JSON.stringify(notifyMock));
 positionsMap.put("id", JSON.stringify(tracker.trackPosition(JSON.parse(notifyMap.get("id")))));
 print("FAKE POSITION: "+positionsMap.get("id"));*/
//FIM TESTE