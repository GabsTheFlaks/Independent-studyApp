# Plano do Jules o Grande: Arquitetura e Refatoração do Sistema Educacional

Saudações, Jules! Este documento é o seu guia definitivo para a arquitetura e refatoração deste repositório. O usuário (nosso chefe) solicitou um planejamento profundo e decisões arquiteturais robustas para transformar o sistema atual. Sua missão é implementar essas diretrizes.

Aqui está o roadmap completo do que foi decidido. Siga-o rigorosamente.

---

## 0. Configuração Inicial e Clonagem (IMPORTANTE)

Como este repositório está limpo, **sua primeira tarefa antes de qualquer refatoração** é clonar o código fonte original para cá.
*   O usuário irá te fornecer (no prompt inicial ou via variáveis) a URL do repositório antigo.
*   Clone o repositório original para dentro desta pasta, garantindo que você tenha as pastas `frontend` (React) e `backend` (FastAPI) devidamente mapeadas no seu ambiente antes de prosseguir com os passos abaixo.

---

## 1. Refatoração Visual: Interface estilo Google Classroom

O objetivo principal do frontend é abandonar o layout atual genérico e adotar uma interface limpa, dividida e focada em turmas, semelhante ao Google Classroom.

### 1.1 Estrutura Global (Layout)
*   **Abandone a `div` única raiz.** O sistema deve usar um layout moderno de Dashboard (ex: `ClassroomLayout.jsx`).
*   **Container Principal:** Utilize `flex h-screen overflow-hidden bg-white`.
*   **Navbar (Topo):** Limpa. Deve conter o botão sanduíche (para abrir/fechar o menu lateral), a logo "Sala de Aula", e à direita, ícones de ação rápida (ex: "+ Adicionar Curso" se for admin) e o Avatar do usuário com dropdown para "Sair".
*   **Sidebar (Menu Lateral):** As antigas abas ("Meus Cursos" e "Catálogo Geral") deixam de existir no topo. Elas viram itens de navegação na barra lateral.

### 1.2 Design do Card de Curso (CourseCard.jsx)
O `CourseCard` sofrerá a maior alteração para ficar idêntico ao Classroom:
*   **Topo:** Metade superior com imagem de fundo ou cor sólida. Título e nome do professor devem ficar **sobrepostos** à imagem (texto branco).
*   **Avatar:** O avatar do professor deve flutuar quebrando a divisão entre o cabeçalho colorido e a área branca inferior (`absolute -bottom-6 right-4`).
*   **Centro:** Espaço em branco limpo. Remover a exibição da descrição longa do curso.
*   **Rodapé:** Uma linha horizontal fina separando a área de ícones (como o ícone de uma pasta) ou ações secundárias.
*   **Interação:** O card inteiro deve ser clicável para "Acessar" o curso (se matriculado). O botão gigante de matricular deve sumir, substituído por um ícone sutil ou modal.

---

## 2. Decisão de Backend e Autenticação

*   **Status Atual:** O sistema roda em **FastAPI + SQLite** com JWT em cookies HTTP-Only.
*   **Diretriz para o Jules:** O usuário avaliou a possibilidade de ir para o **Supabase** (que trocaria tudo por PostgreSQL, Auth embutido e RLS), porém, para não gerar custos de Storage, e para mantermos o controle das regras, a decisão atual é focar na **Refatoração da UI primeiro**.
*   **Se for solicitada a migração para Supabase no futuro:** Lembre-se de deletar a pasta `backend` antiga, usar `@supabase/supabase-js` no frontend e aplicar RLS (Row Level Security) estrito para que alunos só vejam cursos onde estão matriculados.

---

## 3. Armazenamento de Arquivos: Integração Google Drive API

Para economizar custos com armazenamento (evitando pagar por S3 ou Supabase Storage), o sistema utilizará o **Google Drive** como banco de arquivos gratuito, mas de forma **totalmente invisível para o usuário final**.

### 3.1 Fluxo de Upload (UX do Admin)
O Admin **não deve** ir ao Google Drive fazer upload manual e colar links.
*   No Frontend (`Admin.jsx`), crie um formulário com 3 campos:
    1.  **Título do Material** (Ex: "Apostila de Física") - Obrigatório.
    2.  **Descrição** (Opcional).
    3.  **Input de Arquivo (File Upload)**.
*   **Problema resolvido:** O Admin pode subir arquivos com nomes péssimos (ex: `WhatsApp Image 2026.pdf`). O sistema vai tratar isso.

### 3.2 A Mágica no Backend (Google Drive API)
A integração usará a **Google Drive API** (não a Activity nem a Labels) autenticada via **Service Account** (Conta de Serviço / Arquivo `.json`).
*   O Backend recebe o arquivo `WhatsApp Image.pdf` e o título "Apostila de Física".
*   Ao disparar o upload para o Google Drive via API, o Backend deve enviar nos metadados da requisição o campo `name` preenchido com o **Título do Material**.
*   **Resultado no Drive:** O arquivo será salvo limpo, como `Apostila de Física.pdf`.
*   O Drive retorna um `File ID`.

### 3.3 Persistência no Banco de Dados
O Banco de Dados (SQLite/PostgreSQL) **nunca** armazena o nome original zoado do arquivo. Ele armazena:
*   `title`: O título amigável digitado pelo Admin.
*   `description`: A descrição.
*   `drive_link`: A URL de visualização gerada a partir do `File ID`.

No Frontend do aluno, apenas o `title` será exibido, garantindo uma apresentação totalmente profissional.

---

**Boa sorte, Jules! Execute este plano com a excelência técnica esperada.**