import Foundation

struct Skill: Identifiable {
    let id: String
    let name: String
    let domain: String
    let description: String
    let weeks: Int
}

struct Message: Identifiable {
    let id: String
    let role: MessageRole
    let content: String
    let timestamp: String

    enum MessageRole { case user, coach }
}

let mockSkills: [Skill] = [
    Skill(id: "1", name: "Difficult Conversations", domain: "Leadership", description: "Navigate feedback, conflict, and hard truths with clarity and care.", weeks: 4),
    Skill(id: "2", name: "Delegation & Trust", domain: "Management", description: "Hand off work in ways that build team capability, not dependency.", weeks: 4),
    Skill(id: "3", name: "Leadership Presence", domain: "Leadership", description: "Command attention, inspire confidence, and lead from the front.", weeks: 4),
    Skill(id: "4", name: "Managing Up", domain: "Career", description: "Build productive relationships with executives.", weeks: 3),
    Skill(id: "5", name: "Giving Feedback", domain: "Management", description: "Deliver feedback that changes behavior without damaging relationships.", weeks: 4),
    Skill(id: "6", name: "Strategic Thinking", domain: "Strategy", description: "Zoom out, see the landscape, and make decisions that compound.", weeks: 4),
]

let mockMessages: [Message] = [
    Message(id: "1", role: .coach, content: "Let's pick up where we left off. You mentioned wanting to address Jordan's performance. What's been holding you back from having that conversation?", timestamp: "8:26 AM"),
    Message(id: "2", role: .user, content: "Honestly I'm worried he'll get defensive. We have a good relationship and I don't want to damage it.", timestamp: "8:27 AM"),
    Message(id: "3", role: .coach, content: "That concern — wanting to protect the relationship — actually makes this conversation more important, not less. The relationship suffers more from avoidance than from honesty delivered with care.", timestamp: "8:28 AM"),
    Message(id: "4", role: .user, content: "I hadn't thought about it that way. What does that look like practically?", timestamp: "8:29 AM"),
]

let coachResponses = [
    "That's an important insight. What do you think made it difficult to say that directly?",
    "Let's sit with that. If you imagine the best version of that conversation, what does it look like?",
    "What would you tell a peer who came to you with this exact situation?",
    "The fact that you care this much about getting it right is itself a leadership quality.",
    "Let's try something. Walk me through how you'd open that conversation. First sentence — go.",
    "What's the best outcome you're hoping for from this conversation?",
]
