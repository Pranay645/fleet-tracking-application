import React, { useState, useEffect } from 'react';
import { Truck, Activity, AlertCircle, MapPin, Fuel, Gauge } from 'lucide-react';

// Sample data structure - replace with your actual generated data
const SAMPLE_TRIP_DATA = [
  {
    id: 'trip_1',
    name: 'Cross-Country Long Haul',
    driver: 'John Smith',
    vehicle: 'Truck-001',
    route: 'Los Angeles, CA → New York, NY',
    totalEvents: 10247,
    status: 'active',
    events: [
      { id: 1, timestamp: '2024-11-09T08:00:00Z', type: 'trip_started', location: 'Los Angeles, CA' },
      { id: 2, timestamp: '2024-11-09T08:15:00Z', type: 'location_update', location: 'Riverside, CA', speed: 65, fuel: 95 },
      { id: 3, timestamp: '2024-11-09T08:30:00Z', type: 'speed_update', speed: 70, fuel: 93 }
    ]
  },
  {
    id: 'trip_2',
    name: 'Urban Dense Delivery',
    driver: 'Sarah Johnson',
    vehicle: 'Van-042',
    route: 'Chicago, IL (Urban Loop)',
    totalEvents: 587,
    status: 'active',
    events: [
      { id: 1, timestamp: '2024-11-09T09:00:00Z', type: 'trip_started', location: 'Chicago, IL' },
      { id: 2, timestamp: '2024-11-09T09:10:00Z', type: 'location_update', location: 'Chicago Downtown', speed: 25, fuel: 88 }
    ]
  },
  {
    id: 'trip_3',
    name: 'Mountain Route Cancelled',
    driver: 'Mike Chen',
    vehicle: 'Truck-089',
    route: 'Denver, CO → Salt Lake City, UT',
    totalEvents: 143,
    status: 'cancelled',
    events: [
      { id: 1, timestamp: '2024-11-09T07:00:00Z', type: 'trip_started', location: 'Denver, CO' },
      { id: 2, timestamp: '2024-11-09T07:45:00Z', type: 'alert_weather', location: 'Mountain Pass', severity: 'high' },
      { id: 3, timestamp: '2024-11-09T08:00:00Z', type: 'trip_cancelled', location: 'Mountain Pass', reason: 'Weather conditions' }
    ]
  },
  {
    id: 'trip_4',
    name: 'Southern Technical Issues',
    driver: 'Lisa Rodriguez',
    vehicle: 'Truck-156',
    route: 'Houston, TX → Miami, FL',
    totalEvents: 1234,
    status: 'active',
    events: [
      { id: 1, timestamp: '2024-11-09T10:00:00Z', type: 'trip_started', location: 'Houston, TX' },
      { id: 2, timestamp: '2024-11-09T10:30:00Z', type: 'alert_technical', severity: 'medium', description: 'GPS signal weak' }
    ]
  },
  {
    id: 'trip_5',
    name: 'Regional Logistics',
    driver: 'David Park',
    vehicle: 'Truck-203',
    route: 'Portland, OR → Seattle, WA → Boise, ID',
    totalEvents: 2156,
    status: 'active',
    events: [
      { id: 1, timestamp: '2024-11-09T06:00:00Z', type: 'trip_started', location: 'Portland, OR' },
      { id: 2, timestamp: '2024-11-09T06:45:00Z', type: 'fuel_update', fuel: 75 }
    ]
  }
];

// Data Loader Component
function DataLoader({ onDataLoaded }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual file loading
      // const trip1 = await fetch('/data/trip1.json').then(r => r.json());
      // const trip2 = await fetch('/data/trip2.json').then(r => r.json());
      // ... etc
      
      // For now, use sample data
      const trips = SAMPLE_TRIP_DATA;
      
      // Validate and normalize data
      const normalizedTrips = trips.map(trip => ({
        ...trip,
        events: trip.events.map(event => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      }));
      
      onDataLoaded(normalizedTrips);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-2">Error Loading Data</p>
          <p className="text-slate-400">{error}</p>
          <button 
            onClick={loadTripData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
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
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-slate-400 text-xs">Current Time</p>
            <p className="text-white font-mono text-sm">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

// Fleet Metrics Component
function FleetMetrics({ trips }) {
  const activeTrips = trips.filter(t => t.status === 'active').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;
  const totalEvents = trips.reduce((sum, t) => sum + t.totalEvents, 0);

  const metrics = [
    { icon: Activity, label: 'Total Trips', value: trips.length, color: 'blue' },
    { icon: Truck, label: 'Active', value: activeTrips, color: 'green' },
    { icon: AlertCircle, label: 'Cancelled', value: cancelledTrips, color: 'red' },
    { icon: Activity, label: 'Total Events', value: totalEvents.toLocaleString(), color: 'purple' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
            <metric.icon className={`h-8 w-8 text-${metric.color}-500`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Trip Card Component
function TripCard({ trip }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const lastEvent = trip.events[trip.events.length - 1];

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{trip.name}</h3>
          <p className="text-slate-400 text-sm">{trip.route}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(trip.status)}`}>
          {trip.status.toUpperCase()}
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-slate-500 text-xs">Location</p>
            <p className="text-white text-sm">{lastEvent?.location || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-yellow-400" />
          <div>
            <p className="text-slate-500 text-xs">Speed</p>
            <p className="text-white text-sm">{lastEvent?.speed ? `${lastEvent.speed} mph` : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Fuel className="h-4 w-4 text-green-400" />
          <div>
            <p className="text-slate-500 text-xs">Fuel</p>
            <p className="text-white text-sm">{lastEvent?.fuel ? `${lastEvent.fuel}%` : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-purple-400" />
          <div>
            <p className="text-slate-500 text-xs">Events</p>
            <p className="text-white text-sm">{trip.totalEvents.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Last Event */}
      <div className="bg-slate-900 rounded p-3">
        <p className="text-slate-500 text-xs mb-1">Last Event</p>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">{lastEvent?.type || 'N/A'}</span>
          <span className="text-slate-400 text-xs">
            {lastEvent?.timestamp ? new Date(lastEvent.timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Trip Grid Component
function TripGrid({ trips }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}

// Main Dashboard Component
function Dashboard({ trips }) {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="p-6">
        <FleetMetrics trips={trips} />
        <TripGrid trips={trips} />
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