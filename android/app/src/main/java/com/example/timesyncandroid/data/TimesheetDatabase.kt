package com.example.timesyncandroid.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [Timesheet::class], version = 1)
abstract class TimesheetDatabase : RoomDatabase() {
    abstract fun timesheetDao(): TimesheetDao

    companion object {
        @Volatile
        private var INSTANCE: TimesheetDatabase? = null

        fun getDatabase(context: Context): TimesheetDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TimesheetDatabase::class.java,
                    "timesheet_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}