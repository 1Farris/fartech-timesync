package com.example.timesyncandroid.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface TimesheetDao {
    @Query("SELECT * FROM timesheets WHERE userId = :userId")
    fun getTimesheetsByUser(userId: String): Flow<List<Timesheet>>

    @Insert
    suspend fun insert(timesheet: Timesheet)

    @Delete
    suspend fun delete(timesheet: Timesheet)
}