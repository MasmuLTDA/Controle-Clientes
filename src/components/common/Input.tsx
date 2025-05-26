import React from 'react';
import styled from 'styled-components';

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const StyledLabel = styled.label`
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
`;

const StyledInput = styled.input`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  width: 100%;
  margin-top: 5px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(245, 169, 184, 0.2);
  }
`;

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false
}) => {
  return (
    <InputContainer>
      <StyledLabel className={required ? 'required' : ''} htmlFor={name}>
        {label}
      </StyledLabel>
      <StyledInput
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </InputContainer>
  );
};

export default Input;
