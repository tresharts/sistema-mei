package com.api.SistemaMEI.configuracao;

import com.api.SistemaMEI.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ConfiguracaoUsuarioService {

    private static final BigDecimal VALOR_DAS_PADRAO = new BigDecimal("72.00");
    private static final int DIA_LEMBRETE_DAS_PADRAO = 20;

    private final ConfiguracaoUsuarioRepository repository;

    @Transactional
    public ConfiguracaoUsuarioResponse buscar(Usuario usuario) {
        ConfiguracaoUsuario configuracao = obterOuCriar(usuario);
        return toResponse(configuracao);
    }

    @Transactional
    public ConfiguracaoUsuarioResponse atualizar(ConfiguracaoUsuarioRequest request, Usuario usuario) {
        ConfiguracaoUsuario configuracao = obterOuCriar(usuario);

        configuracao.setValorDas(formatarValor(request.valorDas()));
        configuracao.setNomeNegocio(normalizarTexto(request.nomeNegocio()));
        configuracao.setAtividade(normalizarTexto(request.atividade()));
        configuracao.setLembreteDasAtivo(request.lembreteDasAtivo());
        configuracao.setDiaLembreteDas(request.diaLembreteDas());
        configuracao.setResumoDiarioAtivo(request.resumoDiarioAtivo());

        ConfiguracaoUsuario configuracaoSalva = repository.save(configuracao);
        return toResponse(configuracaoSalva);
    }

    private ConfiguracaoUsuario obterOuCriar(Usuario usuario) {
        return repository
            .findByUsuario(usuario)
            .orElseGet(() -> repository.save(ConfiguracaoUsuario
                .builder()
                .valorDas(VALOR_DAS_PADRAO)
                .lembreteDasAtivo(true)
                .diaLembreteDas(DIA_LEMBRETE_DAS_PADRAO)
                .resumoDiarioAtivo(false)
                .usuario(usuario)
                .build()));
    }

    private ConfiguracaoUsuarioResponse toResponse(ConfiguracaoUsuario configuracao) {
        Usuario usuario = configuracao.getUsuario();

        return new ConfiguracaoUsuarioResponse(
            configuracao.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            configuracao.getNomeNegocio(),
            configuracao.getAtividade(),
            configuracao.getValorDas(),
            configuracao.isLembreteDasAtivo(),
            configuracao.getDiaLembreteDas(),
            configuracao.isResumoDiarioAtivo(),
            configuracao.getAtualizadoEm()
        );
    }

    private BigDecimal formatarValor(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizarTexto(String texto) {
        if (!StringUtils.hasText(texto)) {
            return null;
        }

        return texto.trim();
    }
}
