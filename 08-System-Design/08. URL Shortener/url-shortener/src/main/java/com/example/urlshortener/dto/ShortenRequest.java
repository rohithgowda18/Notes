package com.example.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;

public class ShortenRequest {

    @NotBlank
    private String longUrl;

    public ShortenRequest() {
    }

    public String getLongUrl() {
        return longUrl;
    }

    public void setLongUrl(String longUrl) {
        this.longUrl = longUrl;
    }
}
