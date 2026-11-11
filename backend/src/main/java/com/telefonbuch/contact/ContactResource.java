package com.telefonbuch.contact;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/contacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactResource {

    @Inject
    EntityManager em;

    @GET
    public List<Contact> list(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return em.createQuery("select c from Contact c order by c.name", Contact.class).getResultList();
        }
        return em.createQuery(
                "select c from Contact c where lower(c.name) like lower(concat('%', ?1, '%')) "
                        + "or lower(c.phone) like lower(concat('%', ?1, '%')) "
                        + "or lower(c.email) like lower(concat('%', ?1, '%')) order by c.name",
                Contact.class)
                .setParameter(1, q.trim())
                .getResultList();
    }

    @GET
    @Path("/{id}")
    public Response get(@PathParam("id") Long id) {
        return Response.ok(find(id)).build();
    }

    @POST
    @Transactional
    public Response create(@Valid Contact contact) {
        em.persist(contact);
        return Response.status(Response.Status.CREATED).entity(contact).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @Valid Contact contact) {
        Contact managed = find(id);
        managed.setName(contact.getName());
        managed.setPhone(contact.getPhone());
        managed.setEmail(contact.getEmail());
        return Response.ok(managed).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        em.remove(find(id));
        return Response.noContent().build();
    }

    private Contact find(Long id) {
        Contact contact = em.find(Contact.class, id);
        if (contact == null) {
            throw new ContactNotFoundException(id);
        }
        return contact;
    }
}