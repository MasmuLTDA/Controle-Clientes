import React from 'react';
import styled from 'styled-components';

interface RadioButtonGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const RadioGroupContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const StyledLabel = styled.label`
  font-weight: 500;
  margin-bottom: 10px;
  display: block;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 5px;
`;

const RadioOption = styled.label`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  
  &:hover {
    border-color: var(--primary);
  }
  
  &.selected {
    background-color: rgba(245, 169, 184, 0.1);
    border-color: var(--primary);
  }
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .label {
    font-size: 14px;
    text-align: center;
  }
`;

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false
}) => {
  return (
    <RadioGroupContainer>
      <StyledLabel className={required ? 'required' : ''}>
        {label}
      </StyledLabel>
      <OptionsContainer>
        {options.map((option) => (
          <RadioOption 
            key={option.value} 
            className={value === option.value ? 'selected' : ''}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              required={required}
            />
            {option.icon && <div className="icon">{option.icon}</div>}
            <div className="label">{option.label}</div>
          </RadioOption>
        ))}
      </OptionsContainer>
    </RadioGroupContainer>
  );
};

export default RadioButtonGroup;
