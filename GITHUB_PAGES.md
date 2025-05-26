# Instruções para Publicação no GitHub Pages

Este documento contém instruções detalhadas para publicar o sistema de Controle de Clientes no GitHub Pages.

## Passo 1: Criar um repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Dê um nome ao repositório (ex: "controle-clientes")
4. Escolha a visibilidade (público ou privado)
5. Clique em "Create repository"

## Passo 2: Configurar o projeto para GitHub Pages

1. Abra o arquivo `package.json` e adicione a propriedade `"homepage"`:
   ```json
   "homepage": "https://seu-usuario.github.io/controle-clientes"
   ```
   (Substitua "seu-usuario" pelo seu nome de usuário do GitHub e "controle-clientes" pelo nome do repositório)

2. Instale o pacote gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Adicione os seguintes scripts no `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

## Passo 3: Fazer upload dos arquivos para o GitHub

### Opção 1: Usando Git (recomendado)

1. Inicialize um repositório Git local:
   ```bash
   git init
   ```

2. Adicione os arquivos ao repositório:
   ```bash
   git add .
   ```

3. Faça o commit dos arquivos:
   ```bash
   git commit -m "Primeira versão do sistema de controle de clientes"
   ```

4. Adicione o repositório remoto:
   ```bash
   git remote add origin https://github.com/seu-usuario/controle-clientes.git
   ```
   (Substitua "seu-usuario" pelo seu nome de usuário do GitHub e "controle-clientes" pelo nome do repositório)

5. Envie os arquivos para o GitHub:
   ```bash
   git push -u origin master
   ```

### Opção 2: Upload manual

1. Compacte a pasta do projeto em um arquivo ZIP
2. Acesse o repositório no GitHub
3. Clique em "Add file" > "Upload files"
4. Arraste o arquivo ZIP ou clique para selecionar
5. Clique em "Commit changes"

## Passo 4: Publicar no GitHub Pages

1. Execute o comando para publicar:
   ```bash
   npm run deploy
   ```

2. Acesse as configurações do repositório no GitHub
3. Vá até a seção "GitHub Pages"
4. Verifique se a fonte está configurada para o branch "gh-pages"
5. Aguarde alguns minutos para que o site seja publicado

## Passo 5: Acessar o site publicado

Após a publicação, o site estará disponível em:
```
https://seu-usuario.github.io/controle-clientes
```
(Substitua "seu-usuario" pelo seu nome de usuário do GitHub e "controle-clientes" pelo nome do repositório)

## Atualizações futuras

Para atualizar o site após fazer alterações:

1. Faça as alterações necessárias no código
2. Execute novamente o comando:
   ```bash
   npm run deploy
   ```

Isso irá gerar uma nova build e publicar as alterações no GitHub Pages.
