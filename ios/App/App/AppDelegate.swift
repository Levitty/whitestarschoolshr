import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Wait a bit for Capacitor to initialize, then add tab bar
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.wrapInTabBar()
        }
        
        // Disable pinch-to-zoom in WKWebView
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(disableWebViewZoom),
            name: UIWindow.didBecomeVisibleNotification,
            object: window
        )
        
        return true
    }
    
    private func wrapInTabBar() {
        // Get the current root view controller (Capacitor's web view controller)
        guard let currentRoot = window?.rootViewController else { return }
        
        // Create tab bar controller
        let tabBarController = MainTabBarController()
        tabBarController.capacitorViewController = currentRoot
        
        // Replace root view controller
        window?.rootViewController = tabBarController
    }
    
    @objc func disableWebViewZoom() {
        if let webView = findWebView(in: window?.rootViewController?.view) {
            webView.scrollView.minimumZoomScale = 1.0
            webView.scrollView.maximumZoomScale = 1.0
            
            // Fix dropdown menus and overflow issues
            let css = """
            * {
                -webkit-overflow-scrolling: touch;
            }
            
            /* Fix ALL overflow containers that might hide dropdowns */
            body, html, div, section, nav, header, main, article {
                overflow: visible !important;
            }
            
            /* Fix dropdown menus - target multiple possible class names */
            .dropdown, .dropdown-menu, .menu, .popover, .modal,
            [class*="dropdown"], [class*="menu"], [class*="popover"],
            [class*="Menu"], [class*="Dropdown"] {
                position: fixed !important;
                overflow: visible !important;
                z-index: 999999 !important;
                -webkit-transform: translate3d(0,0,0) !important;
                transform: translate3d(0,0,0) !important;
                will-change: transform;
            }
            
            /* Ensure dropdowns and menus stay visible */
            [role="menu"], [role="menubar"], [role="menuitem"],
            [role="dialog"], [aria-haspopup="true"] + * {
                position: fixed !important;
                z-index: 999999 !important;
                overflow: visible !important;
            }
            
            /* Ensure all interactive elements are clickable */
            select, button, a, input, textarea,
            [role="button"], [role="menu"], [role="menuitem"],
            [class*="button"], [class*="Button"] {
                pointer-events: auto !important;
                -webkit-tap-highlight-color: rgba(0,0,0,0.1);
                -webkit-user-select: none;
            }
            
            /* Prevent containers from clipping content */
            div[class], section[class], nav[class], header[class] {
                overflow: visible !important;
                -webkit-clip-path: none !important;
                clip-path: none !important;
            }
            """
            
            let script = """
            // Add CSS fixes
            var style = document.createElement('style');
            style.innerHTML = `\(css)`;
            document.head.appendChild(style);
            
            // Debug and fix dropdown clicks
            setTimeout(function() {
                // Find all buttons and add click logging
                document.addEventListener('click', function(e) {
                    console.log('Clicked element:', e.target);
                    console.log('Tag:', e.target.tagName, 'Classes:', e.target.className);
                    
                    // Force display any hidden menus when any button is clicked
                    var menus = document.querySelectorAll('[class*="menu"], [class*="Menu"], [class*="dropdown"], [class*="Dropdown"]');
                    menus.forEach(function(menu) {
                        if (menu.style.display === 'none' || window.getComputedStyle(menu).display === 'none') {
                            menu.style.display = 'block';
                            menu.style.visibility = 'visible';
                            menu.style.opacity = '1';
                            console.log('Forced menu visible:', menu);
                        }
                    });
                }, true);
                
                // Also check for hidden menus periodically
                setInterval(function() {
                    var menus = document.querySelectorAll('[class*="menu"], [class*="Menu"], [class*="dropdown"], [class*="Dropdown"]');
                    menus.forEach(function(menu) {
                        var style = window.getComputedStyle(menu);
                        if (style.display !== 'none' && (style.visibility === 'hidden' || style.opacity === '0')) {
                            menu.style.visibility = 'visible';
                            menu.style.opacity = '1';
                            menu.style.zIndex = '999999';
                        }
                    });
                }, 100);
            }, 500);
            """
            
            webView.evaluateJavaScript(script, completionHandler: nil)
            
            // Also inject after page loads
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                webView.evaluateJavaScript(script, completionHandler: nil)
            }
            
            // Enable Safari Web Inspector for debugging
            if #available(iOS 16.4, *) {
                webView.isInspectable = true
            }
        }
    }
    
    func findWebView(in view: UIView?) -> WKWebView? {
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

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
