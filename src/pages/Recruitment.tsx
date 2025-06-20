
import RecruitmentAssessments from '@/components/RecruitmentAssessments';

const Recruitment = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Recruitment</h1>
        <p className="text-slate-600 mt-1">Manage recruitment assessments and candidate evaluations</p>
      </div>
      <RecruitmentAssessments />
    </div>
  );
};

export default Recruitment;
