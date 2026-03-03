import SwiftUI

struct OnboardingView: View {
    @AppStorage("isOnboarded") var isOnboarded = false
    @AppStorage("userName") var userName = ""

    @State private var step = 0
    @State private var name = ""
    @State private var role = ""
    @State private var industry = "Technology"
    @State private var focusArea = "Leadership"
    @State private var selectedSkills: Set<String> = []

    let industries = ["Technology", "Finance", "Healthcare", "Education", "Retail", "Consulting", "Other"]
    let focusAreas = ["Leadership", "Management", "Communication", "Strategy", "Career Growth"]

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            VStack(spacing: 0) {
                // Progress dots
                HStack(spacing: 8) {
                    ForEach(0..<3) { i in
                        Circle()
                            .fill(i == step ? Theme.accent : Theme.border)
                            .frame(width: i == step ? 10 : 7, height: i == step ? 10 : 7)
                            .animation(.spring(), value: step)
                    }
                }
                .padding(.top, 60)
                .padding(.bottom, 32)

                Group {
                    if step == 0 { welcomeStep }
                    else if step == 1 { profileStep }
                    else { skillsStep }
                }
                Spacer()
            }
        }
    }

    // MARK: Step 1 - Welcome
    var welcomeStep: some View {
        VStack(spacing: 24) {
            Text("🎯")
                .font(.system(size: 72))
            Text("CoachAI")
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(Theme.text)
            Text("Your personal leadership coach.\nAvailable when you need it most.")
                .font(.subheadline)
                .foregroundColor(Theme.textMuted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            VStack(alignment: .leading, spacing: 16) {
                valueBullet(icon: "🧠", text: "AI coaching tailored to your challenges")
                valueBullet(icon: "📈", text: "Track skill growth with real metrics")
                valueBullet(icon: "🎯", text: "Practical scenarios, not generic advice")
            }
            .padding(.horizontal, 32)
            .padding(.top, 8)

            Button(action: { withAnimation { step = 1 } }) {
                Text("Get Started")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Theme.accent)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 32)
            .padding(.top, 12)
        }
    }

    func valueBullet(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Text(icon).font(.title3)
            Text(text)
                .font(.subheadline)
                .foregroundColor(Theme.text)
        }
    }

    // MARK: Step 2 - Profile
    var profileStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Tell us about you")
                .font(.title2).bold()
                .foregroundColor(Theme.text)
                .padding(.horizontal, 24)

            VStack(spacing: 16) {
                inputField(label: "Your Name", text: $name, placeholder: "e.g. Alex")
                inputField(label: "Your Role", text: $role, placeholder: "e.g. Engineering Manager")

                VStack(alignment: .leading, spacing: 6) {
                    Text("Industry").font(.caption).foregroundColor(Theme.textMuted)
                    Picker("Industry", selection: $industry) {
                        ForEach(industries, id: \.self) { Text($0) }
                    }
                    .pickerStyle(.menu)
                    .padding(12)
                    .background(Theme.surface)
                    .cornerRadius(10)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Focus Area").font(.caption).foregroundColor(Theme.textMuted)
                    Picker("Focus Area", selection: $focusArea) {
                        ForEach(focusAreas, id: \.self) { Text($0) }
                    }
                    .pickerStyle(.menu)
                    .padding(12)
                    .background(Theme.surface)
                    .cornerRadius(10)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
                }
            }
            .padding(.horizontal, 24)

            Button(action: { withAnimation { step = 2 } }) {
                Text("Continue")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(name.isEmpty ? Theme.border : Theme.accent)
                    .cornerRadius(14)
            }
            .disabled(name.isEmpty)
            .padding(.horizontal, 24)
        }
    }

    func inputField(label: String, text: Binding<String>, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.caption).foregroundColor(Theme.textMuted)
            TextField(placeholder, text: text)
                .padding(12)
                .background(Theme.surface)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
        }
    }

    // MARK: Step 3 - Skills
    var skillsStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Pick your first skill")
                .font(.title2).bold()
                .foregroundColor(Theme.text)
                .padding(.horizontal, 24)
            Text("Tap to select. You can change this anytime.")
                .font(.caption)
                .foregroundColor(Theme.textMuted)
                .padding(.horizontal, 24)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(mockSkills) { skill in
                    skillCard(skill)
                }
            }
            .padding(.horizontal, 16)

            Button(action: finish) {
                Text("Start Coaching →")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Theme.accent)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 24)
            .padding(.top, 8)
        }
    }

    func skillCard(_ skill: Skill) -> some View {
        let selected = selectedSkills.contains(skill.id)
        return Button(action: {
            if selected { selectedSkills.remove(skill.id) }
            else { selectedSkills.insert(skill.id) }
        }) {
            VStack(alignment: .leading, spacing: 8) {
                Text(skill.name)
                    .font(.subheadline).bold()
                    .foregroundColor(selected ? .white : Theme.text)
                    .multilineTextAlignment(.leading)
                Text(skill.domain)
                    .font(.caption)
                    .foregroundColor(selected ? .white.opacity(0.8) : Theme.textMuted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background(selected ? Theme.accent : Theme.surface)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(selected ? Theme.accent : Theme.border, lineWidth: 1))
        }
    }

    func finish() {
        userName = name
        isOnboarded = true
    }
}
