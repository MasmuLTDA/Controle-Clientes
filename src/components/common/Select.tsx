import React from 'react';
import styled from 'styled-components';

interface SelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

const SelectContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const StyledLabel = styled.label`
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
`;

const StyledSelect = styled.select`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  width: 100%;
  margin-top: 5px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(245, 169, 184, 0.2);
  }
`;

const Select: React.FC<SelectProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false
}) => {
  return (
    <SelectContainer>
      <StyledLabel className={required ? 'required' : ''} htmlFor={name}>
        {label}
      </StyledLabel>
      <StyledSelect
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
    </SelectContainer>
  );
};

export default Select;
