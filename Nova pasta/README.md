# GEPERA - Site Institucional (Versão Atualizada)

Site do Grupo de Estudos e Pesquisa em Ensino Religioso na Amazônia, desenvolvido em HTML, CSS e JavaScript puro.

## 🎨 Mudanças Implementadas

### Layout Atualizado V3.0:
- ✅ **Logo do GEPERA** na página inicial ao lado dos textos
- ✅ **Layout em duas colunas** na hero section (logo à esquerda, textos à direita)
- ✅ **Fundo verde em todo o site** com variações de tonalidade
- ✅ **Imagem de símbolos religiosos** integrada ao fundo verde (sem camadas brancas)
- ✅ **Variações de verde** em cada seção:
  - Hero: Verde escuro (#0f3d28)
  - Sobre: Verde claro (#2d7a57)
  - Objetivos: Verde médio (#236b4a)
  - Pesquisa: Verde mais claro (#3a8c65)
  - Pesquisadores: Verde pálido (#4fa077)
  - Ações: Verde primário (#1a5f3e)
- ✅ **Textos em cores claras** (creme/dourado) para contraste adequado
- ✅ **Destaques em dourado** (#d4af37) para títulos e elementos importantes
- ✅ **Design totalmente responsivo** - logo se ajusta em mobile
- ✅ **Animações suaves** na entrada da logo e textos

## 📁 Estrutura de Arquivos

```
gepera-website/
├── index.html                    # Página principal
├── style.css                     # Estilos atualizados com novo layout
├── script.js                     # Funcionalidades (sem alterações)
├── gepera-logo.png              # Logo oficial do GEPERA
├── religious-symbols-bg.png      # Imagem de fundo com símbolos religiosos
└── README.md                     # Este arquivo
```

## 🚀 Como Usar

### Opção 1: Abrir Localmente
1. Baixe todos os arquivos (index.html, style.css, script.js, gepera-logo.png, religious-symbols-bg.png)
2. **IMPORTANTE:** Mantenha todos os arquivos na mesma pasta
3. Abra o arquivo `index.html` em seu navegador

### Opção 2: Hospedagem Online
Você pode hospedar gratuitamente em:
- **GitHub Pages**: Faça upload de todos os arquivos para um repositório
- **Netlify**: Arraste a pasta com todos os arquivos para netlify.com/drop
- **Vercel**: Conecte seu repositório GitHub
- **000webhost**: Hospedagem gratuita tradicional

## ✨ Características do Novo Design

### Fundo
- **Cor base:** Verde do GEPERA (#1a5f3e) com variações de tonalidade
- **Padrão:** Imagem de símbolos religiosos integrada ao fundo verde
- **Efeito:** Padrão fixo que não rola com a página (parallax)
- **Sem camadas brancas:** Todo o site utiliza variações de verde

### Hero Section (Página Inicial)
- **Layout em duas colunas**: Logo GEPERA à esquerda + Textos à direita
- **Logo oficial**: 380px de largura com efeito de sombra
- **Título centralizado**: Em dourado (#d4af37) com gradiente animado
- **Textos justificados**: Em creme claro para ótima legibilidade
- **Responsivo**: Em mobile, logo aparece acima dos textos (layout vertical)

### Outras Seções
- **Sobre:** Fundo verde claro (#2d7a57)
- **Objetivos:** Fundo verde médio (#236b4a) com cards em verde claro
- **Pesquisa:** Fundo verde mais claro (#3a8c65) com cards em verde escuro
- **Pesquisadores:** Fundo verde pálido (#4fa077) com cards em verde escuro
- **Ações:** Fundo verde primário (#1a5f3e) com cards em verde claro
- **Destaques:** Dourado (#d4af37) para títulos e elementos importantes

### Responsividade
- Totalmente responsivo em todos os dispositivos
- Mobile-first design
- Ajustes automáticos para tablets e desktops

## 🎨 Personalização

### Ajustar Tamanho da Logo
No arquivo `style.css`, localize `.hero-logo img` e ajuste a largura:

```css
.hero-logo img {
    width: 380px; /* Mude este valor */
}
```

- `320px` = Logo menor
- `450px` = Logo maior

### Ajustar Tonalidade do Verde
No arquivo `style.css`, localize as variáveis CSS no início e ajuste as cores:

```css
:root {
    --primary-green: #1a5f3e;      /* Verde base */
    --primary-green-dark: #0f3d28; /* Verde escuro */
    --primary-green-light: #2d7a57;/* Verde claro */
    --green-medium: #236b4a;       /* Verde médio */
    --green-lighter: #3a8c65;      /* Verde mais claro */
    --green-pale: #4fa077;         /* Verde pálido */
}
```

### Ajustar Tamanho dos Símbolos
No arquivo `style.css`, localize `background-size` no `body`:

```css
body {
    background-size: 400px; /* Mude este valor */
}
```

- `300px` = Símbolos menores e mais densos
- `600px` = Símbolos maiores e mais espaçados

### Ajustar Contraste dos Textos
Para mudar a cor dos textos claros, ajuste:

```css
.hero-text-content p {
    color: var(--neutral-cream); /* Texto claro: #f8f6f0 */
}
```

Para mudar a cor dos destaques dourados:

```css
.hero-main-title {
    color: var(--accent-gold); /* Dourado: #d4af37 */
}
```

## 📱 Compatibilidade

Testado e funcional em:
- ✅ Chrome/Edge (versões recentes)
- ✅ Firefox (versões recentes)
- ✅ Safari (versões recentes)
- ✅ Mobile browsers (iOS e Android)

## 🔧 Recursos Implementados

### Design
- ✅ Fundo verde com padrão de símbolos religiosos
- ✅ Paleta de cores baseada no contexto amazônico
- ✅ Tipografia elegante (Libre Baskerville + Outfit)
- ✅ Totalmente responsivo (mobile, tablet, desktop)
- ✅ Animações suaves e interativas

### Funcionalidades
- ✅ Menu de navegação fixo com scroll
- ✅ Menu mobile hamburger
- ✅ Smooth scroll entre seções
- ✅ Animações ao rolar a página
- ✅ Indicador de seção ativa
- ✅ Efeitos hover em cards e botões
- ✅ Performance otimizada

### Seções
1. **Página Inicial** - Hero com apresentação
2. **Sobre** - História do GEPERA
3. **Objetivos & Metas** - Objetivos e metas do grupo
4. **Pesquisa** - Linhas de pesquisa
5. **Pesquisadores** - Coordenadores
6. **Ações** - Atividades e eventos

## 📝 Notas Importantes

1. **Arquivos necessários:** Certifique-se de que todos os **6 arquivos** estejam na mesma pasta:
   - index.html
   - style.css
   - script.js
   - gepera-logo.png
   - religious-symbols-bg.png
   - README.md (opcional)
2. **Nome dos arquivos:** Os arquivos de imagem devem ter exatamente estes nomes (case-sensitive)
3. **Hospedagem:** Ao fazer upload para servidor, mantenha todos os arquivos juntos
4. **Performance:** As imagens foram otimizadas, mas o total é ~450KB - normal para um site moderno

## 🆘 Solução de Problemas

**Logo não aparece:**
- Verifique se `gepera-logo.png` está na mesma pasta que os outros arquivos
- Verifique se o nome do arquivo está correto (case-sensitive)
- Teste abrir a imagem diretamente no navegador

**Imagem de fundo não aparece:**
- Verifique se `religious-symbols-bg.png` está na mesma pasta
- Verifique o nome do arquivo (case-sensitive em alguns servidores)

**Fundo muito escuro ou muito claro:**
- Ajuste as variações de verde nas variáveis CSS (`:root`)
- Experimente valores diferentes de `background-blend-mode` no body

**Logo muito grande ou pequena:**
- Ajuste a largura em `.hero-logo img` no CSS (padrão: 380px)

**Layout quebrado em mobile:**
- Certifique-se de que o CSS está carregando corretamente
- Limpe o cache do navegador (Ctrl+F5)

## 📞 Customização Adicional

Para personalizações mais avançadas:
- Consulte a documentação de CSS para backgrounds e opacidade
- Use as ferramentas de desenvolvedor do navegador (F12)
- Recursos úteis: MDN Web Docs, W3Schools, CSS-Tricks

## 📄 Licença

Desenvolvido para o GEPERA - Todos os direitos reservados.

---

**Desenvolvido com** 💚 **para o Grupo de Estudos e Pesquisa em Ensino Religioso na Amazônia**

**Versão:** 3.0 (com logo oficial do GEPERA na página inicial)  
**Data:** Fevereiro 2026
