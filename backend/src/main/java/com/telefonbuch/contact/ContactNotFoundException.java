package com.telefonbuch.contact;

public class ContactNotFoundException extends RuntimeException {

    public ContactNotFoundException(Long id) {
        super("Kontakt mit der ID " + id + " nicht gefunden");
    }
}