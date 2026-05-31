import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  AlertTriangle, 
  Lock, 
  CalendarCheck,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: {
    email: string;
    responseStatus?: string;
  }[];
}

interface CalendarListEntry {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  accessRole?: string;
}

const ACADEMIC_PRESETS = [
  {
    title: "QuantumCalc Math Session",
    description: "Deep-dive session revising matrix algebra, multi-variable equation integration, and graphing calculations.",
    duration: 60, // minutes
  },
  {
    title: "Physics Exam Workspace Study",
    description: "Preparing science and quantum dynamics homework proofs. Focused on physical calculations and periodic references.",
    duration: 120,
  },
  {
    title: "Financial Modelling Peer Review",
    description: "Formulating investment scenarios, regression plots, and percentage stats with the team.",
    duration: 90,
  },
  {
    title: "Academic Lab Revision",
    description: "Revise math worksheets and workbook exercises.",
    duration: 45,
  }
];

const GoogleCalendar: React.FC = () => {
  const { user, accessToken, signInWithGoogle, loading: authLoading } = useAuth();
  
  // State variables
  const [calendars, setCalendars] = useState<CalendarListEntry[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'upcoming'>('upcoming');

  // Form states for creating double events
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [guests, setGuests] = useState<string>('');
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Initialize form start/end times contextually
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // Start in 15 mins
    const startStr = now.toISOString().slice(0, 16);
    setStartTime(startStr);

    now.setHours(now.getHours() + 1); // Ends 1 hour later
    const endStr = now.toISOString().slice(0, 16);
    setEndTime(endStr);
  }, []);

  // Fetch calendars
  const fetchCalendars = useCallback(async (token: string) => {
    try {
      const resp = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        if (resp.status === 401 || resp.status === 403) {
          throw new Error('Workspace permissions expired or insufficient calendar scopes. Please sign out and sign in with Google workspace authorization.');
        }
        throw new Error(`Failed to retrieve calendars. Status code: ${resp.status}`);
      }
      const data = await resp.json();
      setCalendars(data.items || []);
    } catch (err: any) {
      console.error('Error fetching calendar configurations:', err);
      setErrorMsg(err.message || 'Error occurred retrieving list of user calendars.');
    }
  }, []);

  // Fetch events for selected calendar
  const fetchEvents = useCallback(async (token: string, calendarId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Setup range to view upcoming events
      let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&maxResults=100`;
      
      if (timeFilter === 'upcoming') {
        url += `&timeMin=${new Date().toISOString()}`;
      } else if (timeFilter === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        url += `&timeMin=${todayStart.toISOString()}&timeMax=${todayEnd.toISOString()}`;
      }

      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        throw new Error(`Error loading events list from Google Calendar. status: ${resp.status}`);
      }

      const data = await resp.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error('Calendar events fetch failure:', err);
      setErrorMsg(err.message || 'Failed to sync upcoming items with Google Calendar.');
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  // Load calendar lists and current entries when token arrives
  useEffect(() => {
    if (accessToken) {
      fetchCalendars(accessToken);
      fetchEvents(accessToken, selectedCalendarId);
    }
  }, [accessToken, selectedCalendarId, timeFilter, fetchCalendars, fetchEvents]);

  // Apply contextual study template preset
  const applyPreset = (preset: typeof ACADEMIC_PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    
    // Set start time to now + 15 mins
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const startIso = now.toISOString().slice(0, 16);
    setStartTime(startIso);

    // Calculate end time
    now.setMinutes(now.getMinutes() + preset.duration);
    const endIso = now.toISOString().slice(0, 16);
    setEndTime(endIso);
  };

  // Submit new Calendar Event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!title || !startTime || !endTime) {
      setErrorMsg('Event title, start timestamp, and end timestamp are required.');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setErrorMsg('The scheduling end timestamp must fall after the starting timestamp.');
      return;
    }

    setIsSubmitLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Parse guests
    const attendeeList = guests
      .split(',')
      .map(item => item.trim())
      .filter(item => item && item.includes('@'))
      .map(email => ({ email }));

    const requestBody = {
      summary: title,
      description: description || 'Scheduled via Quantum Calculator Workspace Dashboard.',
      location: location || '',
      start: {
        dateTime: new Date(startTime).toISOString(),
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
      },
      attendees: attendeeList.length > 0 ? attendeeList : undefined,
    };

    try {
      const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(selectedCalendarId)}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) {
        throw new Error(`Google creation failed: ${resp.statusText} (${resp.status})`);
      }

      setSuccessMsg(`"${title}" has been added to your Google Calendar!`);
      
      // Clear scheduling form
      setTitle('');
      setDescription('');
      setLocation('');
      setGuests('');
      setIsFormOpen(false);

      // Refresh events
      fetchEvents(accessToken, selectedCalendarId);
      
      // Clear success banner after 5 seconds
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Form error: could not publish scheduled study event.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Destructive Delete with mandatory user confirmation prompt
  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!accessToken) return;

    // MANDATORY USER CONFIRMATION DIALOG (as per workspace-integration/SKILL.md specs)
    const confirmed = window.confirm(
      `Are you sure you want to cancel and delete the event "${eventTitle}" from your Google Calendar? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(selectedCalendarId)}/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!resp.ok) {
        throw new Error(`Failed to remove event. Status: ${resp.status}`);
      }

      setSuccessMsg(`"${eventTitle}" has been cancelled and deleted from your Calendar.`);
      fetchEvents(accessToken, selectedCalendarId);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not delete the event from your calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format timestamps gracefully
  const formatEventTime = (ev: GoogleEvent) => {
    const start = ev.start.dateTime || ev.start.date;
    const end = ev.end.dateTime || ev.end.date;
    if (!start) return 'N/A';

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const dateStr = startDate.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    const startTimeStr = ev.start.dateTime 
      ? startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) 
      : 'All Day';

    const endTimeStr = (endDate && ev.end.dateTime) 
      ? ` - ${endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` 
      : '';

    return `${dateStr} @ ${startTimeStr}${endTimeStr}`;
  };

  // Filter study sessions by user search string
  const filteredEvents = events.filter(ev => {
    const query = searchQuery.toLowerCase();
    const titleMatch = ev.summary && ev.summary.toLowerCase().includes(query);
    const descMatch = ev.description && ev.description.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  // Render setup / connect view if no Google token is cached
  if (!user || !accessToken) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 mx-auto">
            <Lock size={14} /> Workspace Protocol
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tighter leading-none italic">
            Google Calendar <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Study Planner</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-brand-text-secondary font-light leading-relaxed">
            Synchronize, plan, and protect your studies! Connecting your Google Workspace allows you to organize upcoming revision schedules, tutor chats, and assignment completions inside QuantumCalc.
          </p>
        </div>

        <div className="bg-brand-surface/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-brand-border/60 max-w-2xl mx-auto text-center space-y-8 shadow-xl">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary border border-brand-primary/20">
            <CalendarIcon size={32} className="opacity-90" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-brand-text">Authentication Required</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed max-w-md mx-auto">
              We require Google authentication permission to connect to your Workspace calendars and load schedules safely.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => signInWithGoogle()}
              disabled={authLoading}
              className="gsi-material-button mx-auto hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-brand-primary/15"
              style={{ display: 'inline-block' }}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper flex items-center gap-3 bg-[#131b2e] hover:bg-[#1a233d] border border-brand-border px-4 py-2.5 rounded-xl text-white">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '20px', height: '20px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-xs font-black uppercase tracking-widest">Connect Google Calendar</span>
              </div>
            </button>
          </div>

          <div className="border-t border-brand-border/20 pt-6">
            <p className="text-[10px] text-brand-text-secondary leading-relaxed flex items-center gap-2 justify-center">
              <Sparkles size={11} className="text-brand-primary" /> Multi-domain authentication backed by Google Cloud OAuth permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-brand-border/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2">
            <CalendarCheck size={14} /> Workspace synchronization enabled
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-brand-text tracking-tighter italic">
            Google Calendar <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Study Hub</span>
          </h2>
          <p className="text-xs text-brand-text-secondary font-light mt-1.5">
            Coordinate revisions, exams, and team calculations directly into your personal calendar stream.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEvents(accessToken, selectedCalendarId)}
            className="flex items-center justify-center gap-2 p-3 text-xs font-black uppercase tracking-widest bg-brand-surface border border-brand-border/60 hover:border-brand-primary/40 text-brand-text rounded-xl transition-all cursor-pointer"
            title="Refresh Schedules"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh Sync</span>
          </button>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest bg-brand-primary hover:bg-brand-primary/90 text-brand-bg rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-primary/15"
          >
            <Plus size={15} />
            <span>Create Study Event</span>
          </button>
        </div>
      </div>

      {/*/ Info / Success / Error Alerts */}
      <AnimatePresence mode="popLayout">
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-2xl flex items-start gap-3"
          >
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[10px] uppercase tracking-wider text-red-400 mb-0.5">Workspace Sync Error</p>
              <p className="opacity-90">{errorMsg}</p>
            </div>
          </motion.div>
        )}
        
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-brand-accent/15 border border-brand-accent/25 text-brand-accent rounded-2xl flex items-start gap-3"
          >
            <Check size={16} className="text-brand-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[10px] uppercase tracking-wider text-brand-accent mb-0.5">Session Action Confirmed</p>
              <p className="text-brand-text opacity-90 font-medium text-xs">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Calendars Selector & Event Presets Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Calendar Picker Card */}
          <div className="bg-brand-surface/30 border border-brand-border/60 p-6 rounded-[2rem] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-brand-text flex items-center gap-2">
              <CalendarIcon size={16} className="text-brand-primary" /> Select Active Calendar
            </h3>
            <p className="text-[10px] text-brand-text-secondary leading-normal">
              Select which Google Calendar to view upcoming events or post academic scheduling slots.
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {calendars.length === 0 ? (
                <div className="text-xs text-brand-text-secondary py-4 italic text-center">
                  Syncing active calendar lists...
                </div>
              ) : (
                calendars.map((cal) => (
                  <button
                    key={cal.id}
                    onClick={() => setSelectedCalendarId(cal.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      selectedCalendarId === cal.id
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-text'
                        : 'bg-transparent border-brand-border/40 text-brand-text-secondary hover:border-brand-border hover:bg-brand-surface/20'
                    }`}
                  >
                    <span className="font-bold truncate max-w-[80%]">{cal.summary}</span>
                    {cal.primary && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-md">
                        Primary
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Academic Presets Trigger Card */}
          <div className="bg-brand-surface/30 border border-brand-border/60 p-6 rounded-[2rem] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-brand-text flex items-center gap-2">
              <GraduationCap size={16} className="text-brand-secondary" /> Study Presets
            </h3>
            <p className="text-[10px] text-brand-text-secondary leading-normal">
              Click any blueprint below to quickly pre-populate the scheduler form with structured study milestones.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {ACADEMIC_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    applyPreset(preset);
                    setIsFormOpen(true);
                  }}
                  className="p-3 text-left bg-brand-surface/40 hover:bg-brand-surface/85 border border-brand-border/40 hover:border-brand-secondary/40 rounded-xl transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-brand-text group-hover:text-brand-secondary transition-colors truncate">{preset.title}</p>
                  <p className="text-[10px] text-brand-text-secondary mt-1 opacity-80 line-clamp-2 leading-relaxed">{preset.description}</p>
                  <span className="inline-block mt-2 text-[8px] font-mono font-bold uppercase bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-md">
                    ⌚ {preset.duration} Mins
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Event Creator & Sizable List */}
        <div className="lg:col-span-8 space-y-6">

          {/* Form Modal/Collapsible: Create Event */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, margin: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                exit={{ height: 0, opacity: 0, margin: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-brand-surface/35 border border-brand-primary/20 p-6 rounded-[2rem] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-border/20">
                    <h3 className="text-md font-black uppercase tracking-[0.15em] text-brand-primary flex items-center gap-2">
                      <Plus size={16} /> Schedule Study Session
                    </h3>
                    <button 
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs font-bold text-brand-text-secondary hover:text-brand-text"
                    >
                      Hide Form
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Event Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. revision on percentages, math homework set"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border/50 focus:border-brand-primary text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/25 transition-all font-medium"
                      />
                    </div>

                    {/* Start Time */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Starts *</label>
                      <input
                        type="datetime-local"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border/50 focus:border-brand-primary text-brand-text rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>

                    {/* End Time */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Ends *</label>
                      <input
                        type="datetime-local"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border/50 focus:border-brand-primary text-brand-text rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Details / Description</label>
                      <textarea
                        rows={2}
                        placeholder="Study guidelines, reference lists of calculators or equations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border/50 focus:border-brand-primary text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/25 transition-all custom-scrollbar font-light"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Location / Room (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Study lab 4C, online Google Meet"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border/50 focus:border-brand-primary text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/25 transition-all"
                      />
                    </div>

                    {/* Guest invites */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Invite Collaborators (comma-separated emails)</label>
                      <input
                        type="text"
                        placeholder="e.g. friend@edu.com, tutor@cal.com"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border/50 focus:border-brand-primary text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/25 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2 pt-2 flex justify-end gap-3 border-t border-brand-border/20">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2.5 text-xs font-black uppercase tracking-widest border border-brand-border hover:border-brand-text text-brand-text-secondary hover:text-brand-text rounded-xl cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitLoading}
                        className="bg-brand-primary hover:bg-brand-primary/95 text-brand-bg font-extrabold text-xs uppercase tracking-widest py-2.5 px-6 rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSubmitLoading ? 'Saving Slot...' : 'Confirm Sync Slot'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sizable Event Listing Section */}
          <div className="bg-brand-surface/30 border border-brand-border/60 p-6 rounded-[2rem] space-y-6">
            
            {/* Filter and search headers */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Filter Tabs */}
              <div className="flex bg-brand-bg/60 p-1 rounded-xl border border-brand-border/30 w-full md:w-auto">
                {[
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'today', label: 'Today' },
                  { id: 'all', label: 'All History' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTimeFilter(item.id as any)}
                    className={`flex-1 md:flex-none py-1.5 px-3.5 text-center font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      timeFilter === item.id
                        ? 'bg-brand-surface text-brand-primary shadow-sm border border-brand-border/25'
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Dynamic search input */}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-brand-bg/70 hover:bg-brand-bg/90 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/60 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 transition-all"
                />
              </div>

            </div>

            {/* List entries */}
            <div className="space-y-3.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <RefreshCw className="text-brand-primary animate-spin" size={24} />
                  <p className="text-xs text-brand-text-secondary font-mono tracking-wider">Syncing scheduling records...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-12 text-center bg-brand-bg/50 border border-brand-border/30 rounded-2xl space-y-3">
                  <BookOpen size={24} className="text-brand-text-secondary opacity-40 mx-auto" />
                  <p className="text-xs font-black text-brand-text-secondary/90">No scheduled study slots found.</p>
                  <p className="text-[10px] text-brand-text-secondary/70 max-w-sm mx-auto">
                    Try modifying your search queries, shifting your upcoming timestamp filters, or create a brand new academic entry using one of our study presets.
                  </p>
                </div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 bg-brand-surface/40 hover:bg-brand-surface/75 border border-brand-border/50 hover:border-brand-border transition-all rounded-2xl flex items-start justify-between gap-4 group"
                  >
                    <div className="space-y-2 max-w-[85%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="p-1 rounded-md bg-brand-primary/10 text-brand-primary">
                          <Clock size={12} />
                        </span>
                        <span className="text-[11px] font-mono font-bold text-brand-text">
                          {formatEventTime(ev)}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-black text-brand-text leading-tight group-hover:text-brand-primary transition-colors">
                          {ev.summary || '(Untitled Study Slot)'}
                        </h4>
                        {ev.description && (
                          <p className="text-[10px] text-brand-text-secondary/90 leading-relaxed mt-1 whitespace-pre-line font-light">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Detail Badges: Location, Guests */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
                        {ev.location && (
                          <span className="flex items-center gap-1.5 text-[9px] text-brand-text-secondary font-medium">
                            <MapPin size={10} className="text-brand-secondary opacity-80" />
                            {ev.location}
                          </span>
                        )}
                        {ev.attendees && ev.attendees.length > 0 && (
                          <span className="flex items-center gap-1.5 text-[9px] text-brand-text-secondary font-medium" title={ev.attendees.map(a => a.email).join(', ')}>
                            <Users size={10} className="text-brand-primary opacity-80" />
                            {ev.attendees.length} invited
                          </span>
                        )}
                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] text-brand-primary hover:underline font-black uppercase tracking-wider"
                          >
                            Open in Google Calendar ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.summary || 'Untitled EventInCalendar')}
                      className="p-2 bg-brand-bg hover:bg-red-500/10 text-brand-text-secondary hover:text-red-400 rounded-xl border border-brand-border/40 hover:border-red-500/30 transition-all shadow-sm opacity-80 group-hover:opacity-100 cursor-pointer lg:mt-0.5"
                      title="Delete Study Slot (Google Sync)"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Pagination / Total count summary indicator */}
            <div className="text-center pt-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-brand-text-secondary/50">
                Found {filteredEvents.length} calendar registry entries
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default GoogleCalendar;
