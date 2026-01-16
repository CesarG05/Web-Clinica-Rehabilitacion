import { Paciente } from "../../pacientes/models/paciente.model";
import { DocumentoTratamiento } from "./documento-tratamiento.model";
import { SesionTratamiento } from "./sesion-tratamiento.model";

export interface TratamientoDetalle {
  tratamientoId: number;
  //pacienteId: number;
  paciente: Paciente;
  padecimiento: string;
  tratamiento: string;
  fechaInicioTratamiento: string;
  fechaFinTratamiento: string | null;
  observaciones: string;
  documentos: DocumentoTratamiento[];
  sesiones: SesionTratamiento[];
}