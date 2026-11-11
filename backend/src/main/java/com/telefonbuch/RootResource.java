package com.telefonbuch;

import jakarta.inject.Singleton;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

/**
 * Liefert die gebaute React-Startseite (index.html) fuer die App-Wurzel.
 *
 * <p>Der clientseitige Router uebernimmt danach die Weiterleitung; die App ist
 * eine Single-Page-Anwendung, die alles unter <code>/</code> rendert.</p>
 */
@Path("/")
@Singleton
public class RootResource {

    @GET
    public Response index() {
        return Response.ok(StaticAssets.indexHtml()).type("text/html; charset=UTF-8").build();
    }
}