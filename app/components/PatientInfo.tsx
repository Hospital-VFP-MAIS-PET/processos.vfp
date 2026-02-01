interface PatientInfoProps {
  patientName: string;
  animalType: string;
  patientAge: string;
  onPatientNameChange: (name: string) => void;
  onAnimalTypeChange: (type: string) => void;
  onPatientAgeChange: (age: string) => void;
}

export default function PatientInfo({
  patientName,
  animalType,
  patientAge,
  onPatientNameChange,
  onAnimalTypeChange,
  onPatientAgeChange,
}: PatientInfoProps) {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
        <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#1B3D6D' }}>
          Informações do Paciente
        </h3>
        <p className="text-xs mb-6" style={{ color: '#00B050' }}>
          Copie e cole aqui o título do card do Bitrix aqui, para identficar o paciente e tutor
        </p>
        <textarea
          value={`${patientName}${animalType ? ` | ${animalType}` : ''}${patientAge ? ` | ${patientAge}` : ''}`}
          onChange={(e) => {
            const parts = e.target.value.split('|');
            onPatientNameChange(parts[0]?.trim() || '');
            onAnimalTypeChange(parts[1]?.trim() || '');
            onPatientAgeChange(parts[2]?.trim() || '');
          }}
          placeholder="Ex: (VFP) Atendimento de Rex 12345 (Cão) - João da Silva Nº 243333"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm text-black"
          style={{ borderColor: '#00B050' }}
          onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 176, 80, 0.2)'}
          onBlur={(e) => e.currentTarget.style.boxShadow = ''}
          rows={3}
        />
      </div>
    </div>
  );
}
