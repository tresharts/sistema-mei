package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.categoria.Categoria;
import com.api.SistemaMEI.categoria.CategoriaRepository;
import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.exception.ResourceNotFoundException;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final CategoriaRepository categoriaRepository;

    private Movimentacao buscarMovimentacaoDoUsuario(UUID id, Usuario usuario) {
        return movimentacaoRepository
            .findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResourceNotFoundException("Movimentação não encontrada"));
    }

    private Categoria buscarCategoriaDoUsuario(UUID categoriaId, Usuario usuario) {
        return categoriaRepository
            .findByIdAndUsuario(categoriaId, usuario)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    private void validarStatusPorTipo(TipoMovimentacao tipo, StatusMovimentacao status) {
        boolean statusReceitaInvalido = tipo == TipoMovimentacao.RECEITA
            && status != StatusMovimentacao.RECEBIDO
            && status != StatusMovimentacao.A_RECEBER;

        if (statusReceitaInvalido) {
            throw new BusinessRuleException("Receita só pode ter status RECEBIDO ou A_RECEBER");
        }

        boolean statusDespesaInvalido = tipo == TipoMovimentacao.DESPESA
            && status != StatusMovimentacao.PAGO
            && status != StatusMovimentacao.A_PAGAR;

        if (statusDespesaInvalido) {
            throw new BusinessRuleException("Despesa só pode ter status PAGO ou A_PAGAR");
        }
    }

    private void validarCategoriaCompativel(
        Categoria categoria,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao
    ) {
        if (categoria.getTipo() != tipo) {
            throw new BusinessRuleException("Categoria deve ter o mesmo tipo da movimentação");
        }

        if (categoria.getClassificacao() != classificacao) {
            throw new BusinessRuleException("Categoria deve ter a mesma classificação da movimentação");
        }
    }

    private void validarDataVencimento(StatusMovimentacao status, LocalDate dataVencimento) {
        boolean statusPendente = status == StatusMovimentacao.A_PAGAR
            || status == StatusMovimentacao.A_RECEBER;

        if (statusPendente && dataVencimento == null) {
            throw new BusinessRuleException("Data de vencimento é obrigatória para movimentações pendentes");
        }
    }

    private MovimentacaoResponse toResponse(Movimentacao movimentacao) {
        return new MovimentacaoResponse(
            movimentacao.getId(),
            movimentacao.getValor(),
            movimentacao.getDescricao(),
            movimentacao.getData(),
            movimentacao.getDataVencimento(),
            movimentacao.getTipo(),
            movimentacao.getClassificacao(),
            movimentacao.getStatus(),
            movimentacao.getCategoria().getId(),
            movimentacao.getCategoria().getNome(),
            movimentacao.getCriadoEm(),
            movimentacao.getAtualizadoEm()
        );
    }

    @Transactional
    public MovimentacaoResponse criar(MovimentacaoRequest request, Usuario usuario) {
        validarStatusPorTipo(request.tipo(), request.status());
        validarDataVencimento(request.status(), request.dataVencimento());

        Categoria categoria = buscarCategoriaDoUsuario(request.categoriaId(), usuario);
        validarCategoriaCompativel(categoria, request.tipo(), request.classificacao());

        Movimentacao movimentacao = Movimentacao
            .builder()
            .valor(request.valor())
            .descricao(request.descricao().trim())
            .data(request.data())
            .dataVencimento(request.dataVencimento())
            .tipo(request.tipo())
            .classificacao(request.classificacao())
            .status(request.status())
            .categoria(categoria)
            .usuario(usuario)
            .build();

        Movimentacao movimentacaoSalva = movimentacaoRepository.save(movimentacao);
        return toResponse(movimentacaoSalva);
    }

    @Transactional(readOnly = true)
    public Page<MovimentacaoResponse> listar(
        Usuario usuario,
        LocalDate dataInicio,
        LocalDate dataFim,
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        ClassificacaoFinanceira classificacao,
        UUID categoriaId,
        Pageable pageable
    ) {
        return movimentacaoRepository
            .buscarComFiltros(
                usuario,
                dataInicio,
                dataFim,
                tipo,
                status,
                classificacao,
                categoriaId,
                pageable
            )
            .map(this::toResponse);
    }

    @Transactional
    public MovimentacaoResponse editar(UUID id, MovimentacaoRequest request, Usuario usuario) {
        Movimentacao movimentacao = buscarMovimentacaoDoUsuario(id, usuario);

        validarStatusPorTipo(request.tipo(), request.status());
        validarDataVencimento(request.status(), request.dataVencimento());

        Categoria categoria = buscarCategoriaDoUsuario(request.categoriaId(), usuario);
        validarCategoriaCompativel(categoria, request.tipo(), request.classificacao());

        movimentacao.setValor(request.valor());
        movimentacao.setDescricao(request.descricao().trim());
        movimentacao.setData(request.data());
        movimentacao.setDataVencimento(request.dataVencimento());
        movimentacao.setTipo(request.tipo());
        movimentacao.setClassificacao(request.classificacao());
        movimentacao.setStatus(request.status());
        movimentacao.setCategoria(categoria);

        Movimentacao movimentacaoSalva = movimentacaoRepository.save(movimentacao);
        return toResponse(movimentacaoSalva);
    }

    @Transactional
    public void excluir(UUID id, Usuario usuario) {
        Movimentacao movimentacao = buscarMovimentacaoDoUsuario(id, usuario);
        movimentacaoRepository.delete(movimentacao);
    }

    @Transactional
    public MovimentacaoResponse atualizarStatus(
        UUID id,
        AtualizarStatusMovimentacaoRequest request,
        Usuario usuario
    ) {
        Movimentacao movimentacao = buscarMovimentacaoDoUsuario(id, usuario);

        validarStatusPorTipo(movimentacao.getTipo(), request.status());
        validarDataVencimento(request.status(), movimentacao.getDataVencimento());

        movimentacao.setStatus(request.status());

        Movimentacao movimentacaoSalva = movimentacaoRepository.save(movimentacao);
        return toResponse(movimentacaoSalva);
    }
}
