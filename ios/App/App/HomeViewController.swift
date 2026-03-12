import UIKit
import SwiftUI
import WebKit

/*
 ┌─────────────────────────────────────────────────────────────┐
 │  HOME SCREEN - AUTO-LOADS LOGGED-IN EMPLOYEE DATA          │
 ├─────────────────────────────────────────────────────────────┤
 │                                                             │
 │  This home screen automatically loads data for the          │
 │  currently logged-in employee (e.g., Ruth Joy).             │
 │                                                             │
 │  How it works:                                              │
 │  1. Connects to your Capacitor web app                      │
 │  2. Reads logged-in user data from localStorage/session     │
 │  3. Updates the UI with real employee information           │
 │                                                             │
 │  To customize data sources:                                 │
 │  - Edit the JavaScript in requestUserDataFromWeb()          │
 │  - Update localStorage keys to match your web app           │
 │  - Add API calls if needed                                  │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
 */

class HomeViewController: UIHostingController<BeautifulHomeView> {
    
    init() {
        let homeView = BeautifulHomeView()
        super.init(rootView: homeView)
    }
    
    @MainActor required dynamic init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Request user data from the web app when view loads
        requestUserDataFromWeb()
    }
    
    private func requestUserDataFromWeb() {
        // Find the Capacitor webview and ask for user data
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            if let webView = self.findWebView(in: self.view.window?.rootViewController?.view) {
                // Send JavaScript to get logged in user data
                let script = """
                (function() {
                    // Get user data from Supabase session
                    var userData = {
                        name: 'Employee',
                        role: 'Staff',
                        hours: '0',
                        projects: '0',
                        tasks: '0',
                        leave: '0',
                        attendance: '0%'
                    };
                    
                    try {
                        // Get Supabase session from localStorage
                        var supabaseKeys = Object.keys(localStorage).filter(key => 
                            key.includes('supabase') || key.includes('auth')
                        );
                        
                        for (var i = 0; i < supabaseKeys.length; i++) {
                            var key = supabaseKeys[i];
                            var value = localStorage.getItem(key);
                            
                            try {
                                var parsed = JSON.parse(value);
                                
                                // Check if this is the auth session
                                if (parsed && parsed.user) {
                                    var user = parsed.user;
                                    var userId = user.id;
                                    
                                    // Get user metadata
                                    if (user.user_metadata) {
                                        userData.name = user.user_metadata.full_name || 
                                                       user.user_metadata.name || 
                                                       user.email || 
                                                       'Employee';
                                        userData.role = user.user_metadata.role || 
                                                       user.user_metadata.position || 
                                                       'Staff';
                                    }
                                    
                                    // Get email if no name
                                    if (userData.name === 'Employee' && user.email) {
                                        userData.name = user.email.split('@')[0].replace(/[._]/g, ' ');
                                        // Capitalize first letters
                                        userData.name = userData.name.split(' ')
                                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                            .join(' ');
                                    }
                                    
                                    // Now fetch real employee data from Supabase
                                    // This will be handled by a separate call
                                    userData.userId = userId;
                                    userData.email = user.email;
                                    
                                    break;
                                }
                            } catch(e) {
                                // Skip invalid JSON
                            }
                        }
                        
                    } catch(error) {
                        console.error('Error reading Supabase data:', error);
                    }
                    
                    return JSON.stringify(userData);
                })();
                """
                
                webView.evaluateJavaScript(script) { result, error in
                    if let error = error {
                        print("❌ Error fetching user data: \(error)")
                        return
                    }
                    
                    if let jsonString = result as? String {
                        print("📱 Received user data: \(jsonString)")
                        
                        if let jsonData = jsonString.data(using: .utf8) {
                            do {
                                if let userData = try JSONSerialization.jsonObject(with: jsonData) as? [String: String] {
                                    print("✅ Parsed user data successfully")
                                    print("   Name: \(userData["name"] ?? "unknown")")
                                    print("   Role: \(userData["role"] ?? "unknown")")
                                    
                                    // Now fetch detailed employee data from Supabase
                                    if let userId = userData["userId"] {
                                        self.fetchEmployeeData(webView: webView, userId: userId, userData: userData)
                                    } else {
                                        // Just send basic data
                                        NotificationCenter.default.post(
                                            name: NSNotification.Name("UpdateUserData"),
                                            object: nil,
                                            userInfo: userData
                                        )
                                    }
                                }
                            } catch {
                                print("❌ Error parsing user data JSON: \(error)")
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func findWebView(in view: UIView?) -> WKWebView? {
        guard let view = view else { return nil }
        
        if let webView = view as? WKWebView {
            return webView
        }
        
        for subview in view.subviews {
            if let webView = findWebView(in: subview) {
                return webView
            }
        }
        
        return nil
    }
    
    private func fetchEmployeeData(webView: WKWebView, userId: String, userData: [String: String]) {
        let fetchScript = """
        (async function() {
            try {
                // Get Supabase client from window
                const supabase = window.supabase;
                if (!supabase) {
                    return JSON.stringify({error: 'Supabase not available'});
                }
                
                const userId = '\(userId)';
                
                // Fetch employee profile
                const { data: profile } = await supabase
                    .from('employee_profiles')
                    .select('id, employee_number, department')
                    .eq('profile_id', userId)
                    .single();
                
                const employeeId = profile?.id;
                
                // Fetch leave balance for 2026
                const { data: leaveBalance } = await supabase
                    .from('leave_balances')
                    .select('annual_leave, sick_leave, casual_leave')
                    .eq('employee_id', employeeId)
                    .eq('year', 2026)
                    .single();
                
                // Count pending leave requests
                const { count: pendingRequests } = await supabase
                    .from('leave_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('employee_id', userId)
                    .eq('status', 'pending');
                
                // Count assigned assets
                const { count: assets } = await supabase
                    .from('company_assets')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_to', userId);
                
                // Count documents
                const { count: documents } = await supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('employee_id', userId);
                
                // Calculate total leave days
                const totalLeave = (leaveBalance?.annual_leave || 0) + 
                                  (leaveBalance?.sick_leave || 0) + 
                                  (leaveBalance?.casual_leave || 0);
                
                return JSON.stringify({
                    success: true,
                    leave: String(totalLeave),
                    projects: String(assets || 0),
                    tasks: String(documents || 0),
                    hours: String(pendingRequests || 0),
                    attendance: '100%',
                    department: profile?.department || ''
                });
            } catch(error) {
                console.error('Error fetching employee data:', error);
                return JSON.stringify({error: error.message});
            }
        })();
        """
        
        webView.evaluateJavaScript(fetchScript) { result, error in
            if let error = error {
                print("❌ Error fetching employee details: \(error)")
                // Send basic data anyway
                NotificationCenter.default.post(
                    name: NSNotification.Name("UpdateUserData"),
                    object: nil,
                    userInfo: userData
                )
                return
            }
            
            if let jsonString = result as? String,
               let jsonData = jsonString.data(using: .utf8) {
                do {
                    if let employeeData = try JSONSerialization.jsonObject(with: jsonData) as? [String: String] {
                        print("📊 Employee data fetched:")
                        print("   Leave days: \(employeeData["leave"] ?? "0")")
                        print("   Assets: \(employeeData["projects"] ?? "0")")
                        print("   Documents: \(employeeData["tasks"] ?? "0")")
                        
                        // Merge with user data
                        var fullData = userData
                        fullData["leave"] = employeeData["leave"]
                        fullData["projects"] = employeeData["projects"]
                        fullData["tasks"] = employeeData["tasks"]
                        fullData["hours"] = employeeData["hours"]
                        fullData["attendance"] = employeeData["attendance"]
                        
                        // Send complete data
                        NotificationCenter.default.post(
                            name: NSNotification.Name("UpdateUserData"),
                            object: nil,
                            userInfo: fullData
                        )
                    }
                } catch {
                    print("❌ Error parsing employee data: \(error)")
                    // Send basic data
                    NotificationCenter.default.post(
                        name: NSNotification.Name("UpdateUserData"),
                        object: nil,
                        userInfo: userData
                    )
                }
            }
        }
    }
}

// MARK: - Beautiful Home View (Mint Green Design)

struct BeautifulHomeView: View {
    // User Data - Will be populated from logged-in employee
    @State private var userName = "Ruth Joy"
    @State private var userRole = "Employee"
    @State private var currentTime = Date()
    
    // Stats Data - Will be populated from employee's actual data
    @State private var hoursWorked = "168"
    @State private var projectCount = "12"
    @State private var taskCount = "24"
    @State private var daysLeft = "15"
    @State private var attendancePercent = "98%"
    @State private var leaveProgress: Double = 0.75
    
    // UI State
    @State private var showNotifications = false
    @State private var showMenu = false
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    // Soft mint green color palette
    let mintBackground = Color(red: 0.91, green: 0.95, blue: 0.92)
    let cardBackground = Color(red: 0.97, green: 0.98, blue: 0.97)
    
    var body: some View {
        ZStack {
            // Background
            mintBackground.ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Top Navigation Bar
                    topBar
                    
                    // Profile Card
                    profileCard
                    
                    // Quick Stats Grid
                    statsGrid
                    
                    // Upcoming Section
                    upcomingSection
                    
                    // Team Activity
                    teamActivitySection
                    
                    Spacer(minLength: 20)
                }
                .padding(.horizontal, 20)
                .padding(.top, 10)
            }
        }
        .onAppear {
            loadUserData()
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
    }
    
    // MARK: - Load Data
    
    private func loadUserData() {
        // Listen for user data updates from the web view
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("UpdateUserData"),
            object: nil,
            queue: .main
        ) { notification in
            if let userData = notification.userInfo as? [String: String] {
                // Update with real employee data
                if let name = userData["name"] {
                    userName = name
                }
                if let role = userData["role"] {
                    userRole = role
                }
                if let hours = userData["hours"] {
                    hoursWorked = hours
                }
                if let projects = userData["projects"] {
                    projectCount = projects
                }
                if let tasks = userData["tasks"] {
                    taskCount = tasks
                }
                if let leave = userData["leave"] {
                    daysLeft = leave
                }
                if let attendance = userData["attendance"] {
                    attendancePercent = attendance
                }
            }
        }
    }
    
    // Public method to update user data from outside
    mutating func updateUserData(
        name: String? = nil,
        role: String? = nil,
        hours: String? = nil,
        projects: String? = nil,
        tasks: String? = nil,
        leave: String? = nil,
        attendance: String? = nil
    ) {
        if let name = name { userName = name }
        if let role = role { userRole = role }
        if let hours = hours { hoursWorked = hours }
        if let projects = projects { projectCount = projects }
        if let tasks = tasks { taskCount = tasks }
        if let leave = leave { daysLeft = leave }
        if let attendance = attendance { attendancePercent = attendance }
    }
    
    // MARK: - Top Bar
    
    private var topBar: some View {
        HStack {
            Button(action: {
                showMenu = true
            }) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.primary)
                    .frame(width: 44, height: 44)
                    .background(cardBackground)
                    .clipShape(Circle())
            }
            
            Spacer()
            
            Button(action: {
                showNotifications = true
            }) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                        .background(cardBackground)
                        .clipShape(Circle())
                    
                    // Notification badge
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                        .offset(x: -8, y: 8)
                }
            }
            .sheet(isPresented: $showNotifications) {
                NotificationsView()
            }
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Profile Card
    
    private var profileCard: some View {
        VStack(spacing: 0) {
            // Profile Image Placeholder
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color(red: 0.4, green: 0.6, blue: 0.9), Color(red: 0.3, green: 0.5, blue: 0.8)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 120, height: 120)
                .overlay(
                    Text(String(userName.prefix(1)))
                        .font(.system(size: 48, weight: .semibold))
                        .foregroundColor(.white)
                )
                .padding(.top, 30)
            
            // Name and Role
            VStack(spacing: 6) {
                Text(userName)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.primary)
                
                Text(userRole)
                    .font(.system(size: 16, weight: .regular))
                    .foregroundColor(.secondary)
            }
            .padding(.top, 16)
            
            // Stats Row
            HStack(spacing: 0) {
                HRStatItem(label: "Pending", value: hoursWorked)
                
                Divider()
                    .frame(height: 40)
                    .padding(.horizontal, 20)
                
                HRStatItem(label: "Assets", value: projectCount)
                
                Divider()
                    .frame(height: 40)
                    .padding(.horizontal, 20)
                
                HRStatItem(label: "Docs", value: taskCount)
            }
            .padding(.top, 24)
            .padding(.bottom, 30)
        }
        .frame(maxWidth: .infinity)
        .background(cardBackground)
        .cornerRadius(30)
    }
    
    // MARK: - Stats Grid
    
    private var statsGrid: some View {
        HStack(spacing: 12) {
            // Leave Balance
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "calendar")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    Spacer()
                }
                
                Text(daysLeft)
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.primary)
                
                Text("Days Left")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.secondary)
                
                Spacer()
                
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.black.opacity(0.05))
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(red: 1.0, green: 0.8, blue: 0.2))
                            .frame(width: geometry.size.width * leaveProgress, height: 8)
                    }
                }
                .frame(height: 8)
            }
            .padding(20)
            .frame(maxWidth: .infinity, minHeight: 180)
            .background(cardBackground)
            .cornerRadius(24)
            
            // Attendance
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "clock")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    Spacer()
                }
                
                Text(attendancePercent)
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.primary)
                
                Text("Attendance")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.secondary)
                
                Spacer()
                
                // Simple checkmark indicator
                HStack(spacing: 4) {
                    ForEach(0..<5) { _ in
                        Circle()
                            .fill(Color(red: 0.4, green: 0.8, blue: 0.5))
                            .frame(width: 8, height: 8)
                    }
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity, minHeight: 180)
            .background(cardBackground)
            .cornerRadius(24)
        }
    }
    
    // MARK: - Upcoming Section
    
    private var upcomingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Upcoming")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button(action: {}) {
                    Text("See All")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            
            VStack(spacing: 12) {
                HRUpcomingItem(
                    title: "Performance Review",
                    subtitle: "Annual review meeting with manager",
                    time: "Today, 3:30 PM",
                    color: Color(red: 0.5, green: 0.7, blue: 1.0)
                )
                
                HRUpcomingItem(
                    title: "Team Standup",
                    subtitle: "Weekly team sync and updates",
                    time: "Tomorrow, 9:00 AM",
                    color: Color(red: 1.0, green: 0.8, blue: 0.2)
                )
            }
        }
    }
    
    // MARK: - Team Activity Section
    
    private var teamActivitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Team Activity")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("Today")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            VStack(spacing: 10) {
                HRTeamActivityRow(
                    name: "Michael Chen",
                    action: "Approved leave request",
                    time: "5 mins ago",
                    initial: "M"
                )
                
                HRTeamActivityRow(
                    name: "Emma Thompson",
                    action: "Submitted timesheet",
                    time: "23 mins ago",
                    initial: "E"
                )
                
                HRTeamActivityRow(
                    name: "David Martinez",
                    action: "Clocked in for shift",
                    time: "1 hour ago",
                    initial: "D"
                )
            }
        }
    }
}

// MARK: - Supporting Views

struct HRStatItem: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 8) {
            Text(value)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.primary)
            
            Text(label)
                .font(.system(size: 13, weight: .regular))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct HRUpcomingItem: View {
    let title: String
    let subtitle: String
    let time: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 16) {
            RoundedRectangle(cornerRadius: 12)
                .fill(color)
                .frame(width: 4, height: 60)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text(subtitle)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.secondary)
                
                Text(time)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary.opacity(0.8))
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary.opacity(0.5))
        }
        .padding(16)
        .background(Color(red: 0.97, green: 0.98, blue: 0.97))
        .cornerRadius(16)
    }
}

struct HRTeamActivityRow: View {
    let name: String
    let action: String
    let time: String
    let initial: String
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color(red: 0.7, green: 0.8, blue: 0.95), Color(red: 0.6, green: 0.7, blue: 0.9)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 44, height: 44)
                .overlay(
                    Text(initial)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                )
            
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text(action)
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(time)
                .font(.system(size: 12, weight: .regular))
                .foregroundColor(.secondary.opacity(0.7))
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Preview

#Preview {
    BeautifulHomeView()
}
