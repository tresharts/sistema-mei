package com.api.SistemaMEI.configuracao;

import com.api.SistemaMEI.common.BaseEntity;
import com.api.SistemaMEI.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "configuracoes_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoUsuario extends BaseEntity {

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDas;

    @Column(length = 120)
    private String nomeNegocio;

    @Column(length = 120)
    private String atividade;

    @Column(nullable = false)
    private boolean lembreteDasAtivo;

    @Column(nullable = false)
    private int diaLembreteDas;

    @Column(nullable = false)
    private boolean resumoDiarioAtivo;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false, name = "usuario_id", unique = true)
    private Usuario usuario;
}
