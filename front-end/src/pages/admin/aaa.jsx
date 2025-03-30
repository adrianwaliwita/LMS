<div className="container mx-auto flex flex-col flex-grow p-4">
  <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4">
    {/* User Statistics Card */}
    <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-blue-700 mb-4">
        User Statistics
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Users:</span>
          <span className="font-medium text-blue-700">{users.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Active Users:</span>
          <span className="font-medium text-green-600">
            {users.filter((u) => u.status === "active").length}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Inactive Users:</span>
          <span className="font-medium text-red-600">
            {users.filter((u) => u.status === "inactive").length}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Courses Section */}
  <div className="mt-6 bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-blue-700 mb-4">Courses</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modules
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {course.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {course.categoryName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {course.levelName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Modules Section */}
  <div className="mt-6 bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-blue-700 mb-4">Modules</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {modules.map((module) => (
            <tr key={module.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {module.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {module.description.substring(0, 50)}...
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Batches Section */}
  <div className="mt-6 bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-blue-700 mb-4">Batches</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {batch.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {batch.course?.title || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(batch.startDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(batch.endDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  batch.status === "active"
                    ? "bg-green-100 text-green-800"
                    : batch.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                >
                  {batch.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Announcements Section */}
  <div className="mt-6">
    <Announcements />
  </div>
</div>;
