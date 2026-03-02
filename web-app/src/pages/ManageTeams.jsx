import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [memberId, setMemberId] = useState("");

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
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Teams</h2>

      {/* CREATE TEAM */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="font-semibold mb-4">Create New Team</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className="border p-2 rounded"
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
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="font-semibold mb-4">Add Member to Team</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
      <div className="bg-white shadow rounded p-4">
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