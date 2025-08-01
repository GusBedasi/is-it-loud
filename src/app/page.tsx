"use client"

import { useState, useEffect } from 'react';
import { Search, Volume2, Volume1, VolumeX, X, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { getItems, searchItems, Item, SoundInfo } from '@/lib/data';
import { SubmitItemForm } from '@/components/submit-item-form';

const SoundLevelApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Load initial items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, []);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        try {
          const results = await searchItems(searchTerm);
          setFilteredItems(results);
        } catch (error) {
          console.error('Error searching items:', error);
          setFilteredItems([]);
        }
      } else {
        setFilteredItems([]);
      }
    };

    performSearch();
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const getSoundLevelInfo = (level: number): SoundInfo => {
    if (level >= 80) {
      return {
        icon: <Volume2 className="text-destructive" size={24} />,
        text: 'Muito Alto',
        variant: 'destructive',
        description: 'Este objeto produz um ruído muito intenso'
      };
    }
    if (level >= 60) {
      return {
        icon: <Volume1 className="text-yellow-500" size={24} />,
        text: 'Moderado',
        variant: 'warning',
        description: 'Este objeto produz um ruído moderado'
      };
    }
    return {
      icon: <VolumeX className="text-green-500" size={24} />,
      text: 'Baixo',
      variant: 'success',
      description: 'Este objeto produz um ruído baixo'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 lg:py-20">
            <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 mb-6">
              Is It Loud?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Descubra o nível de ruído dos objetos ao seu redor e tome decisões mais conscientes sobre o ambiente sonoro
            </p>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={20} />
                </div>
                <Input
                  type="text"
                  placeholder="Digite o nome do objeto..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-12 pr-12 h-16 text-lg border-2 border-gray-200 rounded-full shadow-sm focus:border-gray-900 focus:ring-0 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Limpar busca"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              {/* Submit Item Button */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Sugerir Novo Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Results Section */}
        {showResults && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {filteredItems.length} {filteredItems.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => {
                const soundInfo = getSoundLevelInfo(item.soundLevel);
                
                return (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          {soundInfo.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                              {item.category}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {/* Sound Level Bar */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Nível de Som</span>
                            <span className="text-sm font-semibold text-gray-900">{item.soundLevel} dB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                item.soundLevel >= 80 ? 'bg-red-500' :
                                item.soundLevel >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((item.soundLevel / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Sound Level Badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          soundInfo.variant === 'destructive' ? 'bg-red-100 text-red-800' :
                          soundInfo.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {soundInfo.text}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchTerm && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Não encontramos nenhum item para &quot;{searchTerm}&quot;. Tente buscar por outros objetos.
              </p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!showResults && (
          <div className="text-center py-8">
            <div className="max-w-lg mx-auto">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Comece sua busca
              </h3>
              <p className="text-gray-600 mb-4">
                Digite o nome de um objeto no campo acima para descobrir seu nível de ruído e obter informações detalhadas.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setShowResults(true);
                    }}
                    className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-center group"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Submit Item Form Modal */}
      <SubmitItemForm 
        isOpen={showSubmitForm} 
        onClose={() => setShowSubmitForm(false)} 
      />
    </div>
  );
};

export default SoundLevelApp;