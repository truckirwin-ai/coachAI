import SwiftUI

struct SessionView: View {
    @State private var messages: [Message] = []
    @State private var inputText = ""
    @State private var isThinking = false
    @State private var scrollProxy: ScrollViewProxy? = nil
    @StateObject private var voice = VoiceService.shared

    let skillName: String
    let quickPrompts = ["Help me open this", "Practice the scenario", "What am I avoiding?"]

    init(skillName: String = "Difficult Conversations") {
        self.skillName = skillName
    }

    var body: some View {
        NavigationView {
            ZStack {
                Theme.bg.ignoresSafeArea()
                VStack(spacing: 0) {
                    // Chat scroll
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(messages) { message in
                                    messageBubble(message)
                                        .id(message.id)
                                }
                                if isThinking {
                                    thinkingBubble
                                        .id("thinking")
                                }
                            }
                            .padding()
                        }
                        .onAppear {
                            scrollProxy = proxy
                        }
                        .onChange(of: messages.count) { _ in
                            withAnimation {
                                proxy.scrollTo(messages.last?.id ?? "thinking", anchor: .bottom)
                            }
                        }
                        .onChange(of: isThinking) { _ in
                            withAnimation {
                                if isThinking { proxy.scrollTo("thinking", anchor: .bottom) }
                            }
                        }
                    }

                    // Speaking indicator
                    if voice.isSpeaking {
                        HStack(spacing: 6) {
                            WaveformView()
                            Text("Tap mic to interrupt")
                                .font(.caption)
                                .foregroundColor(Theme.textMuted)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 6)
                        .background(Theme.surface)
                    }

                    Divider()

                    // Quick prompts
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(quickPrompts, id: \.self) { prompt in
                                Button(action: { sendMessage(prompt) }) {
                                    Text(prompt)
                                        .font(.caption)
                                        .foregroundColor(Theme.accent)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(Theme.surface)
                                        .cornerRadius(20)
                                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(Theme.border, lineWidth: 1))
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                    }

                    // Input bar
                    HStack(spacing: 10) {
                        TextField("Message your coach...", text: $inputText)
                            .padding(10)
                            .background(Theme.surface)
                            .cornerRadius(20)
                            .overlay(RoundedRectangle(cornerRadius: 20).stroke(Theme.border, lineWidth: 1))

                        // Mic button
                        Button(action: {
                            if voice.isSpeaking {
                                voice.stopSpeaking()
                                voice.startListening { partial in
                                    inputText = partial
                                }
                            } else if voice.isListening {
                                voice.stopListening()
                                if !voice.transcript.isEmpty {
                                    inputText = voice.transcript
                                    voice.transcript = ""
                                    sendMessage(inputText)
                                }
                            } else {
                                voice.startListening { partial in
                                    inputText = partial
                                }
                            }
                        }) {
                            Image(systemName: voice.isListening ? "mic.fill" : "mic")
                                .foregroundColor(voice.isListening ? .red : Theme.accent)
                                .font(.system(size: 20))
                        }

                        Button(action: { sendMessage(inputText) }) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                                .foregroundColor(inputText.isEmpty ? Theme.border : Theme.accent)
                        }
                        .disabled(inputText.isEmpty || isThinking)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 10)
                    .background(Theme.bg)
                }
            }
            .navigationTitle(skillName)
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            if messages.isEmpty {
                messages = mockMessages
            }
            voice.requestPermissions { _ in }
        }
    }

    func messageBubble(_ message: Message) -> some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.role == .coach {
                // Avatar
                Text("🎯")
                    .font(.caption)
                    .frame(width: 28, height: 28)
                    .background(Theme.accent)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text(message.content)
                        .font(.subheadline)
                        .foregroundColor(Theme.text)
                        .padding(12)
                        .background(Theme.surface)
                        .cornerRadius(16, corners: [.topLeft, .topRight, .bottomRight])
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Theme.border, lineWidth: 1)
                        )
                    Text(message.timestamp)
                        .font(.caption2)
                        .foregroundColor(Theme.textMuted)
                }
                Spacer(minLength: 60)
            } else {
                Spacer(minLength: 60)
                VStack(alignment: .trailing, spacing: 4) {
                    Text(message.content)
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .padding(12)
                        .background(Theme.accent)
                        .cornerRadius(16, corners: [.topLeft, .topRight, .bottomLeft])
                    Text(message.timestamp)
                        .font(.caption2)
                        .foregroundColor(Theme.textMuted)
                }
            }
        }
    }

    var thinkingBubble: some View {
        HStack(alignment: .bottom, spacing: 8) {
            Text("🎯")
                .font(.caption)
                .frame(width: 28, height: 28)
                .background(Theme.accent)
                .clipShape(Circle())
            ThinkingDotsView()
            Spacer()
        }
    }

    func sendMessage(_ text: String) {
        guard !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let userText = text
        inputText = ""

        let userMsg = Message(
            id: UUID().uuidString,
            role: .user,
            content: userText,
            timestamp: nowTime()
        )
        messages.append(userMsg)
        isThinking = true

        // Build Claude message history (all messages except the one we just added)
        let history = messages.dropLast().map { msg in
            ClaudeMessage(role: msg.role == .coach ? "assistant" : "user", content: msg.content)
        } + [ClaudeMessage(role: "user", content: userText)]

        // Add streaming coach message placeholder
        let coachId = UUID().uuidString
        let streamingMsg = Message(id: coachId, role: .coach, content: "", timestamp: nowTime())
        messages.append(streamingMsg)
        isThinking = false

        var accumulated = ""

        ClaudeService.shared.sendMessage(
            messages: Array(history),
            skillName: skillName,
            onToken: { token in
                accumulated += token
                if let idx = self.messages.firstIndex(where: { $0.id == coachId }) {
                    self.messages[idx] = Message(id: coachId, role: .coach, content: accumulated, timestamp: self.nowTime())
                }
            },
            onComplete: { fullText in
                // Speak the coach response
                if !fullText.isEmpty {
                    self.voice.speak(fullText)
                }
            },
            onError: { _ in
                // Fallback to canned response
                let fallback = coachResponses.randomElement() ?? "Tell me more about that."
                if let idx = self.messages.firstIndex(where: { $0.id == coachId }) {
                    self.messages[idx] = Message(id: coachId, role: .coach, content: fallback, timestamp: self.nowTime())
                }
                self.voice.speak(fallback)
            }
        )
    }

    func nowTime() -> String {
        let f = DateFormatter()
        f.timeStyle = .short
        return f.string(from: Date())
    }
}

// MARK: - Waveform animation for speaking indicator
struct WaveformView: View {
    @State private var phase: Double = 0
    let bars = 5

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<bars, id: \.self) { i in
                Capsule()
                    .fill(Theme.accent)
                    .frame(width: 3, height: CGFloat.random(in: 6...18))
                    .animation(
                        Animation.easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.08),
                        value: phase
                    )
            }
        }
        .onAppear { phase = 1 }
    }
}

struct ThinkingDotsView: View {
    @State private var phase = 0

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3) { i in
                Circle()
                    .fill(Theme.textMuted)
                    .frame(width: 6, height: 6)
                    .opacity(phase == i ? 1.0 : 0.3)
            }
        }
        .padding(12)
        .background(Theme.surface)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.4, repeats: true) { _ in
                phase = (phase + 1) % 3
            }
        }
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}
