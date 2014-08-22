package j1.eis;

import j1.app.RegisteredSockets;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.ActivationConfigProperty;
import javax.ejb.MessageDriven;
import javax.inject.Inject;
import org.jboss.ejb3.annotation.ResourceAdapter;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.eventbus.impl.JsonObjectMessage;
import org.vertx.java.core.json.JsonObject;

import org.vertx.java.resourceadapter.inflow.VertxListener;

@MessageDriven(name = "NotificationService",
        messageListenerInterface = VertxListener.class,
        activationConfig = {
            @ActivationConfigProperty(propertyName = "address", propertyValue = "notification-service")
        })
@ResourceAdapter("jca-adaptor-1.0.3.rar")
public class NotificationService implements VertxListener {

    @Inject
    private RegisteredSockets registeredSockets;

    private static final Logger LOGGER = Logger.getLogger(NotificationService.class.getName());

    public NotificationService() {
        LOGGER.info("NotificationService started.");
    }

    @Override
    public <String> void onMessage(final Message<String> message) {
        LOGGER.info("Got a message from Vert.x");
        final JsonObject json = ((JsonObjectMessage) message).body();
        LOGGER.log(Level.INFO, "Body of the message: {0}", json.encodePrettily());
        registeredSockets.doAction(json);
        message.reply("Hi from Java EE. Got your message: " + json);
    }

}
