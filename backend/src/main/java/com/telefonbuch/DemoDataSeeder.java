package com.telefonbuch;

import com.telefonbuch.contact.Contact;

import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import io.quarkus.runtime.StartupEvent;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Fuellt die Datenbank mit Beispiel-Kontakten, wenn der Demo-Modus aktiv ist
 * und noch keine Kontakte vorhanden sind.
 */
@Singleton
public class DemoDataSeeder {

    @Inject
    EntityManager em;

    @ConfigProperty(name = "quarkus.telefonbuch.demo-mode", defaultValue = "false")
    boolean demoMode;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (!demoMode) {
            return;
        }
        long count = (long) em.createQuery("select count(c) from Contact c", Long.class).getSingleResult();
        if (count > 0) {
            return;
        }
        em.persist(new Contact("Max Mustermann", "030-1234567", "max.mustermann@example.com"));
        em.persist(new Contact("Erika Beispiel", "040-6543210", "erika.beispiel@example.com"));
        em.persist(new Contact("Telefonbuch Support", "0800-123456", "support@example.com"));
    }
}