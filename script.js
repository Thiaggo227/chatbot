const webhookURL = "https://thiaggosilva.app.n8n.cloud/webhook/chatbot";

const input = document.getElementById("input");
const chat = document.getElementById("chat");

// Enter envia mensagem

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        enviarMensagem();
    }

});

// Criar ID da sessão

let sessionId = localStorage.getItem("sessionId");

if (!sessionId) {

    sessionId = crypto.randomUUID();

    localStorage.setItem("sessionId", sessionId);

}

// Função principal

async function enviarMensagem() {

    const mensagem = input.value.trim();

    // Não envia vazio

    if (mensagem === "") return;

    // Adiciona mensagem usuário

    adicionarMensagem(mensagem, "user");

    // Limpa input

    input.value = "";

    // Mensagem carregando

    const loadingId = adicionarLoading();

    try {

        const resposta = await fetch(webhookURL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: mensagem,
                sessionId: sessionId

            })

        });

        // Remove loading

        removerLoading(loadingId);

        // Verifica erro HTTP

        if (!resposta.ok) {

            adicionarMensagem(
                "Erro no servidor da IA.",
                "bot"
            );

            return;
        }

        const dados = await resposta.json();

        // Resposta da IA

        adicionarMensagem(
            dados.reply || "Sem resposta da IA.",
            "bot"
        );

    } catch (erro) {

        removerLoading(loadingId);

        adicionarMensagem(
            "Erro ao conectar com a IA.",
            "bot"
        );

        console.error(erro);

    }

}

// Criar mensagem

function adicionarMensagem(texto, tipo) {

    const div = document.createElement("div");

    div.classList.add(
        tipo === "user"
            ? "user-message"
            : "bot-message"
    );

    div.innerHTML = `
        <div class="message">
            ${texto}
        </div>
    `;

    chat.appendChild(div);

    // Scroll automático

    chat.scrollTop = chat.scrollHeight;

}

// Loading

function adicionarLoading() {

    const id = Date.now();

    const div = document.createElement("div");

    div.classList.add("bot-message");

    div.id = id;

    div.innerHTML = `
        <div class="message loading">
            Digitando...
        </div>
    `;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;

    return id;

}

// Remove loading

function removerLoading(id) {

    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.remove();
    }

}
