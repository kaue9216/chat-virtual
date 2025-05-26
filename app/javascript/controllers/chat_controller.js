import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["prompt", "conversation"]
  currentPre = null

  connect() {
    this.currentPre = null
  }

  generateResponse(event) {
    event.preventDefault()

    this.createLabel("Você")
    this.createMessage(this.promptTarget.value)
    this.createLabel("Atendente")
    this.currentPre = this.createMessage()
    this.setupEventSource()

    this.promptTarget.value = ""
  }

  createLabel(text) {
    const label = document.createElement('strong')
    label.innerHTML = `${text}:`
    this.conversationTarget.appendChild(label)
  }

  createMessage(text = '') {
    const preElement = document.createElement('pre');
  preElement.style.whiteSpace = 'pre-wrap'; // Mantém quebras de linha
  preElement.style.wordBreak = 'break-word'; // Quebra palavras longas
  preElement.style.margin = '0.5rem 0';
  preElement.style.padding = '0.5rem';
  preElement.style.background = '#f5f5f5';
  preElement.style.borderRadius = '4px';
  preElement.textContent = text; // Usamos textContent em vez de innerHTML para segurança
  this.conversationTarget.appendChild(preElement);
  return preElement;
  }

  setupEventSource() {
    if (this.eventSource) {
      this.eventSource.close()
    }

    const prompt = encodeURIComponent(this.promptTarget.value)
    this.eventSource = new EventSource(`/chat_responses?prompt=${prompt}`)

    this.eventSource.addEventListener("message", this.handleMessage.bind(this))
    this.eventSource.addEventListener("error", this.handleError.bind(this))
  }

  handleMessage(event) {
    const parsedData = JSON.parse(event.data)
    if (this.currentPre) {
      this.currentPre.innerHTML += parsedData.message
      this.conversationTarget.scrollTop = this.conversationTarget.scrollHeight
    }
  }

  handleError(event) {
    if (event.eventPhase === EventSource.CLOSED) {
      this.eventSource.close()
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
    }
  }
}
