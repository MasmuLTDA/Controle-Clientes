import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import RadioButtonGroup from '../../components/common/RadioButtonGroup';
import { saveCaixaData } from '../../firebase/services';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const FormContainer = styled.form`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

const SuccessMessage = styled.div`
  background-color: var(--success);
  color: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: var(--error);
  color: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const ConditionalFieldsContainer = styled.div`
  background-color: rgba(245, 169, 184, 0.1);
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  margin-bottom: 15px;
  border-left: 3px solid var(--primary);
`;

const CaixaPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    operador: '',
    nomeCliente: '',
    tipoOperacao: '',
    canalAtendimento: 'loja-fisica',
    valorTotal: '',
    formaPagamento: '',
    // Campos condicionais para Troca
    tipoTroca: '',
    tamanhoAntigo: '',
    tamanhoNovo: '',
    produtoAntigo: '',
    produtoNovo: '',
    // Campos condicionais para Consulta de Parcela
    parcelaPaga: '',
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      const result = await saveCaixaData(formData);
      
      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Operação registrada com sucesso!'
        });
        
        // Limpar formulário após envio bem-sucedido
        setFormData({
          operador: '',
          nomeCliente: '',
          tipoOperacao: '',
          canalAtendimento: 'loja-fisica',
          valorTotal: '',
          formaPagamento: '',
          tipoTroca: '',
          tamanhoAntigo: '',
          tamanhoNovo: '',
          produtoAntigo: '',
          produtoNovo: '',
          parcelaPaga: '',
          observacoes: ''
        });
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setSubmitStatus({
          success: false,
          message: 'Erro ao registrar operação. Tente novamente.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Erro ao registrar operação. Tente novamente.'
      });
      console.error('Erro ao enviar dados:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const operadores = [
    { value: 'kaylane', label: 'Kaylane' },
    { value: 'eduarda', label: 'Eduarda' }
  ];

  // Ajustado conforme o feedback detalhado do usuário
  const tiposOperacao = [
    { value: 'pagamento-compra', label: 'Pagamento de Compra', icon: '💰' },
    { value: 'troca', label: 'Troca', icon: '🔄' },
    { value: 'consulta-parcela', label: 'Consulta de Parcela', icon: '🔍' },
    { value: 'pagamento-carne', label: 'Pagamento de Carnê', icon: '📑' }
  ];

  const canaisAtendimento = [
    { value: 'loja-fisica', label: 'Loja Física', icon: '👩‍💼' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '📱' }
  ];

  const tiposTroca = [
    { value: 'troca-tamanho', label: 'Troca de Tamanho' },
    { value: 'troca-produto', label: 'Troca por Outro Produto' }
  ];

  const simNaoOptions = [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ];

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao-credito', label: 'Cartão de Crédito' },
    { value: 'cartao-debito', label: 'Cartão de Débito' },
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência Bancária' }
  ];

  // Mostrar canal de atendimento para consulta de parcela e pagamento de carnê
  const showCanalAtendimento = 
    formData.tipoOperacao === 'consulta-parcela' || 
    formData.tipoOperacao === 'pagamento-carne';

  // Renderização condicional baseada no tipo de operação
  const renderConditionalFields = () => {
    switch (formData.tipoOperacao) {
      case 'troca':
        return (
          <ConditionalFieldsContainer>
            <Select
              label="Tipo de Troca"
              name="tipoTroca"
              options={tiposTroca}
              value={formData.tipoTroca}
              onChange={handleChange}
              required
            />
            
            {formData.tipoTroca === 'troca-tamanho' && (
              <>
                <Input
                  label="Tamanho que não serviu"
                  name="tamanhoAntigo"
                  placeholder="Ex: P, M, G, 38, 40..."
                  value={formData.tamanhoAntigo}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Tamanho novo"
                  name="tamanhoNovo"
                  placeholder="Ex: P, M, G, 38, 40..."
                  value={formData.tamanhoNovo}
                  onChange={handleChange}
                  required
                />
              </>
            )}
            
            {formData.tipoTroca === 'troca-produto' && (
              <>
                <Input
                  label="Produto Antigo"
                  name="produtoAntigo"
                  placeholder="Nome/descrição do produto a ser trocado"
                  value={formData.produtoAntigo}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Produto Novo"
                  name="produtoNovo"
                  placeholder="Nome/descrição do novo produto"
                  value={formData.produtoNovo}
                  onChange={handleChange}
                  required
                />
              </>
            )}
          </ConditionalFieldsContainer>
        );
      case 'consulta-parcela':
        return (
          <ConditionalFieldsContainer>
            <Select
              label="Parcela foi paga?"
              name="parcelaPaga"
              options={simNaoOptions}
              value={formData.parcelaPaga}
              onChange={handleChange}
              required
            />
          </ConditionalFieldsContainer>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Header title="Controle de Clientes" subtitle="Caixa" />
      
      <ContentContainer>
        {submitStatus.success && (
          <SuccessMessage>{submitStatus.message}</SuccessMessage>
        )}
        
        {submitStatus.success === false && (
          <ErrorMessage>{submitStatus.message}</ErrorMessage>
        )}
        
        <FormContainer onSubmit={handleSubmit}>
          <Select
            label="Operador(a) de Caixa"
            name="operador"
            options={operadores}
            value={formData.operador}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Nome do Cliente"
            name="nomeCliente"
            placeholder="Nome completo"
            value={formData.nomeCliente}
            onChange={handleChange}
            required
          />
          
          <RadioButtonGroup
            label="Tipo de Operação"
            name="tipoOperacao"
            options={tiposOperacao}
            value={formData.tipoOperacao}
            onChange={handleChange}
            required
          />
          
          {showCanalAtendimento && (
            <RadioButtonGroup
              label="Canal de Atendimento"
              name="canalAtendimento"
              options={canaisAtendimento}
              value={formData.canalAtendimento}
              onChange={handleChange}
              required
            />
          )}
          
          {renderConditionalFields()}
          
          <Input
            label="Valor Total (R$)"
            name="valorTotal"
            type="number"
            placeholder="0,00"
            value={formData.valorTotal}
            onChange={handleChange}
            required
          />
          
          <Select
            label="Forma de Pagamento"
            name="formaPagamento"
            options={formasPagamento}
            value={formData.formaPagamento}
            onChange={handleChange}
            required
          />
          
          <TextArea
            label="Observações"
            name="observacoes"
            placeholder="Informações adicionais relevantes"
            value={formData.observacoes}
            onChange={handleChange}
          />
          
          <ButtonContainer>
            <Button 
              type="submit" 
              primary 
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Atendimento'}
            </Button>
          </ButtonContainer>
        </FormContainer>
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default CaixaPage;
