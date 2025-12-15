package com.community.profession_connect.service;

import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class LinkGuardService {

    // Trusted domains for job applications
    private static final Set<String> TRUSTED_DOMAINS = new HashSet<>(Arrays.asList(
        "linkedin.com", "www.linkedin.com",
        "greenhouse.io", "www.greenhouse.io",
        "lever.co", "www.lever.co",
        "workday.com", "www.workday.com",
        "indeed.com", "www.indeed.com",
        "glassdoor.com", "www.glassdoor.com",
        "jobvite.com", "www.jobvite.com"
    ));

    // Suspicious domains that should be flagged
    private static final Set<String> SUSPICIOUS_DOMAINS = new HashSet<>(Arrays.asList(
        "t.me", "wa.me",
        "bit.ly", "tinyurl.com", "goo.gl",
        "ow.ly", "is.gd", "buff.ly",
        "telegram.org", "telegram.me"
    ));

    public enum LinkSafetyStatus {
        SAFE,      // Internal application or null/empty
        TRUSTED,   // Known trusted domain
        UNSAFE     // Suspicious or flagged domain
    }

    /**
     * Analyze a URL for safety.
     * @param url The URL to analyze
     * @return LinkSafetyStatus indicating safety level
     */
    public LinkSafetyStatus analyzeLink(String url) {
        // If URL is null/empty, treat as internal application (SAFE)
        if (url == null || url.trim().isEmpty()) {
            return LinkSafetyStatus.SAFE;
        }

        try {
            // Extract domain from URL
            String domain = extractDomain(url);
            
            // Check if domain is in trusted list
            if (TRUSTED_DOMAINS.contains(domain.toLowerCase())) {
                return LinkSafetyStatus.TRUSTED;
            }

            // Check if domain is in suspicious list
            if (SUSPICIOUS_DOMAINS.contains(domain.toLowerCase())) {
                return LinkSafetyStatus.UNSAFE;
            }

            // For unknown domains, perform HEAD request to check for redirects
            String finalUrl = resolveRedirects(url);
            String finalDomain = extractDomain(finalUrl);

            // Check if final domain is suspicious
            if (SUSPICIOUS_DOMAINS.contains(finalDomain.toLowerCase())) {
                return LinkSafetyStatus.UNSAFE;
            }

            // If not in any list and no suspicious redirects, consider it TRUSTED
            return LinkSafetyStatus.TRUSTED;

        } catch (Exception e) {
            // If any error occurs during analysis, mark as UNSAFE for safety
            System.out.println("[LinkGuard] Error analyzing URL: " + e.getMessage());
            return LinkSafetyStatus.UNSAFE;
        }
    }

    /**
     * Extract domain from URL
     */
    private String extractDomain(String url) {
        try {
            // Handle URLs without protocol
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            URL urlObj = new URL(url);
            String host = urlObj.getHost();
            
            // Remove 'www.' prefix if present for comparison
            if (host.startsWith("www.")) {
                return host;
            }
            
            return host;
        } catch (Exception e) {
            return url; // Return original if parsing fails
        }
    }

    /**
     * Resolve redirects by performing HEAD request
     */
    private String resolveRedirects(String urlString) {
        try {
            // Handle URLs without protocol
            if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
                urlString = "https://" + urlString;
            }

            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(5000); // 5 second timeout
            connection.setReadTimeout(5000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            int responseCode = connection.getResponseCode();
            
            // If it's a redirect (3xx), get the Location header
            if (responseCode >= 300 && responseCode < 400) {
                String redirectUrl = connection.getHeaderField("Location");
                if (redirectUrl != null) {
                    return redirectUrl;
                }
            }

            return urlString; // No redirect, return original
        } catch (Exception e) {
            // If we can't resolve, return original URL
            return urlString;
        }
    }

    /**
     * Check if link is safe (not UNSAFE)
     */
    public boolean isLinkSafe(String url) {
        return analyzeLink(url) != LinkSafetyStatus.UNSAFE;
    }
}
