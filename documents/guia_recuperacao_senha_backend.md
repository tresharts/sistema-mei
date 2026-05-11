# Guia didático: recuperação de senha no backend

Este guia mostra como implementar, passo a passo, o backend de recuperação de senha no BoraMEI. A ideia é que uma pessoa que já conhece Java e Spring consiga construir a funcionalidade sozinha, entendendo o motivo de cada classe e decisão.

O foco aqui é aprendizado. Por isso, o código aparece aos poucos: primeiro o contrato, depois banco, entidade, repository, service, controller, segurança e testes.

## O que vamos construir

Fluxo desejado:

1. Usuário clica em "Esqueci minha senha" e informa o e-mail.
2. Backend recebe o e-mail em `POST /auth/forgot-password`.
3. Backend sempre responde sucesso, mesmo se o e-mail não existir.
4. Se o e-mail existir, backend gera um token temporário, salva apenas o hash do token e envia um link por e-mail.
5. Usuário acessa o link e envia nova senha para `POST /auth/reset-password`.
6. Backend valida token, expiração e uso anterior.
7. Backend atualiza a senha usando `PasswordEncoder`.
8. Token fica marcado como usado.

Regra importante: o backend nunca deve revelar se um e-mail está cadastrado. Isso evita enumeração de usuários.

## Onde encaixar no projeto

O projeto já tem autenticação em:

- `backend/src/main/java/com/api/SistemaMEI/auth`
- `backend/src/main/java/com/api/SistemaMEI/usuario`
- `backend/src/main/resources/db/migration`

Então a recuperação de senha também deve ficar principalmente em `auth`, seguindo o padrão atual.

Arquivos que vamos criar:

- `ForgotPasswordRequest.java`
- `ResetPasswordRequest.java`
- `PasswordResetToken.java`
- `PasswordResetTokenRepository.java`
- `PasswordResetService.java`
- `MailService.java`
- `LoggingMailService.java`
- migration `V10__create_password_reset_tokens_table.sql`

Arquivos que vamos alterar:

- `AuthController.java`
- `SecurityConfig.java`
- `UsuarioRepository.java`

## Passo 1: criar os contratos da API

Antes de pensar no banco, defina o que entra pela API.

Crie `backend/src/main/java/com/api/SistemaMEI/auth/ForgotPasswordRequest.java`:

```java
package com.api.SistemaMEI.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    String email
) {
}
```

Esse DTO representa a primeira tela: o usuário informa o e-mail. Não precisamos retornar token nesse endpoint.

Agora crie `backend/src/main/java/com/api/SistemaMEI/auth/ResetPasswordRequest.java`:

```java
package com.api.SistemaMEI.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Token é obrigatório")
    String token,

    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    String novaSenha,

    @NotBlank(message = "Confirmação de senha é obrigatória")
    String confirmacaoSenha
) {
    @AssertTrue(message = "A confirmação de senha deve ser igual à nova senha")
    public boolean isConfirmacaoSenhaValida() {
        return novaSenha != null && novaSenha.equals(confirmacaoSenha);
    }
}
```

Aqui o backend já garante duas coisas:

- senha com tamanho mínimo;
- confirmação igual à senha.

O frontend também deve validar, mas a regra que realmente protege o sistema precisa estar no backend.

## Passo 2: criar a migration

Vamos guardar tokens de recuperação em uma tabela própria. O token puro não deve ser salvo no banco. Salve somente um hash.

Crie `backend/src/main/resources/db/migration/V10__create_password_reset_tokens_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY,
    criado_em TIMESTAMP(6) NOT NULL,
    atualizado_em TIMESTAMP(6) NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP(6) WITH TIME ZONE,
    usuario_id UUID NOT NULL,

    CONSTRAINT fk_password_reset_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_usuario_id
    ON password_reset_tokens (usuario_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_expires_at
    ON password_reset_tokens (expires_at);
```

Por que esses campos existem:

- `token_hash`: hash do token enviado ao usuário.
- `expires_at`: data/hora limite de uso.
- `used_at`: preenchido quando o token já foi usado.
- `usuario_id`: dono do token.

O `ON DELETE CASCADE` aqui é aceitável porque se um usuário for apagado, tokens de reset dele não têm mais utilidade.

## Passo 3: criar a entidade

Crie `backend/src/main/java/com/api/SistemaMEI/auth/PasswordResetToken.java`:

```java
package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.common.BaseEntity;
import com.api.SistemaMEI.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken extends BaseEntity {

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
```

Note que a entidade usa `BaseEntity`, igual ao restante do projeto. Isso reaproveita `id`, `criadoEm` e `atualizadoEm`.

## Passo 4: criar o repository

Crie `backend/src/main/java/com/api/SistemaMEI/auth/PasswordResetTokenRepository.java`:

```java
package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
        UPDATE PasswordResetToken t
        SET t.usedAt = :usedAt
        WHERE t.usuario = :usuario
          AND t.usedAt IS NULL
        """)
    void marcarTokensAbertosComoUsados(
        @Param("usuario") Usuario usuario,
        @Param("usedAt") Instant usedAt
    );
}
```

A query `marcarTokensAbertosComoUsados` invalida tokens anteriores antes de gerar um novo. Isso evita vários links de recuperação ativos ao mesmo tempo.

## Passo 5: melhorar busca de usuário por e-mail

O repository atual busca por e-mail exato. Para recuperação de senha, é mais confortável aceitar variação de maiúsculas/minúsculas.

Em `UsuarioRepository.java`, adicione:

```java
@Query("SELECT u FROM Usuario u WHERE LOWER(u.email) = LOWER(:email)")
Optional<Usuario> findByEmailIgnoreCase(@Param("email") String email);
```

Ficará junto de `findByEmail` e `existsByEmail`.

## Passo 6: criar uma camada de e-mail

No começo, não prenda a implementação a SMTP, SendGrid ou outro provedor. Crie uma interface simples.

Crie `backend/src/main/java/com/api/SistemaMEI/auth/MailService.java`:

```java
package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.usuario.Usuario;

public interface MailService {

    void sendPasswordResetEmail(Usuario usuario, String resetLink);
}
```

Agora crie uma implementação inicial que apenas loga o link em ambiente local.

Crie `backend/src/main/java/com/api/SistemaMEI/auth/LoggingMailService.java`:

```java
package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.usuario.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"dev", "test"})
@Slf4j
public class LoggingMailService implements MailService {

    @Override
    public void sendPasswordResetEmail(Usuario usuario, String resetLink) {
        log.info(
            "Link de recuperação de senha para {}: {}",
            usuario.getEmail(),
            resetLink
        );
    }
}
```

Isso ajuda no desenvolvimento. Em produção, você deve criar outra classe, por exemplo `SmtpMailService`, usando o provedor real.

Se o projeto não estiver usando profile `dev`, há duas opções:

- remover temporariamente `@Profile`;
- ou garantir que o ambiente local rode com `SPRING_PROFILES_ACTIVE=dev`.

## Passo 7: implementar o service principal

Agora vem a regra de negócio.

Crie `backend/src/main/java/com/api/SistemaMEI/auth/PasswordResetService.java`.

Comece pela estrutura:

```java
package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${frontend.url}")
    private String frontendUrl;
}
```

Agora adicione o método que solicita recuperação:

```java
@Transactional
public void requestPasswordReset(ForgotPasswordRequest request) {
    String email = request.email().trim();

    usuarioRepository
        .findByEmailIgnoreCase(email)
        .ifPresent(this::createResetTokenAndSendEmail);
}
```

Repare que o método não retorna erro quando o e-mail não existe. Ele simplesmente não faz nada. O controller responderá sucesso do mesmo jeito.

Agora adicione o método privado:

```java
private void createResetTokenAndSendEmail(Usuario usuario) {
    Instant now = Instant.now();
    String rawToken = generateRawToken();
    String tokenHash = hashToken(rawToken);

    tokenRepository.marcarTokensAbertosComoUsados(usuario, now);

    PasswordResetToken resetToken = PasswordResetToken
        .builder()
        .usuario(usuario)
        .tokenHash(tokenHash)
        .expiresAt(now.plus(TOKEN_TTL))
        .build();

    tokenRepository.save(resetToken);

    String resetLink = frontendUrl + "/redefinir-senha?token=" + rawToken;
    mailService.sendPasswordResetEmail(usuario, resetLink);
}
```

O token puro (`rawToken`) só aparece no link enviado ao usuário. No banco vai apenas `tokenHash`.

Agora implemente o reset:

```java
@Transactional
public void resetPassword(ResetPasswordRequest request) {
    Instant now = Instant.now();
    String tokenHash = hashToken(request.token());

    PasswordResetToken resetToken = tokenRepository
        .findByTokenHash(tokenHash)
        .orElseThrow(() -> new BusinessRuleException("Token inválido ou expirado"));

    if (resetToken.isUsed() || resetToken.isExpired(now)) {
        throw new BusinessRuleException("Token inválido ou expirado");
    }

    Usuario usuario = resetToken.getUsuario();
    usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
    resetToken.setUsedAt(now);
}
```

Como o método está dentro de uma transação, o JPA salva as alterações em `usuario` e `resetToken` ao final.

Por fim, adicione os métodos auxiliares:

```java
private String generateRawToken() {
    byte[] bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return Base64
        .getUrlEncoder()
        .withoutPadding()
        .encodeToString(bytes);
}

private String hashToken(String rawToken) {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
        return Base64
            .getUrlEncoder()
            .withoutPadding()
            .encodeToString(hash);
    } catch (NoSuchAlgorithmException ex) {
        throw new IllegalStateException("SHA-256 não disponível", ex);
    }
}
```

Por que `Base64.getUrlEncoder()`? Porque o token vai na URL. Esse formato evita caracteres problemáticos como `/` e `+`.

## Passo 8: expor endpoints no AuthController

Altere `AuthController.java` para receber `PasswordResetService`:

```java
private final PasswordResetService passwordResetService;
```

Depois adicione os endpoints:

```java
@PostMapping("/forgot-password")
public ResponseEntity<Void> forgotPassword(
    @Valid @RequestBody ForgotPasswordRequest request
) {
    passwordResetService.requestPasswordReset(request);
    return ResponseEntity.noContent().build();
}

@PostMapping("/reset-password")
public ResponseEntity<Void> resetPassword(
    @Valid @RequestBody ResetPasswordRequest request
) {
    passwordResetService.resetPassword(request);
    return ResponseEntity.noContent().build();
}
```

Por que `204 No Content`? Porque a operação não precisa devolver dados. No caso de `forgot-password`, isso também ajuda a manter a resposta genérica.

## Passo 9: liberar endpoints no SecurityConfig

Esses endpoints precisam ser públicos, porque o usuário ainda não está autenticado.

Em `SecurityConfig.java`, adicione:

```java
req.requestMatchers(HttpMethod.POST, "/auth/forgot-password")
    .permitAll();
req.requestMatchers(HttpMethod.POST, "/auth/reset-password")
    .permitAll();
```

Coloque junto dos outros endpoints públicos de auth.

## Passo 10: configurar envio real em produção

O `LoggingMailService` serve para desenvolvimento. Em produção, crie outra implementação.

Exemplo de contrato:

```java
@Service
@Profile("prod")
@RequiredArgsConstructor
public class SmtpMailService implements MailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(Usuario usuario, String resetLink) {
        // montar e enviar e-mail real
    }
}
```

Para usar `JavaMailSender`, você adicionaria a dependência:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

E variáveis como:

```yaml
spring:
  mail:
    host: ${MAIL_HOST:}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME:}
    password: ${MAIL_PASSWORD:}
```

Não implemente envio real antes de decidir o provedor. Para aprendizado, o log local já permite testar o fluxo.

## Passo 11: escrever testes de service

O service é onde estão as regras mais importantes. Teste primeiro ele.

Cenários mínimos:

1. Quando e-mail existe, gera token e chama `mailService`.
2. Quando e-mail não existe, não lança erro.
3. Quando token é válido, atualiza senha e marca token como usado.
4. Quando token está expirado, lança `BusinessRuleException`.
5. Quando token já foi usado, lança `BusinessRuleException`.

Exemplo parcial:

```java
@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MailService mailService;

    @InjectMocks
    private PasswordResetService service;

    @Test
    void deveIgnorarEmailInexistenteSemRevelarConta() {
        ForgotPasswordRequest request =
            new ForgotPasswordRequest("naoexiste@email.com");

        when(usuarioRepository.findByEmailIgnoreCase("naoexiste@email.com"))
            .thenReturn(Optional.empty());

        service.requestPasswordReset(request);

        verify(tokenRepository, never()).save(any());
        verify(mailService, never()).sendPasswordResetEmail(any(), any());
    }
}
```

Esse teste ensina a regra principal: e-mail inexistente não gera erro visível.

## Passo 12: escrever testes de controller

Depois do service, teste a API.

Cenários mínimos:

- `POST /auth/forgot-password` com e-mail válido retorna `204`.
- `POST /auth/forgot-password` com e-mail inválido retorna `400`.
- `POST /auth/reset-password` com senha e confirmação diferentes retorna `400`.
- `POST /auth/reset-password` com token inválido retorna `422`.

O projeto já usa `ProblemDetail` no `GlobalExceptionHandler`, então erros de validação e regra de negócio seguem o padrão atual.

## Passo 13: validar migration

Rode os testes normais:

```bash
cd backend
./mvnw test
```

Se Docker estiver disponível, também rode o teste de migrations com Postgres/Testcontainers que já existe no projeto:

```bash
cd backend
./mvnw test -Dtest=FlywayPostgresMigrationTest
```

Esse teste ajuda a pegar diferenças entre H2 e Postgres.

## Passo 14: teste manual do fluxo

Com backend rodando:

1. Faça cadastro de um usuário.
2. Chame `POST /auth/forgot-password` com o e-mail cadastrado.
3. Veja o link no log do backend.
4. Pegue o `token` da URL.
5. Chame `POST /auth/reset-password`.
6. Tente login com a senha nova.
7. Tente usar o mesmo token de novo. Deve falhar.

Payload de solicitação:

```json
{
  "email": "usuario@email.com"
}
```

Payload de redefinição:

```json
{
  "token": "TOKEN_RECEBIDO_NO_LINK",
  "novaSenha": "novaSenha123",
  "confirmacaoSenha": "novaSenha123"
}
```

## Pontos de atenção

- Não salve token puro no banco.
- Não retorne mensagem diferente para e-mail inexistente.
- Não deixe token sem expiração.
- Não permita reutilizar token.
- Não atualize senha sem `PasswordEncoder`.
- Não logue token em produção.
- Não esqueça de liberar os endpoints no `SecurityConfig`.
- Não implemente e-mail real antes de configurar variáveis e provedor com segurança.

## Checklist final

- DTOs criados.
- Migration `V10` criada.
- Entidade `PasswordResetToken` criada.
- Repository criado.
- `UsuarioRepository` com busca case-insensitive.
- `MailService` criado.
- `PasswordResetService` implementado.
- `AuthController` expondo os endpoints.
- `SecurityConfig` liberando os endpoints.
- Testes de service criados.
- Testes de controller criados.
- Fluxo manual validado com login usando senha nova.

Quando esse checklist estiver completo, o backend de recuperação de senha estará pronto para o frontend consumir.
