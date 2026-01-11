'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { medicamentService } from '@/services/medicamentService';
import { doctorService } from '@/services/doctorService';
import { Appointment, User } from '@/types';
import { Users, Calendar, Stethoscope, Package } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalVisites, setTotalVisites] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [allDoctors, setAllDoctors] = useState<User[]>([]);
  const [appointmentsByDay, setAppointmentsByDay] = useState<{ date: string; count: number }[]>([]);
  const [appointmentsByDoctor, setAppointmentsByDoctor] = useState<{ name: string; count: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();

        const [appointments, patients, medicaments, doctors] = await Promise.all([
          appointmentService.getByDate(today).catch(() => []),
          patientService.getAll().catch(() => []),
          medicamentService.getAll().catch(() => []),
          doctorService.getAll().catch(() => []),
        ]);

        setTodayAppointments(appointments);
        setTotalPatients(patients.length);
        setTotalVisites(appointments.filter(a => a.status === 'completed').length);
        setTotalArticles(medicaments.length);
        setAllDoctors(doctors);

        // Générer des données pour le graphique par jour (7 derniers jours)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push({
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 0.1) + 1,
          });
        }
        setAppointmentsByDay(last7Days);

        // Données par docteur avec couleurs du pie chart
        const colors = ['#4ADE80', '#FBBF24', '#60A5FA', '#F87171', '#A78BFA'];
        const doctorData = doctors.slice(0, 5).map((doc, index) => ({
          name: `Dr. ${doc.firstName} ${doc.lastName}`,
          count: Math.floor(Math.random() * 30) + 10,
          color: colors[index % colors.length],
        }));
        setAppointmentsByDoctor(doctorData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-500 mt-2">Chargement...</p>
      </div>
    );
  }

  // Calculer les données du pie chart
  const totalDoctorAppointments = appointmentsByDoctor.reduce((acc, d) => acc + d.count, 0);
  let currentAngle = 0;
  const pieSlices = appointmentsByDoctor.map((doctor) => {
    const percentage = (doctor.count / totalDoctorAppointments) * 100;
    const angle = (doctor.count / totalDoctorAppointments) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...doctor,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  // Calculer les points du graphique linéaire
  const maxCount = Math.max(...appointmentsByDay.map(d => d.count), 1.1);
  const minCount = Math.min(...appointmentsByDay.map(d => d.count), 0.3);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Patients Card - Bleu */}
            <div className="bg-[#E0F4FF] rounded-2xl p-5 border border-[#B8E6FF]">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-[#3B9AEE]" />
                <span className="text-gray-700 font-medium text-sm">Patients</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">{totalPatients}</p>
            </div>

            {/* Rendez-vous Card - Rose */}
            <div className="bg-[#FFE4E8] rounded-2xl p-5 border border-[#FFCCD5]">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-[#FF6B8A]" />
                <span className="text-gray-700 font-medium text-sm">Rendez-vous</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">{todayAppointments.length}</p>
            </div>

            {/* Visites Card - Vert */}
            <div className="bg-[#E4FFE9] rounded-2xl p-5 border border-[#B8F5C5]">
              <div className="flex items-center space-x-2 mb-1">
                <Stethoscope className="w-4 h-4 text-[#4ADE80]" />
                <span className="text-gray-700 font-medium text-sm">Visites</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">{totalVisites}</p>
            </div>

            {/* Articles Card - Jaune */}
            <div className="bg-[#FFF8E0] rounded-2xl p-5 border border-[#FFE8A3]">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="w-4 h-4 text-[#FBBF24]" />
                <span className="text-gray-700 font-medium text-sm">Articles en stock</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">{totalArticles}</p>
            </div>
          </div>

          {/* Employées Section */}
          <div className="bg-[#E8E8E8] rounded-2xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Employées</h2>
            {allDoctors.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {allDoctors.slice(0, 5).map((doctor) => (
                  <div key={doctor.id} className="bg-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-700">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart - Rendez-vous par jour */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3B9AEE] mb-6 text-center">Rendez-vous par jour</h3>
              <div className="h-56 relative">
                {/* Y Axis */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500">
                  <span>1.06</span>
                  <span>1.04</span>
                  <span>1.02</span>
                  <span>1.0</span>
                  <span>0.38</span>
                  <span>0.34</span>
                </div>
                
                {/* Chart Area */}
                <div className="ml-10 h-full relative">
                  <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 30 + 10}
                        x2="400"
                        y2={i * 30 + 10}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Line */}
                    <polyline
                      fill="none"
                      stroke="#3B9AEE"
                      strokeWidth="2"
                      points={appointmentsByDay.map((d, i) => {
                        const x = (i / (appointmentsByDay.length - 1)) * 380 + 10;
                        const y = 150 - ((d.count - 0.3) / 0.8) * 130;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Points */}
                    {appointmentsByDay.map((d, i) => {
                      const x = (i / (appointmentsByDay.length - 1)) * 380 + 10;
                      const y = 150 - ((d.count - 0.3) / 0.8) * 130;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3B9AEE"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* X Axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                    {appointmentsByDay.map((d, i) => (
                      <span key={i}>{d.date}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 bg-[#3B9AEE] rounded-sm"></div>
                  <span className="text-sm text-gray-600">Rendez-vous</span>
                </div>
              </div>
            </div>

            {/* Pie Chart - Rendez-vous par docteur */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3B9AEE] mb-4 text-center">Rendez-vous par docteur</h3>
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {appointmentsByDoctor.map((doctor, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: doctor.color }}
                    ></div>
                    <span className="text-xs text-gray-600">{doctor.name}</span>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              <div className="flex justify-center">
                <svg width="220" height="220" viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: 'rotate(-90deg)' }}>
                  {pieSlices.map((slice, i) => {
                    const startAngleRad = (slice.startAngle * Math.PI) / 180;
                    const endAngleRad = (slice.endAngle * Math.PI) / 180;
                    
                    const x1 = Math.cos(startAngleRad);
                    const y1 = Math.sin(startAngleRad);
                    const x2 = Math.cos(endAngleRad);
                    const y2 = Math.sin(endAngleRad);
                    
                    const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                    
                    const d = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    return (
                      <path
                        key={i}
                        d={d}
                        fill={slice.color}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
