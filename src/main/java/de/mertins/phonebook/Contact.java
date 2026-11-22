package de.mertins.phonebook;

public record Contact(
        String id,
        String displayName,
        String givenName,
        String sn,
        String mail,
        String telephone,
        String mobile,
        String title,
        String department,
        String office) {}
