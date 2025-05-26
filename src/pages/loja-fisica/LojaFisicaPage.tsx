import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import RadioButtonGroup from '../../components/common/RadioButtonGroup';
import { saveLojaFisicaData } from '../../firebase/services';

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

const LojaFisicaPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendedor: '',
    canalAtendimento: 'presencial',
    nomeCliente: '',
    contato: '',
    tipoAtendimento: '',
    // Campos condicionais para Venda Concluída
    produtoVendido: '',
    valorVenda: '',
    // Campos condicionais para Venda não concluída
    produtoInteresse: '',
    motivoNaoCompra: '',
    // Campos condicionais para Troca
    tipoTroca: '',
    tamanhoAntigo: '',
    tamanhoNovo: '',
    produtoAntigo: '',
    produtoNovo: '',
    // Campos condicionais para Prova
    produtosProva: '',
    valorTotalProva: '',
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
      const result = await saveLojaFisicaData(formData);
      
      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Atendimento registrado com sucesso!'
        });
        
        // Limpar formulário após envio bem-sucedido
        setFormData({
          vendedor: '',
          canalAtendimento: 'presencial',
          nomeCliente: '',
          contato: '',
          tipoAtendimento: '',
          produtoVendido: '',
          valorVenda: '',
          produtoInteresse: '',
          motivoNaoCompra: '',
          tipoTroca: '',
          tamanhoAntigo: '',
          tamanhoNovo: '',
          produtoAntigo: '',
          produtoNovo: '',
          produtosProva: '',
          valorTotalProva: '',
          observacoes: ''
        });
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setSubmitStatus({
          success: false,
          message: 'Erro ao registrar atendimento. Tente novamente.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Erro ao registrar atendimento. Tente novamente.'
      });
      console.error('Erro ao enviar dados:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const vendedores = [
    { value: 'daniele', label: 'Daniele' },
    { value: 'kaylane', label: 'Kaylane' },
    { value: 'fabiola', label: 'Fabiola' },
    { value: 'eduarda', label: 'Eduarda' }
  ];

  const tiposAtendimento = [
    { value: 'venda-concluida', label: 'Venda Concluída' },
    { value: 'venda-nao-concluida', label: 'Venda não concluída' },
    { value: 'troca', label: 'Troca' },
    { value: 'prova', label: 'Prova' }
  ];

  const tiposTroca = [
    { value: 'troca-tamanho', label: 'Troca de Tamanho' },
    { value: 'troca-produto', label: 'Troca por Outro Produto' }
  ];

  const canaisAtendimento = [
    { value: 'presencial', label: 'Presencial', icon: '👩‍💼' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '📱' }
  ];

  // Renderização condicional baseada no tipo de atendimento
  const renderConditionalFields = () => {
    switch (formData.tipoAtendimento) {
      case 'venda-concluida':
        return (
          <ConditionalFieldsContainer>
            <Input
              label="Produto Vendido"
              name="produtoVendido"
              placeholder="Nome/descrição do produto"
              value={formData.produtoVendido}
              onChange={handleChange}
              required
            />
            <Input
              label="Valor da Venda (R$)"
              name="valorVenda"
              type="number"
              placeholder="0,00"
              value={formData.valorVenda}
              onChange={handleChange}
              required
            />
          </ConditionalFieldsContainer>
        );
      case 'venda-nao-concluida':
        return (
          <ConditionalFieldsContainer>
            <Input
              label="Produto de Interesse"
              name="produtoInteresse"
              placeholder="Nome/descrição do produto"
              value={formData.produtoInteresse}
              onChange={handleChange}
              required
            />
            <TextArea
              label="Motivo da Não Compra"
              name="motivoNaoCompra"
              placeholder="Descreva o motivo pelo qual a venda não foi concluída"
              value={formData.motivoNaoCompra}
              onChange={handleChange}
              required
            />
          </ConditionalFieldsContainer>
        );
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
      case 'prova':
        return (
          <ConditionalFieldsContainer>
            <TextArea
              label="Produtos para Prova"
              name="produtosProva"
              placeholder="Liste os produtos que foram para prova"
              value={formData.produtosProva}
              onChange={handleChange}
              required
            />
            <Input
              label="Valor Total da Prova (R$)"
              name="valorTotalProva"
              type="number"
              placeholder="0,00"
              value={formData.valorTotalProva}
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
      <Header title="Controle de Clientes" subtitle="Loja Física" />
      
      <ContentContainer>
        {submitStatus.success && (
          <SuccessMessage>{submitStatus.message}</SuccessMessage>
        )}
        
        {submitStatus.success === false && (
          <ErrorMessage>{submitStatus.message}</ErrorMessage>
        )}
        
        <FormContainer onSubmit={handleSubmit}>
          <Select
            label="Vendedor(a)"
            name="vendedor"
            options={vendedores}
            value={formData.vendedor}
            onChange={handleChange}
            required
          />
          
          <RadioButtonGroup
            label="Canal de Atendimento"
            name="canalAtendimento"
            options={canaisAtendimento}
            value={formData.canalAtendimento}
            onChange={handleChange}
          />
          
          <Input
            label="Nome do Cliente"
            name="nomeCliente"
            placeholder="Nome completo"
            value={formData.nomeCliente}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Contato"
            name="contato"
            placeholder="Número do WhatsApp"
            value={formData.contato}
            onChange={handleChange}
          />
          
          <Select
            label="Tipo de Atendimento"
            name="tipoAtendimento"
            options={tiposAtendimento}
            value={formData.tipoAtendimento}
            onChange={handleChange}
            required
          />
          
          {renderConditionalFields()}
          
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

export default LojaFisicaPage;
