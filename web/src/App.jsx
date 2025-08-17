import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [timesheets, setTimesheets] = useState([]);

useEffect(() => {
  if (user) {
    axios.get('http://api.fartech-timesync.com/test-sync').then(res => console.log(res.data));
  }
}, [user]);

  useEffect(() => {
    // Check for logged-in user (e.g., from localStorage or token)
    const token = localStorage.getItem('token');
    if (token) {
      // Mock user fetch; replace with actual API call
      setUser({ token });
    }
  }, []);

  const login = async () => {
    try {
      const response = await axios.post('http://api.fartech-timesync.com/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      alert('Login failed');
    }
  };

  const logTime = async () => {
    try {
      await axios.post('http://api.fartech-timesync.com/timesheet', {
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        date: new Date().toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Time logged');
      setHours('');
      setMinutes('');
    } catch (error) {
      alert('Error logging time');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      {!user ? (
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">TimeSync Login</h1>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-gray-300 p-2 mb-2 w-full rounded"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-gray-300 p-2 mb-2 w-full rounded"
          />
          <button
            onClick={login}
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">TimeSync Dashboard</h1>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="Hours"
            className="border border-gray-300 p-2 mb-2 w-full rounded"
          />
          <input
            type="number"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            placeholder="Minutes"
            className="border border-gray-300 p-2 mb-2 w-full rounded"
          />
          <button
            onClick={logTime}
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
          >
            Log Time
          </button>
        </div>
      )}
    </div>
  );
};

export default App;