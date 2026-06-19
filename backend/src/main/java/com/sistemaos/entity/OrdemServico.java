package com.sistemaos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ordens_servico")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    // --- Equipamento (inline na OS) ---
    @Column(name = "equipamento_tipo", length = 30)
    private String equipamentoTipo;

    @Column(name = "equipamento_marca", length = 100)
    private String equipamentoMarca;

    @Column(name = "equipamento_modelo", length = 100)
    private String equipamentoModelo;

    // --- Endereço do serviço (inline na OS) ---
    @Column(name = "servico_logradouro", length = 200)
    private String servicoLogradouro;

    @Column(name = "servico_numero", length = 20)
    private String servicoNumero;

    @Column(name = "servico_complemento", length = 100)
    private String servicoComplemento;

    @Column(name = "servico_bairro", length = 100)
    private String servicoBairro;

    @Column(name = "servico_cidade", length = 100)
    private String servicoCidade;

    @Column(name = "servico_estado", length = 2)
    private String servicoEstado;

    @Column(name = "servico_cep", length = 9)
    private String servicoCep;

    @Column(name = "servico_latitude", precision = 10, scale = 8)
    private BigDecimal servicoLatitude;

    @Column(name = "servico_longitude", precision = 11, scale = 8)
    private BigDecimal servicoLongitude;

    // --- Dados da OS ---
    @Column(name = "descricao_problema", columnDefinition = "TEXT")
    private String descricaoProblema;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusOS status = StatusOS.ABERTA;

    @Column(name = "valor_orcamento", precision = 10, scale = 2)
    private BigDecimal valorOrcamento;


    @Column(name = "data_abertura", nullable = false, updatable = false)
    private LocalDateTime dataAbertura;

    @Column(name = "data_agendamento")
    private LocalDateTime dataAgendamento;

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<StatusHistorico> historico = new ArrayList<>();

    public OrdemServico() {}

    @PrePersist
    private void prePersist() {
        if (dataAbertura == null) dataAbertura = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Usuario getTecnico() { return tecnico; }
    public void setTecnico(Usuario tecnico) { this.tecnico = tecnico; }

    public String getEquipamentoTipo() { return equipamentoTipo; }
    public void setEquipamentoTipo(String equipamentoTipo) { this.equipamentoTipo = equipamentoTipo; }

    public String getEquipamentoMarca() { return equipamentoMarca; }
    public void setEquipamentoMarca(String equipamentoMarca) { this.equipamentoMarca = equipamentoMarca; }

    public String getEquipamentoModelo() { return equipamentoModelo; }
    public void setEquipamentoModelo(String equipamentoModelo) { this.equipamentoModelo = equipamentoModelo; }


    public String getServicoLogradouro() { return servicoLogradouro; }
    public void setServicoLogradouro(String servicoLogradouro) { this.servicoLogradouro = servicoLogradouro; }

    public String getServicoNumero() { return servicoNumero; }
    public void setServicoNumero(String servicoNumero) { this.servicoNumero = servicoNumero; }

    public String getServicoComplemento() { return servicoComplemento; }
    public void setServicoComplemento(String servicoComplemento) { this.servicoComplemento = servicoComplemento; }

    public String getServicoBairro() { return servicoBairro; }
    public void setServicoBairro(String servicoBairro) { this.servicoBairro = servicoBairro; }

    public String getServicoCidade() { return servicoCidade; }
    public void setServicoCidade(String servicoCidade) { this.servicoCidade = servicoCidade; }

    public String getServicoEstado() { return servicoEstado; }
    public void setServicoEstado(String servicoEstado) { this.servicoEstado = servicoEstado; }

    public String getServicoCep() { return servicoCep; }
    public void setServicoCep(String servicoCep) { this.servicoCep = servicoCep; }

    public BigDecimal getServicoLatitude() { return servicoLatitude; }
    public void setServicoLatitude(BigDecimal servicoLatitude) { this.servicoLatitude = servicoLatitude; }

    public BigDecimal getServicoLongitude() { return servicoLongitude; }
    public void setServicoLongitude(BigDecimal servicoLongitude) { this.servicoLongitude = servicoLongitude; }

    public String getDescricaoProblema() { return descricaoProblema; }
    public void setDescricaoProblema(String descricaoProblema) { this.descricaoProblema = descricaoProblema; }

    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }

    public StatusOS getStatus() { return status; }
    public void setStatus(StatusOS status) { this.status = status; }

    public BigDecimal getValorOrcamento() { return valorOrcamento; }
    public void setValorOrcamento(BigDecimal valorOrcamento) { this.valorOrcamento = valorOrcamento; }


    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDateTime dataAbertura) { this.dataAbertura = dataAbertura; }

    public LocalDateTime getDataAgendamento() { return dataAgendamento; }
    public void setDataAgendamento(LocalDateTime dataAgendamento) { this.dataAgendamento = dataAgendamento; }

    public LocalDateTime getDataFechamento() { return dataFechamento; }
    public void setDataFechamento(LocalDateTime dataFechamento) { this.dataFechamento = dataFechamento; }

    public List<StatusHistorico> getHistorico() { return historico; }
    public void setHistorico(List<StatusHistorico> historico) { this.historico = historico; }

    public enum StatusOS {
        ABERTA, APROVADA, NAO_APROVADA, FECHADA
    }
}
