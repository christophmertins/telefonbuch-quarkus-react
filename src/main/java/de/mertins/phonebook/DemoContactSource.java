package de.mertins.phonebook;

import java.util.List;

/** Sample data used when no directory is configured or reachable. */
public final class DemoContactSource {

    private DemoContactSource() {}

    public static List<Contact> contacts() {
        return List.of(
                new Contact("demo-1", "Alex Morgan", "Alex", "Morgan",
                        "alex.morgan@example.com", "+1 555 0101", "+1 555 101",
                        "IT Lead", "IT", "Office 3.12"),
                new Contact("demo-2", "Sam Chen", "Sam", "Chen",
                        "sam.chen@example.com", "+1 555 0102", "+1 555 102",
                        "Software Engineer", "IT", "Office 3.15"),
                new Contact("demo-3", "Jordan Lee", "Jordan", "Lee",
                        "jordan.lee@example.com", "+1 555 0103", "+1 555 103",
                        "Project Manager", "Sales", "Office 2.04"),
                new Contact("demo-4", "Casey Rivera", "Casey", "Rivera",
                        "casey.rivera@example.com", "+1 555 0104", null,
                        "Sales Representative", "Sales", "Office 2.07"),
                new Contact("demo-5", "Riley Kim", "Riley", "Kim",
                        "riley.kim@example.com", "+1 555 0105", "+1 555 105",
                        "Marketing Manager", "Marketing", "Office 1.08"),
                new Contact("demo-6", "Jamie Park", "Jamie", "Park",
                        "jamie.park@example.com", "+1 555 0106", null,
                        "Sales Lead", "Sales", "Office 2.01"),
                new Contact("demo-7", "Avery Novak", "Avery", "Novak",
                        "avery.novak@example.com", "+1 555 0107", "+1 555 107",
                        "HR Specialist", "HR", "Office 1.02"),
                new Contact("demo-8", "Quinn Patel", "Quinn", "Patel",
                        "quinn.patel@example.com", "+1 555 0108", null,
                        "Accountant", "Finance", "Office 4.02"),
                new Contact("demo-9", "Drew Brooks", "Drew", "Brooks",
                        "drew.brooks@example.com", "+1 555 0109", "+1 555 109",
                        "Production Manager", "Operations", "Floor 1"),
                new Contact("demo-10", "Ellis Grant", "Ellis", "Grant",
                        "ellis.grant@example.com", "+1 555 0110", null,
                        "Quality Inspector", "Operations", "Floor 2"),
                new Contact("demo-11", "Harper Diaz", "Harper", "Diaz",
                        "harper.diaz@example.com", "+1 555 0111", "+1 555 111",
                        "Managing Director", "Management", "Office 5.01"),
                new Contact("demo-12", "Logan Frost", "Logan", "Frost",
                        "logan.frost@example.com", "+1 555 0112", null,
                        "IT Support", "IT", "Office 3.01"));
    }
}
