package com.example.timesyncandroid.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {
    @POST("users")
    suspend fun saveUserRole(@Body user: Map<String, String>)
}

class AuthViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val retrofit = Retrofit.Builder()
        .baseUrl("http://api.fartech-timesync.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    private val apiService = retrofit.create(AuthApiService::class.java)
    private val _user = MutableStateFlow<FirebaseUser?>(auth.currentUser)
    val user: StateFlow<FirebaseUser?> = _user

    fun login(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            auth.signInWithEmailAndPassword(email, password)
                .addOnSuccessListener {
                    _user.value = auth.currentUser
                    onSuccess()
                }
        }
    }

    fun signUp(email: String, password: String, role: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            auth.createUserWithEmailAndPassword(email, password)
                .addOnSuccessListener {
                    val userId = auth.currentUser?.uid ?: return@addOnSuccessListener
                    apiService.saveUserRole(mapOf("userId" to userId, "role" to role))
                    _user.value = auth.currentUser
                    onSuccess()
                }
        }
    }
}