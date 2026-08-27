export type ConcursoEstado = 'DRAFT' | 'ACTIVE' | 'FINISHED';

export interface Concurso {
  id: string;
  titulo: string;
  estado: ConcursoEstado;
  montoMinimo: number;
  fechaDesde: string;
  fechaHasta: string | null;
  reglas: string;
  legal: string;
  imagenPromoUrl: string | null;
  imagenPromoActiva: boolean;
  resultadoVisible: boolean;
  ganadorOrdenId: string | null;
  permiteMultiplesParticipaciones: boolean;
  creadoEn: string;
  participantesCount?: number;
}

export interface Participante {
  id: string;
  ordenId: string;
  usuarioId: string;
  clienteNombre: string | null;
  clienteEmail: string | null;
  ordenTotal: number | null;
  ordenFecha: string | null;
  ordenOrigen: string | null;
  creadoEn: string;
}

export interface CreateConcursoRequest {
  titulo: string;
  montoMinimo: number;
  fechaDesde: string;
  fechaHasta?: string;
  reglas: string;
  legal: string;
  imagenPromoUrl?: string;
  imagenPromoActiva: boolean;
  permiteMultiplesParticipaciones: boolean;
}
