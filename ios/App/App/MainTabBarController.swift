import UIKit
import Capacitor
import WebKit

class MainTabBarController: UITabBarController, UITabBarControllerDelegate {
    
    var capacitorViewController: UIViewController?
    private var sharedWebView: WKWebView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        delegate = self
        setupTabBar()
        
        // Find the web view from Capacitor
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.findAndSetupWebView()
            self.setupViewControllers()
        }
    }
    
    private func setupTabBar() {
        // Style the tab bar
        tabBar.backgroundColor = .systemBackground
        tabBar.tintColor = .systemBlue
        tabBar.unselectedItemTintColor = .systemGray
        
        // Modern iOS appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        tabBar.standardAppearance = appearance
        if #available(iOS 15.0, *) {
            tabBar.scrollEdgeAppearance = appearance
        }
    }
    
    private func findAndSetupWebView() {
        // Get the web view from the Capacitor view controller
        if let capVC = capacitorViewController {
            sharedWebView = findWebView(in: capVC.view)
            
            // Remove from original parent
            sharedWebView?.removeFromSuperview()
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
    
    private func setupViewControllers() {
        // Create custom native Home tab
        let homeVC = createNativeHomeTab()
        
        // Create web-based tabs for other sections
        let leaveVC = createTabViewController(
            path: "/leave",
            title: "My Leave",
            iconName: "calendar"
        )
        
        let attendanceVC = createTabViewController(
            path: "/attendance",
            title: "Attendance",
            iconName: "clock.fill"
        )
        
        let profileVC = createTabViewController(
            path: "/profile",
            title: "Profile",
            iconName: "person.fill"
        )
        
        let moreVC = createTabViewController(
            path: "/more",
            title: "More",
            iconName: "ellipsis.circle.fill"
        )
        
        // Set view controllers
        viewControllers = [homeVC, leaveVC, attendanceVC, profileVC, moreVC]
        
        // Add the shared web view to the second tab (first web-based tab)
        if let webView = sharedWebView, let firstWebVC = viewControllers?[1] as? WebContentViewController {
            firstWebVC.setWebView(webView)
        }
    }
    
    private func createNativeHomeTab() -> UIViewController {
        let homeVC = HomeViewController()
        homeVC.title = "Home"
        homeVC.tabBarItem = UITabBarItem(
            title: "Home",
            image: UIImage(systemName: "house.fill"),
            selectedImage: UIImage(systemName: "house.fill")
        )
        
        // Set the tab bar to use mint green tint to match the design
        tabBar.tintColor = UIColor(red: 0.3, green: 0.6, blue: 0.4, alpha: 1.0)
        
        return homeVC
    }
    
    private func createTabViewController(path: String, title: String, iconName: String) -> WebContentViewController {
        let vc = WebContentViewController()
        vc.urlPath = path
        vc.title = title
        vc.tabBarItem = UITabBarItem(
            title: title,
            image: UIImage(systemName: iconName),
            selectedImage: UIImage(systemName: iconName)
        )
        
        return vc
    }
    
    // MARK: - UITabBarControllerDelegate
    
    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
        // Only move web view for web-based tabs
        if let selectedVC = viewController as? WebContentViewController {
            // Move the web view to the selected tab
            if let webView = sharedWebView {
                // Remove from current parent
                webView.removeFromSuperview()
                
                // Add to new parent
                selectedVC.setWebView(webView)
                
                // Notify web app about tab change
                selectedVC.navigationToPath()
            }
        }
        // Home tab uses native UI, no web view needed
    }
}
