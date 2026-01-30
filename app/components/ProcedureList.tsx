import { Search, X, Download, Printer } from "lucide-react";

export interface Procedimento {
  cod: number;
  nome: string;
  grupo_linha: string;
  sub_grupo: string;
  preco_tabela: string;
}

interface ProcedureListProps {
  selected: Procedimento[];
  patientName: string;
  patientAge: string;
  animalType: string;
  onRemove: (procedure: Procedimento) => void;
  onGeneratePDF: () => void;
}

export default function ProcedureList({
  selected,
  patientName,
  patientAge,
  animalType,
  onRemove,
  onGeneratePDF,
}: ProcedureListProps) {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-8 min-h-96 flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {selected.length > 0
            ? `Procedimentos Selecionados (${selected.length})`
            : "Nenhum procedimento selecionado"}
        </h3>

        {selected.length > 0 ? (
          <>
            <div id="pdf-content" className="flex flex-col gap-3 flex-1 mb-6">
              {/* PDF Header */}
              <div className="mb-4 pb-4 border-b-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-900">
                  Relatório de Procedimentos
                </h4>
                {patientName && (
                  <p className="text-sm text-gray-600">
                    Paciente:{" "}
                    <span className="font-semibold">{patientName}</span>
                  </p>
                )}
                {animalType && (
                  <p className="text-sm text-gray-600">
                    Tipo: <span className="font-semibold">{animalType}</span>
                  </p>
                )}
                {patientAge && (
                  <p className="text-sm text-gray-600">
                    Idade: <span className="font-semibold">{patientAge}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Data:{" "}
                  <span className="font-semibold">
                    {new Date().toLocaleDateString("pt-BR")}
                  </span>
                </p>
              </div>

              {/* Procedures List */}
              <div className="space-y-2">
                {selected.map((procedure, index) => (
                  <div
                    key={procedure.cod}
                    className="group bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 flex items-center justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {index + 1}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{procedure.nome}</p>
                    </div>
                    <button
                      onClick={() => onRemove(procedure)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onGeneratePDF}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={20} />
                Baixar PDF
              </button>
              <button
                onClick={onGeneratePDF}
                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                <Printer size={20} />
                Imprimir
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 text-lg">
                Comece selecionando procedimentos
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Eles aparecerão aqui quando forem escolhidos
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
