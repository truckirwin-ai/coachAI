import SwiftUI

struct CoachProgressView: View {
    let completedSkills = [
        ("Difficult Conversations", 88),
        ("Delegation & Trust", 74),
        ("Giving Feedback", 91),
    ]

    let rubricItems = [
        ("Clarity", 0.9),
        ("Empathy", 0.85),
        ("Directness", 0.82),
        ("Follow-through", 0.78),
        ("Confidence", 0.88),
    ]

    let aiFeedback = "You've made significant progress in how you approach difficult conversations. Your language has become more precise, and your instinct to protect relationships while still delivering hard truths is developing well. Focus next on follow-through — what happens after the conversation matters as much as the conversation itself."

    var body: some View {
        NavigationView {
            ZStack {
                Theme.bg.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Overall progress
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Overall Progress")
                                .font(.headline)
                                .foregroundColor(Theme.text)

                            GeometryReader { geo in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Theme.border)
                                        .frame(height: 12)
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Theme.accent)
                                        .frame(width: geo.size.width * 0.5, height: 12)
                                }
                            }
                            .frame(height: 12)

                            Text("50% — 3 of 6 skills completed")
                                .font(.caption)
                                .foregroundColor(Theme.textMuted)
                        }
                        .padding(.horizontal)

                        // Completed Skills
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Completed Skills")
                                .font(.headline)
                                .foregroundColor(Theme.text)
                                .padding(.horizontal)

                            VStack(spacing: 0) {
                                ForEach(Array(completedSkills.enumerated()), id: \.offset) { idx, skill in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(skill.0)
                                                .font(.subheadline).bold()
                                                .foregroundColor(Theme.text)
                                            Text("Completed")
                                                .font(.caption)
                                                .foregroundColor(Theme.success)
                                        }
                                        Spacer()
                                        Text("\(skill.1)")
                                            .font(.title3).bold()
                                            .foregroundColor(Theme.accent)
                                    }
                                    .padding(.horizontal)
                                    .padding(.vertical, 12)
                                    if idx < completedSkills.count - 1 {
                                        Divider().padding(.horizontal)
                                    }
                                }
                            }
                            .background(Theme.surface)
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.border, lineWidth: 1))
                            .padding(.horizontal)
                        }

                        // Evaluation Detail
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Latest Evaluation")
                                .font(.headline)
                                .foregroundColor(Theme.text)
                                .padding(.horizontal)

                            VStack(spacing: 16) {
                                // Big score
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Difficult Conversations")
                                            .font(.subheadline).bold()
                                            .foregroundColor(Theme.text)
                                        Text("Final Evaluation")
                                            .font(.caption)
                                            .foregroundColor(Theme.textMuted)
                                    }
                                    Spacer()
                                    Text("88")
                                        .font(.system(size: 48, weight: .bold))
                                        .foregroundColor(Theme.accent)
                                }

                                Divider()

                                // Rubric bars
                                VStack(spacing: 12) {
                                    ForEach(rubricItems, id: \.0) { item in
                                        HStack(spacing: 12) {
                                            Text(item.0)
                                                .font(.caption)
                                                .foregroundColor(Theme.textMuted)
                                                .frame(width: 90, alignment: .leading)
                                            GeometryReader { geo in
                                                ZStack(alignment: .leading) {
                                                    RoundedRectangle(cornerRadius: 4)
                                                        .fill(Theme.border)
                                                        .frame(height: 6)
                                                    RoundedRectangle(cornerRadius: 4)
                                                        .fill(Theme.accent)
                                                        .frame(width: geo.size.width * item.1, height: 6)
                                                }
                                            }
                                            .frame(height: 6)
                                            Text("\(Int(item.1 * 100))")
                                                .font(.caption)
                                                .foregroundColor(Theme.textMuted)
                                                .frame(width: 28, alignment: .trailing)
                                        }
                                    }
                                }

                                Divider()

                                // AI Feedback
                                VStack(alignment: .leading, spacing: 8) {
                                    Label("AI Feedback", systemImage: "sparkles")
                                        .font(.caption).bold()
                                        .foregroundColor(Theme.accent)
                                    Text(aiFeedback)
                                        .font(.subheadline)
                                        .foregroundColor(Theme.text)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                                .padding(14)
                                .background(Theme.bg)
                                .cornerRadius(10)
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
                            }
                            .padding(16)
                            .background(Theme.surface)
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.border, lineWidth: 1))
                            .padding(.horizontal)
                        }
                    }
                    .padding(.top)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Progress")
        }
    }
}
