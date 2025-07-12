const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const askAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userQuestion = `    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com: 'Não sei a resposta para essa pergunta.';

    - Você está proibido de inventar, inferir respostas, só fale o que tem conhecimento;

    - Se a pergunta não estiver relacionada ao jogo, responda com: 'Essa pergunta não está relacionada ao jogo.';

    - Considere a data atual ${new Date().toLocaleDateString()};

    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.

    - Nunca responda ítems que você não tenha certeza de que existe no patch atual.
    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta:

    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual(versão patch e data de atualização do patch) é:\n\n **Runas:**\n\n exemplo de runas\n\n **Itens:**\n\n coloque os itens aqui.\n\n

    - Exemplo de uma resposta completa:
    ####A melhor build atual para **Jayce Top** no patch 15.13(atualizado em 24/06/2025) é:\n\n

    **Runas:**\n\n

    - Primária (Feitiçaria): Phase Rush, Manaflow Band, Absolute Focus, Gathering Storm
    - Secundária (Inspiração): Biscuit Delivery, Magical Footwear\n\n

    **Itens:**\n\n

    - Youmuu's Ghostblade
    - Ionian Boots of Lucidity
    - Manamune
    - Serylda's Grudge
    - Edge of Night\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: userQuestion,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  // chamada API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const sendForm = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  //console.log({ apiKey, game, question });

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    // perguntar para IA
    const text = await askAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", sendForm);
