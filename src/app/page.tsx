"use client"

import { useState } from 'react';
import { Search, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  soundLevel: number;
  image: string;
  category: string;
  description: string;
}

interface SoundInfo {
  icon: JSX.Element;
  text: string;
  variant: 'default' | 'destructive' | 'warning' | 'success';
  description: string;
}

const items: Item[] = [
  {
    id: 1,
    name: 'Secador de Cabelo',
    soundLevel: 85,
    image: 'https://images.unsplash.com/photo-1621607510248-9c78bbab941b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Equipamentos Domésticos',
    description: 'Usado para secar cabelos, produz um ruído constante e alto'
  },
  {
    id: 2,
    name: 'Aspirador de Pó',
    soundLevel: 75,
    image: 'https://images.unsplash.com/photo-1722710070534-e31f0290d8de?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Equipamentos Domésticos',
    description: 'Aparelho de limpeza com motor que gera ruído considerável'
  },
  {
    id: 3,
    name: 'Liquidificador',
    soundLevel: 80,
    image: 'https://plus.unsplash.com/premium_photo-1663853294058-3f85f18a4bed?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Cozinha',
    description: 'Processador de alimentos com lâminas rotativas de alta velocidade'
  },
  {
    id: 4,
    name: 'Ventilador',
    soundLevel: 45,
    image: 'https://images.unsplash.com/photo-1528293064916-02c0435e416d?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Equipamentos Domésticos',
    description: 'Aparelho de ventilação com ruído suave e constante'
  }
];

const SoundLevelApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length > 0);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Is It Loud?
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra o nível de ruído dos objetos ao seu redor
          </p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Digite o nome do objeto..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map(item => {
              const soundInfo = getSoundLevelInfo(item.soundLevel);
              
              return (
                <Card key={item.id} className="flex flex-col">
                  <CardHeader className="p-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  
                  <CardContent className="pt-6 flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl mb-1">{item.name}</CardTitle>
                        <CardDescription>{item.category}</CardDescription>
                      </div>
                      {soundInfo.icon}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Nível de Som</span>
                          <span className="font-medium">{item.soundLevel} dB</span>
                        </div>
                        <Progress value={item.soundLevel} className="h-2" />
                      </div>
                      
                      <Alert variant={soundInfo.variant as 'default' | 'destructive'}>
                        <AlertDescription>
                          {soundInfo.description}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Badge variant={soundInfo.variant as 'default' | 'destructive'} className="w-full justify-center">
                      {soundInfo.text}
                    </Badge>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {searchTerm && filteredItems.length === 0 && (
          <Alert variant="default" className="max-w-2xl mx-auto">
            <AlertDescription className="text-center">
              Nenhum item encontrado para &quot;{searchTerm}&quot;
            </AlertDescription>
          </Alert>
        )}

        {/* Initial State */}
        {!showResults && (
          <Alert variant="default" className="max-w-2xl mx-auto">
            <AlertDescription className="text-center">
              Digite o nome de um objeto para descobrir seu nível de ruído
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SoundLevelApp;