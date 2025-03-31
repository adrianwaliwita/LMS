import Schedule from "../../components/Schedule";
import Announcements from "../../components/Announcements";
const StudentDashboard = () => {
  return (
    <>
      <div className="mt-6">
        <Schedule />
        <Announcements />
      </div>
    </>
  );
};

export default StudentDashboard;
