import { Apontamento } from "./apontamento-interface";
import { Cliente } from "./cliente-interface";
import { Usuario } from "./usuario-interface";

export interface Timesheet {
    id: number,
    usuario: Usuario,
    data: Date,
    cliente: Cliente,
    observacao: string,
    apontamentos: Apontamento[]
}