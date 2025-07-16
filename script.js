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

  const questionValorant = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, agentes, armas e dicas para que o usuário obtenha a melhor performance para realizar o que foi perguntado.

    ## Regras
    - Se você não sabe a resposta ou a informação pedida não existe ou é inválida, responda com: 'Não encontrei informações para essa pergunta. Por favor, verifique se o nome do mapa/agente/item está correto.'
    - Você está proibido de inventar, inferir ou alucinar respostas. Responda APENAS o que tem conhecimento e que é comprovadamente real no jogo.
    - Se a pergunta não estiver relacionada ao jogo, responda com: 'Essa pergunta não está relacionada ao jogo.';
    - Considere a data atual ${new Date().toLocaleDateString()};
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Se a pergunta for complexa, pense e analise cuidadosamente antes de responder, para ser o mais assertivo possível.
    
    
    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta:

    pergunta do usuário: Como jogar de Jett no ataque no mapa Ascent?
    resposta: Para Jett no ataque em Ascent (Patch e Data do Patch), priorize entrada rápida e eliminação.

    **Estratégia:**
    - Use 'Dash' (E) para entrar rapidamente em bomb sites após utilitários aliados.
    - Combine 'Updraft' (Q) com 'Tailwind' (E) para acessar posições elevadas.
    - Use 'Cloudburst' (C) para bloquear linhas de visão inimigas ou cobrir sua entrada/planta da Spike.
    - Priorize duelos rápidos e saia após o abate.

    **Dicas:**
    - Coordene seu Dash com flashes de aliados.
    - Pratique o uso de Updraft para escalar caixas e estruturas.
    - Use sua Ultimate 'Blade Storm' (X) em rounds de economia ou para garantir abates de forma segura.
    ---
    Aqui está a pergunta do usuário: ${question}

`;
  const questionLol = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game} (League of Legends).

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, incluindo estratégias de campeões, builds (runas e itens), ordem de habilidades, feitiços de invocador, matchups e dicas de posicionamento para que o usuário obtenha a melhor performance para realizar o que foi perguntado.

    ## Regras
    - Se você não sabe a resposta ou a informação pedida não existe ou é inválida, ou se o campeão na pergunta não for reconhecido ou for confundido, responda com: 'Não encontrei informações para essa pergunta. Por favor, verifique se o nome do campeão/item/runa está correto.'
    - Você está proibido de inventar, inferir ou alucinar respostas, ou de responder sobre um campeão diferente do que foi perguntado. Responda APENAS o que tem conhecimento e que é comprovadamente real no jogo sobre o campeão ESPECÍFICO da pergunta.
    - Se a pergunta não estiver relacionada ao jogo League of Legends, responda com: 'Essa pergunta não está relacionada ao jogo.'
    - Considere a data atual ${new Date().toLocaleDateString("pt-BR")};
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente e com informações do meta atual.
    - Se a pergunta for complexa, pense e analise cuidadosamente antes de responder, para ser o mais assertivo possível.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta
    - Seja direto e conciso, respondendo no máximo 500 caracteres.
    - Responda em Markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta BOA:

    pergunta do usuário: Melhor build e dicas para Rengar Jungle
    resposta: Para Rengar Jungle (Patch 15.13 - 16/07/2025), foque em burst e mobilidade.

    **Runas:**
    - Primária: Conquistador (ou Eletrocutar), Impacto Repentino, Globos Oculares, Caça Voraz.
    - Secundária: Celeridade, Caminhar Sobre as Águas.

    **Feitiços:**
    - Golpear, Flash (ou Purificar/Exaustão contra CC pesado).

    **Itens:**
    - Eclipse, Hidra Raivosa, A Coletora, Lembrete Mortal.

    **Dicas:**
    - Priorize ganks no nível 3 com W (Rugido de Batalha).
    - Use arbustos para engajar e resetar a passiva.
    - Foque alvos frágeis na ult.

    ## Exemplo de resposta RUIM (a ser EVITADA):

    pergunta do usuário: Melhor build de Aatrox TOP
    resposta: Para Jinx ADC (Patch 15.13 - 16/07/2025), foque em dano sustentado e velocidade de ataque para escalar bem para o late game.
    // Explicação: Esta resposta está incorreta porque o usuário perguntou sobre Aatrox, mas a resposta é sobre Jinx. EVITE este tipo de erro.

    pergunta do usuário: Quais as habilidades do Teemo?
    resposta: As habilidades do Ezreal são: Disparo Místico (Q), Fluxo Essencial (W)...
    // Explicação: Esta resposta está incorreta porque o usuário perguntou sobre Teemo, mas a resposta é sobre Ezreal. EVITE este tipo de erro.

    ---
    Aqui está a pergunta do usuário: ${question}
`;

  let chosenGame = "";

  if (game === "valorant") {
    chosenGame = questionValorant;
  } else {
    chosenGame = questionLol;
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: chosenGame,
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
