import { Search, X, Download, Printer } from 'lucide-react'

export interface Procedimento {
  cod: number
  nome: string
  grupo_linha: string
  sub_grupo: string
  preco_tabela: string
}

interface ProcedureListProps {
  selected: Procedimento[]
  patientName: string
  patientAge: string
  animalType: string
  onRemove: (procedure: Procedimento) => void
  onGeneratePDF: () => void
  isFormValid?: boolean
  validationErrors?: Record<string, string[]>
}

export default function ProcedureList({
  selected,
  patientName,
  onRemove,
  onGeneratePDF,
  isFormValid = false,
  validationErrors = {},
}: ProcedureListProps) {
  return (
    <div>
      <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-8 min-h-96 flex flex-col'>
        <h3 className='text-lg sm:text-2xl font-bold mb-4 sm:mb-6' style={{ color: '#1B3D6D' }}>
          {selected.length > 0 ? `Procedimentos Selecionados (${selected.length})` : 'Nenhum procedimento selecionado'}
        </h3>

        {selected.length > 0 ? (
          <>
            {/* Conteúdo para PDF (oculto na tela) */}
            <div
              id='pdf-content'
              style={{
                display: 'none',
              }}
            >
              {/* PDF Header com Logo */}
              <div style={{ marginBottom: '30px', borderBottom: '2px solid #000000', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                  <img src='/logo.png' alt='VFP Hospital Veterinário' style={{ height: '60px', width: 'auto' }} />
                </div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#000000',
                    margin: '15px 0 20px 0',
                  }}
                >
                  Relatório de Procedimentos
                </h2>

                {/* Informações do Paciente */}
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                  }}
                >
                  {patientName && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#000000' }}>
                      <strong>Título:</strong> {patientName}
                    </p>
                  )}
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#000000' }}>
                    <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Lista de Procedimentos */}
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000',
                    marginBottom: '15px',
                  }}
                >
                  Procedimentos a Realizar ({selected.length})
                </h3>
                {selected.map((procedure, index) => (
                  <div
                    key={procedure.cod}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        minWidth: '26px',
                        backgroundColor: '#000000',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        flexShrink: 0,
                        lineHeight: '1',
                        textAlign: 'center',
                      }}
                    >
                      {index + 1}
                    </div>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#000000',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {procedure.nome}
                    </p>
                  </div>
                ))}
              </div>

              {/* Rodapé do PDF */}
              <div
                style={{
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '2px solid #000000',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0' }}>VFP Hospital Veterinário</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '5px 0' }}>
                  Documento gerado em {new Date().toLocaleDateString('pt-BR')} às{' '}
                  {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Lista Visual (não aparece no PDF) */}
            <div className='flex flex-col gap-2 sm:gap-3 flex-1 mb-4 sm:mb-6'>
              <div className='space-y-1 sm:space-y-2'>
                {selected.map((procedure, index) => (
                  <div
                    key={procedure.cod}
                    className='group border-2 rounded-xl p-2 sm:p-3 flex items-center justify-between hover:shadow-md transition-all duration-200'
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderColor: '#00B050',
                    }}
                  >
                    <div className='flex items-center gap-2 sm:gap-3 flex-1'>
                      <div
                        className='w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs'
                        style={{ backgroundColor: '#00B050' }}
                      >
                        <span className='text-white font-bold'>{index + 1}</span>
                      </div>
                      <p className='font-medium text-sm sm:text-base' style={{ color: '#1B3D6D' }}>
                        {procedure.nome}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(procedure)}
                      className='bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-2 transition-all duration-200 flex-shrink-0'
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200'>
              <button
                onClick={onGeneratePDF}
                disabled={!isFormValid}
                className={`flex-1 flex items-center justify-center gap-2 text-white font-semibold py-2 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:shadow-lg'
                }`}
                style={isFormValid ? { backgroundColor: '#00B050' } : { backgroundColor: '#9ca3af' }}
                onMouseEnter={e => {
                  if (isFormValid) {
                    e.currentTarget.style.backgroundColor = '#009940'
                  }
                }}
                onMouseLeave={e => {
                  if (isFormValid) {
                    e.currentTarget.style.backgroundColor = '#00B050'
                  }
                }}
                title={!isFormValid ? 'Preencha todos os campos obrigatórios' : ''}
              >
                <Download size={18} />
                Baixar PDF
              </button>
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Search className='text-gray-400' size={32} />
              </div>
              <p className='text-gray-500 text-lg'>Comece selecionando procedimentos</p>
              <p className='text-gray-400 text-sm mt-1'>Eles aparecerão aqui quando forem escolhidos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
