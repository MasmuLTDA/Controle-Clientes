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
import { saveWhatsappData } from '../../firebase/services';

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

const WhatsappPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    atendente: '',
    canal: 'instagram',
    nomeCliente: '',
    contato: '',
    tipoInteracao: '',
    // Campos condicionais para Compra Direta
    produtoVendido: '',
    valorVenda: '',
    // Campos condicionais para Pedido de Informação
    produtoInteresse: '',
    // Campos condicionais para Prova
    produtosProva: '',
    valorTotalProva: '',
    clienteCadastrado: '',
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
      const result = await saveWhatsappData(formData);
      
      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Atendimento registrado com sucesso!'
        });
        
        // Limpar formulário após envio bem-sucedido
        setFormData({
          atendente: '',
          canal: 'instagram',
          nomeCliente: '',
          contato: '',
          tipoInteracao: '',
          produtoVendido: '',
          valorVenda: '',
          produtoInteresse: '',
          produtosProva: '',
          valorTotalProva: '',
          clienteCadastrado: '',
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

  const atendentes = [
    { value: 'daniel', label: 'Daniel' }
  ];

  const canais = [
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
    { value: 'facebook', label: 'Facebook', icon: '👍' }
  ];

  const tiposInteracao = [
    { value: 'pedido-informacao', label: 'Pedido de Informação' },
    { value: 'compra-direta', label: 'Compra Direta' },
    { value: 'prova', label: 'Prova' }
  ];

  const clienteCadastradoOptions = [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ];

  // Renderização condicional baseada no tipo de interação
  const renderConditionalFields = () => {
    switch (formData.tipoInteracao) {
      case 'compra-direta':
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
      case 'pedido-informacao':
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
      <Header title="Controle de Clientes" subtitle="WhatsApp/Instagram" />
      
      <ContentContainer>
        {submitStatus.success && (
          <SuccessMessage>{submitStatus.message}</SuccessMessage>
        )}
        
        {submitStatus.success === false && (
          <ErrorMessage>{submitStatus.message}</ErrorMessage>
        )}
        
        <FormContainer onSubmit={handleSubmit}>
          <Select
            label="Atendente"
            name="atendente"
            options={atendentes}
            value={formData.atendente}
            onChange={handleChange}
            required
          />
          
          <RadioButtonGroup
            label="Canal"
            name="canal"
            options={canais}
            value={formData.canal}
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
          
          <Input
            label="Contato"
            name="contato"
            placeholder="Telefone ou @instagram"
            value={formData.contato}
            onChange={handleChange}
          />
          
          <Select
            label="Tipo de Interação"
            name="tipoInteracao"
            options={tiposInteracao}
            value={formData.tipoInteracao}
            onChange={handleChange}
            required
          />
          
          {renderConditionalFields()}
          
          <Select
            label="Cliente Cadastrado"
            name="clienteCadastrado"
            options={clienteCadastradoOptions}
            value={formData.clienteCadastrado}
            onChange={handleChange}
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

export default WhatsappPage;
