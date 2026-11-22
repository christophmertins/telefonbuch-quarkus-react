package de.mertins.phonebook;

import java.util.List;

/** Sample data used when no Active Directory is configured or reachable. */
public final class DemoContactSource {

    private DemoContactSource() {}

    public static List<Contact> contacts() {
        return List.of(
                new Contact("demo-1", "Anna Berger", "Anna", "Berger",
                        "anna.berger@example.com", "+49 3834 555 101", "+49 171 555 101",
                        "Abteilungsleiterin IT", "IT", "Büro 3.12"),
                new Contact("demo-2", "Ben Schmidt", "Ben", "Schmidt",
                        "ben.schmidt@example.com", "+49 3834 555 102", "+49 172 555 102",
                        "Softwareentwickler", "IT", "Büro 3.15"),
                new Contact("demo-3", "Clara Hoffmann", "Clara", "Hoffmann",
                        "clara.hoffmann@example.com", "+49 3834 555 103", "+49 173 555 103",
                        "Projektleiterin", "Vertrieb", "Büro 2.04"),
                new Contact("demo-4", "David Klein", "David", "Klein",
                        "david.klein@example.com", "+49 3834 555 104", null,
                        "Vertriebsmitarbeiter", "Vertrieb", "Büro 2.07"),
                new Contact("demo-5", "Elena Wagner", "Elena", "Wagner",
                        "elena.wagner@example.com", "+49 3834 555 105", "+49 174 555 105",
                        "Marketing Managerin", "Marketing", "Büro 1.08"),
                new Contact("demo-6", "Felix Roth", "Felix", "Roth",
                        "felix.roth@example.com", "+49 3834 555 106", null,
                        "Verkaufsleiter", "Vertrieb", "Büro 2.01"),
                new Contact("demo-7", "Greta Neumann", "Greta", "Neumann",
                        "greta.neumann@example.com", "+49 3834 555 107", "+49 175 555 107",
                        "Personalsachbearbeiterin", "Personal", "Büro 1.02"),
                new Contact("demo-8", "Henrik Schulz", "Henrik", "Schulz",
                        "henrik.schulz@example.com", "+49 3834 555 108", null,
                        "Finanzbuchhalter", "Finanzen", "Büro 4.02"),
                new Contact("demo-9", "Isabell Vogel", "Isabell", "Vogel",
                        "isabell.vogel@example.com", "+49 3834 555 109", "+49 176 555 109",
                        "Produktionsleiterin", "Produktion", "Werkstatt 1"),
                new Contact("demo-10", "Jonas Peters", "Jonas", "Peters",
                        "jonas.peters@example.com", "+49 3834 555 110", null,
                        "Qualitätsprüfer", "Produktion", "Werkstatt 2"),
                new Contact("demo-11", "Katrin Lehmann", "Katrin", "Lehmann",
                        "katrin.lehmann@example.com", "+49 3834 555 111", "+49 177 555 111",
                        "Geschäftsführerin", "Geschäftsführung", "Büro 5.01"),
                new Contact("demo-12", "Lukas Weber", "Lukas", "Weber",
                        "lukas.weber@example.com", "+49 3834 555 112", null,
                        "IT-Support", "IT", "Büro 3.01"));
    }
}
