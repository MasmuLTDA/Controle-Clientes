import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: white;
  padding: 15px 0;
  text-align: center;
  font-size: 14px;
  color: var(--text);
  border-top: 1px solid #eee;
  margin-top: 30px;
  width: 100%;
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      Sistema de Controle de Clientes © {currentYear}
    </FooterContainer>
  );
};

export default Footer;
