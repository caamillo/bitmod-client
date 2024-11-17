"use client"; // This marks the component as a client component

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function MapPage() {
  const { token } = useAuth();
  const [devices, setDevices] = useState([]);
  const [center, setCenter] = useState([51.505, -0.09]); // Default center
  const [loading, setLoading] = useState(true); // Loading state
  const [booking, setBooking] = useState(false) 

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true); // Set loading state to true
      const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDevices(data);

      // Calculate the average coordinates to set the map center
      if (data.length > 0) {
        const avgLat = data.reduce((sum, el) => sum + el.deviceData.latitude, 0) / data.length;
        const avgLng = data.reduce((sum, el) => sum + el.deviceData.longitude, 0) / data.length;
        setCenter([avgLat, avgLng]);
      }

      setLoading(false); // Set loading state to false
    };

    const fetchStatus = async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBooking(data?.booking)
    }

    if (token) {
      fetchDevices()
      fetchStatus()
    }
  }, [token]);

  const bookDevice = async (name) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/book?name=${name}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) return console.error(response)
    setBooking(true)
    alert(`Successfully booked device ${name} for 10 mins`)
  }

  const unbookDevice = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/unbook`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) return console.error(response)
    setBooking(false)
    return alert(`Successfully unbooked`)
  } 

  return (
    <div className='relative'>
      <div data-booking={booking} className='fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-md transition-all opacity-0 data-[booking=true]:opacity-100 pointer-events-none data-[booking=true]:pointer-events-auto z-[99999] flex justify-center items-center'>
        <div className='px-5 py-3 rounded-lg bg-white'>
          <h1 className='text-lg font-semibold'>You are already booking</h1>
          <button onClick={unbookDevice} className='w-full py-2 text-lg bg-red-400 text-white rounded-lg mt-2 font-medium'>Unbook</button>
        </div>
      </div>
      {loading ? ( // Show a loading message while fetching data
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h2>Loading...</h2>
        </div>
      ) : (
        <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100vw' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Add markers for each device */}
          {devices.map((el, index) => (
            <Marker key={index} position={[el.deviceData.latitude, el.deviceData.longitude]}>
              <Popup>
                <div>
                  <h4>Name: {el?.name}</h4>
                  <h4>Battery: {el?.deviceData?.battery}%</h4>
                  <button onClick={() => bookDevice(el?.name)} class="bg-red-400 mt-2 px-4 py-2 leading-5 rounded-lg text-white text-sm font-medium">Book me</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
