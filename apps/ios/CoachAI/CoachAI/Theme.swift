import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

struct Theme {
    static let bg = Color(hex: "F5F0E8")
    static let surface = Color(hex: "EDE8DC")
    static let border = Color(hex: "D4C9B0")
    static let text = Color(hex: "2C2416")
    static let textMuted = Color(hex: "7A6A50")
    static let accent = Color(hex: "8B6914")
    static let success = Color(hex: "4A7C59")
}
