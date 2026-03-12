import UIKit
import WebKit

class WebContentViewController: UIViewController {
    
    var urlPath: String = "/"
    private var webView: WKWebView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // Navigate to path when view appears
        if webView != nil {
            navigationToPath()
        }
    }
    
    func setWebView(_ webView: WKWebView) {
        // Remove from current parent if any
        self.webView?.removeFromSuperview()
        
        // Store reference
        self.webView = webView
        
        // Add to view hierarchy
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        
        // Navigate to the path for this tab
        navigationToPath()
    }
    
    func navigationToPath() {
        guard let webView = webView else { return }
        
        let script = """
        // Navigate to the specific section for this tab
        if (window.Capacitor) {
            // Send message to web app about which tab is selected
            window.postMessage({ type: 'TAB_CHANGED', path: '\(urlPath)' }, '*');
            
            // If your web app uses hash routing
            if (window.location.hash !== '#\(urlPath)') {
                window.location.hash = '\(urlPath)';
            }
            
            // If your web app uses HTML5 history routing  
            if (window.location.pathname !== '\(urlPath)' && '\(urlPath)' !== '/') {
                window.history.pushState({}, '', '\(urlPath)');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        }
        """
        
        webView.evaluateJavaScript(script, completionHandler: nil)
    }
}
