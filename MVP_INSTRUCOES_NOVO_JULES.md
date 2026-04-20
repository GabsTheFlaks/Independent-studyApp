# Plataforma Educacional Independente (MVP) - Instruções para o Jules

Olá, Jules! Este é o roteiro base para a construção do nosso Mínimo Produto Viável (MVP) de uma plataforma educacional independente.

**Por favor, leia todas as especificações abaixo antes de começar a codar. Você deve executar este projeto do zero, focado em alta qualidade de Frontend e utilizando BaaS (Backend as a Service).**

---

## 1. Visão Geral e Arquitetura

O objetivo é criar uma plataforma de estudos limpa, rápida e responsiva onde alunos podem visualizar cursos e administradores (professores) podem cadastrá-los.

A grande sacada de arquitetura para economizar custos de infraestrutura neste MVP é **não armazenar arquivos pesados localmente**.
- O conteúdo das aulas (PDFs, Vídeos, planilhas, docs) será hospedado externamente (Google Drive com links `/preview` públicos ou YouTube Embed).
- O nosso banco de dados armazenará apenas os metadados do curso e o link.
- O Frontend será responsável por renderizar esse link do professor de forma responsiva dentro de um `<iframe>`.

### Stack Tecnológica Exigida:
- **Frontend:** React (usando Vite), Tailwind CSS (para estilização), React Router DOM (para roteamento) e Lucide React (para ícones).
- **Backend, Banco de Dados e Autenticação:** Supabase. Não usaremos Python, Node.js ou SQLite locais. Toda a comunicação de dados e login será feita através do `@supabase/supabase-js` diretamente no Frontend.

---

## 2. Modelagem do Banco de Dados (Supabase)

Você deverá instruir o usuário sobre como configurar (via painel do Supabase ou script SQL) as seguintes tabelas no PostgreSQL:

1.  **Tabela `users` (Perfis customizados):**
    -   `id` (UUID, referenciando o `auth.users` do Supabase)
    -   `email` (String)
    -   `firstname` (String)
    -   `lastname` (String)
    -   `role` (String, default: `'student'`)

2.  **Tabela `courses`:**
    -   `id` (UUID ou BigInt serial)
    -   `title` (String, obrigatório)
    -   `description` (Text)
    -   `category` (String)
    -   `link_drive` (String, obrigatório - *a URL que vai para o Iframe*)
    -   `file_type` (String, enum: `pdf, video, docs, pptx, xls`)
    -   `thumbnail_url` (String - *URL da imagem de capa do curso*)

---

## 3. Especificações de Funcionalidades (O que deve ser construído)

O projeto deve ser dividido logicamente nas seguintes etapas/telas em React:

### Etapa 1: Autenticação e Contexto Global
-   Criar um `AuthContext.jsx` que inicialize e escute o cliente do Supabase (`supabase.auth.onAuthStateChange`).
-   O contexto deve prover o usuário logado, estado de carregamento (`loading`), e métodos de login/registro/logout.
-   **RBAC (Controle de Acesso):** O contexto deve buscar a `role` do usuário (na tabela pública `users` criada acima) assim que o login ocorrer, para sabermos se ele é `'student'` ou `'admin'`.

### Etapa 2: Telas de Acesso (Login e Registro)
-   Criar `LoginPage.jsx` e `RegisterPage.jsx` com formulários limpos em Tailwind (fundo cinza, card branco centralizado).
-   Tratar erros de autenticação visíveis ao usuário (ex: "Senha fraca", "E-mail já cadastrado").

### Etapa 3: Vitrine de Cursos (Dashboard)
-   Criar `Dashboard.jsx`, protegido por autenticação.
-   **Header:** Exibir o nome do usuário logado, um botão "Sair" e, **se a role for 'admin'**, um botão verde "Adicionar Curso".
-   **Grid de Cursos:** Fazer um `SELECT` na tabela `courses` do Supabase e renderizá-los em cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
-   **Fallback de Imagem:** Inteligência crucial! Criar um componente isolado (`CourseImage`) que intercepte erros de carregamento na `thumbnail_url` (usando `onError`). Se o link da imagem estiver quebrado, renderizar um placeholder elegante usando Tailwind e um ícone do `lucide-react` (ex: `ImageOff`) informando "Sem Imagem".
-   **Estados de UI:** Exibir *Skeleton Loading* enquanto os cursos carregam do Supabase, e um Empty State (estado vazio) amigável se não houver nenhum curso.

### Etapa 4: O Visualizador de Aulas (Viewer)
-   Criar `Viewer.jsx` na rota `/course/:id`.
-   Ao abrir a página, fazer fetch no Supabase pelo `id` do curso.
-   Renderizar um cabeçalho simples (botão voltar, título do curso e um badge mostrando o `file_type`).
-   Logo abaixo do cabeçalho, ocupar o resto da tela 100% com um `<iframe>` cuja propriedade `src` recebe o `link_drive`. Ajustar via Tailwind para ser responsivo e não quebrar em celulares.
-   Ter uma UI de Fallback (Erro 404) estilizada caso o curso não exista ou a requisição falhe, oferecendo um botão "Voltar ao Dashboard".

### Etapa 5: Painel de Cadastro (Admin)
-   Criar `Admin.jsx` na rota protegida `/admin` (Criar um `<AdminRoute>` no React Router que bloqueie usuários com role `'student'` e os redirecione para `/dashboard`).
-   A página conterá um formulário consumindo o Supabase (Insert na tabela `courses`).
-   **Campos:** Título, Descrição, Categoria, Tipo de Arquivo (Select), URL da Imagem e Link do Drive.
-   **Preview Dinâmico:** Abaixo do input de `thumbnail_url`, exibir a miniatura da imagem em tempo real à medida que o professor cola a URL. Caso a URL seja inválida, exibir um aviso de erro (`onError`) no próprio preview, alertando que será usado um placeholder no painel principal.
-   Exibir estados de carregamento (botão "Salvando...") e mensagem de sucesso antes de redirecionar para a home.

---

## 4. Regras de Ouro para o Jules
1.  **Beleza e Responsividade:** Você é um excelente engenheiro Frontend. Abuse do Tailwind CSS para criar interfaces limpas, modernas, com hover states, transições suaves (`transition-colors`, etc.) e garantia absoluta de funcionamento em dispositivos móveis.
2.  **Tratamento de Erros:** Nenhuma tela deve "quebrar" branca. Intercepte todos os `try/catch` das chamadas do Supabase e exiba os erros de forma tratada na UI.
3.  **Segurança RLS (Row Level Security):** Recomende ao usuário e, se possível, gere os snippets SQL para ativar as políticas RLS no Supabase (ex: qualquer usuário autenticado pode ler `courses`, mas apenas usuários com a role `admin` podem inserir dados).
4.  **Autonomia:** Verifique seu próprio código (build estático) antes de dar as tarefas como concluídas. Não precisa fazer simulação E2E pesada com Playwright, mas certifique-se de que não existem erros de importação ou Hooks React (useEffect/useState) fora do lugar.

Pronto, pode iniciar o setup do projeto!
