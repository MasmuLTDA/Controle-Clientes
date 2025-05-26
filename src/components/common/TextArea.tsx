import React from 'react';
import styled from 'styled-components';

interface TextAreaProps {
  label: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

const TextAreaContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const StyledLabel = styled.label`
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
`;

const StyledTextArea = styled.textarea`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  width: 100%;
  margin-top: 5px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(245, 169, 184, 0.2);
  }
`;

const TextArea: React.FC<TextAreaProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 4
}) => {
  return (
    <TextAreaContainer>
      <StyledLabel className={required ? 'required' : ''} htmlFor={name}>
        {label}
      </StyledLabel>
      <StyledTextArea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
      />
    </TextAreaContainer>
  );
};

export default TextArea;
