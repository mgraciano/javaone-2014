package j1.web;

import j1.app.RegisteredSockets;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.inject.Inject;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.resource.ResourceException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.resourceadapter.VertxConnection;
import org.vertx.java.resourceadapter.VertxConnectionFactory;

@WebServlet(urlPatterns = {"/notification"})
public class NotificationServlet extends HttpServlet {

    @Inject
    private RegisteredSockets registeredSockets;

    private static final Logger LOGGER = Logger.getLogger(NotificationServlet.class.getName());

    private static final String JNDI_NAME = "java:/eis/VertxConnectionFactory";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");

        final String tenant = request.getParameter("tenant");
        final String message = request.getParameter("message");

        if (tenant != null && tenant.trim().length() > 0
                && message != null && message.trim().length() > 0) {

            InitialContext ctx = null;
            VertxConnection conn = null;
            try {
                ctx = new InitialContext();
                VertxConnectionFactory connFactory = (VertxConnectionFactory) ctx.lookup(JNDI_NAME);
                conn = connFactory.getVertxConnection();
                EventBus eb = conn.eventBus();
                registeredSockets.getSocketsFromTenant(tenant)
                        .forEach(o -> {
                            eb.send(o.getString("instance"), o.putString("message", message));
                        });
                response.getOutputStream().print("OK");
            } catch (NamingException e) {
                LOGGER.log(Level.SEVERE, null, e);
            } catch (ResourceException e) {
                LOGGER.log(Level.SEVERE, null, e);
            } finally {
                if (ctx != null) {
                    try {
                        ctx.close();
                    } catch (NamingException ex) {
                        LOGGER.log(Level.SEVERE, null, ex);
                    }
                }
                if (conn != null) {
                    try {
                        conn.close();
                    } catch (ResourceException ex) {
                        LOGGER.log(Level.SEVERE, null, ex);
                    }
                }
            }
        } else {
            response.sendError(400, "Wrong parameters");
        }
    }

}
