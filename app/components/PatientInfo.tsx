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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Informações do Paciente
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Digite o nome do animal, tipo e idade para gerar o relatório
        </p>
        <textarea
          value={`${patientName}${animalType ? ` | ${animalType}` : ''}${patientAge ? ` | ${patientAge}` : ''}`}
          onChange={(e) => {
            const parts = e.target.value.split('|');
            onPatientNameChange(parts[0]?.trim() || '');
            onAnimalTypeChange(parts[1]?.trim() || '');
            onPatientAgeChange(parts[2]?.trim() || '');
          }}
          placeholder="Ex: Fluffy | Gato | 3 anos"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}
