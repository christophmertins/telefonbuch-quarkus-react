package de.mertins.phonebook;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Optional;
import javax.naming.NamingEnumeration;
import javax.naming.Context;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.directory.Attributes;
import javax.naming.directory.Attribute;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Reads contacts from an LDAP directory. No extra dependency: uses the JDK's built-in LDAP client.
 */
@ApplicationScoped
public class LdapContactSource {

    @ConfigProperty(name = "phonebook.ldap.host")
    Optional<String> host;

    @ConfigProperty(name = "phonebook.ldap.port", defaultValue = "389")
    int port;

    @ConfigProperty(name = "phonebook.ldap.baseDn")
    Optional<String> baseDn;

    @ConfigProperty(name = "phonebook.ldap.bindDn")
    Optional<String> bindDn;

    @ConfigProperty(name = "phonebook.ldap.bindPassword")
    Optional<String> bindPassword;

    @ConfigProperty(name = "phonebook.ldap.useTls", defaultValue = "false")
    boolean useTls;

    public boolean configured() {
        return host.isPresent() && !host.get().isBlank()
                && baseDn.isPresent() && !baseDn.get().isBlank();
    }

    public List<Contact> search() throws Exception {
        Hashtable<String, Object> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        env.put(Context.PROVIDER_URL, (useTls ? "ldaps://" : "ldap://") + host.get() + ":" + port);
        env.put(Context.SECURITY_AUTHENTICATION, "simple");
        if (bindDn.isPresent() && !bindDn.get().isBlank()) {
            env.put(Context.SECURITY_PRINCIPAL, bindDn.get());
            env.put(Context.SECURITY_CREDENTIALS, bindPassword.orElse(""));
        }
        env.put("com.sun.jndi.ldap.connect.timeout", "5000");
        env.put("com.sun.jndi.ldap.read.timeout", "10000");

        List<Contact> contacts = new ArrayList<>();
        DirContext ctx = new InitialDirContext(env);
        try {
            SearchControls controls = new SearchControls();
            controls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            controls.setCountLimit(1000);
            controls.setTimeLimit(10);
            controls.setReturningAttributes(new String[] {
                    "displayName", "givenName", "sn", "mail",
                    "telephoneNumber", "mobile", "title", "department",
                    "physicalDeliveryOfficeName"
            });

            NamingEnumeration<SearchResult> results = ctx.search(baseDn.get(), "(objectClass=user)", controls);
            while (results.hasMore()) {
                SearchResult r = results.next();
                Attributes a = r.getAttributes();
                contacts.add(new Contact(
                        r.getNameInNamespace(),
                        get(a, "displayName"),
                        get(a, "givenName"),
                        get(a, "sn"),
                        get(a, "mail"),
                        get(a, "telephoneNumber"),
                        get(a, "mobile"),
                        get(a, "title"),
                        get(a, "department"),
                        get(a, "physicalDeliveryOfficeName")));
            }
            return contacts;
        } finally {
            try { ctx.close(); } catch (Exception ignored) {}
        }
    }

    private static String get(Attributes attrs, String name) {
        try {
            Attribute attr = attrs.get(name);
            if (attr == null || attr.size() == 0) return null;
            Object v = attr.get();
            return v == null ? null : v.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
