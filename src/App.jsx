import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Truck, Activity, AlertCircle, MapPin, Fuel, Gauge, Play, Pause, RotateCcw, Clock, Zap } from 'lucide-react';

// Sample data structure - replace with your actual generated data
const SAMPLE_TRIP_DATA = [
  {
    id: 'trip_1',
    name: 'Cross-Country Long Haul',
    driver: 'John Smith',
    vehicle: 'Truck-001',
    route: 'Los Angeles, CA → New York, NY',
    status: 'in_progress',
    events: [
      { id: 1, timestamp: '2024-11-09T08:00:00Z', type: 'trip_started', location: 'Los Angeles, CA', speed: 0, fuel: 100 },
      { id: 2, timestamp: '2024-11-09T08:15:00Z', type: 'location_update', location: 'Riverside, CA', speed: 65, fuel: 95 },
      { id: 3, timestamp: '2024-11-09T08:30:00Z', type: 'speed_update', location: 'San Bernardino, CA', speed: 70, fuel: 93 },
      { id: 4, timestamp: '2024-11-09T08:45:00Z', type: 'location_update', location: 'Barstow, CA', speed: 68, fuel: 90 },
      { id: 5, timestamp: '2024-11-09T09:00:00Z', type: 'fuel_update', location: 'Baker, CA', speed: 65, fuel: 85 },
      { id: 6, timestamp: '2024-11-09T09:30:00Z', type: 'location_update', location: 'Las Vegas, NV', speed: 70, fuel: 80 }
    ]
  },
  {
    id: 'trip_2',
    name: 'Urban Dense Delivery',
    driver: 'Sarah Johnson',
    vehicle: 'Van-042',
    route: 'Chicago, IL (Urban Loop)',
    status: 'in_progress',
    events: [
      { id: 1, timestamp: '2024-11-09T09:00:00Z', type: 'trip_started', location: 'Chicago, IL', speed: 0, fuel: 100 },
      { id: 2, timestamp: '2024-11-09T09:10:00Z', type: 'location_update', location: 'Chicago Downtown', speed: 25, fuel: 98 },
      { id: 3, timestamp: '2024-11-09T09:20:00Z', type: 'location_update', location: 'Chicago Loop', speed: 15, fuel: 96 },
      { id: 4, timestamp: '2024-11-09T09:35:00Z', type: 'delivery_completed', location: 'Chicago North', speed: 20, fuel: 94 }
    ]
  },
  {
    id: 'trip_3',
    name: 'Mountain Route Cancelled',
    driver: 'Mike Chen',
    vehicle: 'Truck-089',
    route: 'Denver, CO → Salt Lake City, UT',
    status: 'cancelled',
    events: [
      { id: 1, timestamp: '2024-11-09T07:00:00Z', type: 'trip_started', location: 'Denver, CO', speed: 0, fuel: 100 },
      { id: 2, timestamp: '2024-11-09T07:30:00Z', type: 'location_update', location: 'Golden, CO', speed: 55, fuel: 95 },
      { id: 3, timestamp: '2024-11-09T07:45:00Z', type: 'alert_weather', location: 'Mountain Pass', speed: 30, fuel: 92, severity: 'high' },
      { id: 4, timestamp: '2024-11-09T08:00:00Z', type: 'trip_cancelled', location: 'Mountain Pass', speed: 0, fuel: 92, reason: 'Weather conditions' }
    ]
  },
  {
    id: 'trip_4',
    name: 'Southern Technical Issues',
    driver: 'Lisa Rodriguez',
    vehicle: 'Truck-156',
    route: 'Houston, TX → Miami, FL',
    status: 'in_progress',
    events: [
      { id: 1, timestamp: '2024-11-09T10:00:00Z', type: 'trip_started', location: 'Houston, TX', speed: 0, fuel: 100 },
      { id: 2, timestamp: '2024-11-09T10:30:00Z', type: 'alert_technical', location: 'Houston East', speed: 60, fuel: 95, severity: 'medium', description: 'GPS signal weak' },
      { id: 3, timestamp: '2024-11-09T10:45:00Z', type: 'location_update', location: 'Beaumont, TX', speed: 65, fuel: 92 }
    ]
  },
  {
    id: 'trip_5',
    name: 'Regional Logistics',
    driver: 'David Park',
    vehicle: 'Truck-203',
    route: 'Portland, OR → Seattle, WA → Boise, ID',
    status: 'in_progress',
    events: [
      { id: 1, timestamp: '2024-11-09T06:00:00Z', type: 'trip_started', location: 'Portland, OR', speed: 0, fuel: 100 },
      { id: 2, timestamp: '2024-11-09T06:30:00Z', type: 'location_update', location: 'Olympia, WA', speed: 70, fuel: 90 },
      { id: 3, timestamp: '2024-11-09T06:45:00Z', type: 'fuel_update', location: 'Tacoma, WA', speed: 65, fuel: 85 },
      { id: 4, timestamp: '2024-11-09T07:15:00Z', type: 'location_update', location: 'Seattle, WA', speed: 55, fuel: 80 }
    ]
  }
];

// Simulation Engine Hook
function useSimulation(trips) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(null);
  const [processedEvents, setProcessedEvents] = useState({});
  const [progress, setProgress] = useState(0);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

  // Merge and sort all events
  const allEvents = useMemo(() => {
    if (!trips) return [];
    
    const events = [];
    trips.forEach(trip => {
      trip.events.forEach(event => {
        events.push({
          ...event,
          tripId: trip.id,
          timestamp: new Date(event.timestamp)
        });
      });
    });
    
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }, [trips]);

  const simulationStart = allEvents[0]?.timestamp;
  const simulationEnd = allEvents[allEvents.length - 1]?.timestamp;
  const totalDuration = simulationEnd - simulationStart;

  // Process events up to current time
  const getEventsUpToTime = useCallback((time) => {
    const eventsByTrip = {};
    
    allEvents.forEach(event => {
      if (event.timestamp <= time) {
        if (!eventsByTrip[event.tripId]) {
          eventsByTrip[event.tripId] = [];
        }
        eventsByTrip[event.tripId].push(event);
      }
    });
    
    return eventsByTrip;
  }, [allEvents]);

  // Animation loop
  const tick = useCallback(() => {
    if (!startTimeRef.current || !simulationStart) return;
    
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) * speed;
    const newSimTime = new Date(simulationStart.getTime() + elapsed);
    
    if (newSimTime >= simulationEnd) {
      setCurrentTime(simulationEnd);
      setProcessedEvents(getEventsUpToTime(simulationEnd));
      setProgress(100);
      setIsPlaying(false);
      return;
    }
    
    setCurrentTime(newSimTime);
    setProcessedEvents(getEventsUpToTime(newSimTime));
    
    const prog = ((newSimTime - simulationStart) / totalDuration) * 100;
    setProgress(prog);
    
    animationRef.current = requestAnimationFrame(tick);
  }, [speed, simulationStart, simulationEnd, totalDuration, getEventsUpToTime]);

  // Play/Pause control
  useEffect(() => {
    if (isPlaying) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        setCurrentTime(simulationStart);
      } else if (pausedTimeRef.current) {
        const pausedDuration = Date.now() - pausedTimeRef.current;
        startTimeRef.current += pausedDuration;
        pausedTimeRef.current = null;
      }
      
      animationRef.current = requestAnimationFrame(tick);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        pausedTimeRef.current = Date.now();
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, tick, simulationStart]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(simulationStart);
    setProcessedEvents({});
    setProgress(0);
    startTimeRef.current = null;
    pausedTimeRef.current = null;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [simulationStart]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const changeSpeed = useCallback((newSpeed) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      setIsPlaying(false);
      setTimeout(() => {
        setSpeed(newSpeed);
        setIsPlaying(true);
      }, 50);
    } else {
      setSpeed(newSpeed);
    }
  }, [isPlaying]);

  const seekTo = useCallback((percentage) => {
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    
    const targetTime = new Date(simulationStart.getTime() + (totalDuration * percentage / 100));
    setCurrentTime(targetTime);
    setProcessedEvents(getEventsUpToTime(targetTime));
    setProgress(percentage);
    
    const elapsed = targetTime - simulationStart;
    startTimeRef.current = Date.now() - (elapsed / speed);
    
    if (wasPlaying) {
      setTimeout(() => setIsPlaying(true), 50);
    }
  }, [isPlaying, simulationStart, totalDuration, speed, getEventsUpToTime]);

  return {
    isPlaying,
    speed,
    currentTime,
    processedEvents,
    progress,
    simulationStart,
    simulationEnd,
    togglePlayPause,
    reset,
    changeSpeed,
    seekTo
  };
}

// Playback Controls Component
function PlaybackControls({ isPlaying, speed, progress, onTogglePlay, onReset, onSpeedChange, onSeek }) {
  const speeds = [1, 5, 10, 50];

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onTogglePlay}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span className="font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="font-medium">Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-slate-400 text-sm mr-2">Speed:</span>
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1 rounded ${
                speed === s 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              } transition-colors`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Simulation Progress</span>
          <span className="text-white font-mono">{Math.round(progress)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
}

// Time Display Component
function TimeDisplay({ currentTime, simulationStart, simulationEnd }) {
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  const formatDate = (date) => {
    if (!date) return '--/--/----';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-400" />
          <span className="text-slate-400">Current Time:</span>
        </div>
        <div className="text-right">
          <div className="text-white font-mono text-lg">{formatTime(currentTime)}</div>
          <div className="text-slate-400 text-sm">{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
}

// Event Feed Component
function EventFeed({ allEvents, currentTime }) {
  const recentEvents = useMemo(() => {
    if (!currentTime) return [];
    return allEvents
      .filter(e => e.timestamp <= currentTime)
      .slice(-10)
      .reverse();
  }, [allEvents, currentTime]);

  const getEventColor = (type) => {
    if (type.includes('alert')) return 'text-red-400';
    if (type.includes('completed')) return 'text-green-400';
    if (type.includes('cancelled')) return 'text-red-400';
    return 'text-blue-400';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-purple-400" />
        Recent Events
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {recentEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">No events yet...</p>
        ) : (
          recentEvents.map((event, idx) => (
            <div key={idx} className="bg-slate-900 rounded p-2 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium ${getEventColor(event.type)}`}>
                  {event.type.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="text-slate-500 text-xs">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-slate-400 text-xs">
                {event.location} • Trip: {event.tripId}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Updated Trip Card Component with Real-time Data
function TripCard({ trip, processedEvents = [] }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const lastEvent = processedEvents[processedEvents.length - 1];
  const currentMetrics = useMemo(() => {
    if (!processedEvents.length) return null;
    
    const latest = processedEvents[processedEvents.length - 1];
    return {
      location: latest.location || 'Unknown',
      speed: latest.speed || 0,
      fuel: latest.fuel || 0
    };
  }, [processedEvents]);

  const tripProgress = useMemo(() => {
    if (!trip.events.length || !processedEvents.length) return 0;
    return (processedEvents.length / trip.events.length) * 100;
  }, [trip.events.length, processedEvents.length]);

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{trip.name}</h3>
          <p className="text-slate-400 text-sm">{trip.route}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(trip.status)}`}>
          {trip.status === 'in_progress' ? 'ACTIVE' : trip.status.toUpperCase()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Trip Progress</span>
          <span className="text-white font-mono">{Math.round(tripProgress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${tripProgress}%` }}
          />
        </div>
      </div>

      {/* Driver & Vehicle Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-700">
        <div>
          <p className="text-slate-500 text-xs mb-1">Driver</p>
          <p className="text-white text-sm font-medium">{trip.driver}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-1">Vehicle</p>
          <p className="text-white text-sm font-medium">{trip.vehicle}</p>
        </div>
      </div>

      {/* Live Metrics */}
      {currentMetrics ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-slate-500 text-xs">Location</p>
              <p className="text-white text-sm truncate">{currentMetrics.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-slate-500 text-xs">Speed</p>
              <p className="text-white text-sm">{currentMetrics.speed} mph</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-slate-500 text-xs">Fuel</p>
              <p className="text-white text-sm">{currentMetrics.fuel}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <div>
              <p className="text-slate-500 text-xs">Events</p>
              <p className="text-white text-sm">{processedEvents.length}/{trip.events.length}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-slate-500 text-sm">
          Waiting for events...
        </div>
      )}

      {/* Last Event */}
      {lastEvent && (
        <div className="bg-slate-900 rounded p-3">
          <p className="text-slate-500 text-xs mb-1">Last Event</p>
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">{lastEvent.type.replace(/_/g, ' ')}</span>
            <span className="text-slate-400 text-xs">
              {lastEvent.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Updated Fleet Metrics
function FleetMetrics({ trips, processedEvents }) {
  const metrics = useMemo(() => {
    const activeTrips = trips.filter(t => t.status === 'in_progress').length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;
    
    let totalProcessed = 0;
    Object.values(processedEvents).forEach(events => {
      totalProcessed += events.length;
    });
    
    return {
      total: trips.length,
      active: activeTrips,
      completed: completedTrips,
      cancelled: cancelledTrips,
      processedEvents: totalProcessed
    };
  }, [trips, processedEvents]);

  const metricCards = [
    { icon: Activity, label: 'Total Trips', value: metrics.total, color: 'text-blue-400' },
    { icon: Truck, label: 'Active', value: metrics.active, color: 'text-green-400' },
    { icon: AlertCircle, label: 'Cancelled', value: metrics.cancelled, color: 'text-red-400' },
    { icon: Activity, label: 'Events Processed', value: metrics.processedEvents, color: 'text-purple-400' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricCards.map((metric, idx) => (
        <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
            <metric.icon className={`h-8 w-8 ${metric.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Fleet Tracking Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time Vehicle Monitoring System</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// Data Loader Component
function DataLoader({ onDataLoaded }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const normalizedTrips = SAMPLE_TRIP_DATA.map(trip => ({
        ...trip,
        events: trip.events.map(event => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      }));
      
      onDataLoaded(normalizedTrips);
      setLoading(false);
    };
    
    loadData();
  }, [onDataLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading Fleet Data...</p>
        </div>
      </div>
    );
  }

  return null;
}

// Main Dashboard Component
function Dashboard({ trips }) {
  const simulation = useSimulation(trips);
  
  // Merge all events for the event feed
  const allEvents = useMemo(() => {
    const events = [];
    trips.forEach(trip => {
      trip.events.forEach(event => {
        events.push({
          ...event,
          tripId: trip.id,
          timestamp: new Date(event.timestamp)
        });
      });
    });
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }, [trips]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="p-6">
        <TimeDisplay 
          currentTime={simulation.currentTime}
          simulationStart={simulation.simulationStart}
          simulationEnd={simulation.simulationEnd}
        />
        
        <PlaybackControls
          isPlaying={simulation.isPlaying}
          speed={simulation.speed}
          progress={simulation.progress}
          onTogglePlay={simulation.togglePlayPause}
          onReset={simulation.reset}
          onSpeedChange={simulation.changeSpeed}
          onSeek={simulation.seekTo}
        />
        
        <FleetMetrics trips={trips} processedEvents={simulation.processedEvents} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip}
                  processedEvents={simulation.processedEvents[trip.id] || []}
                />
              ))}
            </div>
          </div>
          
          <div>
            <EventFeed allEvents={allEvents} currentTime={simulation.currentTime} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Main App Component
export default function App() {
  const [trips, setTrips] = useState(null);

  if (!trips) {
    return <DataLoader onDataLoaded={setTrips} />;
  }

  return <Dashboard trips={trips} />;
}