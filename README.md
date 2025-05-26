# Controle de Clientes - Documentação

Este é um sistema de controle de clientes desenvolvido para gerenciar atendimentos em diferentes setores (Loja Física, WhatsApp/Instagram e Caixa), com integração ao Firebase para armazenamento de dados.

## Estrutura do Projeto

O projeto foi desenvolvido utilizando React com TypeScript e possui a seguinte estrutura:

- **Página Inicial**: Seleção de setores (Loja Física, WhatsApp/Instagram, Caixa e Administração)
- **Formulário de Loja Física**: Registro de atendimentos presenciais
- **Formulário de WhatsApp/Instagram**: Registro de atendimentos via redes sociais
- **Formulário de Caixa**: Registro de operações financeiras
- **Administração**: Visualização de relatórios e estatísticas (em desenvolvimento)

## Tecnologias Utilizadas

- React 18
- TypeScript
- Firebase (Realtime Database)
- Styled Components
- React Router

## Configuração do Firebase

O sistema está configurado para utilizar o Firebase Realtime Database para armazenamento dos dados. As credenciais do Firebase estão configuradas no arquivo `src/firebase/config.ts`.

## Estrutura de Dados

Os dados são armazenados no Firebase Realtime Database com a seguinte estrutura:

- **atendimentos/loja-fisica**: Registros de atendimentos na loja física
- **atendimentos/whatsapp-instagram**: Registros de atendimentos via WhatsApp/Instagram
- **atendimentos/caixa**: Registros de operações no caixa

## Publicação no GitHub Pages

Para publicar o sistema no GitHub Pages, siga os passos abaixo:

1. Crie um repositório no GitHub
2. Faça upload dos arquivos do projeto para o repositório
3. No arquivo `package.json`, adicione a propriedade `"homepage"` com o valor `"https://seu-usuario.github.io/nome-do-repositorio"`
4. Instale o pacote gh-pages: `npm install --save-dev gh-pages`
5. Adicione os seguintes scripts no `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
6. Execute o comando `npm run deploy` para publicar o sistema no GitHub Pages

## Desenvolvimento Futuro

- Implementação da página de Administração com relatórios e estatísticas
- Implementação de filtros avançados para consulta de dados
- Implementação de autenticação de usuários
