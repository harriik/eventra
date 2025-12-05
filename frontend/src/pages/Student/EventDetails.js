import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { eventsAPI, registrationsAPI, teamsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const eventResponse = await eventsAPI.getById(id);
      setEvent(eventResponse.data);
      
      // If team event, check if user is in a team
      if (eventResponse.data.team_size > 1) {
        try {
          const teamResponse = await teamsAPI.getMyTeam(id);
          setTeam(teamResponse.data);
        } catch (error) {
          // User is not in a team, which is fine
          setTeam(null);
        }
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (eventId) => {
    setEnrolling(true);
    try {
      await registrationsAPI.enroll(eventId);
      toast.success('Successfully enrolled in event!');
      navigate('/student/enrollments');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to enroll';
      if (error.response?.data?.requires_team) {
        toast.error(message);
        setShowCreateTeam(true);
      } else {
        toast.error(message);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setCreatingTeam(true);
    try {
      const response = await teamsAPI.create({
        team_name: teamName,
        event_id: id
      });
      setTeam(response.data.team);
      setShowCreateTeam(false);
      setTeamName('');
      toast.success(`Team created! Your team code is: ${response.data.team.team_code}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      toast.error('Please enter a team code');
      return;
    }

    setJoiningTeam(true);
    try {
      const response = await teamsAPI.join(teamCode.toUpperCase(), id);
      setTeam(response.data.team);
      setShowJoinTeam(false);
      setTeamCode('');
      toast.success('Successfully joined the team!');
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join team');
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleRegisterTeam = async () => {
    if (!team) return;

    setEnrolling(true);
    try {
      await teamsAPI.register(team._id);
      toast.success('Team registered successfully!');
      navigate('/student/enrollments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register team');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    try {
      await teamsAPI.leave(team._id);
      setTeam(null);
      toast.success('Left the team successfully');
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave team');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-300">Event not found</p>
            <Link to="/student/events" className="text-indigo-300 mt-4 inline-block">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const maxTeamSize = event.max_team_size || event.team_size || 1;
  const isTeamEvent = maxTeamSize > 1;
  const isTeamLeader = team && user && team.leader_id._id === (user._id || user.id);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            to="/student/events"
            className="text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-2 text-sm font-semibold"
          >
            ← Back to Events
          </Link>

          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-lg space-y-6">
            <div className="space-y-3">
              <span className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
                Event Details
              </span>
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
              <p className="text-slate-300 text-sm sm:text-base">{event.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Date</p>
                <p className="text-slate-100 font-semibold">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Venue</p>
                <p className="text-slate-100 font-semibold">{event.venue}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Team Size</p>
                <p className="text-slate-100 font-semibold">
                  {event.min_team_size && event.max_team_size && event.min_team_size !== event.max_team_size
                    ? `${event.min_team_size}-${event.max_team_size} people`
                    : `${event.max_team_size || event.team_size || 1} ${(event.max_team_size || event.team_size || 1) === 1 ? 'person' : 'people'}`}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Total Prize</p>
                <p className="text-indigo-200 font-semibold">{event.total_prize || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">About the Event</h2>
              <p className="text-slate-300">
                {event.about || 'No additional information available.'}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Event Coordinators</h2>
              {event.coordinator_ids && event.coordinator_ids.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {event.coordinator_ids.map((coordinator, index) => (
                    <div key={coordinator._id || index} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="font-semibold text-slate-100">{coordinator.name}</p>
                      <p className="text-sm text-slate-400">📧 {coordinator.email}</p>
                      {coordinator.mobile && (
                        <p className="text-sm text-slate-400">📱 {coordinator.mobile}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No coordinators assigned yet.</p>
              )}
            </div>

            {isTeamEvent ? (
              <div className="space-y-4">
                {!team ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                      <p className="text-indigo-100 font-semibold mb-2">
                        Team registration required (
                        {event.min_team_size && event.max_team_size && event.min_team_size !== event.max_team_size
                          ? `${event.min_team_size}-${event.max_team_size} members per team`
                          : `${maxTeamSize} members per team`}
                        )
                      </p>
                      <p className="text-indigo-200 text-sm mb-4">
                        Create a new team or join an existing team using a team code.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            setShowCreateTeam(true);
                            setShowJoinTeam(false);
                          }}
                          className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition text-sm font-semibold shadow-md shadow-indigo-500/20"
                        >
                          Create Team
                        </button>
                        <button
                          onClick={() => {
                            setShowJoinTeam(true);
                            setShowCreateTeam(false);
                          }}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-400 transition text-sm font-semibold shadow-md shadow-emerald-500/20"
                        >
                          Join Team
                        </button>
                      </div>
                    </div>

                    {showCreateTeam && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-3">Create New Team</h3>
                        <form onSubmit={handleCreateTeam} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                              Team Name
                            </label>
                            <input
                              type="text"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter team name"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={creatingTeam}
                              className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition disabled:opacity-60 text-sm font-semibold"
                            >
                              {creatingTeam ? 'Creating...' : 'Create Team'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCreateTeam(false)}
                              className="bg-slate-800 text-slate-100 px-4 py-2 rounded-xl hover:bg-slate-700 transition border border-slate-700 text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {showJoinTeam && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-3">Join Existing Team</h3>
                        <form onSubmit={handleJoinTeam} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                              Team Code
                            </label>
                            <input
                              type="text"
                              value={teamCode}
                              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                              placeholder="Enter 6-character team code"
                              maxLength={6}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={joiningTeam}
                              className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-400 transition disabled:opacity-60 text-sm font-semibold"
                            >
                              {joiningTeam ? 'Joining...' : 'Join Team'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowJoinTeam(false)}
                              className="bg-slate-800 text-slate-100 px-4 py-2 rounded-xl hover:bg-slate-700 transition border border-slate-700 text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-2">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-emerald-100 mb-1">Team: {team.team_name}</h3>
                        <p className="text-sm text-emerald-200">
                          Team Code: <span className="font-mono font-bold">{team.team_code}</span>
                        </p>
                        <p className="text-sm text-emerald-200">
                          Members: {1 + team.member_ids.length} / {maxTeamSize}
                          {event.min_team_size && event.min_team_size < maxTeamSize && (
                            <span className="text-slate-300"> (min: {event.min_team_size})</span>
                          )}
                        </p>
                      </div>
                      {team.status === 'registered' && (
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">
                          Registered
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-200 mb-2">Team Members:</p>
                      <div className="space-y-2">
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                          <p className="font-semibold text-slate-100">👑 {team.leader_id.name} (Leader)</p>
                          <p className="text-xs text-slate-400">{team.leader_id.email}</p>
                        </div>
                        {team.member_ids.map((member) => (
                          <div key={member._id} className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                            <p className="font-semibold text-slate-100">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {team.status === 'registered' ? (
                      <p className="text-sm text-emerald-200">Your team is registered for this event!</p>
                    ) : (
                      <div className="flex gap-2">
                        {isTeamLeader ? (
                          <button
                            onClick={handleRegisterTeam}
                            disabled={enrolling || (1 + team.member_ids.length) < 2}
                            className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition disabled:opacity-60 text-sm font-semibold"
                          >
                            {enrolling ? 'Registering...' : 'Register Team'}
                          </button>
                        ) : (
                          <button
                            onClick={handleLeaveTeam}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-400 transition text-sm font-semibold"
                          >
                            Leave Team
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleEnroll(event._id)}
                disabled={enrolling}
                className="w-full bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-400 transition disabled:opacity-60 shadow-lg shadow-indigo-500/20 text-sm font-semibold"
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
