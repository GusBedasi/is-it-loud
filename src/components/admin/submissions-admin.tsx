"use client"

import { useState, useEffect } from 'react';
import { Check, X, Eye, Clock, AlertCircle, User, Mail, Search, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PendingSubmission, SubmissionStats, Item } from '@/lib/types';
import { pendingSubmissionService } from '@/lib/pending-submissions';
import { approvedItemsService } from '@/lib/approved-items';

export const SubmissionsAdmin = () => {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<PendingSubmission[]>([]);
  const [approvedItems, setApprovedItems] = useState<Item[]>([]);
  const [filteredApprovedItems, setFilteredApprovedItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actualSoundLevel, setActualSoundLevel] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState<'submissions' | 'approved'>('submissions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allSubmissions, submissionStats, allApprovedItems] = await Promise.all([
        pendingSubmissionService.getAllSubmissions(),
        pendingSubmissionService.getSubmissionStats(),
        Promise.resolve(approvedItemsService.getApprovedItems())
      ]);
      setSubmissions(allSubmissions);
      setFilteredSubmissions(allSubmissions);
      setApprovedItems(allApprovedItems);
      setFilteredApprovedItems(allApprovedItems);
      setStats(submissionStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions based on search and status
  useEffect(() => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(query) ||
        sub.category.toLowerCase().includes(query) ||
        sub.description.toLowerCase().includes(query) ||
        sub.submitterName.toLowerCase().includes(query) ||
        sub.submitterEmail.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchQuery, statusFilter]);

  // Filter approved items based on search
  useEffect(() => {
    let filtered = [...approvedItems];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    setFilteredApprovedItems(filtered);
  }, [approvedItems, searchQuery]);

  const handleApprove = async (submissionId: string) => {
    try {
      await pendingSubmissionService.approveAndAddToItems(submissionId, actualSoundLevel);
      await loadData();
      setSelectedSubmission(null);
      setReviewNotes('');
      alert('Item aprovado e adicionado à base de dados!');
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Erro ao aprovar item');
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!reviewNotes.trim()) {
      alert('Por favor, adicione uma nota explicando o motivo da rejeição.');
      return;
    }

    try {
      await pendingSubmissionService.updateSubmissionStatus(submissionId, 'rejected', reviewNotes);
      await loadData();
      setSelectedSubmission(null);
      setReviewNotes('');
      alert('Item rejeitado com sucesso!');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Erro ao rejeitar item');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta submissão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await pendingSubmissionService.deleteSubmission(submissionId);
      await loadData();
      setSelectedSubmission(null);
      alert('Submissão deletada com sucesso!');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Erro ao deletar submissão');
    }
  };

  const handleDeleteApprovedItem = async (itemId: number) => {
    if (!confirm('Tem certeza que deseja deletar este item aprovado? Esta ação não pode ser desfeita e o item será removido da busca.')) {
      return;
    }

    try {
      const success = approvedItemsService.deleteApprovedItem(itemId);
      if (success) {
        await loadData();
        alert('Item aprovado deletado com sucesso!');
      } else {
        alert('Item não encontrado');
      }
    } catch (error) {
      console.error('Error deleting approved item:', error);
      alert('Erro ao deletar item aprovado');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: PendingSubmission['status']) => {
    const variants = {
      pending: { variant: 'warning' as const, text: 'Pendente' },
      approved: { variant: 'success' as const, text: 'Aprovado' },
      rejected: { variant: 'destructive' as const, text: 'Rejeitado' }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getSoundLevelColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando dados...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel de Administração</h1>
            <p className="text-gray-600">Gerencie as submissões e itens aprovados da comunidade</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Rejeitadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-6">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'submissions'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Submissões ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'approved'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Itens Aprovados ({approvedItems.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              placeholder="Buscar por nome, categoria, descrição ou submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeTab === 'submissions' && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'submissions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submissions List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Submissões ({filteredSubmissions.length})
            </h2>
            <div className="space-y-4">
              {filteredSubmissions.map(submission => (
                <Card 
                  key={submission.id} 
                  className={`cursor-pointer transition-all ${
                    selectedSubmission?.id === submission.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{submission.name}</CardTitle>
                        <CardDescription>{submission.category}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubmission(submission.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Deletar submissão"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(submission.submittedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {submission.submitterName}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline">{submission.estimatedSoundLevel} dB (estimado)</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredSubmissions.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Nenhuma submissão encontrada com os filtros aplicados.'
                      : 'Nenhuma submissão encontrada.'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div>
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedSubmission.name}</CardTitle>
                      <CardDescription>Detalhes da submissão</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image */}
                  {selectedSubmission.imageUrl && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Imagem</label>
                      <img 
                        src={selectedSubmission.imageUrl} 
                        alt={selectedSubmission.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <p className="text-gray-900">{selectedSubmission.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nível Estimado</label>
                      <Badge variant="outline">{selectedSubmission.estimatedSoundLevel} dB</Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedSubmission.description}</p>
                  </div>

                  {/* Additional Info */}
                  {selectedSubmission.additionalInfo && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Informações Adicionais</label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedSubmission.additionalInfo}</p>
                    </div>
                  )}

                  {/* Submitter Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Informações do Submitter</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{selectedSubmission.submitterName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{selectedSubmission.submitterEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Enviado em {formatDate(selectedSubmission.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Section */}
                  {selectedSubmission.status === 'pending' && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Revisão</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Nível de Som Correto (dB)
                            <Badge variant="outline" className="ml-2">
                              {actualSoundLevel} dB
                            </Badge>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="120"
                            value={actualSoundLevel}
                            onChange={(e) => setActualSoundLevel(parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getSoundLevelColor(actualSoundLevel)}`}
                              style={{ width: `${(actualSoundLevel / 120) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Notas da Revisão</label>
                          <textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Adicione comentários sobre a revisão..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(selectedSubmission.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Check size={16} />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(selectedSubmission.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            <X size={16} />
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review History */}
                  {selectedSubmission.status !== 'pending' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Histórico da Revisão</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Status:</strong> {selectedSubmission.status === 'approved' ? 'Aprovado' : 'Rejeitado'}</p>
                        {selectedSubmission.reviewedAt && (
                          <p><strong>Data da Revisão:</strong> {formatDate(selectedSubmission.reviewedAt)}</p>
                        )}
                        {selectedSubmission.actualSoundLevel && (
                          <p><strong>Nível de Som Correto:</strong> {selectedSubmission.actualSoundLevel} dB</p>
                        )}
                        {selectedSubmission.reviewNotes && (
                          <p><strong>Notas:</strong> {selectedSubmission.reviewNotes}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Selecione uma submissão à esquerda para ver os detalhes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      ) : (
        /* Approved Items Tab */
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Itens Aprovados ({filteredApprovedItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApprovedItems.map(item => (
              <Card key={item.id} className="group">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <button
                      onClick={() => handleDeleteApprovedItem(item.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      title="Deletar item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.category}</CardDescription>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Nível de Som</span>
                      <span className="text-sm font-semibold text-gray-900">{item.soundLevel} dB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getSoundLevelColor(item.soundLevel)}`}
                        style={{ width: `${Math.min((item.soundLevel / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {item.createdAt && (
                    <div className="text-xs text-gray-500 mt-3">
                      Aprovado em {formatDate(item.createdAt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredApprovedItems.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchQuery 
                  ? 'Nenhum item aprovado encontrado com os filtros aplicados.'
                  : 'Nenhum item aprovado encontrado.'
                }
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};