package com.community.profession_connect.service;

public class AiPostPromptTemplate {

    public static String buildPrompt(String profession, String contentType) {

        profession = profession.toUpperCase();
        contentType = contentType.toUpperCase();

        switch (profession) {

            case "STUDENT":
                return studentPrompt(contentType);

            case "TEACHER":
                return teacherPrompt(contentType);

            case "DOCTOR":
                return doctorPrompt(contentType);

            default:
                throw new IllegalArgumentException("Invalid profession: " + profession);
        }
    }

    // ---------------- STUDENT ----------------
    private static String studentPrompt(String type) {
        return switch (type) {

            case "BOOK" -> """
                Recommend one useful book for students.
                Rules:
                - Mention book name + author
                - 1-line reason why it helps students
                - Max 3 lines
                - Friendly tone
                - One emoji
                - No hashtags
                """;

            case "QUOTE" -> """
                Share a famous motivational quote for students.
                Rules:
                - Quote + author
                - Add one short line explaining relevance
                - Max 3 lines
                - One emoji
                """;

            case "TIP" -> """
                Share one practical study or career tip for students.
                Rules:
                - Actionable advice
                - Simple language
                - Max 2–3 lines
                - One emoji
                """;

            case "NEWS" -> """
                Share one short education or career-related update for students.
                Rules:
                - Informative, not alarming
                - No fake news
                - Max 3 lines
                - One emoji
                """;

            default -> defaultPrompt("students");
        };
    }

    // ---------------- TEACHER ----------------
    private static String teacherPrompt(String type) {
        return switch (type) {

            case "BOOK" -> """
                Recommend one impactful book for teachers.
                Rules:
                - Book name + author
                - Teaching or mentoring relevance
                - Professional tone
                - Max 3 lines
                - One emoji
                """;

            case "QUOTE" -> """
                Share a quote related to teaching or mentorship.
                Rules:
                - Quote + author
                - Add one reflective line
                - Professional tone
                - Max 3 lines
                """;

            case "TIP" -> """
                Share one effective teaching or classroom strategy.
                Rules:
                - Practical and realistic
                - Professional tone
                - Max 3 lines
                - One emoji
                """;

            case "NEWS" -> """
                Share one short update related to education or teaching trends.
                Rules:
                - Informative
                - Neutral tone
                - Max 3 lines
                """;

            default -> defaultPrompt("teachers");
        };
    }

    // ---------------- DOCTOR ----------------
    private static String doctorPrompt(String type) {
        return switch (type) {

            case "BOOK" -> """
                Recommend one meaningful book for doctors.
                Rules:
                - Medical, ethics, or mental health related
                - Book name + author
                - Professional tone
                - Max 3 lines
                """;

            case "QUOTE" -> """
                Share a thoughtful quote related to medicine or healing.
                Rules:
                - Quote + author
                - Reflective tone
                - Max 3 lines
                """;

            case "TIP" -> """
                Share one wellness or professional tip for doctors.
                Rules:
                - No diagnosis or prescriptions
                - Ethical and supportive
                - Max 3 lines
                - One emoji
                """;

            case "NEWS" -> """
                Share one general health awareness update.
                Rules:
                - No medical advice
                - Public health focused
                - Max 3 lines
                """;

            default -> defaultPrompt("doctors");
        };
    }

    private static String defaultPrompt(String audience) {
        return """
            Create a useful post for %s.
            Rules:
            - Informative or motivational
            - Max 3 lines
            - One emoji
            """.formatted(audience);
    }
}
