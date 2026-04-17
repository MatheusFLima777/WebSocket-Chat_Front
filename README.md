# 💬 WebSocket Chat — Frontend

Frontend de uma aplicação de chat em tempo real utilizando WebSocket, com autenticação via Auth0 e comunicação com backend Spring Boot hospedado no Railway.

---

## 🚀 Deploy

- **Frontend:** [web-socket-chat-front.vercel.app](https://web-socket-chat-front.vercel.app)
- **Backend:** [websocket-production-b4dd.up.railway.app](https://websocket-production-b4dd.up.railway.app)

---

## 🛠️ Tecnologias

- **HTML5 / CSS3 / JavaScript** — Vanilla, sem frameworks
- **WebSocket API** — Comunicação em tempo real
- **Auth0** — Autenticação e gerenciamento de sessão via JWT
- **Vercel** — Hospedagem do frontend

---

## 📁 Estrutura do Projeto

```
WebSocket-Chat_Front/
├── index.html          # Página de login
├── chat.html           # Página principal do chat
├── Css/                # Estilos da aplicação
├── js/
│   ├── auth.js         # Configuração e funções do Auth0
│   ├── backend.js      # Conexão WebSocket e chamadas REST
│   └── ...
└── assets/             # Imagens e recursos estáticos
```

---

## ⚙️ Como funciona

1. O usuário acessa `index.html` e realiza login via **Auth0**
2. Após autenticação, é redirecionado para `chat.html`
3. O frontend obtém o **JWT** do Auth0 e solicita um **ticket** ao backend
4. Com o ticket, abre uma conexão **WebSocket** com o backend
5. Mensagens são trocadas em tempo real entre os usuários conectados
6. A conexão é mantida viva via **ping/pong** a cada 10 segundos

---

## 🔐 Autenticação

A autenticação é gerenciada pelo **Auth0**. O fluxo utilizado é o **Authorization Code Flow** com redirecionamento.

Callbacks configurados no Auth0:
```
http://localhost:3000
https://web-socket-chat-front.vercel.app
https://web-socket-chat-front.vercel.app/chat.html
```

---

## 🔧 Configuração local

1. Clone o repositório:
```bash
git clone https://github.com/MatheusFLima777/WebSocket-Chat_Front.git
cd WebSocket-Chat_Front
```

2. Abra o projeto com um servidor local (ex: Live Server no VS Code) na porta `3000`

3. Certifique-se de que `http://localhost:3000` está nos **Allowed Callback URLs** e **Allowed Logout URLs** do seu tenant no Auth0

4. O backend local deve estar rodando em `http://localhost:8080`

---

## 🌐 Variáveis de ambiente (backend)

O frontend detecta automaticamente o ambiente:

```javascript
const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:8080"
    : "https://websocket-production-b4dd.up.railway.app";
```

Nenhuma configuração adicional é necessária no frontend para alternar entre ambientes.

---

## 📡 Repositório do Backend

O backend (Spring Boot) está disponível em: [WebSocket-Chat_Back](https://github.com/MatheusFLima777)
