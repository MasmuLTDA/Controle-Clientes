import React from 'react';
import styled from 'styled-components';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const HeaderContainer = styled.header`
  background-color: var(--primary);
  color: white;
  padding: 20px 0;
  text-align: center;
  width: 100%;
`;

const Logo = styled.div`
  margin-bottom: 10px;
  
  img {
    height: 40px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
`;

const Subtitle = styled.h2`
  font-size: 16px;
  font-weight: 400;
  margin: 5px 0 0;
`;

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <HeaderContainer>
      <Logo>
        <img src="/logo.svg" alt="MASMU Logo" />
      </Logo>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </HeaderContainer>
  );
};

export default Header;
