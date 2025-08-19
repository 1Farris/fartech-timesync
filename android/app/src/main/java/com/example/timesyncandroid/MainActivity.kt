package com.example.timesyncandroid

import TimeSyncTheme
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
//import com.example.timesyncandroid.ui.theme.TimeSyncTheme
import com.example.timesyncandroid.data.Timesheet
import com.example.timesyncandroid.data.TimesheetDatabase
import com.example.timesyncandroid.viewmodel.AuthViewModel
import com.example.timesyncandroid.viewmodel.TimeViewModel
import com.google.firebase.auth.FirebaseAuth

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val auth = FirebaseAuth.getInstance()
        val timesheetDao = TimesheetDatabase.getDatabase(application).timesheetDao()
        val authViewModel = ViewModelProvider(this)[AuthViewModel::class.java]
        val timeViewModel = ViewModelProvider(this)[TimeViewModel::class.java]

        setContent {
            TimeSyncTheme() {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation(authViewModel, timeViewModel)
                }
            }
        }
    }
}


@Composable
fun AppNavigation(authViewModel: AuthViewModel, timeViewModel: TimeViewModel) {
    val navController = rememberNavController()
    val user by authViewModel.user.collectAsState()

    NavHost(navController = navController, startDestination = if (user != null) "dashboard" else "login") {
        composable("login") {
            LoginScreen(authViewModel, onLoginSuccess = { navController.navigate("dashboard") })
        }
        composable("dashboard") {
            DashboardScreen(timeViewModel, onLogTime = { navController.navigate("time_entry") })
        }
        composable("time_entry") {
            TimeEntryScreen(timeViewModel, onTimeLogged = { navController.popBackStack() }
            // Add file picker logic using ActivityResultLauncher
            // Example: val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> uploadProof(uri) }
            // Implement uploadProof using Retrofit POST to /proof)
        }
        composable("team_management") {
            TeamManagementScreen(teamViewModel)
        }

    }
}

@Composable
fun LoginScreen(authViewModel: AuthViewModel, onLoginSuccess: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("worker") }
    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "TimeSync Login", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        TextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = role,
            onValueChange = { role = it },
            label = { Text("Role (worker/leader/admin)") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { authViewModel.signUp(email, password, role, onLoginSuccess) }) {
            Text("Sign Up")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { authViewModel.login(email, password, onLoginSuccess) }) {
            Text("Login")
        }
    }
}

@Composable
fun DashboardScreen(timeViewModel: TimeViewModel, onLogTime: () -> Unit) {
    val timesheets by timeViewModel.allTimesheets.collectAsState(initial = emptyList())
    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "TimeSync Dashboard", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        timesheets.forEach { timesheet ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "${timesheet.hours}h ${timesheet.minutes}m - ${timesheet.date}")
                    if (timeViewModel.isAdminOrLeader) {
                        Button(onClick = { timeViewModel.deleteTimesheet(timesheet) }) {
                            Text("Delete")
                        }
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onLogTime) {
            Text("Log Time")
        }
    }
}



@Composable
fun TimeEntryScreen(timeViewModel: TimeViewModel, onTimeLogged: () -> Unit) {
    var hours by remember { mutableStateOf("") }
    var minutes by remember { mutableStateOf("") }
    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "Log Time", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        TextField(
            value = hours,
            onValueChange = { hours = it },
            label = { Text("Hours") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = minutes,
            onValueChange = { minutes = it },
            label = { Text("Minutes") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            if (hours.isNotBlank() && minutes.isNotBlank()) {
                timeViewModel.logTime(Timesheet(hours = hours.toInt(), minutes = minutes.toInt(), date = "2025-08-09"))
                onTimeLogged()
            }
        }) {
            Text("Submit Time")
        }
    }
}