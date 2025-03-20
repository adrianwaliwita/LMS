import Schedule from "./MiniSchedule";
import Announcements from "./Announcements";
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
