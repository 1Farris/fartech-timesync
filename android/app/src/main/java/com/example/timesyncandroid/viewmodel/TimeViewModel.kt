package com.example.timesyncandroid.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.timesyncandroid.data.Timesheet
import com.example.timesyncandroid.data.TimesheetDao
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("timesheet")
    suspend fun logTime(@Body timesheet: Timesheet)
}

class TimeViewModel(private val timesheetDao: TimesheetDao) : ViewModel() {
    private val retrofit = Retrofit.Builder()
        .baseUrl("http://api.fartech-timesync.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    private val apiService = retrofit.create(ApiService::class.java)
    val isAdminOrLeader: Boolean = FirebaseAuth.getInstance().currentUser?.let { user ->
        // Simplified; check role in production from backend
        true
    } ?: false

    fun getAllTimesheets(userId: String): Flow<List<Timesheet>> = timesheetDao.getTimesheetsByUser(userId)

fun testSync() {
    viewModelScope.launch {
        // Call apiService.testSync() if added to interface
    }
}
    fun logTime(timesheet: Timesheet) {
        viewModelScope.launch {
            apiService.logTime(timesheet)
            timesheetDao.insert(timesheet)
        }
    }

    fun deleteTimesheet(timesheet: Timesheet) {
        viewModelScope.launch {
            timesheetDao.delete(timesheet)
        }
    }
}