package com.api.SistemaMEI.config;

import com.api.SistemaMEI.auth.AuthResponse;
import com.api.SistemaMEI.auth.AuthService;
import com.api.SistemaMEI.auth.SecurityFilter;
import com.api.SistemaMEI.auth.TokenService;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SecurityFilter securityFilter;
    private final AuthService authService;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(req -> {
                req.requestMatchers(HttpMethod.POST, "/auth/register")
                    .permitAll();
                req.requestMatchers(HttpMethod.POST, "/auth/login")
                    .permitAll();
                req.requestMatchers(HttpMethod.POST, "/auth/refresh")
                    .permitAll();
                req.anyRequest().authenticated();
            })
            .oauth2Login(oauth2 -> oauth2
                .successHandler((request, response, authentication) -> {
                    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

                    String email = oAuth2User.getAttribute("email");
                    String nome = oAuth2User.getAttribute("name");

                    AuthResponse returnTokens = authService.loginWithGoogle(email, nome);

                    String urlRedirect = frontendUrl
                        + "/google-callback?token"
                        + "&refreshToken="
                        + returnTokens.refreshToken();

                    response.sendRedirect(urlRedirect);
                }))
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
