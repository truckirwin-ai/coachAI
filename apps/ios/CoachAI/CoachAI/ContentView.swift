import SwiftUI

struct ContentView: View {
    @AppStorage("isOnboarded") var isOnboarded = false

    var body: some View {
        if !isOnboarded {
            OnboardingView()
        } else {
            TabView {
                DashboardView()
                    .tabItem { Label("Home", systemImage: "house.fill") }
                SessionView()
                    .tabItem { Label("Session", systemImage: "message.fill") }
                SkillsView()
                    .tabItem { Label("Skills", systemImage: "star.fill") }
                CoachProgressView()
                    .tabItem { Label("Progress", systemImage: "chart.bar.fill") }
            }
            .accentColor(Theme.accent)
            .background(Theme.bg)
        }
    }
}
