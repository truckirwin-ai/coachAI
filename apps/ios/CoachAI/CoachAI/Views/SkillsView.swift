import SwiftUI

struct SkillsView: View {
    @State private var selectedFilter = "All"
    let filters = ["All", "Leadership", "Management", "Communication", "Strategy", "Career"]

    var filteredSkills: [Skill] {
        if selectedFilter == "All" { return mockSkills }
        return mockSkills.filter { $0.domain == selectedFilter }
    }

    let domainColors: [String: Color] = [
        "Leadership": Color(hex: "8B6914"),
        "Management": Color(hex: "4A7C59"),
        "Career": Color(hex: "5B7FA6"),
        "Strategy": Color(hex: "8B4A6E"),
        "Communication": Color(hex: "C07820"),
    ]

    var body: some View {
        NavigationView {
            ZStack {
                Theme.bg.ignoresSafeArea()
                VStack(spacing: 0) {
                    // Filter pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(filters, id: \.self) { filter in
                                Button(action: { selectedFilter = filter }) {
                                    Text(filter)
                                        .font(.subheadline)
                                        .foregroundColor(selectedFilter == filter ? .white : Theme.textMuted)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 7)
                                        .background(selectedFilter == filter ? Theme.accent : Theme.surface)
                                        .cornerRadius(20)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 20)
                                                .stroke(selectedFilter == filter ? Theme.accent : Theme.border, lineWidth: 1)
                                        )
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 12)
                    }

                    ScrollView {
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            ForEach(filteredSkills) { skill in
                                skillCard(skill)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 32)
                    }
                }
            }
            .navigationTitle("Skills Library")
        }
    }

    func skillCard(_ skill: Skill) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            // Domain badge
            Text(skill.domain)
                .font(.caption2).bold()
                .foregroundColor(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(domainColors[skill.domain] ?? Theme.accent)
                .cornerRadius(6)

            Text(skill.name)
                .font(.subheadline).bold()
                .foregroundColor(Theme.text)
                .fixedSize(horizontal: false, vertical: true)

            Text(skill.description)
                .font(.caption)
                .foregroundColor(Theme.textMuted)
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)

            Spacer()

            HStack {
                Text("\(skill.weeks)w")
                    .font(.caption)
                    .foregroundColor(Theme.textMuted)
                Spacer()
                Button(action: {}) {
                    Text("Start")
                        .font(.caption).bold()
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 5)
                        .background(Theme.accent)
                        .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .topLeading)
        .background(Theme.surface)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.border, lineWidth: 1))
    }
}
