package com.example.timesyncandroid.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import retrofit2.http.GET
import retrofit2.http.Path

interface PaymentApiService {
    @GET("/payment/{userId}/{period}")
    suspend fun getPayment(@Path("userId") userId: String, @Path("period") period: String): Map<String, Any>
}

class PaymentViewModel : ViewModel() {
    private val retrofit = Retrofit.Builder()
        .baseUrl("http://api.fartech-timesync.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    private val apiService = retrofit.create(PaymentApiService::class.java)

    fun getPaymentBreakdown(userId: String, period: String, onSuccess: (Map<String, Any>) -> Unit) {
        viewModelScope.launch {
            val breakdown = apiService.getPayment(userId, period)
            onSuccess(breakdown)
        }
    }
}