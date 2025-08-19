package com.example.timesyncandroid.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.timesyncandroid.data.Team
import com.example.timesyncandroid.data.TeamDao // Assume you create this similar to TimesheetDao
import kotlinx.coroutines.launch
import retrofit2.http.Body
import retrofit2.http.POST

interface TeamApiService {
    @POST("team")
    suspend fun createTeam(@Body team: Team)
}

class TeamViewModel(private val teamDao: TeamDao) : ViewModel() {
    private val retrofit = Retrofit.Builder()
        .baseUrl("http://api.fartech-timesync.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    private val apiService = retrofit.create(TeamApiService::class.java)

    fun createTeam(team: Team) {
        viewModelScope.launch {
            apiService.createTeam(team)
            teamDao.insert(team) // Assume local caching
        }
    }
}

// Add Team.kt and TeamDao.kt similar to Timesheet