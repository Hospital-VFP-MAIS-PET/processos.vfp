import { Search, X, Download, Printer } from 'lucide-react'
import { parsePrice } from '@/app/helpers/currency'

export interface Procedimento {
  cod: number
  nome: string
  planos: string
  grupo_linha: string
  sub_grupo: string
  preco: string
}

export interface SelectedProcedimento extends Procedimento {
  count: number
}

interface ProcedureListProps {
  selected: SelectedProcedimento[]
  patientName: string
  patientAge: string
  animalType: string
  onRemove: (procedure: SelectedProcedimento) => void
  onIncrement: (procedure: SelectedProcedimento) => void
  onDecrement: (procedure: SelectedProcedimento) => void
  onGeneratePDF: () => void
  isFormValid?: boolean
  validationErrors?: Record<string, string[]>
  isGeneratingPDF?: boolean
}

export default function ProcedureList({
  selected,
  patientName,
  onRemove,
  onIncrement,
  onDecrement,
  onGeneratePDF,
  isFormValid = false,
  validationErrors = {},
  isGeneratingPDF = false,
}: ProcedureListProps) {
  const totalCount = selected.reduce((sum, item) => sum + item.count, 0)
  const procedure_total = selected.reduce((sum, item) => sum + item.count, 0)
  const procedure_total_numeric = selected.reduce((sum, item) => sum + parsePrice(item.preco) * item.count, 0)
  const procedure_total_value = procedure_total_numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
                  Procedimentos a Realizar ({totalCount})
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
                      {procedure.cod} - {procedure.nome}
                    </p>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#00B050',
                        fontWeight: 'bold',
                        marginRight: '8px',
                      }}
                    >
                      {procedure.preco && procedure.preco.trim() !== '' && procedure.preco.trim() !== 'R$ -'
                        ? procedure.preco
                        : 'R$ 0'}
                    </span>
                    <div
                      style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: '#000000',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Qtd: x{procedure.count}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumo do PDF */}
              <div
                style={{
                  marginTop: '30px',
                  paddingTop: '20px',
                  paddingBottom: '20px',
                  paddingLeft: '15px',
                  paddingRight: '15px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                }}
              >
                <p style={{ fontSize: '13px', color: '#000000', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                  Resumo
                </p>
                <p style={{ fontSize: '12px', color: '#000000', margin: '5px 0' }}>
                  <strong>Total de Procedimentos:</strong> {procedure_total}
                </p>
                <p style={{ fontSize: '12px', color: '#00B050', margin: '5px 0', fontWeight: 'bold' }}>
                  <strong>Valor Total:</strong> {procedure_total_value}
                </p>
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
                    className='group border-2 rounded-xl p-2 sm:p-3 hover:shadow-md transition-all duration-200'
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderColor: '#00B050',
                    }}
                  >
                    {/* Mobile Layout */}
                    <div className='flex sm:hidden flex-col gap-2'>
                      <div className='flex items-start gap-2'>
                        <div
                          className='w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs'
                          style={{ backgroundColor: '#00B050' }}
                        >
                          <span className='text-white font-bold'>{index + 1}</span>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-xs break-words' style={{ color: '#1B3D6D' }}>
                            {procedure.cod} - {procedure.nome}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between gap-2 ml-8'>
                        <p className='font-semibold text-xs' style={{ color: '#00B050' }}>
                          {procedure.preco && procedure.preco.trim() !== '' && procedure.preco.trim() !== 'R$ -'
                            ? procedure.preco
                            : 'R$ 0'}
                        </p>
                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1'>
                            <button
                              onClick={() => onDecrement(procedure)}
                              disabled={procedure.count <= 1}
                              className='w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              -
                            </button>
                            <span className='px-1.5 text-xs font-semibold text-gray-700 min-w-[1.5rem] text-center'>
                              {procedure.count}
                            </span>
                            <button
                              onClick={() => onIncrement(procedure)}
                              className='w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all duration-200'
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => onRemove(procedure)}
                            className='bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-1.5 transition-all duration-200'
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className='hidden sm:flex items-center justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div
                          className='w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs'
                          style={{ backgroundColor: '#00B050' }}
                        >
                          <span className='text-white font-bold'>{index + 1}</span>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-base' style={{ color: '#1B3D6D' }}>
                            {procedure.cod} - {procedure.nome}
                          </p>
                        </div>
                        <p className='font-semibold text-sm mr-2 flex-shrink-0' style={{ color: '#00B050' }}>
                          {procedure.preco && procedure.preco.trim() !== '' && procedure.preco.trim() !== 'R$ -'
                            ? procedure.preco
                            : 'R$ 0'}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1'>
                          <button
                            onClick={() => onDecrement(procedure)}
                            disabled={procedure.count <= 1}
                            className='w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            -
                          </button>
                          <span className='px-2 text-sm font-semibold text-gray-700 min-w-[2rem] text-center'>
                            {procedure.count}
                          </span>
                          <button
                            onClick={() => onIncrement(procedure)}
                            className='w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200'
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(procedure)}
                          className='bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-2 transition-all duration-200'
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary and Actions */}
            <div className='flex flex-col gap-4 pt-6 border-t border-gray-200'>
              {/* Summary Info */}
              <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm'>
                <div>
                  <p className='text-gray-500 mb-1'>Total de Procedimentos</p>
                  <p className='text-lg font-semibold text-gray-700'>{procedure_total}</p>
                </div>
                <div>
                  <p className='text-gray-500 mb-1'>Valor Total</p>
                  <p className='text-lg font-semibold' style={{ color: '#00B050' }}>
                    {procedure_total_value}
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={onGeneratePDF}
                disabled={!isFormValid || isGeneratingPDF}
                className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base ${
                  !isFormValid || isGeneratingPDF
                    ? 'opacity-60 cursor-not-allowed bg-gray-400'
                    : 'hover:shadow-lg cursor-pointer'
                }`}
                style={
                  !isFormValid || isGeneratingPDF
                    ? { backgroundColor: '#9ca3af', cursor: 'not-allowed' }
                    : { backgroundColor: '#00B050', cursor: 'pointer' }
                }
                onMouseEnter={e => {
                  if (isFormValid && !isGeneratingPDF) {
                    e.currentTarget.style.backgroundColor = '#009940'
                  }
                }}
                onMouseLeave={e => {
                  if (isFormValid && !isGeneratingPDF) {
                    e.currentTarget.style.backgroundColor = '#00B050'
                  }
                }}
                title={!isFormValid ? 'Preencha todos os campos obrigatórios' : isGeneratingPDF ? 'Gerando PDF...' : ''}
              >
                {isGeneratingPDF ? (
                  <span className='flex items-center gap-2'>
                    <span className='inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Gerando PDF...
                  </span>
                ) : (
                  <>
                    <Download size={18} />
                    Baixar PDF
                  </>
                )}
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
