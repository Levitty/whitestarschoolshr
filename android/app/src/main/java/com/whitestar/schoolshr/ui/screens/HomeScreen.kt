package com.whitestar.schoolshr.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.whitestar.schoolshr.ui.theme.BlueAccent
import com.whitestar.schoolshr.ui.theme.CardBackground
import com.whitestar.schoolshr.ui.theme.GreenDot
import com.whitestar.schoolshr.ui.theme.MintBackground
import com.whitestar.schoolshr.ui.theme.ProfileGradientEnd
import com.whitestar.schoolshr.ui.theme.ProfileGradientStart
import com.whitestar.schoolshr.ui.theme.TeamAvatarGradientEnd
import com.whitestar.schoolshr.ui.theme.TeamAvatarGradientStart
import com.whitestar.schoolshr.ui.theme.TextDark
import com.whitestar.schoolshr.ui.theme.TextGrey
import com.whitestar.schoolshr.ui.theme.TextSecondaryLight
import com.whitestar.schoolshr.ui.theme.YellowAccent

@Composable
fun HomeScreen(
    userName: String = "Ruth Joy",
    userRole: String = "Employee",
    hoursWorked: String = "168",
    projectCount: String = "12",
    taskCount: String = "24",
    daysLeft: String = "15",
    attendancePercent: String = "98%",
    leaveProgress: Float = 0.75f
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MintBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(top = 10.dp, bottom = 20.dp)
        ) {
            TopBar()
            Spacer(modifier = Modifier.height(20.dp))
            ProfileCard(userName, userRole, hoursWorked, projectCount, taskCount)
            Spacer(modifier = Modifier.height(20.dp))
            StatsGrid(daysLeft, leaveProgress, attendancePercent)
            Spacer(modifier = Modifier.height(20.dp))
            UpcomingSection()
            Spacer(modifier = Modifier.height(20.dp))
            TeamActivitySection()
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun TopBar() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(
            onClick = {},
            modifier = Modifier
                .size(44.dp)
                .background(CardBackground, CircleShape)
        ) {
            Icon(
                Icons.Filled.Menu,
                contentDescription = "Menu",
                tint = TextDark,
                modifier = Modifier.size(20.dp)
            )
        }

        IconButton(
            onClick = {},
            modifier = Modifier
                .size(44.dp)
                .background(CardBackground, CircleShape)
        ) {
            Icon(
                Icons.Filled.Notifications,
                contentDescription = "Notifications",
                tint = TextDark,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun ProfileCard(
    userName: String,
    userRole: String,
    hoursWorked: String,
    projectCount: String,
    taskCount: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBackground, RoundedCornerShape(30.dp))
            .padding(bottom = 30.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(30.dp))

        Box(
            modifier = Modifier
                .size(120.dp)
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(ProfileGradientStart, ProfileGradientEnd),
                        start = Offset.Zero,
                        end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
                    ),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = userName.take(1).uppercase(),
                fontSize = 48.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = userName,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = userRole,
            fontSize = 16.sp,
            fontWeight = FontWeight.Normal,
            color = TextGrey
        )

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            StatItem(value = hoursWorked, label = "Hours")
            StatDivider()
            StatItem(value = projectCount, label = "Projects")
            StatDivider()
            StatItem(value = taskCount, label = "Tasks")
        }
    }
}

@Composable
private fun StatItem(value: String, label: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(horizontal = 8.dp)
    ) {
        Text(
            text = value,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = FontWeight.Normal,
            color = TextGrey
        )
    }
}

@Composable
private fun StatDivider() {
    Box(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .width(1.dp)
            .height(40.dp)
            .background(Color.Black.copy(alpha = 0.08f))
    )
}

@Composable
private fun StatsGrid(
    daysLeft: String,
    leaveProgress: Float,
    attendancePercent: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        LeaveCard(
            daysLeft = daysLeft,
            progress = leaveProgress,
            modifier = Modifier.weight(1f)
        )
        AttendanceCard(
            percent = attendancePercent,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun LeaveCard(daysLeft: String, progress: Float, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .height(180.dp)
            .background(CardBackground, RoundedCornerShape(24.dp))
            .padding(20.dp)
    ) {
        Icon(
            Icons.Filled.DateRange,
            contentDescription = null,
            tint = TextDark,
            modifier = Modifier.size(18.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = daysLeft,
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Days Left",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = TextGrey
        )

        Spacer(modifier = Modifier.weight(1f))

        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
            color = YellowAccent,
            trackColor = Color.Black.copy(alpha = 0.05f),
            strokeCap = StrokeCap.Round
        )
    }
}

@Composable
private fun AttendanceCard(percent: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .height(180.dp)
            .background(CardBackground, RoundedCornerShape(24.dp))
            .padding(20.dp)
    ) {
        Icon(
            Icons.Filled.CheckCircle,
            contentDescription = null,
            tint = TextDark,
            modifier = Modifier.size(18.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = percent,
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Attendance",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = TextGrey
        )

        Spacer(modifier = Modifier.weight(1f))

        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            repeat(5) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(GreenDot, CircleShape)
                )
            }
        }
    }
}

@Composable
private fun UpcomingSection() {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Upcoming",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            TextButton(onClick = {}) {
                Text(
                    text = "See All",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextGrey
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        UpcomingItem(
            title = "Performance Review",
            subtitle = "Annual review meeting with manager",
            time = "Today, 3:30 PM",
            accentColor = BlueAccent
        )

        Spacer(modifier = Modifier.height(12.dp))

        UpcomingItem(
            title = "Team Standup",
            subtitle = "Weekly team sync and updates",
            time = "Tomorrow, 9:00 AM",
            accentColor = YellowAccent
        )
    }
}

@Composable
private fun UpcomingItem(
    title: String,
    subtitle: String,
    time: String,
    accentColor: Color
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBackground, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .width(4.dp)
                .height(60.dp)
                .background(accentColor, RoundedCornerShape(12.dp))
        )

        Spacer(modifier = Modifier.width(16.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                fontSize = 14.sp,
                fontWeight = FontWeight.Normal,
                color = TextGrey
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = time,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondaryLight
            )
        }

        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = TextGrey.copy(alpha = 0.5f),
            modifier = Modifier.size(14.dp)
        )
    }
}

@Composable
private fun TeamActivitySection() {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Team Activity",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            Text(
                text = "Today",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = TextGrey
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        TeamActivityRow(
            name = "Michael Chen",
            action = "Approved leave request",
            time = "5 mins ago",
            initial = "M"
        )
        TeamActivityRow(
            name = "Emma Thompson",
            action = "Submitted timesheet",
            time = "23 mins ago",
            initial = "E"
        )
        TeamActivityRow(
            name = "David Martinez",
            action = "Clocked in for shift",
            time = "1 hour ago",
            initial = "D"
        )
    }
}

@Composable
private fun TeamActivityRow(
    name: String,
    action: String,
    time: String,
    initial: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(TeamAvatarGradientStart, TeamAvatarGradientEnd),
                        start = Offset.Zero,
                        end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
                    ),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = initial,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = action,
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = TextGrey
            )
        }

        Text(
            text = time,
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            color = TextGrey.copy(alpha = 0.7f)
        )
    }
}
