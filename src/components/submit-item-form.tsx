"use client"

import { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { submitNewItem } from '@/lib/pending-submissions';
import { submissionRateLimiter, RateLimitError, formatRemainingTime } from '@/lib/rate-limiter';

interface SubmissionData {
  name: string;
  estimatedSoundLevel: number;
  imageUrl: string;
  category: string;
  description: string;
  submitterName: string;
  submitterEmail: string;
  additionalInfo: string;
}

interface SubmitItemFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitItemForm = ({ isOpen, onClose }: SubmitItemFormProps) => {
  const [formData, setFormData] = useState<SubmissionData>({
    name: '',
    estimatedSoundLevel: 50,
    imageUrl: '',
    category: '',
    description: '',
    submitterName: '',
    submitterEmail: '',
    additionalInfo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    used: number;
    limit: number;
    resetTime: number;
  } | null>(null);

  const categories = [
    'Equipamentos Domésticos',
    'Cozinha', 
    'Eletrônicos',
    'Climatização',
    'Ferramentas',
    'Veículos',
    'Instrumentos Musicais',
    'Esportes',
    'Outros'
  ];

  const handleInputChange = (field: keyof SubmissionData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome do objeto é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.submitterName.trim()) newErrors.submitterName = 'Seu nome é obrigatório';
    if (!formData.submitterEmail.trim()) newErrors.submitterEmail = 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitterEmail)) {
      newErrors.submitterEmail = 'Email inválido';
    }
    if (formData.estimatedSoundLevel < 0 || formData.estimatedSoundLevel > 120) {
      newErrors.estimatedSoundLevel = 'Nível de som deve estar entre 0-120 dB';
    }
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'URL da imagem inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check rate limit before submitting
    const limitCheck = submissionRateLimiter.checkLimit();
    if (!limitCheck.allowed) {
      const remainingTime = submissionRateLimiter.getRemainingTime();
      setErrors({ 
        submit: `Limite de submissões excedido. Tente novamente em ${formatRemainingTime(remainingTime)}.` 
      });
      updateRateLimitInfo();
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      await submitItemForReview(formData);
      setSubmitSuccess(true);
      updateRateLimitInfo();
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          estimatedSoundLevel: 50,
          imageUrl: '',
          category: '',
          description: '',
          submitterName: '',
          submitterEmail: '',
          additionalInfo: ''
        });
        setSubmitSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      if (error instanceof RateLimitError) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Erro ao enviar sugestão. Tente novamente.' });
      }
      updateRateLimitInfo();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRateLimitInfo = () => {
    const usage = submissionRateLimiter.getCurrentUsage();
    setRateLimitInfo(usage);
  };

  // Update rate limit info when form opens
  useEffect(() => {
    if (isOpen) {
      updateRateLimitInfo();
    }
  }, [isOpen]);

  const getSoundLevelColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Sugerir Novo Item</CardTitle>
            <CardDescription>
              Ajude nossa comunidade sugerindo um novo objeto para nossa base de dados
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </CardHeader>

        <CardContent>
          {submitSuccess ? (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Sugestão enviada com sucesso! Nossa equipe irá revisar e verificar as informações antes de adicionar à base de dados.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guidelines */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Diretrizes:</strong> Forneça informações precisas sobre o objeto. Nossa equipe verificará todas as informações antes da aprovação.
                </AlertDescription>
              </Alert>

              {/* Rate Limit Info */}
              {rateLimitInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-800">
                      Submissões: {rateLimitInfo.used}/{rateLimitInfo.limit}
                    </span>
                    <span className="text-blue-600">
                      Limite por minuto
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(rateLimitInfo.used / rateLimitInfo.limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Object Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações do Objeto</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Objeto *</label>
                  <Input
                    placeholder="Ex: Liquidificador, Aspirador de Pó..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição *</label>
                  <textarea
                    placeholder="Descreva o objeto e como ele produz som..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md h-20 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nível de Som Estimado (dB) * 
                    <Badge variant="outline" className="ml-2">
                      {formData.estimatedSoundLevel} dB
                    </Badge>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="120"
                      value={formData.estimatedSoundLevel}
                      onChange={(e) => handleInputChange('estimatedSoundLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 dB (Silêncio)</span>
                      <span>60 dB (Moderado)</span>
                      <span>120 dB (Muito Alto)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getSoundLevelColor(formData.estimatedSoundLevel)}`}
                        style={{ width: `${(formData.estimatedSoundLevel / 120) * 100}%` }}
                      />
                    </div>
                  </div>
                  {errors.estimatedSoundLevel && <p className="text-red-500 text-sm mt-1">{errors.estimatedSoundLevel}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL da Imagem (opcional)</label>
                  <Input
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className={errors.imageUrl ? 'border-red-500' : ''}
                  />
                  {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
                  <p className="text-xs text-gray-500 mt-1">Preferencialmente de sites como Unsplash ou similar</p>
                </div>
              </div>

              {/* Submitter Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suas Informações</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Seu Nome *</label>
                  <Input
                    placeholder="Como gostaria de ser creditado"
                    value={formData.submitterName}
                    onChange={(e) => handleInputChange('submitterName', e.target.value)}
                    className={errors.submitterName ? 'border-red-500' : ''}
                  />
                  {errors.submitterName && <p className="text-red-500 text-sm mt-1">{errors.submitterName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.submitterEmail}
                    onChange={(e) => handleInputChange('submitterEmail', e.target.value)}
                    className={errors.submitterEmail ? 'border-red-500' : ''}
                  />
                  {errors.submitterEmail && <p className="text-red-500 text-sm mt-1">{errors.submitterEmail}</p>}
                  <p className="text-xs text-gray-500 mt-1">Para contatarmos sobre a sugestão</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Informações Adicionais (opcional)</label>
                  <textarea
                    placeholder="Qualquer informação adicional sobre o objeto ou sua experiência com ele..."
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-16"
                  />
                </div>
              </div>

              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Real function to submit item for review
async function submitItemForReview(data: SubmissionData): Promise<void> {
  await submitNewItem({
    name: data.name,
    estimatedSoundLevel: data.estimatedSoundLevel,
    imageUrl: data.imageUrl,
    category: data.category,
    description: data.description,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    additionalInfo: data.additionalInfo
  });
}