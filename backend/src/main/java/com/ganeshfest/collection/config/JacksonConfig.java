package com.ganeshfest.collection.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers Hibernate6Module explicitly (rather than relying only on
 * classpath auto-detection) so lazy-proxy JSON serialization is safe
 * everywhere in the app, permanently - this is what stops the
 * "ByteBuddyInterceptor" crash for good, project-wide, for every current
 * and future entity, not just the ones with manual @JsonIgnore annotations.
 *
 * Uninitialized lazy associations serialize as null instead of crashing;
 * associations that are already loaded (e.g. explicitly fetched) still
 * serialize normally.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        // Do NOT force-load lazy associations just to serialize them - that
        // would trigger extra DB queries for every response. Leave them null
        // if not already loaded; we explicitly fetch what each endpoint needs.
        module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }
}
