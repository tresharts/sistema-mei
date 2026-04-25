package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.categoria.Categoria;
import com.api.SistemaMEI.common.BaseEntity;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimentacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimentacao extends BaseEntity {

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private LocalDate data;

    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimentacao tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClassificacaoFinanceira classificacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusMovimentacao status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false, name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false, name = "usuario_id")
    private Usuario usuario;
}
