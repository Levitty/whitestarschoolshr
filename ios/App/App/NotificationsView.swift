import SwiftUI

struct NotificationsView: View {
    @Environment(\.dismiss) var dismiss
    @State private var notifications: [NotificationItem] = []
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.91, green: 0.95, blue: 0.92)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 12) {
                        if notifications.isEmpty {
                            emptyState
                        } else {
                            ForEach(notifications) { notification in
                                NotificationCard(notification: notification)
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                loadNotifications()
            }
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "bell.slash")
                .font(.system(size: 64))
                .foregroundColor(.gray)
                .padding(.top, 60)
            
            Text("No Notifications")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("You're all caught up!")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
    }
    
    private func loadNotifications() {
        // Sample notifications - we'll fetch real ones from Supabase later
        notifications = [
            NotificationItem(
                id: "1",
                title: "Leave Request Approved",
                message: "Your leave request for Dec 25-26 has been approved",
                time: "2 hours ago",
                type: .success,
                isRead: false
            ),
            NotificationItem(
                id: "2",
                title: "Document Ready",
                message: "Your employment certificate is ready for download",
                time: "1 day ago",
                type: .info,
                isRead: false
            ),
            NotificationItem(
                id: "3",
                title: "Reminder: Performance Review",
                message: "Your performance review is scheduled for tomorrow at 3:30 PM",
                time: "2 days ago",
                type: .warning,
                isRead: true
            )
        ]
    }
}

struct NotificationCard: View {
    let notification: NotificationItem
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Icon
            Circle()
                .fill(notification.type.color.opacity(0.2))
                .frame(width: 48, height: 48)
                .overlay(
                    Image(systemName: notification.type.icon)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(notification.type.color)
                )
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    if !notification.isRead {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 8, height: 8)
                    }
                }
                
                Text(notification.message)
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                Text(notification.time)
                    .font(.system(size: 12))
                    .foregroundColor(.secondary.opacity(0.7))
                    .padding(.top, 4)
            }
        }
        .padding(16)
        .background(Color(red: 0.97, green: 0.98, blue: 0.97))
        .cornerRadius(16)
    }
}

// MARK: - Models

struct NotificationItem: Identifiable {
    let id: String
    let title: String
    let message: String
    let time: String
    let type: NotificationType
    let isRead: Bool
}

enum NotificationType {
    case success
    case info
    case warning
    case error
    
    var icon: String {
        switch self {
        case .success: return "checkmark.circle.fill"
        case .info: return "info.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .error: return "xmark.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .success: return .green
        case .info: return .blue
        case .warning: return .orange
        case .error: return .red
        }
    }
}

#Preview {
    NotificationsView()
}
