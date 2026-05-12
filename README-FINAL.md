# GEPERA - Portal acadêmico com Next.js, banco e painel admin

Site reconstruído para o Grupo de Estudos e Pesquisas em Ensino Religioso na Amazônia.

## Como abrir

### Versão nova: Next.js + SQLite

No terminal, dentro da pasta do projeto:

```powershell
npm.cmd install
npm.cmd run seed
npm.cmd run dev
```

Depois acesse:

- Site: `http://localhost:4173`
- Admin: `http://localhost:4173/admin`

Credenciais padrão:

- Usuário: `admin`
- Senha: `gepera2026`

Para trocar as credenciais sem editar código:

```powershell
$env:GEPERA_ADMIN_USER="novo_usuario"
$env:GEPERA_ADMIN_PASS="nova_senha"
npm.cmd run seed
npm.cmd run dev
```

### Versão antiga preservada

A versão estática anterior ainda existe e pode rodar com:

```powershell
npm.cmd run legacy:start
```

## O que foi adicionado

- Painel `admin.html` com login.
- Importação da versão mais atual em `Nova pasta`, com mídias em `assets/atual`.
- Nova versão React/Next.js em `app/`, `components/` e `lib/`.
- Banco SQLite em `data/gepera.db`.
- Autenticação com hash PBKDF2, cookie HttpOnly assinado, proteção CSRF e limite de tentativas de login.
- Headers de segurança via `next.config.mjs`.
- Textura religiosa em transparência no fundo verde usando `public/patterns/religious-symbols-pattern.png`.
- Cards e layout inspirados na referência visual enviada, mantendo verde/branco/dourado.
- Publicações com texto sobreposto à capa/PDF para leitura imediata.
- Edição de identidade, textos, contatos, página inicial e imagem de fundo.
- Edição do menu, com criação e remoção de novas abas personalizadas.
- Página `pagina.html` para exibir abas novas criadas pelo admin.
- Edição de objetivos, metas, pesquisa, pesquisadores, ações e publicações.
- Seção de Publicações dentro de Ações para artigos, livros, capítulos, materiais e anais.
- Upload de imagens pelo admin quando o site roda via `node server.js`.
- Exportação/importação completa dos dados em JSON.
- Persistência em `data/site-data.json`.
- Carrosséis com Swiper via CDN, com fallback visual.
- Paleta mais uniforme e layout responsivo.

## Arquivos principais

- `site-data.js`: conteúdo padrão do site.
- `script.js`: renderização pública e painel admin.
- `style.css`: design do site e do admin.
- `server.js`: servidor local, autenticação, salvamento e upload.
- `app/`: rotas Next.js do portal.
- `components/`: navbar, cards, carrosséis, publicações e admin React.
- `lib/db.js`: banco SQLite e persistência.
- `lib/security.js`: hash de senha e sessão assinada.
- `assets/atual/`: logos, fotos, carrosséis, imagens das ações, capas e PDFs importados da versão atual.
- `data/site-data.json`: criado automaticamente após salvar no admin.
- `data/gepera.db`: banco SQLite da versão nova.
- `uploads/`: criado automaticamente para imagens enviadas pelo admin.

## Publicação online

Para ter admin persistente em produção, hospede o projeto em um ambiente que rode Node.js. Em hospedagens puramente estáticas, como GitHub Pages, o site público funciona, mas o admin não consegue salvar alterações em arquivo no servidor.

## Verificações

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd audit --audit-level=moderate
```
