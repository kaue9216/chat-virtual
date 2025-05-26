class ChatResponsesController < ApplicationController
  include ActionController::Live

  def show
    prompt = params[:prompt]
    response.headers['Content-Type'] = 'text/event-stream'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'

    client = OpenAI::Client.new(access_token: ENV["OPENAI_ACCESS_TOKEN"])

    begin
      client.chat(
        parameters: {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "Você é um atendente de uma agencia de marketing digital chamada Kanka.
              Suas respostas devem ser:
               - Sempre sobre marketing digital
               - Curtas e sucintas
               - Não podem parecer geradas por AI

              Eventualmente você deve convidar o cliente para uma reunião presencial.
              Caso a pessoa diga que não, você deve:
               - Seguir a conversa normalmente

              Caso a pessoa diga sim, você deve:
               - Enviar o link de nossa agenda: https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ354h1LmJXqbaXu7O0eERnGIv71XeAHBYn_gDLb8tDmWU7cHgvqZkxjCnVHk73Z60mW59w-8eyu
              "
            },
            { role: "user", content: prompt }],
          stream: proc do |chunk|
            content = chunk.dig("choices", 0, "delta", "content")
            next if content.nil?

            # Formato SSE correto
            response.stream.write("event: message\n")
            response.stream.write("data: #{JSON.generate({message: content})}\n\n")
          end
        }
      )
    rescue => e
      Rails.logger.error "Error in chat stream: #{e.message}"
    ensure
      response.stream.close
    end
  end
end
