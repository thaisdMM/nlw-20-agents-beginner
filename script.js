const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

const sendForm = (event) => {
    //previnir de fazer o esperado(enviar o formulário/atualizar a página)
  event.preventDefault()
  console.log(event);
};

form.addEventListener("submit", sendForm);
