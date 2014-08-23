package j1.app;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import javax.ejb.Singleton;
import org.vertx.java.core.json.JsonObject;

@Singleton
public class RegisteredSockets {

    private final Map<String, JsonObject> sockets = new ConcurrentHashMap<>();

    public void doAction(final JsonObject json) {
        if (json.getValue("action").equals("register")) {
            sockets.put(json.getString("socket"), json);
        } else {
            sockets.remove(json.getString("socket"));
        }
    }

    public Set<JsonObject> getSocketsFromTenant(final String tenant) {
        return sockets.values().stream()
                .filter(o -> o.getString("tenant").equals(tenant))
                .collect(Collectors.toSet());
    }

}
