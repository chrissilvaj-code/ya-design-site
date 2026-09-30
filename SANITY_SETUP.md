# Configuração do painel editorial da YA Design

## 1. Criar e vincular o projeto

No painel do projeto na Vercel, abra **Marketplace**, procure por **Sanity** e instale a integração. Crie um projeto novo chamado `YA Design Blog` e use o dataset `production`.

## 2. Variáveis da Vercel

Confirme se a integração criou as variáveis abaixo em **Settings > Environment Variables**:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET` com o valor `production`

As variáveis devem estar disponíveis em Production, Preview e Development.

## 3. Configurar o Studio

Na pasta `studio`, copie `.env.example` para `.env` e substitua `seu_project_id` pelo identificador fornecido pelo Sanity.

Depois execute:

```powershell
cd studio
npm install
npm run dev
```

Para publicar o painel em um endereço `*.sanity.studio`:

```powershell
npm run deploy
```

Durante a primeira publicação, escolha um endereço como `ya-design-blog.sanity.studio`.

## 4. Acesso da Yasmin

No painel de gerenciamento do Sanity, abra as configurações do projeto, acesse **Members** e convide o e-mail da Yasmin. Ela receberá acesso protegido ao Studio.

## 5. Publicar o primeiro artigo

No Studio, abra **Artigos**, crie um novo documento, preencha os campos obrigatórios e clique em **Publish**. O artigo será exibido automaticamente em `/blog/` e terá sua própria URL em `/blog/endereco-do-artigo`.
