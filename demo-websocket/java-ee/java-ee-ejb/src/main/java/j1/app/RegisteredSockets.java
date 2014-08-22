package j1.app;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.enterprise.context.ApplicationScoped;
import org.vertx.java.core.json.JsonObject;

@ApplicationScoped
public class RegisteredSockets {

    private Map<String, JsonObject> sockets = new ConcurrentHashMap<>();

    public void doAction(final JsonObject json) {
        if (json.getValue("action").equals("register")) {
            put(json);
        } else {
            remove(json);
        }
    }

    private void put(final JsonObject json) {
        sockets.putIfAbsent(json.getString("socket"), json);
    }

    private void remove(final JsonObject json) {
        sockets.remove(json.getString("socket"));
    }
}
