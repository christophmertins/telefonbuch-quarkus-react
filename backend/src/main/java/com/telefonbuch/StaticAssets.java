package com.telefonbuch;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

/**
 * Liest die gebaute React-Startseite (index.html) fuer die App-Wurzel.
 *
 * <p>Im Quarkus-Uber-JAR liegen die statischen Assets unter
 * {@code BOOT-INF/classes/static/}; ob der Classloader sie direkt lesen kann,
 * haengt vom Laufzeit-Modus ab. Deshalb wird zuerst ueber den Classloader
 * gelesen und als Fallback ueber HTTP vom eigenen Server.</p>
 */
final class StaticAssets {

    private static final String FALLBACK = "<!DOCTYPE html>\n<html lang=\"de\">\n<head>\n"
            + "<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
            + "<title>Telefonbuch</title>\n</head>\n<body>\n<div id=\"root\"></div>\n"
            + "<p>Frontend-Assets sind nicht verfuegbar. Bauen Sie zuerst das Frontend und kopieren Sie es in "
            + "<code>backend/src/main/resources/static/</code>.</p>\n</body>\n</html>";

    private static final String[] PATHS = {
        "META-INF/resources/index.html",
        "/META-INF/resources/index.html",
        "static/index.html",
        "/static/index.html",
        "index.html",
        "/index.html"
    };

    private static String load() {
        String viaClassloader = tryClassloader();
        if (viaClassloader != null) {
            return viaClassloader;
        }
        String viaSelfHttp = trySelfHttp();
        return viaSelfHttp != null ? viaSelfHttp : FALLBACK;
    }

    private static String tryClassloader() {
        ClassLoader[] loaders = {
                StaticAssets.class.getClassLoader(),
                Thread.currentThread().getContextClassLoader()
        };
        for (ClassLoader loader : loaders) {
            if (loader == null) {
                continue;
            }
            for (String path : PATHS) {
                try (InputStream in = loader.getResourceAsStream(path)) {
                    if (in == null) {
                        continue;
                    }
                    String body = new String(in.readAllBytes(), StandardCharsets.UTF_8);
                    if (body.contains("id=\"root\"")) {
                        return body;
                    }
                } catch (Exception ignored) {
                    // naechster Pfad
                }
            }
        }
        return null;
    }

    private static String trySelfHttp() {
        try {
            int port = Integer.getInteger("quarkus.http.port", 8080);
            String host = System.getProperty("quarkus.http.host", "127.0.0.1");
            if (host == null || host.isBlank() || "0.0.0.0".equals(host)) {
                host = "127.0.0.1";
            }
            HttpResponse<String> response = HttpClient.newHttpClient().send(
                    HttpRequest.newBuilder(URI.create("http://" + host + ":" + port + "/index.html")).GET().build(),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() == 200 && response.body() != null && response.body().contains("id=\"root\"")) {
                return response.body();
            }
        } catch (Exception ignored) {
            // kein eigenes HTTP (z. B. Test-Umfeld)
        }
        return null;
    }

    static String indexHtml() {
        return load();
    }
}