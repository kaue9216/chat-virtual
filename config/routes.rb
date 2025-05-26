Rails.application.routes.draw do
  root "chats#index"
  get "/chat_responses", to: "chat_responses#show"
end
