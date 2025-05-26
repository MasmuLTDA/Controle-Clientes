import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #F5A9B8;
    --primary-dark: #FF6B8B;
    --secondary: #FFFFFF;
    --text: #333333;
    --background: #F5F5F5;
    --success: #4CAF50;
    --warning: #FFC107;
    --error: #F44336;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
  }

  body {
    background-color: var(--background);
    color: var(--text);
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, select, textarea {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    font-size: 16px;
    width: 100%;
    margin-top: 5px;
  }

  label {
    font-weight: 500;
    margin-bottom: 5px;
    display: block;
  }

  .required:after {
    content: " *";
    color: var(--primary-dark);
  }
`;

export default GlobalStyle;
