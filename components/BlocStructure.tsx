import React, { useState } from 'react';
import { Building2, DoorOpen, Layers, Plus } from 'lucide-react';

// Base types for the structure
interface Salle {
  id: number;
  numero: string;
  nom: string;
}

interface Bloc {
  id: number;
  nom: string;
  salles: Salle[];
}

interface Etage {
  id: number;
  numero: string;
  blocs: Bloc[];
}

// Example data (replace with real data via API or props)
const initialEtages: Etage[] = [
  {
    id: 1,
    numero: '1',
    blocs: [
      {
        id: 1,
        nom: 'Bloc A',
        salles: [
          { id: 1, numero: '101', nom: 'Consultation' },
          { id: 2, numero: '102', nom: 'Soins' },
        ],
      },
      {
        id: 2,
        nom: 'Bloc B',
        salles: [
          { id: 3, numero: '103', nom: 'Chirurgie' },
        ],
      },
    ],
  },
  {
    id: 2,
    numero: '2',
    blocs: [],
  },
];

const BlocStructure: React.FC = () => {
  const [etages, setEtages] = useState<Etage[]>(initialEtages);
  const totalBlocs = etages.reduce((sum, etage) => sum + etage.blocs.length, 0);
  const totalSalles = etages.reduce(
    (sum, etage) => sum + etage.blocs.reduce((inner, bloc) => inner + bloc.salles.length, 0),
    0
  );

  // Add actions (hook to API later)
  const ajouterBloc = (etageId: number) => {
    setEtages(prev => prev.map(etage =>
      etage.id === etageId
        ? { ...etage, blocs: [...etage.blocs, { id: Date.now(), nom: '', salles: [] }] }
        : etage
    ));
  };

  const ajouterSalle = (etageId: number, blocId: number) => {
    setEtages(prev => prev.map(etage =>
      etage.id === etageId
        ? {
            ...etage,
            blocs: etage.blocs.map(bloc =>
              bloc.id === blocId
                ? { ...bloc, salles: [...bloc.salles, { id: Date.now(), numero: '', nom: '' }] }
                : bloc
            ),
          }
        : etage
    ));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#3B9AEE] rounded-lg flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Structure du bloc operatoire</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Etages</p>
              <p className="text-3xl font-bold text-gray-800">{etages.length}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Blocs</p>
              <p className="text-3xl font-bold text-gray-800">{totalBlocs}</p>
            </div>
            <div className="bg-[#FFE4E4] rounded-xl p-4 text-center border-2 border-[#FF6B6B]">
              <p className="text-gray-600 text-sm font-medium">Salles</p>
              <p className="text-3xl font-bold text-gray-800">{totalSalles}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Chaque etage contient plusieurs blocs, et chaque bloc contient plusieurs salles.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {etages.map(etage => {
            const etageSalles = etage.blocs.reduce((sum, bloc) => sum + bloc.salles.length, 0);
            return (
              <div key={etage.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-[#E0F4FF] to-[#F3E8FF]">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-white text-[#3B9AEE] flex items-center justify-center shadow-sm">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Etage {etage.numero}</h2>
                      <p className="text-sm text-gray-600">
                        {etage.blocs.length} bloc{etage.blocs.length !== 1 ? 's' : ''} • {etageSalles} salle{etageSalles !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => ajouterBloc(etage.id)}
                    className="inline-flex items-center justify-center space-x-2 bg-[#3B9AEE] text-white px-4 py-2 rounded-lg hover:bg-[#2D8AD8] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un bloc</span>
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {etage.blocs.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                      Aucun bloc pour cet etage
                    </div>
                  ) : (
                    etage.blocs.map(bloc => (
                      <div key={bloc.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-[#E4FFE9] text-[#16A34A] flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">
                              {bloc.nom || 'Nouveau bloc'}
                            </h3>
                          </div>
                          <button
                            onClick={() => ajouterSalle(etage.id, bloc.id)}
                            className="inline-flex items-center justify-center space-x-2 bg-[#4ADE80] text-white px-3 py-2 rounded-lg hover:bg-[#3ACC70] transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter une salle</span>
                          </button>
                        </div>

                        {bloc.salles.length === 0 ? (
                          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                            Aucune salle disponible
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {bloc.salles.map(salle => (
                              <div key={salle.id} className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                                <DoorOpen className="w-4 h-4 text-[#FF6B6B]" />
                                <span className="text-sm text-gray-700">
                                  Salle {salle.numero || 'nouvelle salle'}
                                  {salle.nom ? ` - ${salle.nom}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlocStructure;
