import React from 'react';
import styled from 'styled-components';

interface CardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

const CardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  margin-bottom: 20px;
  font-size: 48px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text);
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const Card: React.FC<CardProps> = ({ icon, title, description, onClick }) => {
  return (
    <CardContainer onClick={onClick}>
      <IconContainer>
        {icon}
      </IconContainer>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </CardContainer>
  );
};

export default Card;
