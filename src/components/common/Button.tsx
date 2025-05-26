import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  primary?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
}

const StyledButton = styled.button<ButtonProps>`
  background-color: ${props => props.primary ? 'var(--primary-dark)' : 'var(--secondary)'};
  color: ${props => props.primary ? 'white' : 'var(--text)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--primary)'};
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary)' : 'rgba(245, 169, 184, 0.1)'};
  }
  
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
  }
`;

const Button: React.FC<ButtonProps> = ({ 
  primary = true, 
  fullWidth = false, 
  onClick, 
  type = 'button',
  disabled = false,
  children 
}) => {
  return (
    <StyledButton 
      primary={primary} 
      fullWidth={fullWidth} 
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
