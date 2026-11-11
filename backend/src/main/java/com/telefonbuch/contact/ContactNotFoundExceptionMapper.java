package com.telefonbuch.contact;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;

import java.util.Map;

/**
 * Liefert 404 als JSON, statt der Standard-HTML-Seite.
 */
@ApplicationScoped
@Provider
public class ContactNotFoundExceptionMapper implements ExceptionMapper<ContactNotFoundException> {

    @Override
    public Response toResponse(ContactNotFoundException exception) {
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", exception.getMessage()))
                .build();
    }
}