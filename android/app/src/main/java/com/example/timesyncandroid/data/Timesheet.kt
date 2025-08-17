package com.example.timesyncandroid.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "timesheets")
data class Timesheet(
    @PrimaryKey val id: String = "",
    val userId: String = "",
    val hours: Int,
    val minutes: Int,
    val date: String,
    val proof: String? = null,
    val status: String = "pending"
)