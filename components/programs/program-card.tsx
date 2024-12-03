export interface ProgramInterface {
  id: string;
  name: string;
  level: string;
  duration: string;
  tuitionFee: number;
  currency: string;
  country: string;
  description?: string;
  eligibilityCriteria?: Record<string, any>;
}

export const ProgramCard = ({ program }: { program: ProgramInterface }) => (
  <div className="rounded-lg border p-4 mb-4 bg-white shadow-sm">
    <h3 className="text-lg font-bold">{program.name}</h3>
    <p className="text-sm text-gray-600">
      {program.level} • {program.country}
    </p>
    <div className="mt-2 space-y-2">
      <p>Duration: {program.duration}</p>
      <p>
        Tuition: {program.tuitionFee} {program.currency}
      </p>
      {program.description && (
        <p className="text-sm text-gray-700">{program.description}</p>
      )}
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Learn More
        </button>
        <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50">
          Compare
        </button>
      </div>
    </div>
  </div>
);
