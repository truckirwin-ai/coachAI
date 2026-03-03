import Foundation

struct ClaudeMessage: Codable {
    let role: String
    let content: String
}

struct ClaudeRequest: Codable {
    let model: String
    let max_tokens: Int
    let system: String
    let messages: [ClaudeMessage]
    let stream: Bool
}

struct ClaudeStreamDelta: Codable {
    let type: String
    let text: String?
}

struct ClaudeStreamEvent: Codable {
    let type: String
    let delta: ClaudeStreamDelta?
}

class ClaudeService: ObservableObject {
    static let shared = ClaudeService()

    // Set your API key here or via Info.plist key ANTHROPIC_API_KEY
    private let apiKey = Bundle.main.object(forInfoDictionaryKey: "ANTHROPIC_API_KEY") as? String ?? "PLACEHOLDER_KEY"

    private let systemPrompt = """
    You are an expert AI business coach. You are warm, direct, Socratic, and professional.
    Help business professionals develop real leadership and management skills.

    Your coaching style:
    - Ask powerful questions rather than giving lectures
    - Reflect back what you hear to deepen insight
    - Keep responses concise — 2-4 sentences, never more than 6
    - Never preachy, never generic, never corporate
    """

    func sendMessage(
        messages: [ClaudeMessage],
        skillName: String,
        onToken: @escaping (String) -> Void,
        onComplete: @escaping (String) -> Void,
        onError: @escaping (String) -> Void
    ) {
        let url = URL(string: "https://api.anthropic.com/v1/messages")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let claudeRequest = ClaudeRequest(
            model: "claude-sonnet-4-5",
            max_tokens: 300,
            system: systemPrompt + "\n\nCurrent skill: \(skillName)",
            messages: messages,
            stream: true
        )

        request.httpBody = try? JSONEncoder().encode(claudeRequest)

        var fullResponse = ""

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async { onError(error.localizedDescription) }
                return
            }
            guard let data = data, let text = String(data: data, encoding: .utf8) else {
                DispatchQueue.main.async { onError("No data received") }
                return
            }

            // Parse SSE stream
            let lines = text.components(separatedBy: "\n")
            for line in lines {
                if line.hasPrefix("data: ") {
                    let jsonStr = String(line.dropFirst(6))
                    if jsonStr == "[DONE]" { continue }
                    if let jsonData = jsonStr.data(using: .utf8),
                       let event = try? JSONDecoder().decode(ClaudeStreamEvent.self, from: jsonData) {
                        if event.type == "content_block_delta",
                           let text = event.delta?.text {
                            fullResponse += text
                            DispatchQueue.main.async { onToken(text) }
                        }
                    }
                }
            }
            DispatchQueue.main.async { onComplete(fullResponse) }
        }
        task.resume()
    }
}
