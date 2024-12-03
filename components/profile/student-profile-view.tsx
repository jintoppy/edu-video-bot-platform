export interface StudentProfileInterface {
  currentEducation: string;
  desiredLevel: string;
  preferredCountries: string[];
  budgetRange?: string;
  testScores?: Record<string, number>;
}

export const StudentProfileView = ({
  profile,
}: {
  profile: StudentProfileInterface;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-4">
    <h3 className="font-bold mb-2">Your Profile</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>Current Education: {profile.currentEducation}</div>
      <div>Desired Level: {profile.desiredLevel}</div>
      <div>Preferred Countries: {profile.preferredCountries.join(", ")}</div>
      {profile.budgetRange && <div>Budget Range: {profile.budgetRange}</div>}
      {profile.testScores && (
        <div className="col-span-2">
          <p className="font-semibold mt-2">Test Scores:</p>
          {Object.entries(profile.testScores).map(([test, score]) => (
            <span key={test} className="mr-4">
              {test}: {score}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);
