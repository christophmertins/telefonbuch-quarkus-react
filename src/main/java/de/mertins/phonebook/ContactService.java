package de.mertins.phonebook;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class ContactService {

    private static final Logger LOG = Logger.getLogger(ContactService.class);
    private static final long CACHE_TTL_MS = 30_000;

    @Inject
    LdapContactSource ldap;

    private volatile List<Contact> cache;
    private volatile long cacheTime;
    private volatile String mode = "demo";

    public synchronized List<Contact> contacts() {
        long now = System.currentTimeMillis();
        if (cache != null && now - cacheTime < CACHE_TTL_MS) return cache;

        List<Contact> loaded;
        if (ldap.configured()) {
            try {
                loaded = ldap.search();
                mode = "ldap";
                LOG.infof("Loaded %d contacts from Active Directory", loaded.size());
            } catch (Exception e) {
                LOG.warnf("LDAP search failed, falling back to demo data: %s", e.getMessage());
                loaded = DemoContactSource.contacts();
                mode = "demo";
            }
        } else {
            loaded = DemoContactSource.contacts();
            mode = "demo";
        }
        cache = loaded;
        cacheTime = now;
        return loaded;
    }

    public String mode() {
        contacts();
        return mode;
    }

    public List<Contact> search(String q) {
        List<Contact> all = contacts();
        if (q == null || q.isBlank()) return all;
        String needle = q.trim().toLowerCase();
        return all.stream().filter(c ->
                contains(c.displayName(), needle)
                        || contains(c.givenName(), needle)
                        || contains(c.sn(), needle)
                        || contains(c.mail(), needle)
                        || contains(c.telephone(), needle)
                        || contains(c.mobile(), needle)
                        || contains(c.title(), needle)
                        || contains(c.department(), needle)
                        || contains(c.office(), needle)).toList();
    }

    private static boolean contains(String haystack, String needle) {
        return haystack != null && haystack.toLowerCase().contains(needle);
    }
}
