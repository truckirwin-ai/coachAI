import SwiftUI

struct DashboardView: View {
    @AppStorage("userName") var userName = "Coach"

    var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "Good morning" }
        else if hour < 17 { return "Good afternoon" }
        else { return "Good evening" }
    }

    let recentSessions = [
        ("🎯", "Difficult Conversations", "Today • 18 min"),
        ("📊", "Strategic Thinking", "Yesterday • 22 min"),
        ("💬", "Giving Feedback", "Mar 1 • 15 min"),
        ("🚀", "Leadership Presence", "Feb 28 • 20 min"),
    ]

    let goals = [
        ("Have the Jordan conversation", 0.7),
        ("Improve feedback clarity", 0.45),
        ("Run better 1:1s", 0.3),
    ]

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(greeting), \(userName.isEmpty ? "Coach" : userName) 👋")
                            .font(.title2).bold()
                            .foregroundColor(Theme.text)
                        Text("You're on a 12-day streak. Keep it going.")
                            .font(.subheadline)
                            .foregroundColor(Theme.textMuted)
                    }
                    .padding(.horizontal)

                    // Current Program Card
                    currentProgramCard

                    // Stats Row
                    HStack(spacing: 12) {
                        statCard(value: "4", label: "Skills")
                        statCard(value: "81", label: "Score")
                        statCard(value: "12", label: "Day Streak 🔥")
                    }
                    .padding(.horizontal)

                    // Recent Sessions
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Sessions")
                            .font(.headline)
                            .foregroundColor(Theme.text)
                            .padding(.horizontal)

                        VStack(spacing: 0) {
                            ForEach(Array(recentSessions.enumerated()), id: \.offset) { idx, session in
                                HStack(spacing: 12) {
                                    Text(session.0)
                                        .font(.title3)
                                        .frame(width: 36, height: 36)
                                        .background(Theme.surface)
                                        .cornerRadius(8)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(session.1)
                                            .font(.subheadline).bold()
                                            .foregroundColor(Theme.text)
                                        Text(session.2)
                                            .font(.caption)
                                            .foregroundColor(Theme.textMuted)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.caption)
                                        .foregroundColor(Theme.border)
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 12)
                                if idx < recentSessions.count - 1 {
                                    Divider().padding(.horizontal)
                                }
                            }
                        }
                        .background(Theme.surface)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.border, lineWidth: 1))
                        .padding(.horizontal)
                    }

                    // Active Goals
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Active Goals")
                            .font(.headline)
                            .foregroundColor(Theme.text)
                            .padding(.horizontal)

                        VStack(spacing: 12) {
                            ForEach(Array(goals.enumerated()), id: \.offset) { _, goal in
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(goal.0)
                                        .font(.subheadline)
                                        .foregroundColor(Theme.text)
                                    GeometryReader { geo in
                                        ZStack(alignment: .leading) {
                                            RoundedRectangle(cornerRadius: 4)
                                                .fill(Theme.border)
                                                .frame(height: 6)
                                            RoundedRectangle(cornerRadius: 4)
                                                .fill(Theme.accent)
                                                .frame(width: geo.size.width * goal.1, height: 6)
                                        }
                                    }
                                    .frame(height: 6)
                                    Text("\(Int(goal.1 * 100))%")
                                        .font(.caption)
                                        .foregroundColor(Theme.textMuted)
                                }
                                .padding(14)
                                .background(Theme.surface)
                                .cornerRadius(12)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.top)
                .padding(.bottom, 32)
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationBarHidden(true)
        }
    }

    var currentProgramCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("CURRENT PROGRAM")
                        .font(.caption).bold()
                        .foregroundColor(.white.opacity(0.7))
                    Text("Difficult Conversations")
                        .font(.title3).bold()
                        .foregroundColor(.white)
                }
                Spacer()
                Text("4 weeks")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(.white.opacity(0.2))
                    .cornerRadius(20)
            }

            // Week dots
            HStack(spacing: 8) {
                ForEach(["W1", "W2", "W3", "W4", "Eval"], id: \.self) { week in
                    HStack(spacing: 4) {
                        Image(systemName: week == "W1" ? "checkmark.circle.fill" : week == "W2" ? "circle.fill" : "circle")
                            .font(.caption)
                            .foregroundColor(week == "W1" ? .white : week == "W2" ? .white.opacity(0.9) : .white.opacity(0.4))
                        Text(week)
                            .font(.caption2)
                            .foregroundColor(week == "W1" || week == "W2" ? .white : .white.opacity(0.5))
                    }
                }
                Spacer()
            }

            Button(action: {}) {
                Text("Start Refresher →")
                    .font(.subheadline).bold()
                    .foregroundColor(Theme.accent)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(.white)
                    .cornerRadius(10)
            }
        }
        .padding(20)
        .background(
            LinearGradient(colors: [Theme.accent, Color(hex: "6B4F10")], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .cornerRadius(16)
        .padding(.horizontal)
    }

    func statCard(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2).bold()
                .foregroundColor(Theme.text)
            Text(label)
                .font(.caption)
                .foregroundColor(Theme.textMuted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Theme.surface)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
    }
}
