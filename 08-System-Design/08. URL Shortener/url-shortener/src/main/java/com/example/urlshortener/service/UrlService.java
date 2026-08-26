package com.example.urlshortener.service;

import com.example.urlshortener.entity.Url;
import com.example.urlshortener.repository.UrlRepository;
import com.example.urlshortener.util.Base62;
import org.springframework.stereotype.Service;

@Service
public class UrlService {

    private final UrlRepository urlRepository;

    public UrlService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    public String shortenUrl(String longUrl) {

        // 1. Create database record
        Url url = new Url(longUrl);

        // 2. Save it
        // Database generates the ID
        url = urlRepository.save(url);

        // 3. Get generated ID
        Long id = url.getId();

        // 4. Convert ID to Base62
        String shortCode = Base62.encode(id);

        // 5. Store short code
        url.setShortCode(shortCode);

        urlRepository.save(url);

        return shortCode;
    }

    public String getLongUrl(String shortCode) {

        // Convert Base62 back to ID
        long id = Base62.decode(shortCode);

        // Find URL using primary key
        Url url = urlRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("URL not found")
                );

        return url.getLongUrl();
    }
}
