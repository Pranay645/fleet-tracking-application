import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Truck, Activity, AlertCircle, MapPin, Fuel, Gauge, Play, Pause, RotateCcw, Clock, Zap, TrendingUp, AlertTriangle, CheckCircle, XCircle, Timer, Navigation, Battery, Signal } from 'lucide-react';

// Sample data structure matching your format
const SAMPLE_TRIP_DATA = [
  {
    trip_id: 'trip_20251103_090000',
    name: 'Cross-Country Long Haul',
    driver: 'John Smith',
    vehicle_id: 'VH_002',
    route: 'Los Angeles, CA → New York, NY',
    status: 'in_progress',
    totalDistance: 2800,
    events: [
      {
        event_id: "evt_1762323066449_1",
        event_type: "trip_started",
        timestamp: "2024-11-09T08:00:00Z",
        vehicle_id: "VH_002",
        trip_id: "trip_20251103_090000",
        location: { lat: 34.0522, lng: -118.2437, accuracy_meters: 10, altitude_meters: 71 },
        movement: { speed_kmh: 0, heading_degrees: 0, moving: false },
        distance_travelled_km: 0,
        signal_quality: "excellent",
        device: { battery_level: 100, charging: false },
        overspeed: false
      },
      {
        event_id: "evt_1762323066449_2",
        event_type: "location_ping",
        timestamp: "2024-11-09T08:15:00Z",
        vehicle_id: "VH_002",
        trip_id: "trip_20251103_090000",
        location: { lat: 33.9533, lng: -117.3962, accuracy_meters: 8, altitude_meters: 256 },
        movement: { speed_kmh: 104.6, heading_degrees: 90, moving: true },
        distance_travelled_km: 80,
        signal_quality: "excellent",
        device: { battery_level: 95, charging: false },
        overspeed: false
      },
      {
        event_id: "evt_1762323066449_3",
        event_type: "location_ping",
        timestamp: "2024-11-09T08:30:00Z",
        vehicle_id: "VH_002",
        trip_id: "trip_20251103_090000",
        location: { lat: 34.1083, lng: -117.2898, accuracy_meters: 10, altitude_meters: 570 },
        movement: { speed_kmh: 112.6, heading_degrees: 85, moving: true },
        distance_travelled_km: 160,
        signal_quality: "good",
        device: { battery_level: 93, charging: false },
        overspeed: true
      },
      {
        event_id: "evt_1762323066449_4",
        event_type: "speed_violation",
        timestamp: "2024-11-09T08:32:00Z",
        vehicle_id: "VH_002",
        trip_id: "trip_20251103_090000",
        location: { lat: 34.1083, lng: -117.2898, accuracy_meters: 10, altitude_meters: 570 },
        movement: { speed_kmh: 137, heading_degrees: 85, moving: true },
        distance_travelled_km: 165,
        signal_quality: "good",
        device: { battery_level: 93, charging: false },
        overspeed: true,
        severity: "high"
      }
    ]
  },
  {
    trip_id: 'trip_20251103_100000',
    name: 'Urban Dense Delivery',
    driver: 'Sarah Johnson',
    vehicle_id: 'VH_042',
    route: 'Chicago, IL (Urban Loop)',
    status: 'completed',
    totalDistance: 150,
    events: [
      {
        event_id: "evt_1762323066450_1",
        event_type: "trip_started",
        timestamp: "2024-11-09T09:00:00Z",
        vehicle_id: "VH_042",
        trip_id: "trip_20251103_100000",
        location: { lat: 41.8781, lng: -87.6298, accuracy_meters: 12, altitude_meters: 180 },
        movement: { speed_kmh: 0, heading_degrees: 0, moving: false },
        distance_travelled_km: 0,
        signal_quality: "excellent",
        device: { battery_level: 100, charging: false },
        overspeed: false
      },
      {
        event_id: "evt_1762323066450_2",
        event_type: "location_ping",
        timestamp: "2024-11-09T09:20:00Z",
        vehicle_id: "VH_042",
        trip_id: "trip_20251103_100000",
        location: { lat: 41.8854, lng: -87.6250, accuracy_meters: 15, altitude_meters: 182 },
        movement: { speed_kmh: 40.2, heading_degrees: 45, moving: true },
        distance_travelled_km: 25,
        signal_quality: "good",
        device: { battery_level: 96, charging: false },
        overspeed: false
      },
      {
        event_id: "evt_1762323066450_3",
        event_type: "trip_completed",
        timestamp: "2024-11-09T10:10:00Z",
        vehicle_id: "VH_042",
        trip_id: "trip_20251103_100000",
        location: { lat: 41.8781, lng: -87.6298, accuracy_meters: 10, altitude_meters: 180 },
        movement: { speed_kmh: 0, heading_degrees: 0, moving: false },
        distance_travelled_km: 150,
        signal_quality: "excellent",
        device: { battery_level: 90, charging: false },
        overspeed: false
      }
    ]
  },
  {
    trip_id: 'trip_20251103_070000',
    name: 'Mountain Route Cancelled',
    driver: 'Mike Chen',
    vehicle_id: 'VH_089',
    route: 'Denver, CO → Salt Lake City, UT',
    status: 'cancelled',
    totalDistance: 525,
    events: [
      {
        event_id: "evt_1762323066451_1",
        event_type: "trip_started",
        timestamp: "2024-11-09T07:00:00Z",
        vehicle_id: "VH_089",
        trip_id: "trip_20251103_070000",
        location: { lat: 39.7392, lng: -104.9903, accuracy_meters: 8, altitude_meters: 1609 },
        movement: { speed_kmh: 0, heading_degrees: 0, moving: false },
        distance_travelled_km: 0,
        signal_quality: "excellent",
        device: { battery_level: 100, charging: false },
        overspeed: false
      },
      {
        event_id: "evt_1762323066451_2",
        event_type: "weather_alert",
        timestamp: "2024-11-09T07:45:00Z",
        vehicle_id: "VH_089",
        trip_id: "trip_20251103_070000",
        location: { lat: 39.7500, lng: -105.8000, accuracy_meters: 20, altitude_meters: 2800 },
        movement: { speed_kmh: 48.3, heading_degrees: 270, moving: true },
        distance_travelled_km: 65,
        signal_quality: "poor",
        device: { battery_level: 92, charging: false },
        overspeed: false,
        severity: "critical"
      },
      {
        event_id: "evt_1762323066451_3",
        event_type: "trip_cancelled",
        timestamp: "2024-11-09T08:00:00Z",
        vehicle_id: "VH_089",
        trip_id: "trip_20251103_070000",
        location: { lat: 39.7500, lng: -105.8000, accuracy_meters: 15, altitude_meters: 2800 },
        movement: { speed_kmh: 0, heading_degrees: 270, moving: false },
        distance_travelled_km: 70,
        signal_quality: "poor",
        device: { battery_level: 91, charging: false },
        overspeed: false,
        reason: "Weather conditions"
      }
    ]
  }
];

// Helper function to convert coordinates to readable location
function getLocationName(lat, lng) {
  // In a real app, you'd use reverse geocoding API
  // For now, return coordinates
  return `${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°W`;
}

// Calculate trip metrics from new data format
function calculateTripMetrics(trip, processedEvents) {
  if (!processedEvents || processedEvents.length === 0) {
    return {
      distance: 0,
      avgSpeed: 0,
      currentSpeed: 0,
      batteryLevel: 100,
      progress: 0,
      alerts: [],
      duration: 0,
      status: trip.status,
      signalQuality: 'unknown',
      heading: 0,
      altitude: 0
    };
  }

  const latest = processedEvents[processedEvents.length - 1];
  const first = processedEvents[0];
  
  // Calculate average speed (exclude 0 speeds)
  const speedEvents = processedEvents.filter(e => e.movement?.speed_kmh > 0);
  const avgSpeed = speedEvents.length > 0 
    ? speedEvents.reduce((sum, e) => sum + e.movement.speed_kmh, 0) / speedEvents.length 
    : 0;

  // Get alerts and violations
  const alerts = processedEvents.filter(e => 
    e.event_type.includes('alert') || 
    e.event_type.includes('violation') ||
    e.event_type.includes('warning') ||
    e.overspeed === true
  );

  // Calculate duration in hours
  const duration = (latest.timestamp - first.timestamp) / (1000 * 60 * 60);

  // Calculate progress based on distance
  const progress = trip.totalDistance > 0 
    ? (latest.distance_travelled_km / trip.totalDistance) * 100 
    : (processedEvents.length / trip.events.length) * 100;

  return {
    distance: latest.distance_travelled_km || 0,
    avgSpeed: Math.round(avgSpeed),
    currentSpeed: latest.movement?.speed_kmh || 0,
    batteryLevel: latest.device?.battery_level || 0,
    charging: latest.device?.charging || false,
    progress: Math.min(progress, 100),
    alerts,
    duration: duration.toFixed(1),
    status: latest.event_type === 'trip_completed' ? 'completed' : 
            latest.event_type === 'trip_cancelled' ? 'cancelled' : 'in_progress',
    currentLocation: getLocationName(latest.location?.lat, latest.location?.lng),
    signalQuality: latest.signal_quality || 'unknown',
    heading: latest.movement?.heading_degrees || 0,
    altitude: latest.location?.altitude_meters || 0,
    accuracy: latest.location?.accuracy_meters || 0,
    moving: latest.movement?.moving || false
  };
}

// Calculate fleet-wide statistics
function calculateFleetStats(trips, processedEvents) {
  const stats = {
    totalTrips: trips.length,
    activeTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalDistance: 0,
    avgSpeed: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    avgBattery: 0,
    completionBuckets: {
      '0-25': 0,
      '25-50': 0,
      '50-75': 0,
      '75-100': 0,
      '100': 0
    }
  };

  let totalSpeed = 0;
  let activeCount = 0;
  let totalBattery = 0;
  let batteryCount = 0;

  trips.forEach(trip => {
    const events = processedEvents[trip.trip_id] || [];
    const metrics = calculateTripMetrics(trip, events);

    // Count by status
    if (metrics.status === 'completed') stats.completedTrips++;
    else if (metrics.status === 'cancelled') stats.cancelledTrips++;
    else stats.activeTrips++;

    // Accumulate distance and speed
    stats.totalDistance += metrics.distance;
    if (metrics.currentSpeed > 0) {
      totalSpeed += metrics.currentSpeed;
      activeCount++;
    }

    // Battery stats
    if (metrics.batteryLevel > 0) {
      totalBattery += metrics.batteryLevel;
      batteryCount++;
    }

    // Count alerts
    stats.totalAlerts += metrics.alerts.length;
    stats.criticalAlerts += metrics.alerts.filter(a => 
      a.severity === 'high' || a.severity === 'critical'
    ).length;

    // Categorize by completion
    const progress = metrics.progress;
    if (progress >= 100) stats.completionBuckets['100']++;
    else if (progress >= 75) stats.completionBuckets['75-100']++;
    else if (progress >= 50) stats.completionBuckets['50-75']++;
    else if (progress >= 25) stats.completionBuckets['25-50']++;
    else stats.completionBuckets['0-25']++;
  });

  stats.avgSpeed = activeCount > 0 ? Math.round(totalSpeed / activeCount) : 0;
  stats.avgBattery = batteryCount > 0 ? Math.round(totalBattery / batteryCount) : 0;

  return stats;
}

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

  const allEvents = useMemo(() => {
    if (!trips) return [];
    
    const events = [];
    trips.forEach(trip => {
      trip.events.forEach(event => {
        events.push({
          ...event,
          timestamp: new Date(event.timestamp)
        });
      });
    });
    
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }, [trips]);

  const simulationStart = allEvents[0]?.timestamp;
  const simulationEnd = allEvents[allEvents.length - 1]?.timestamp;
  const totalDuration = simulationEnd - simulationStart;

  const getEventsUpToTime = useCallback((time) => {
    const eventsByTrip = {};
    
    allEvents.forEach(event => {
      if (event.timestamp <= time) {
        if (!eventsByTrip[event.trip_id]) {
          eventsByTrip[event.trip_id] = [];
        }
        eventsByTrip[event.trip_id].push(event);
      }
    });
    
    return eventsByTrip;
  }, [allEvents]);

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

// Signal Quality Badge Component
function SignalBadge({ quality }) {
  const getColor = (quality) => {
    switch(quality) {
      case 'excellent': return 'text-green-400 bg-green-500/10';
      case 'good': return 'text-blue-400 bg-blue-500/10';
      case 'fair': return 'text-yellow-400 bg-yellow-500/10';
      case 'poor': return 'text-red-400 bg-red-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getColor(quality)}`}>
      <Signal className="h-3 w-3" />
      <span className="text-xs font-medium capitalize">{quality}</span>
    </div>
  );
}

// Enhanced Trip Card with new data format
function TripCard({ trip, processedEvents = [] }) {
  const metrics = useMemo(() => 
    calculateTripMetrics(trip, processedEvents),
    [trip, processedEvents]
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Activity;
    }
  };

  const StatusIcon = getStatusIcon(metrics.status);

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{trip.name}</h3>
          <p className="text-slate-400 text-sm">{trip.route}</p>
          <p className="text-slate-500 text-xs mt-1">Vehicle: {trip.vehicle_id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1 ${getStatusColor(metrics.status)}`}>
          <StatusIcon className="h-3 w-3" />
          <span>{metrics.status === 'in_progress' ? 'ACTIVE' : metrics.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Trip Progress</span>
          <span className="text-white font-mono">{Math.round(metrics.progress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${
              metrics.status === 'completed' ? 'bg-green-500' :
              metrics.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${metrics.progress}%` }}
          />
        </div>
      </div>

      {/* Driver Info */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <p className="text-slate-500 text-xs mb-1">Driver</p>
        <p className="text-white text-sm font-medium">{trip.driver}</p>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-start space-x-2">
          <Navigation className="h-4 w-4 text-blue-400 mt-0.5" />
          <div>
            <p className="text-slate-500 text-xs">Distance</p>
            <p className="text-white text-sm font-semibold">{metrics.distance.toFixed(1)} km</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Gauge className="h-4 w-4 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-slate-500 text-xs">Avg Speed</p>
            <p className="text-white text-sm font-semibold">{metrics.avgSpeed} km/h</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Battery className={`h-4 w-4 mt-0.5 ${
            metrics.batteryLevel < 20 ? 'text-red-400' :
            metrics.batteryLevel < 40 ? 'text-yellow-400' : 'text-green-400'
          }`} />
          <div>
            <p className="text-slate-500 text-xs">Battery</p>
            <p className={`text-sm font-semibold flex items-center space-x-1 ${
              metrics.batteryLevel < 20 ? 'text-red-400' :
              metrics.batteryLevel < 40 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              <span>{metrics.batteryLevel.toFixed(1)}%</span>
              {metrics.charging && <Zap className="h-3 w-3" />}
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Timer className="h-4 w-4 text-purple-400 mt-0.5" />
          <div>
            <p className="text-slate-500 text-xs">Duration</p>
            <p className="text-white text-sm font-semibold">{metrics.duration}h</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {metrics.currentLocation && metrics.moving && (
        <div className="bg-slate-900 rounded p-3 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start space-x-2 flex-1">
              <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-xs">Current Location</p>
                <p className="text-white text-sm truncate">{metrics.currentLocation}</p>
              </div>
            </div>
            <SignalBadge quality={metrics.signalQuality} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-500">Speed</p>
              <p className="text-white font-semibold">{metrics.currentSpeed.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-slate-500">Heading</p>
              <p className="text-white font-semibold">{metrics.heading}°</p>
            </div>
            <div>
              <p className="text-slate-500">Altitude</p>
              <p className="text-white font-semibold">{metrics.altitude.toFixed(0)}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Badge */}
      {metrics.alerts.length > 0 && (
        <div className="flex items-center justify-between bg-red-900/20 border border-red-800 rounded p-2 mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              {metrics.alerts.length} Active Alert{metrics.alerts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Event Counter */}
      <div className="pt-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Events Processed</span>
          <span className="text-white font-mono">{processedEvents.length} / {trip.events.length}</span>
        </div>
      </div>
    </div>
  );
}

// Rest of the components remain similar, updating only data access patterns...
// (Continuing with remaining components in next part due to length)

// Enhanced Fleet Metrics
function FleetMetrics({ trips, processedEvents }) {
  const stats = useMemo(() => 
    calculateFleetStats(trips, processedEvents),
    [trips, processedEvents]
  );

  const metricCards = [
    { 
      icon: Truck, 
      label: 'Active Trips', 
      value: stats.activeTrips, 
      total: stats.totalTrips,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    { 
      icon: CheckCircle, 
      label: 'Completed', 
      value: stats.completedTrips, 
      total: stats.totalTrips,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    { 
      icon: Navigation, 
      label: 'Total Distance', 
      value: `${Math.round(stats.totalDistance)} km`, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    { 
      icon: Gauge, 
      label: 'Avg Speed', 
      value: `${stats.avgSpeed} km/h`, 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    { 
      icon: Battery, 
      label: 'Avg Battery', 
      value: `${stats.avgBattery}%`, 
      color: stats.avgBattery < 40 ? 'text-red-400' : 'text-green-400',
      bgColor: stats.avgBattery < 40 ? 'bg-red-500/10' : 'bg-green-500/10'
    },
    { 
      icon: AlertTriangle, 
      label: 'Total Alerts', 
      value: stats.totalAlerts, 
      critical: stats.criticalAlerts,
      color: stats.criticalAlerts > 0 ? 'text-red-400' : 'text-orange-400',
      bgColor: stats.criticalAlerts > 0 ? 'bg-red-500/10' : 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {metricCards.map((metric, idx) => (
        <div key={idx} className={`${metric.bgColor} rounded-lg p-4 border border-slate-700`}>
          <div className="flex items-center justify-between mb-2">
            <metric.icon className={`h-6 w-6 ${metric.color}`} />
            {metric.total !== undefined && (
              <span className="text-slate-500 text-xs">/{metric.total}</span>
            )}
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">{metric.label}</p>
            <div className="flex items-baseline space-x-2">
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              {metric.critical !== undefined && metric.critical > 0 && (
                <span className="text-red-400 text-xs font-medium">
                  ({metric.critical} critical)
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Completion Statistics Component
function CompletionStats({ trips, processedEvents }) {
  const stats = useMemo(() => 
    calculateFleetStats(trips, processedEvents),
    [trips, processedEvents]
  );

  const buckets = [
    { label: '0-25%', value: stats.completionBuckets['0-25'], color: 'bg-red-500' },
    { label: '25-50%', value: stats.completionBuckets['25-50'], color: 'bg-orange-500' },
    { label: '50-75%', value: stats.completionBuckets['50-75'], color: 'bg-yellow-500' },
    { label: '75-100%', value: stats.completionBuckets['75-100'], color: 'bg-blue-500' },
    { label: 'Complete', value: stats.completionBuckets['100'], color: 'bg-green-500' }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
        Trip Completion Distribution
      </h3>
      <div className="space-y-3">
        {buckets.map((bucket, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-sm">{bucket.label}</span>
              <span className="text-white font-semibold">{bucket.value}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`${bucket.color} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(bucket.value / trips.length) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Alert Summary Component
function AlertSummary({ trips, processedEvents }) {
  const alerts = useMemo(() => {
    const allAlerts = [];
    Object.entries(processedEvents).forEach(([tripId, events]) => {
      const trip = trips.find(t => t.trip_id === tripId);
      events.forEach(event => {
        if (event.event_type.includes('alert') || 
            event.event_type.includes('violation') || 
            event.event_type.includes('warning') ||
            event.overspeed === true) {
          allAlerts.push({
            ...event,
            tripName: trip?.name,
            tripId
          });
        }
      });
    });
    return allAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }, [trips, processedEvents]);

  const criticalCount = alerts.filter(a => 
    a.severity === 'high' || a.severity === 'critical'
  ).length;

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
          Active Alerts
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">Total:</span>
          <span className="text-white font-semibold">{alerts.length}</span>
          {criticalCount > 0 && (
            <>
              <span className="text-red-400 text-sm ml-2">Critical:</span>
              <span className="text-red-400 font-semibold">{criticalCount}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No alerts - All systems normal</p>
          </div>
        ) : (
          alerts.slice(0, 10).map((alert, idx) => (
            <div key={idx} className="bg-slate-900 rounded p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity?.toUpperCase() || 'INFO'}
                    </span>
                    <span className="text-white text-sm font-medium">
                      {alert.event_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{alert.tripName}</p>
                </div>
                <span className="text-slate-500 text-xs">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-300 text-sm">{getLocationName(alert.location?.lat, alert.location?.lng)}</p>
              {alert.overspeed && (
                <p className="text-red-400 text-xs mt-1">⚠️ Vehicle exceeding speed limit</p>
              )}
              {alert.movement?.speed_kmh && (
                <p className="text-slate-400 text-xs mt-1">Speed: {alert.movement.speed_kmh.toFixed(1)} km/h</p>
              )}
            </div>
          ))
        )}
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
      .slice(-15)
      .reverse();
  }, [allEvents, currentTime]);

  const getEventColor = (type) => {
    if (type.includes('alert') || type.includes('violation') || type.includes('warning')) return 'text-red-400';
    if (type.includes('completed')) return 'text-green-400';
    if (type.includes('cancelled')) return 'text-red-400';
    if (type.includes('started')) return 'text-blue-400';
    return 'text-slate-300';
  };

  const getEventIcon = (type) => {
    if (type.includes('alert') || type.includes('violation')) return AlertTriangle;
    if (type.includes('completed')) return CheckCircle;
    if (type.includes('cancelled')) return XCircle;
    if (type.includes('location') || type.includes('ping')) return MapPin;
    if (type.includes('speed')) return Gauge;
    return Activity;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
        <span className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-purple-400" />
          Live Event Feed
        </span>
        <span className="text-slate-500 text-xs font-normal">
          {recentEvents.length} events
        </span>
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {recentEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events yet...</p>
            <p className="text-xs mt-1">Press Play to start simulation</p>
          </div>
        ) : (
          recentEvents.map((event, idx) => {
            const EventIcon = getEventIcon(event.event_type);
            return (
              <div key={idx} className="bg-slate-900 rounded p-3 hover:bg-slate-850 transition-colors">
                <div className="flex items-start space-x-3">
                  <EventIcon className={`h-4 w-4 mt-0.5 ${getEventColor(event.event_type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-sm ${getEventColor(event.event_type)}`}>
                        {event.event_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-slate-500 text-xs whitespace-nowrap ml-2">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mb-1">
                      {getLocationName(event.location?.lat, event.location?.lng)}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span>Vehicle: {event.vehicle_id}</span>
                      {event.movement?.speed_kmh !== undefined && (
                        <span>Speed: {event.movement.speed_kmh.toFixed(1)} km/h</span>
                      )}
                      {event.device?.battery_level !== undefined && (
                        <span>Battery: {event.device.battery_level.toFixed(0)}%</span>
                      )}
                    </div>
                    {event.overspeed && (
                      <div className="mt-1 text-xs text-red-400 font-medium">⚠️ Overspeed detected</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #334155 ${progress}%, #334155 100%)`
          }}
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
          <span className="text-slate-400">Simulation Time:</span>
        </div>
        <div className="text-right">
          <div className="text-white font-mono text-lg">{formatTime(currentTime)}</div>
          <div className="text-slate-400 text-sm">{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fleet Tracking Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time Vehicle Monitoring & Analytics</p>
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
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual file loading from your generated JSON files
      // Example:
      // const response = await fetch('/data/trip1.json');
      // const tripData = await response.json();
      
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
          <p className="text-slate-500 text-sm mt-2">Initializing real-time tracking system</p>
        </div>
      </div>
    );
  }

  return null;
}

// Main Dashboard Component
function Dashboard({ trips }) {
  const simulation = useSimulation(trips);
  
  const allEvents = useMemo(() => {
    const events = [];
    trips.forEach(trip => {
      trip.events.forEach(event => {
        events.push({
          ...event,
          timestamp: new Date(event.timestamp)
        });
      });
    });
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }, [trips]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="p-6 max-w-[1920px] mx-auto">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CompletionStats trips={trips} processedEvents={simulation.processedEvents} />
          <AlertSummary trips={trips} processedEvents={simulation.processedEvents} />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trips.map(trip => (
                <TripCard 
                  key={trip.trip_id} 
                  trip={trip}
                  processedEvents={simulation.processedEvents[trip.trip_id] || []}
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