package com.whitestar.schoolshr

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.getcapacitor.BridgeActivity
import com.whitestar.schoolshr.ui.screens.HomeScreen
import com.whitestar.schoolshr.ui.theme.AppTheme
import com.whitestar.schoolshr.ui.theme.BrandGreen
import com.whitestar.schoolshr.ui.theme.TabActiveGreen
import com.whitestar.schoolshr.ui.theme.TextGrey
import org.json.JSONObject
import org.json.JSONTokener

class MainActivity : BridgeActivity() {

    private val userName = mutableStateOf("Employee")
    private val userRole = mutableStateOf("Staff")
    private val hoursWorked = mutableStateOf("168")
    private val projectCount = mutableStateOf("12")
    private val taskCount = mutableStateOf("24")
    private val daysLeft = mutableStateOf("15")
    private val attendancePercent = mutableStateOf("98%")
    private val leaveProgress = mutableStateOf(0.75f)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val capWebView = bridge?.webView

        setContent {
            AppTheme {
                MainApp(
                    capWebView = capWebView,
                    userName = userName,
                    userRole = userRole,
                    hoursWorked = hoursWorked,
                    projectCount = projectCount,
                    taskCount = taskCount,
                    daysLeft = daysLeft,
                    attendancePercent = attendancePercent,
                    leaveProgress = leaveProgress,
                    onTabChanged = { index -> navigateWebView(index) }
                )
            }
        }

        if (capWebView != null) {
            Handler(Looper.getMainLooper()).postDelayed({ fetchUserData(capWebView) }, 2000)
            Handler(Looper.getMainLooper()).postDelayed({ fetchUserData(capWebView) }, 5000)
        }
    }

    private fun navigateWebView(tabIndex: Int) {
        val path = when (tabIndex) {
            1 -> "/leave"
            2 -> "/attendance"
            3 -> "/profile"
            4 -> "/more"
            else -> "/"
        }
        val script = """
            (function() {
                window.postMessage({ type: 'TAB_CHANGED', path: '$path' }, '*');
                if (window.location.hash !== '#$path') {
                    window.location.hash = '$path';
                }
                if (window.location.pathname !== '$path' && '$path' !== '/') {
                    window.history.pushState({}, '', '$path');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                }
            })();
        """.trimIndent()
        bridge?.webView?.evaluateJavascript(script, null)
    }

    private fun fetchUserData(webView: WebView) {
        val script = """
            (function() {
                var userData = {
                    name: 'Employee',
                    role: 'Staff',
                    hours: '168',
                    projects: '12',
                    tasks: '24',
                    leave: '15',
                    attendance: '98%'
                };
                try {
                    var supabaseKeys = Object.keys(localStorage).filter(function(key) {
                        return key.includes('supabase') || key.includes('auth');
                    });
                    for (var i = 0; i < supabaseKeys.length; i++) {
                        var key = supabaseKeys[i];
                        var value = localStorage.getItem(key);
                        try {
                            var parsed = JSON.parse(value);
                            if (parsed && parsed.user) {
                                var user = parsed.user;
                                if (user.user_metadata) {
                                    userData.name = user.user_metadata.full_name ||
                                                   user.user_metadata.name ||
                                                   user.email ||
                                                   'Employee';
                                    userData.role = user.user_metadata.role ||
                                                   user.user_metadata.position ||
                                                   'Staff';
                                }
                                if (userData.name === 'Employee' && user.email) {
                                    userData.name = user.email.split('@')[0].replace(/[._]/g, ' ');
                                    userData.name = userData.name.split(' ')
                                        .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); })
                                        .join(' ');
                                }
                                break;
                            }
                        } catch(e) {}
                    }
                    var employeeName = localStorage.getItem('employeeName') ||
                                     localStorage.getItem('userName') ||
                                     localStorage.getItem('currentUser');
                    if (employeeName) userData.name = employeeName;
                    var employeeRole = localStorage.getItem('employeeRole') ||
                                     localStorage.getItem('userRole');
                    if (employeeRole) userData.role = employeeRole;
                } catch(error) {
                    console.error('Error reading Supabase data:', error);
                }
                return JSON.stringify(userData);
            })();
        """.trimIndent()

        webView.evaluateJavascript(script) { result ->
            if (result == null || result == "null") return@evaluateJavascript
            try {
                val unquoted = JSONTokener(result).nextValue() as? String
                    ?: return@evaluateJavascript
                val json = JSONObject(unquoted)
                userName.value = json.optString("name", "Employee")
                userRole.value = json.optString("role", "Staff")
                hoursWorked.value = json.optString("hours", "168")
                projectCount.value = json.optString("projects", "12")
                taskCount.value = json.optString("tasks", "24")
                daysLeft.value = json.optString("leave", "15")
                attendancePercent.value = json.optString("attendance", "98%")
            } catch (e: Exception) {
                Log.e("MainActivity", "Error parsing user data", e)
            }
        }
    }
}

private data class TabItem(
    val label: String,
    val icon: ImageVector
)

private val tabs = listOf(
    TabItem("Home", Icons.Filled.Home),
    TabItem("My Leave", Icons.Filled.DateRange),
    TabItem("Attendance", Icons.Filled.CheckCircle),
    TabItem("Profile", Icons.Filled.Person),
    TabItem("More", Icons.Filled.Menu)
)

@Composable
fun MainApp(
    capWebView: WebView?,
    userName: MutableState<String>,
    userRole: MutableState<String>,
    hoursWorked: MutableState<String>,
    projectCount: MutableState<String>,
    taskCount: MutableState<String>,
    daysLeft: MutableState<String>,
    attendancePercent: MutableState<String>,
    leaveProgress: MutableState<Float>,
    onTabChanged: (Int) -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label, fontSize = 10.sp) },
                        selected = selectedTab == index,
                        onClick = {
                            selectedTab = index
                            if (index > 0) onTabChanged(index)
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = TabActiveGreen,
                            selectedTextColor = TabActiveGreen,
                            unselectedIconColor = TextGrey,
                            unselectedTextColor = TextGrey,
                            indicatorColor = BrandGreen
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            if (capWebView != null) {
                AndroidView(
                    factory = { _ ->
                        (capWebView.parent as? ViewGroup)?.removeView(capWebView)
                        capWebView
                    },
                    modifier = Modifier.fillMaxSize(),
                    update = { view ->
                        view.visibility = if (selectedTab == 0) View.GONE else View.VISIBLE
                    }
                )
            }

            if (selectedTab == 0) {
                HomeScreen(
                    userName = userName.value,
                    userRole = userRole.value,
                    hoursWorked = hoursWorked.value,
                    projectCount = projectCount.value,
                    taskCount = taskCount.value,
                    daysLeft = daysLeft.value,
                    attendancePercent = attendancePercent.value,
                    leaveProgress = leaveProgress.value
                )
            }
        }
    }
}
