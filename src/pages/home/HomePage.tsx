import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/common/Card';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 10px;
  color: var(--text);
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 40px;
  color: #666;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Header title="Sistema de Controle de Clientes" />
      
      <ContentContainer>
        <Title>Selecione seu setor para registrar atendimentos</Title>
        <Subtitle>Escolha uma das opções abaixo para acessar o formulário correspondente</Subtitle>
        
        <CardsGrid>
          <Card
            icon="👩‍💼"
            title="Loja Física"
            description="Registre atendimentos e vendas realizadas na loja física."
            onClick={() => navigate('/loja-fisica')}
          />
          
          <Card
            icon="📱"
            title="WhatsApp/Instagram"
            description="Registre atendimentos realizados via redes sociais."
            onClick={() => navigate('/whatsapp')}
          />
          
          <Card
            icon="💰"
            title="Caixa"
            description="Registre pagamentos, trocas e consultas de valores."
            onClick={() => navigate('/caixa')}
          />
          
          <Card
            icon="📊"
            title="Administração"
            description="Visualize relatórios e estatísticas de atendimentos."
            onClick={() => alert('Área administrativa em desenvolvimento')}
          />
        </CardsGrid>
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default HomePage;
