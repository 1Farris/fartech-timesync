import React, { useEffect, useState } from "react";
import api from "../services/api";

/**
 * ManageTeams.jsx
 * -----------------------
 * This component allows admin users to manage teams within the TimeSync application. 
 * Admins can create new teams by specifying a team name and selecting a team leader from the list of 
 * users. They can also add members to existing teams and remove members from teams. The component 
 * fetches the list of teams and users from the backend API and displays them in a user-friendly 
 * interface. Tailwind CSS is used for styling the layout and form elements.
 * The component uses React's useEffect hook to fetch data when the component mounts and useState 
 * to manage the teams, users, and form state. It provides functions to handle creating teams, adding 
 * members, and removing members, which interact with the backend API to update the team data 
 * accordingly.
 */

// Define the ManageTeams component that renders the team management page for admin users.
export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [memberId, setMemberId] = useState("");

  /* ================= FETCH TEAMS & USERS ================= */
  const fetchTeams = async () => {
    const res = await api.get("/teams");
    setTeams(res.data.teams || []);
  };

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data.users || []);
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  /* ================= CREATE TEAM ================= */
  const createTeam = async () => {
    if (!teamName || !leaderId) {
      alert("Team name and leader required");
      return;
    }

    await api.post("/teams", {
      name: teamName,
      leaderId,
    });

    setTeamName("");
    setLeaderId("");
    fetchTeams();
  };

  /* ================= ADD MEMBER ================= */
  const addMember = async () => {
    if (!selectedTeamId || !memberId) {
      alert("Select team and member");
      return;
    }

    await api.post("/teams/members", {
      teamId: selectedTeamId,
      userId: memberId,
    });

    fetchTeams();
  };

  /* ================= REMOVE MEMBER ================= */
  const removeMember = async (teamId, userId) => {
    await api.post("/teams/remove-member", {
      teamId,
      userId,
    });

    fetchTeams();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Manage Teams</h2>

      {/* CREATE TEAM */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
        <h3 className="font-semibold mb-4">Create New Team</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
          />

          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
          >
            <option value="">Select Team Leader</option>
            {users
              .filter((u) => u.role === "team-leader")
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
          </select>

          <button
            onClick={createTeam}
            className="bg-blue-600 text-white rounded p-2"
          >
            Create Team
          </button>
        </div>
      </div>

      {/* ADD MEMBER */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
        <h3 className="font-semibold mb-4">Add Member to Team</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>

          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
          >
            <option value="">Select Member</option>
            {users
              .filter((u) => u.role === "worker")
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
          </select>

          <button
            onClick={addMember}
            className="bg-green-600 text-white rounded p-2"
          >
            Add Member
          </button>
        </div>
      </div>

      {/* TEAM LIST */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h3 className="font-semibold mb-4">Existing Teams</h3>

        {teams.map((team) => (
          <div key={team._id} className="border-b py-4">
            <p className="font-medium">{team.name}</p>
            <p className="text-sm text-gray-500">
              Leader: {team.leaderId?.firstName}{" "}
              {team.leaderId?.lastName}
            </p>

            <div className="mt-2">
              <p className="text-sm font-semibold">Members:</p>

              {team.members?.length === 0 && (
                <p className="text-sm text-gray-400">No members</p>
              )}

              {team.members?.map((member) => (
                <div
                  key={member._id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    {member.firstName} {member.lastName}
                  </span>

                  <button
                    onClick={() =>
                      removeMember(team._id, member._id)
                    }
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}