package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {

        // 🔹 Build prompt
        String prompt = buildPrompt(emailRequest);

        // 🔹 Request body
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        // 🔹 Debug (optional)
        System.out.println("URL: " + geminiApiUrl);
        System.out.println("KEY: " + geminiApiKey);

        // ✅ FINAL FIXED API CALL
        String response;

        try {
            response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        } catch (Exception e) {
            e.printStackTrace(); // VERY IMPORTANT for debugging
            return "Error from Gemini: " + e.getMessage();
        }

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);

            JsonNode candidates = rootNode.path("candidates");

            if (!candidates.isArray() || candidates.size() == 0) {
                return "Error: No candidates in response -> " + response;
            }

            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");

            if (!parts.isArray() || parts.size() == 0) {
                return "Error: No parts in response -> " + response;
            }

            JsonNode textNode = parts.get(0).path("text");

            if (textNode.isMissingNode() || textNode.asText().isEmpty()) {
                return "Error: Empty text response -> " + response;
            }

            return textNode.asText();

        } catch (Exception e) {
            return "Error processing response: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Generate a professional email reply for the following email content. The reply must start with \"Hi,\" and end with \"Best regards\". Do not include a subject line.");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
        }

        prompt.append("\nOriginal email:\n")
                .append(emailRequest.getEmailContent());

        return prompt.toString();
    }
}