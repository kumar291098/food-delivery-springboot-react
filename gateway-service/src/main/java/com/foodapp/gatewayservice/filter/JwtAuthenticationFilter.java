package com.foodapp.gatewayservice.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final SecretKey key;

    public JwtAuthenticationFilter() {
        super(Config.class);
        String secret = "9a4f2c8d3b7a1e5f8g2h6i0j4k8l2m6n0o4p8q2r6s0t4u8v2w6x0y4z8A2B6C0";
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public static class Config {
        // config parameters if needed
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 1. Exclude public endpoints
            String path = request.getURI().getPath();
            if (path.contains("/api/users/login") || path.contains("/api/users/register") || 
                (path.contains("/api/restaurants") && request.getMethod().name().equals("GET"))) {
                return chain.filter(exchange);
            }

            // 2. Extract and check Authorization header
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Missing or Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // 3. Validate Token
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // 4. Mutate request headers to propagate user details downstream
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", claims.getSubject())
                        .header("X-User-Email", claims.get("email", String.class))
                        .header("X-User-Role", claims.get("role", String.class))
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                return onError(exchange, "Invalid JWT Token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
}
