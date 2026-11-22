package de.mertins.phonebook;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

import java.util.List;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ContactResource {

    @Inject
    ContactService service;

    @GET
    @Path("/contacts")
    public List<Contact> list(@QueryParam("q") String q) {
        return service.search(q);
    }

    @GET
    @Path("/contacts/{id}")
    public Response get(@PathParam("id") String id) {
        return service.contacts().stream()
                .filter(c -> c.id().equals(id))
                .findFirst()
                .map(c -> Response.ok(c).build())
                .orElseGet(() -> Response.status(Status.NOT_FOUND).entity("Kontakt nicht gefunden").build());
    }

    @GET
    @Path("/stats")
    public Stats stats() {
        List<Contact> all = service.contacts();
        long withMail = all.stream().filter(c -> c.mail() != null && !c.mail().isBlank()).count();
        long withPhone = all.stream().filter(c ->
                (c.telephone() != null && !c.telephone().isBlank())
                        || (c.mobile() != null && !c.mobile().isBlank())).count();
        return new Stats(all.size(), (int) withMail, (int) withPhone, service.mode());
    }
}
