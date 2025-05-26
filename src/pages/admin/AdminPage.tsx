import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ref, get, query, orderByChild } from 'firebase/database';
import { database } from '../../firebase/config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Registrar componentes do Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title
);

// Interface para dados de atendimento
interface AtendimentoData {
  id: string;
  setor: string;
  timestamp: string;
  createdAt: number;
  nomeCliente: string;
  [key: string]: any; // Para campos dinâmicos adicionais
}

const AdminPage = () => {
  // Estados para armazenar dados
  const [lojaFisicaData, setLojaFisicaData] = useState<AtendimentoData[]>([]);
  const [whatsappData, setWhatsappData] = useState<AtendimentoData[]>([]);
  const [caixaData, setCaixaData] = useState<AtendimentoData[]>([]);
  const [allData, setAllData] = useState<AtendimentoData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedVendedor, setSelectedVendedor] = useState('all');
  const [selectedTipoAtendimento, setSelectedTipoAtendimento] = useState('all');
  const [selectedCanal, setSelectedCanal] = useState('all');
  const [valorRange, setValorRange] = useState({ min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para visualização ativa
  const [activeView, setActiveView] = useState('dashboard');
  const [activeReport, setActiveReport] = useState('geral');



  // Carregar dados do Firebase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar dados da Loja Física
        const lojaFisicaRef = ref(database, 'atendimentos/loja-fisica');
        const lojaFisicaSnapshot = await get(lojaFisicaRef);
        
        if (lojaFisicaSnapshot.exists()) {
          const data: AtendimentoData[] = [];
          lojaFisicaSnapshot.forEach((childSnapshot) => {
            data.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val(),
              setor: 'loja-fisica'
            });
          });
          setLojaFisicaData(data);
        }
        
        // Buscar dados do WhatsApp/Instagram
        const whatsappRef = ref(database, 'atendimentos/whatsapp-instagram');
        const whatsappSnapshot = await get(whatsappRef);
        
        if (whatsappSnapshot.exists()) {
          const data: AtendimentoData[] = [];
          whatsappSnapshot.forEach((childSnapshot) => {
            data.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val(),
              setor: 'whatsapp-instagram'
            });
          });
          setWhatsappData(data);
        }
        
        // Buscar dados do Caixa
        const caixaRef = ref(database, 'atendimentos/caixa');
        const caixaSnapshot = await get(caixaRef);
        
        if (caixaSnapshot.exists()) {
          const data: AtendimentoData[] = [];
          caixaSnapshot.forEach((childSnapshot) => {
            data.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val(),
              setor: 'caixa'
            });
          });
          setCaixaData(data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Combinar todos os dados quando os dados individuais mudarem
  useEffect(() => {
    setAllData([...lojaFisicaData, ...whatsappData, ...caixaData]);
  }, [lojaFisicaData, whatsappData, caixaData]);
  
  // Aplicar filtros aos dados
  const filteredData = allData.filter(item => {
    // Filtro por setor
    if (selectedSector !== 'all' && item.setor !== selectedSector) {
      return false;
    }
    
    // Filtro por vendedor/atendente/operador
    if (selectedVendedor !== 'all') {
      const vendedorField = item.setor === 'loja-fisica' ? 'vendedor' : 
                           item.setor === 'whatsapp-instagram' ? 'atendente' : 'operador';
      if (item[vendedorField] !== selectedVendedor) {
        return false;
      }
    }
    
    // Filtro por tipo de atendimento/interação/operação
    if (selectedTipoAtendimento !== 'all') {
      const tipoField = item.setor === 'loja-fisica' ? 'tipoAtendimento' : 
                       item.setor === 'whatsapp-instagram' ? 'tipoInteracao' : 'tipoOperacao';
      if (item[tipoField] !== selectedTipoAtendimento) {
        return false;
      }
    }
    
    // Filtro por canal
    if (selectedCanal !== 'all') {
      const canalField = item.setor === 'whatsapp-instagram' ? 'canal' : 'canalAtendimento';
      if (item[canalField] !== selectedCanal) {
        return false;
      }
    }
    
    // Filtro por valor
    if (valorRange.min && valorRange.max) {
      const valorField = item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' ? 'valorVenda' :
                        item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' ? 'valorVenda' :
                        item.setor === 'caixa' ? 'valorTotal' : null;
      
      if (valorField && (item[valorField] < parseFloat(valorRange.min) || item[valorField] > parseFloat(valorRange.max))) {
        return false;
      }
    }
    
    // Filtro por termo de busca (nome do cliente ou produto)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const clienteMatch = item.nomeCliente && item.nomeCliente.toLowerCase().includes(searchLower);
      
      const produtoField = item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' ? 'produtoVendido' :
                          item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-nao-concluida' ? 'produtoInteresse' :
                          item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' ? 'produtoVendido' :
                          item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'pedido-informacao' ? 'produtoInteresse' : null;
      
      const produtoMatch = produtoField && item[produtoField] && item[produtoField].toLowerCase().includes(searchLower);
      
      if (!clienteMatch && !produtoMatch) {
        return false;
      }
    }
    
    // Filtro por data
    if (dateRange.start && dateRange.end) {
      const itemDate = new Date(item.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Definir para o final do dia
      
      if (itemDate < startDate || itemDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
  
  // Preparar dados para gráficos
  const prepareChartData = () => {
    // Dados para gráfico de pizza de distribuição por setor
    const setorData = {
      labels: ['Loja Física', 'WhatsApp/Instagram', 'Caixa'],
      datasets: [
        {
          label: 'Atendimentos por Setor',
          data: [
            lojaFisicaData.length,
            whatsappData.length,
            caixaData.length
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Dados para gráfico de barras de desempenho por vendedor
    const vendedores = ['Daniele', 'Kaylane', 'Fabiola', 'Eduarda'];
    const vendedorData = {
      labels: vendedores,
      datasets: [
        {
          label: 'Total de Atendimentos',
          data: vendedores.map(vendedor => 
            allData.filter(item => {
              const vendedorField = item.setor === 'loja-fisica' ? 'vendedor' : 
                                   item.setor === 'whatsapp-instagram' ? 'atendente' : 'operador';
              return item[vendedorField] === vendedor;
            }).length
          ),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Vendas Concluídas',
          data: vendedores.map(vendedor => 
            allData.filter(item => {
              const vendedorField = item.setor === 'loja-fisica' ? 'vendedor' : 
                                   item.setor === 'whatsapp-instagram' ? 'atendente' : 'operador';
              return item[vendedorField] === vendedor && 
                    ((item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida') ||
                     (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta'));
            }).length
          ),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Dados para gráfico de linha de clientes por dia (últimos 30 dias)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const dateLabels = [];
    const clientesData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      dateLabels.push(dateString);
      
      const clientesCount = allData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toISOString().split('T')[0] === dateString;
      }).length;
      
      clientesData.push(clientesCount);
    }
    
    const clientesPorDiaData = {
      labels: dateLabels,
      datasets: [
        {
          label: 'Clientes Atendidos',
          data: clientesData,
          fill: false,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          tension: 0.1
        }
      ]
    };
    
    // Dados para gráfico de pizza de tipos de atendimento na Loja Física
    const tiposAtendimentoLojaFisica = {
      labels: ['Venda Concluída', 'Venda não Concluída', 'Troca', 'Prova'],
      datasets: [
        {
          label: 'Tipos de Atendimento',
          data: [
            lojaFisicaData.filter(item => item.tipoAtendimento === 'venda-concluida').length,
            lojaFisicaData.filter(item => item.tipoAtendimento === 'venda-nao-concluida').length,
            lojaFisicaData.filter(item => item.tipoAtendimento === 'troca').length,
            lojaFisicaData.filter(item => item.tipoAtendimento === 'prova').length
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Dados para gráfico de pizza de canais no WhatsApp/Instagram
    const canaisWhatsappInstagram = {
      labels: ['Instagram', 'WhatsApp', 'Facebook'],
      datasets: [
        {
          label: 'Canais',
          data: [
            whatsappData.filter(item => item.canal === 'instagram').length,
            whatsappData.filter(item => item.canal === 'whatsapp').length,
            whatsappData.filter(item => item.canal === 'facebook').length
          ],
          backgroundColor: [
            'rgba(153, 102, 255, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)'
          ],
          borderColor: [
            'rgba(153, 102, 255, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Dados para gráfico de pizza de formas de pagamento no Caixa
    const formasPagamentoCaixa = {
      labels: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência'],
      datasets: [
        {
          label: 'Formas de Pagamento',
          data: [
            caixaData.filter(item => item.formaPagamento === 'dinheiro').length,
            caixaData.filter(item => item.formaPagamento === 'cartao-credito').length,
            caixaData.filter(item => item.formaPagamento === 'cartao-debito').length,
            caixaData.filter(item => item.formaPagamento === 'pix').length,
            caixaData.filter(item => item.formaPagamento === 'transferencia').length
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
    
    return {
      setorData,
      vendedorData,
      clientesPorDiaData,
      tiposAtendimentoLojaFisica,
      canaisWhatsappInstagram,
      formasPagamentoCaixa
    };
  };
  
  const chartData = prepareChartData();
  
  // Calcular estatísticas
  const calcularEstatisticas = () => {
    // Total de atendimentos
    const totalAtendimentos = allData.length;
    
    // Total de vendas concluídas
    const totalVendasConcluidas = allData.filter(item => 
      (item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida') ||
      (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta')
    ).length;
    
    // Valor total de vendas
    const valorTotalVendas = allData.reduce((total, item) => {
      if ((item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' && item.valorVenda) ||
          (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' && item.valorVenda) ||
          (item.setor === 'caixa' && item.tipoOperacao === 'pagamento-compra' && item.valorTotal)) {
        const valor = item.valorVenda || item.valorTotal || 0;
        return total + parseFloat(valor);
      }
      return total;
    }, 0);
    
    // Média de clientes por dia
    const clientesPorDia: {[key: string]: number} = {};
    allData.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      clientesPorDia[date] = (clientesPorDia[date] || 0) + 1;
    });
    
    const mediaClientesPorDia = Object.keys(clientesPorDia).length > 0 
      ? (Object.values(clientesPorDia).reduce((a, b) => a + b, 0) / Object.keys(clientesPorDia).length).toFixed(1)
      : 0;
    
    // Taxa de conversão
    const taxaConversao = totalAtendimentos > 0 
      ? ((totalVendasConcluidas / totalAtendimentos) * 100).toFixed(1)
      : 0;
    
    // Estatísticas por vendedor
    const estatisticasPorVendedor = ['Daniele', 'Kaylane', 'Fabiola', 'Eduarda'].map(vendedor => {
      const atendimentos = allData.filter(item => {
        const vendedorField = item.setor === 'loja-fisica' ? 'vendedor' : 
                             item.setor === 'whatsapp-instagram' ? 'atendente' : 'operador';
        return item[vendedorField] === vendedor;
      });
      
      const vendasConcluidas = atendimentos.filter(item => 
        (item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida') ||
        (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta')
      );
      
      const valorTotal = atendimentos.reduce((total, item) => {
        if ((item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' && item.valorVenda) ||
            (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' && item.valorVenda) ||
            (item.setor === 'caixa' && item.tipoOperacao === 'pagamento-compra' && item.valorTotal)) {
          const valor = item.valorVenda || item.valorTotal || 0;
          return total + parseFloat(valor);
        }
        return total;
      }, 0);
      
      const taxaConversaoVendedor = atendimentos.length > 0 
        ? ((vendasConcluidas.length / atendimentos.length) * 100).toFixed(1)
        : 0;
      
      return {
        vendedor,
        totalAtendimentos: atendimentos.length,
        vendasConcluidas: vendasConcluidas.length,
        valorTotal: valorTotal.toFixed(2),
        taxaConversao: taxaConversaoVendedor
      };
    });
    
    // Estatísticas por canal
    const canais = ['presencial', 'whatsapp', 'instagram', 'facebook'];
    const estatisticasPorCanal = canais.map(canal => {
      const atendimentos = allData.filter(item => {
        if (item.setor === 'loja-fisica' && item.canalAtendimento === canal) return true;
        if (item.setor === 'whatsapp-instagram' && item.canal === canal) return true;
        return false;
      });
      
      const vendasConcluidas = atendimentos.filter(item => 
        (item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida') ||
        (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta')
      );
      
      const valorTotal = atendimentos.reduce((total, item) => {
        if ((item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' && item.valorVenda) ||
            (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' && item.valorVenda)) {
          const valor = item.valorVenda || 0;
          return total + parseFloat(valor);
        }
        return total;
      }, 0);
      
      const taxaConversaoCanal = atendimentos.length > 0 
        ? ((vendasConcluidas.length / atendimentos.length) * 100).toFixed(1)
        : 0;
      
      return {
        canal: canal.charAt(0).toUpperCase() + canal.slice(1),
        totalAtendimentos: atendimentos.length,
        vendasConcluidas: vendasConcluidas.length,
        valorTotal: valorTotal.toFixed(2),
        taxaConversao: taxaConversaoCanal
      };
    }).filter(item => item.totalAtendimentos > 0);
    
    return {
      totalAtendimentos,
      totalVendasConcluidas,
      valorTotalVendas: valorTotalVendas.toFixed(2),
      mediaClientesPorDia,
      taxaConversao,
      estatisticasPorVendedor,
      estatisticasPorCanal
    };
  };
  
  const estatisticas = calcularEstatisticas();
  
  // Renderizar tabela de dados
  const renderTabela = () => {
    if (filteredData.length === 0) {
      return <p>Nenhum dado encontrado com os filtros selecionados.</p>;
    }
    
    // Determinar colunas com base no setor selecionado
    let colunas: string[] = [];
    
    if (selectedSector === 'all') {
      colunas = ['Setor', 'Data', 'Nome do Cliente', 'Vendedor/Atendente', 'Tipo', 'Canal', 'Valor', 'Ações'];
    } else if (selectedSector === 'loja-fisica') {
      colunas = ['Data', 'Vendedor', 'Nome do Cliente', 'Tipo de Atendimento', 'Canal', 'Produto', 'Valor', 'Ações'];
    } else if (selectedSector === 'whatsapp-instagram') {
      colunas = ['Data', 'Atendente', 'Nome do Cliente', 'Canal', 'Tipo de Interação', 'Produto', 'Valor', 'Ações'];
    } else if (selectedSector === 'caixa') {
      colunas = ['Data', 'Operador', 'Nome do Cliente', 'Tipo de Operação', 'Valor', 'Forma de Pagamento', 'Ações'];
    }
    
    return (
      <TabelaContainer>
        <Tabela>
          <thead>
            <tr>
              {colunas.map((coluna, index) => (
                <th key={index}>{coluna}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                {selectedSector === 'all' && (
                  <td>{item.setor === 'loja-fisica' ? 'Loja Física' : 
                      item.setor === 'whatsapp-instagram' ? 'WhatsApp/Instagram' : 'Caixa'}</td>
                )}
                <td>{new Date(item.timestamp).toLocaleDateString('pt-BR')}</td>
                <td>{item.nomeCliente}</td>
                <td>
                  {item.setor === 'loja-fisica' ? item.vendedor : 
                   item.setor === 'whatsapp-instagram' ? item.atendente : item.operador}
                </td>
                <td>
                  {item.setor === 'loja-fisica' ? 
                    (item.tipoAtendimento === 'venda-concluida' ? 'Venda Concluída' :
                     item.tipoAtendimento === 'venda-nao-concluida' ? 'Venda não Concluída' :
                     item.tipoAtendimento === 'troca' ? 'Troca' : 'Prova') :
                   item.setor === 'whatsapp-instagram' ?
                    (item.tipoInteracao === 'pedido-informacao' ? 'Pedido de Informação' :
                     item.tipoInteracao === 'compra-direta' ? 'Compra Direta' : 'Prova') :
                    (item.tipoOperacao === 'pagamento-compra' ? 'Pagamento de Compra' :
                     item.tipoOperacao === 'troca' ? 'Troca' :
                     item.tipoOperacao === 'consulta-parcela' ? 'Consulta de Parcela' : 'Pagamento de Carnê')
                  }
                </td>
                {(selectedSector === 'all' || selectedSector === 'loja-fisica' || selectedSector === 'whatsapp-instagram') && (
                  <td>
                    {item.setor === 'loja-fisica' ? 
                      (item.canalAtendimento === 'presencial' ? 'Presencial' : 'WhatsApp') :
                     item.setor === 'whatsapp-instagram' ?
                      (item.canal === 'instagram' ? 'Instagram' :
                       item.canal === 'whatsapp' ? 'WhatsApp' : 'Facebook') : '-'
                    }
                  </td>
                )}
                {(selectedSector === 'loja-fisica' || selectedSector === 'whatsapp-instagram') && (
                  <td>
                    {item.setor === 'loja-fisica' ? 
                      (item.tipoAtendimento === 'venda-concluida' ? item.produtoVendido :
                       item.tipoAtendimento === 'venda-nao-concluida' ? item.produtoInteresse :
                       item.tipoAtendimento === 'prova' ? item.produtosProva : '-') :
                     item.tipoInteracao === 'compra-direta' ? item.produtoVendido :
                     item.tipoInteracao === 'pedido-informacao' ? item.produtoInteresse :
                     item.tipoInteracao === 'prova' ? item.produtosProva : '-'
                    }
                  </td>
                )}
                <td>
                  {item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' ? `R$ ${item.valorVenda || 0}` :
                   item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' ? `R$ ${item.valorVenda || 0}` :
                   item.setor === 'caixa' ? `R$ ${item.valorTotal || 0}` : '-'}
                </td>
                {selectedSector === 'caixa' && (
                  <td>{item.formaPagamento}</td>
                )}
                <td>
                  <button onClick={() => alert(`Detalhes do registro ${item.id}`)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </TabelaContainer>
    );
  };
  
  // Renderizar dashboard
  const renderDashboard = () => {
    return (
      <DashboardContainer>
        <CardsContainer>
          <Card>
            <h3>Total de Atendimentos</h3>
            <p>{estatisticas.totalAtendimentos}</p>
          </Card>
          <Card>
            <h3>Vendas Concluídas</h3>
            <p>{estatisticas.totalVendasConcluidas}</p>
          </Card>
          <Card>
            <h3>Valor Total</h3>
            <p>R$ {estatisticas.valorTotalVendas}</p>
          </Card>
          <Card>
            <h3>Média de Clientes/Dia</h3>
            <p>{estatisticas.mediaClientesPorDia}</p>
          </Card>
          <Card>
            <h3>Taxa de Conversão</h3>
            <p>{estatisticas.taxaConversao}%</p>
          </Card>
        </CardsContainer>
        
        <GraficosContainer>
          <GraficoBox>
            <h3>Clientes Atendidos por Dia</h3>
            <Line data={chartData.clientesPorDiaData} options={{ responsive: true, maintainAspectRatio: false }} />
          </GraficoBox>
          
          <GraficoBox>
            <h3>Distribuição por Setor</h3>
            <Pie data={chartData.setorData} options={{ responsive: true, maintainAspectRatio: false }} />
          </GraficoBox>
          
          <GraficoBox>
            <h3>Desempenho por Vendedor</h3>
            <Bar data={chartData.vendedorData} options={{ responsive: true, maintainAspectRatio: false }} />
          </GraficoBox>
        </GraficosContainer>
      </DashboardContainer>
    );
  };
  
  // Renderizar relatórios
  const renderRelatorios = () => {
    if (activeReport === 'geral') {
      return (
        <RelatorioContainer>
          <h2>Relatório Geral</h2>
          
          <RelatorioSection>
            <h3>Resumo de Atendimentos</h3>
            <p>Período: {dateRange.start && dateRange.end ? `${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}` : 'Todos os períodos'}</p>
            <p>Total de atendimentos: <strong>{estatisticas.totalAtendimentos}</strong></p>
            <p>Total de vendas concluídas: <strong>{estatisticas.totalVendasConcluidas}</strong></p>
            <p>Valor total de vendas: <strong>R$ {estatisticas.valorTotalVendas}</strong></p>
            <p>Taxa de conversão: <strong>{estatisticas.taxaConversao}%</strong></p>
          </RelatorioSection>
          
          <RelatorioSection>
            <h3>Distribuição por Setor</h3>
            <div style={{ height: '300px' }}>
              <Pie data={chartData.setorData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </RelatorioSection>
          
          <RelatorioSection>
            <h3>Clientes Atendidos por Dia</h3>
            <div style={{ height: '300px' }}>
              <Line data={chartData.clientesPorDiaData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </RelatorioSection>
        </RelatorioContainer>
      );
    } else if (activeReport === 'vendedores') {
      return (
        <RelatorioContainer>
          <h2>Relatório por Vendedor</h2>
          
          <RelatorioSection>
            <h3>Desempenho por Vendedor</h3>
            <div style={{ height: '300px' }}>
              <Bar data={chartData.vendedorData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </RelatorioSection>
          
          <RelatorioSection>
            <h3>Estatísticas Detalhadas por Vendedor</h3>
            <TabelaContainer>
              <Tabela>
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th>Total de Atendimentos</th>
                    <th>Vendas Concluídas</th>
                    <th>Valor Total</th>
                    <th>Taxa de Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {estatisticas.estatisticasPorVendedor.map((item, index) => (
                    <tr key={index}>
                      <td>{item.vendedor}</td>
                      <td>{item.totalAtendimentos}</td>
                      <td>{item.vendasConcluidas}</td>
                      <td>R$ {item.valorTotal}</td>
                      <td>{item.taxaConversao}%</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </TabelaContainer>
          </RelatorioSection>
        </RelatorioContainer>
      );
    } else if (activeReport === 'canais') {
      return (
        <RelatorioContainer>
          <h2>Relatório por Canal</h2>
          
          <RelatorioSection>
            <h3>Distribuição por Canal - WhatsApp/Instagram</h3>
            <div style={{ height: '300px' }}>
              <Pie data={chartData.canaisWhatsappInstagram} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </RelatorioSection>
          
          <RelatorioSection>
            <h3>Estatísticas Detalhadas por Canal</h3>
            <TabelaContainer>
              <Tabela>
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Total de Atendimentos</th>
                    <th>Vendas Concluídas</th>
                    <th>Valor Total</th>
                    <th>Taxa de Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {estatisticas.estatisticasPorCanal.map((item, index) => (
                    <tr key={index}>
                      <td>{item.canal}</td>
                      <td>{item.totalAtendimentos}</td>
                      <td>{item.vendasConcluidas}</td>
                      <td>R$ {item.valorTotal}</td>
                      <td>{item.taxaConversao}%</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </TabelaContainer>
          </RelatorioSection>
        </RelatorioContainer>
      );
    } else if (activeReport === 'produtos') {
      // Preparar dados de produtos
      const produtosVendidos: {[key: string]: number} = {};
      const produtosInteresse: {[key: string]: number} = {};
      
      allData.forEach(item => {
        if (item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-concluida' && item.produtoVendido) {
          produtosVendidos[item.produtoVendido] = (produtosVendidos[item.produtoVendido] || 0) + 1;
        } else if (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'compra-direta' && item.produtoVendido) {
          produtosVendidos[item.produtoVendido] = (produtosVendidos[item.produtoVendido] || 0) + 1;
        }
        
        if (item.setor === 'loja-fisica' && item.tipoAtendimento === 'venda-nao-concluida' && item.produtoInteresse) {
          produtosInteresse[item.produtoInteresse] = (produtosInteresse[item.produtoInteresse] || 0) + 1;
        } else if (item.setor === 'whatsapp-instagram' && item.tipoInteracao === 'pedido-informacao' && item.produtoInteresse) {
          produtosInteresse[item.produtoInteresse] = (produtosInteresse[item.produtoInteresse] || 0) + 1;
        }
      });
      
      const produtosVendidosArray = Object.entries(produtosVendidos)
        .map(([produto, quantidade]) => ({ produto, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);
      
      const produtosInteresseArray = Object.entries(produtosInteresse)
        .map(([produto, quantidade]) => ({ produto, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);
      
      // Dados para gráfico de produtos mais vendidos
      const produtosVendidosData = {
        labels: produtosVendidosArray.map(item => item.produto),
        datasets: [
          {
            label: 'Quantidade Vendida',
            data: produtosVendidosArray.map(item => item.quantidade),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
      
      // Dados para gráfico de produtos mais procurados
      const produtosInteresseData = {
        labels: produtosInteresseArray.map(item => item.produto),
        datasets: [
          {
            label: 'Quantidade de Interesse',
            data: produtosInteresseArray.map(item => item.quantidade),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      };
      
      return (
        <RelatorioContainer>
          <h2>Relatório de Produtos</h2>
          
          <RelatorioSection>
            <h3>Produtos Mais Vendidos</h3>
            <div style={{ height: '300px' }}>
              <Bar data={produtosVendidosData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y'
              }} />
            </div>
          </RelatorioSection>
          
          <RelatorioSection>
            <h3>Produtos Mais Procurados</h3>
            <div style={{ height: '300px' }}>
              <Bar data={produtosInteresseData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y'
              }} />
            </div>
          </RelatorioSection>
          
          <RelatorioSection>
            <h3>Lista de Produtos Mais Vendidos</h3>
            <TabelaContainer>
              <Tabela>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade Vendida</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosVendidosArray.map((item, index) => (
                    <tr key={index}>
                      <td>{item.produto}</td>
                      <td>{item.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </TabelaContainer>
          </RelatorioSection>
        </RelatorioContainer>
      );
    }
  };
  
  // Função para exportar dados
  const exportarDados = (formato: string) => {
    if (filteredData.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    
    if (formato === 'csv') {
      // Criar cabeçalho CSV
      const headers = Object.keys(filteredData[0]).filter(key => key !== 'id');
      let csvContent = headers.join(',') + '\n';
      
      // Adicionar linhas de dados
      filteredData.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          // Escapar aspas e adicionar aspas em volta de strings
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',');
        csvContent += row + '\n';
      });
      
      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (formato === 'excel') {
      // Preparar dados para Excel
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
      
      // Gerar arquivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Baixar arquivo
      saveAs(blob, `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };
  
  // Função para exportar relatório atual
  const exportarRelatorio = () => {
    // Implementação básica para demonstração
    alert('Funcionalidade de exportação de relatório será implementada em breve.');
  };
  
  return (
    <Container>
      <Header>
        <h1>Painel de Administração</h1>
      </Header>
      
      <Content>
        <Sidebar>
          <h2>Filtros</h2>
          
          <FilterGroup>
            <label>Período:</label>
            <div>
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
              />
              <span> até </span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
              />
            </div>
          </FilterGroup>
          
          <FilterGroup>
            <label>Setor:</label>
            <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
              <option value="all">Todos</option>
              <option value="loja-fisica">Loja Física</option>
              <option value="whatsapp-instagram">WhatsApp/Instagram</option>
              <option value="caixa">Caixa</option>
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Vendedor/Atendente:</label>
            <select value={selectedVendedor} onChange={(e) => setSelectedVendedor(e.target.value)}>
              <option value="all">Todos</option>
              <option value="Daniele">Daniele</option>
              <option value="Kaylane">Kaylane</option>
              <option value="Fabiola">Fabiola</option>
              <option value="Eduarda">Eduarda</option>
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Tipo:</label>
            <select value={selectedTipoAtendimento} onChange={(e) => setSelectedTipoAtendimento(e.target.value)}>
              <option value="all">Todos</option>
              {selectedSector === 'loja-fisica' || selectedSector === 'all' ? (
                <>
                  <option value="venda-concluida">Venda Concluída</option>
                  <option value="venda-nao-concluida">Venda não Concluída</option>
                  <option value="troca">Troca</option>
                  <option value="prova">Prova</option>
                </>
              ) : selectedSector === 'whatsapp-instagram' ? (
                <>
                  <option value="pedido-informacao">Pedido de Informação</option>
                  <option value="compra-direta">Compra Direta</option>
                  <option value="prova">Prova</option>
                </>
              ) : selectedSector === 'caixa' ? (
                <>
                  <option value="pagamento-compra">Pagamento de Compra</option>
                  <option value="troca">Troca</option>
                  <option value="consulta-parcela">Consulta de Parcela</option>
                  <option value="pagamento-carne">Pagamento de Carnê</option>
                </>
              ) : null}
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Canal:</label>
            <select value={selectedCanal} onChange={(e) => setSelectedCanal(e.target.value)}>
              <option value="all">Todos</option>
              {selectedSector === 'loja-fisica' || selectedSector === 'all' ? (
                <>
                  <option value="presencial">Presencial</option>
                  <option value="whatsapp">WhatsApp</option>
                </>
              ) : selectedSector === 'whatsapp-instagram' ? (
                <>
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                </>
              ) : null}
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Valor:</label>
            <div>
              <input 
                type="number" 
                placeholder="Mínimo" 
                value={valorRange.min} 
                onChange={(e) => setValorRange({...valorRange, min: e.target.value})} 
              />
              <span> a </span>
              <input 
                type="number" 
                placeholder="Máximo" 
                value={valorRange.max} 
                onChange={(e) => setValorRange({...valorRange, max: e.target.value})} 
              />
            </div>
          </FilterGroup>
          
          <FilterGroup>
            <label>Buscar:</label>
            <input 
              type="text" 
              placeholder="Cliente ou produto" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </FilterGroup>
          
          <ButtonGroup>
            <Button onClick={() => {
              setDateRange({ start: '', end: '' });
              setSelectedSector('all');
              setSelectedVendedor('all');
              setSelectedTipoAtendimento('all');
              setSelectedCanal('all');
              setValorRange({ min: '', max: '' });
              setSearchTerm('');
            }}>
              Limpar Filtros
            </Button>
          </ButtonGroup>
          
          <ExportSection>
            <h3>Exportar Dados</h3>
            <ButtonGroup>
              <Button onClick={() => exportarDados('csv')}>CSV</Button>
              <Button onClick={() => exportarDados('excel')}>Excel</Button>
            </ButtonGroup>
          </ExportSection>
        </Sidebar>
        
        <MainContent>
          <TabsContainer>
            <Tab 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </Tab>
            <Tab 
              active={activeView === 'tabela'} 
              onClick={() => setActiveView('tabela')}
            >
              Tabela de Dados
            </Tab>
            <Tab 
              active={activeView === 'relatorios'} 
              onClick={() => setActiveView('relatorios')}
            >
              Relatórios
            </Tab>
          </TabsContainer>
          
          {loading ? (
            <LoadingMessage>Carregando dados...</LoadingMessage>
          ) : (
            <>
              {activeView === 'dashboard' && renderDashboard()}
              {activeView === 'tabela' && renderTabela()}
              {activeView === 'relatorios' && (
                <RelatoriosContainer>
                  <RelatoriosTabs>
                    <RelatorioTab 
                      active={activeReport === 'geral'} 
                      onClick={() => setActiveReport('geral')}
                    >
                      Geral
                    </RelatorioTab>
                    <RelatorioTab 
                      active={activeReport === 'vendedores'} 
                      onClick={() => setActiveReport('vendedores')}
                    >
                      Vendedores
                    </RelatorioTab>
                    <RelatorioTab 
                      active={activeReport === 'canais'} 
                      onClick={() => setActiveReport('canais')}
                    >
                      Canais
                    </RelatorioTab>
                    <RelatorioTab 
                      active={activeReport === 'produtos'} 
                      onClick={() => setActiveReport('produtos')}
                    >
                      Produtos
                    </RelatorioTab>
                    
                    <ExportButton onClick={exportarRelatorio}>
                      Exportar Relatório
                    </ExportButton>
                  </RelatoriosTabs>
                  
                  {renderRelatorios()}
                </RelatoriosContainer>
              )}
            </>
          )}
        </MainContent>
      </Content>
    </Container>
  );
};

// Estilos
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #f8bbc4;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  padding: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 300px;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 1rem;
  
  h2 {
    margin-top: 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  select, input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  div {
    display: flex;
    align-items: center;
    
    input {
      flex: 1;
    }
    
    span {
      margin: 0 0.5rem;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f8bbc4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #e5a8b1;
  }
`;

const ExportSection = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  
  h3 {
    margin-top: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.div<TabProps>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#f8bbc4' : 'transparent'};
  color: ${props => props.active ? '#f8bbc4' : '#333'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: #f8bbc4;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  text-align: center;
  border-top: 3px solid #f8bbc4;
  
  h3 {
    margin-top: 0;
    font-size: 1rem;
    color: #666;
  }
  
  p {
    margin-bottom: 0;
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
  }
`;

const GraficosContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GraficoBox = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  height: 300px;
  
  h3 {
    margin-top: 0;
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #666;
  }
`;

const TabelaContainer = styled.div`
  overflow-x: auto;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f9f9f9;
    font-weight: bold;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
  
  button {
    padding: 0.25rem 0.5rem;
    background-color: #f8bbc4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #e5a8b1;
    }
  }
`;

const RelatoriosContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RelatoriosTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  position: relative;
`;

interface RelatorioTabProps {
  active: boolean;
}

const RelatorioTab = styled.div<RelatorioTabProps>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#f8bbc4' : 'transparent'};
  color: ${props => props.active ? '#f8bbc4' : '#333'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: #f8bbc4;
  }
`;

const ExportButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  padding: 0.5rem 1rem;
  background-color: #f8bbc4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e5a8b1;
  }
`;

const RelatorioContainer = styled.div`
  padding: 1rem;
`;

const RelatorioSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
`;

export default AdminPage;
