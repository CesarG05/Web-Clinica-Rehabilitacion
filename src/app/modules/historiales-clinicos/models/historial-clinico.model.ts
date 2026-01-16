import { Paciente } from "../../pacientes/models/paciente.model";
import { SesionTratamiento } from "./sesion-tratamiento.model";
import { Tratamiento } from "./tratamiento.model";

export interface HistorialClinico {
  paciente: Paciente;
  tratamientos: Tratamiento[];
  sesionesUnicas: SesionTratamiento[];
}